import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SpotifyProfile {
  id: string;
  display_name: string;
  email: string;
  images?: { url: string }[];
  followers: { total: number };
}

interface SpotifyContextType {
  isConnected: boolean;
  profile: SpotifyProfile | null;
  loading: boolean;
  connectSpotify: () => Promise<void>;
  disconnectSpotify: () => Promise<void>;
  getPlaylists: () => Promise<any[]>;
  getTopTracks: (timeRange?: string) => Promise<any[]>;
  getTopArtists: (timeRange?: string) => Promise<any[]>;
  getRecentlyPlayed: () => Promise<any[]>;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export const SpotifyProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, session } = useAuth();

  useEffect(() => {
    if (user && session) {
      checkSpotifyConnection();
    } else {
      setIsConnected(false);
      setProfile(null);
      setLoading(false);
    }
  }, [user, session]);

  const checkSpotifyConnection = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('spotify-auth', {
        body: { action: 'get_profile' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setIsConnected(data.connected);
      setProfile(data.profile || null);
    } catch (error) {
      console.error('Error checking Spotify connection:', error);
      setIsConnected(false);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const connectSpotify = async () => {
    if (!session) throw new Error('Not authenticated');

    try {
      // Get auth URL
      const { data, error } = await supabase.functions.invoke('spotify-auth', {
        body: { action: 'get_auth_url' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Store state for verification
      sessionStorage.setItem('spotify_oauth_state', data.state);
      
      // Redirect to Spotify auth
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error connecting to Spotify:', error);
      throw error;
    }
  };

  const disconnectSpotify = async () => {
    if (!session) throw new Error('Not authenticated');

    try {
      const { error } = await supabase.functions.invoke('spotify-auth', {
        body: { action: 'disconnect' },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setIsConnected(false);
      setProfile(null);
    } catch (error) {
      console.error('Error disconnecting Spotify:', error);
      throw error;
    }
  };

  const getPlaylists = async () => {
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('spotify-data', {
      body: { action: 'get_playlists' },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    return data.playlists;
  };

  const getTopTracks = async (timeRange = 'medium_term') => {
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('spotify-data', {
      body: { action: 'get_top_tracks', time_range: timeRange },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    return data.tracks;
  };

  const getTopArtists = async (timeRange = 'medium_term') => {
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('spotify-data', {
      body: { action: 'get_top_artists', time_range: timeRange },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    return data.artists;
  };

  const getRecentlyPlayed = async () => {
    if (!session) throw new Error('Not authenticated');

    const { data, error } = await supabase.functions.invoke('spotify-data', {
      body: { action: 'get_recently_played' },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    return data.tracks;
  };

  const value = {
    isConnected,
    profile,
    loading,
    connectSpotify,
    disconnectSpotify,
    getPlaylists,
    getTopTracks,
    getTopArtists,
    getRecentlyPlayed,
  };

  return <SpotifyContext.Provider value={value}>{children}</SpotifyContext.Provider>;
};

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
};