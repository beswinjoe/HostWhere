-- Phase 3: Enable Row Level Security (RLS) on user_analyses to guarantee privacy

-- 1. Enable RLS
ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if they exist to prevent conflicts during re-runs
DROP POLICY IF EXISTS "Users can view their own analyses" ON user_analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON user_analyses;
DROP POLICY IF EXISTS "Users can update their own analyses" ON user_analyses;
DROP POLICY IF EXISTS "Users can delete their own analyses" ON user_analyses;

-- 3. Create policies
-- Allow users to SELECT only rows where user_id matches their own auth.uid()
CREATE POLICY "Users can view their own analyses" 
ON user_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow users to INSERT rows where user_id matches their own auth.uid()
CREATE POLICY "Users can insert their own analyses" 
ON user_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to UPDATE rows where user_id matches their own auth.uid()
CREATE POLICY "Users can update their own analyses" 
ON user_analyses 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to DELETE their own analyses
CREATE POLICY "Users can delete their own analyses" 
ON user_analyses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Important: Any operations executed via the service_role key bypass RLS by default.
