-- Disable CAPTCHA requirement for authentication
-- This is handled in Supabase dashboard under Authentication > Settings
-- For now, let's ensure our auth flow works properly

-- Create a table for playlist analysis if it doesn't exist
CREATE TABLE IF NOT EXISTS public.playlist_analysis (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  playlist_name text NOT NULL,
  playlist_data jsonb NOT NULL,
  analysis_result jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.playlist_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own playlist analysis" 
ON public.playlist_analysis 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create playlist analysis" 
ON public.playlist_analysis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own playlist analysis" 
ON public.playlist_analysis 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_playlist_analysis_updated_at
BEFORE UPDATE ON public.playlist_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();