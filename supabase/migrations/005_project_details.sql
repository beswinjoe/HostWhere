-- Supabase Migration: 005_project_details.sql

-- Add optional project detail columns for authenticated owners to manage
ALTER TABLE public.featured_projects
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS demo_url TEXT,
ADD COLUMN IF NOT EXISTS project_type TEXT,
ADD COLUMN IF NOT EXISTS use_case_description TEXT;
