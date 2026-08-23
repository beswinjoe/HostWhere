-- Supabase Migration: 002_auth_and_profiles.sql

-- 1. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create user_analyses table (History)
CREATE TABLE public.user_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  analysis_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  source_type TEXT NOT NULL, -- 'github' or 'zip'
  github_url TEXT,
  framework TEXT,
  compatibility_summary JSONB,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analyses ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for profiles
-- Users can view any public profile
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can insert their own profile." 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 5. RLS Policies for user_analyses
-- Users can manage their own history
CREATE POLICY "Users can insert their own analyses." 
ON public.user_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own analyses." 
ON public.user_analyses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyses." 
ON public.user_analyses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses." 
ON public.user_analyses FOR DELETE USING (auth.uid() = user_id);

-- Public visitors can view public analyses
CREATE POLICY "Public analyses are viewable by everyone." 
ON public.user_analyses FOR SELECT USING (is_public = true);

-- 6. Function to handle automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger for handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
