-- Supabase Migration: 008_featured_project_owner.sql

-- 1. Add owner_id to featured_projects
ALTER TABLE public.featured_projects
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Create index for faster lookups by owner_id
CREATE INDEX IF NOT EXISTS idx_featured_projects_owner_id ON public.featured_projects(owner_id);
