-- Add spotify_user_id column to user_spotify_tokens table
ALTER TABLE public.user_spotify_tokens 
ADD COLUMN spotify_user_id TEXT;

-- Create user_playlists table for storing Spotify playlist data
CREATE TABLE public.user_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  spotify_playlist_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  track_count INTEGER DEFAULT 0,
  image_url TEXT,
  spotify_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, spotify_playlist_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_playlists ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own playlists" 
ON public.user_playlists 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own playlists" 
ON public.user_playlists 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists" 
ON public.user_playlists 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists" 
ON public.user_playlists 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_playlists_updated_at
BEFORE UPDATE ON public.user_playlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();