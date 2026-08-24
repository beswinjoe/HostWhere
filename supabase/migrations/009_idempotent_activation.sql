-- Supabase Migration: 009_idempotent_activation.sql
-- Implements an atomic RPC for idempotently activating or extending a featured project.

CREATE OR REPLACE FUNCTION activate_featured_project_idempotent(
  p_project_id UUID,
  p_plan TEXT,
  p_price_cents INTEGER,
  p_priority INTEGER,
  p_duration_days INTEGER,
  p_payment_id TEXT
) RETURNS json AS $$
DECLARE
  v_project featured_projects%ROWTYPE;
  v_processed_payments text[];
  v_now TIMESTAMPTZ := now();
  v_new_expires_at TIMESTAMPTZ;
  v_new_featured_at TIMESTAMPTZ;
  v_social_links jsonb;
BEGIN
  -- Lock the row for update to prevent concurrent race conditions
  SELECT * INTO v_project
  FROM featured_projects
  WHERE id = p_project_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project not found';
  END IF;

  v_social_links := COALESCE(v_project.social_links, '{}'::jsonb);
  
  -- Extract processed payments array safely
  IF v_social_links ? '_processed_payments' THEN
    SELECT array_agg(x::text) INTO v_processed_payments
    FROM jsonb_array_elements_text(v_social_links->'_processed_payments') x;
  ELSE
    v_processed_payments := ARRAY[]::text[];
  END IF;

  -- Ensure we don't have nulls
  IF v_processed_payments IS NULL THEN
    v_processed_payments := ARRAY[]::text[];
  END IF;

  -- Idempotency check: if this payment has already been processed, return without making changes
  IF p_payment_id = ANY(v_processed_payments) THEN
    RETURN row_to_json(v_project);
  END IF;

  -- Calculate new expiry dates
  IF v_project.featured_active AND v_project.expires_at > v_now THEN
    IF p_priority > COALESCE(v_project.priority, 0) THEN
      v_new_featured_at := v_now;
      v_new_expires_at := v_now + (p_duration_days || ' days')::interval;
    ELSE
      v_new_featured_at := v_project.featured_at;
      v_new_expires_at := v_project.expires_at + (p_duration_days || ' days')::interval;
    END IF;
  ELSE
    v_new_featured_at := v_now;
    v_new_expires_at := v_now + (p_duration_days || ' days')::interval;
  END IF;

  -- Add payment to processed list atomically
  v_processed_payments := array_append(v_processed_payments, p_payment_id);
  v_social_links := jsonb_set(v_social_links, '{_processed_payments}', to_jsonb(v_processed_payments));

  -- Perform the atomic update
  UPDATE featured_projects
  SET 
    plan = p_plan,
    price_cents = p_price_cents,
    priority = p_priority,
    featured_at = v_new_featured_at,
    expires_at = v_new_expires_at,
    featured_active = true,
    updated_at = v_now,
    social_links = v_social_links
  WHERE id = p_project_id
  RETURNING * INTO v_project;

  RETURN row_to_json(v_project);
END;
$$ LANGUAGE plpgsql;
