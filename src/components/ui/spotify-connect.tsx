import { useEffect, useState } from 'react';
import { Button } from './button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Badge } from './badge';
import { useSpotify } from '@/hooks/useSpotify';
import { useToast } from '@/hooks/use-toast';
import { Music, Users, ExternalLink, Unlink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const SpotifyConnect = () => {
  const { isConnected, profile, loading, connectSpotify, disconnectSpotify } = useSpotify();
  const { toast } = useToast();
  const { session } = useAuth();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Handle OAuth callback
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const storedState = sessionStorage.getItem('spotify_oauth_state');

      if (code && state && state === storedState && session) {
        setProcessing(true);
        try {
          const { data, error } = await supabase.functions.invoke('spotify-auth', {
            body: { 
              action: 'exchange_code', 
              code, 
              state 
            },
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          });

          if (error) throw error;

          sessionStorage.removeItem('spotify_oauth_state');
          
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
          
          toast({
            title: "Success!",
            description: "Your Spotify account has been connected.",
          });

          // Force refresh of Spotify connection status
          window.location.reload();
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast({
            title: "Connection Failed",
            description: "Failed to connect your Spotify account. Please try again.",
            variant: "destructive",
          });
        } finally {
          setProcessing(false);
        }
      }
    };

    handleOAuthCallback();
  }, [session, toast]);

  const handleConnect = async () => {
    setProcessing(true);
    try {
      await connectSpotify();
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Spotify. Please try again.",
        variant: "destructive",
      });
      setProcessing(false);
    }
  };

  const handleDisconnect = async () => {
    setProcessing(true);
    try {
      await disconnectSpotify();
      toast({
        title: "Disconnected",
        description: "Your Spotify account has been disconnected.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect Spotify account.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading || processing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Spotify Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-10 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Connect Spotify
          </CardTitle>
          <CardDescription>
            Connect your Spotify account to get personalized book recommendations based on your music taste.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleConnect}
            className="w-full"
            variant="hero"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Connect Spotify Account
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5 text-green-500" />
          Spotify Connected
        </CardTitle>
        <CardDescription>
          Your Spotify account is connected and ready for personalized recommendations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {profile && (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={profile.images?.[0]?.url} />
              <AvatarFallback>
                {profile.display_name?.charAt(0) || profile.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{profile.display_name || profile.email}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-3 w-3" />
                {profile.followers?.total || 0} followers
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Connected
            </Badge>
          </div>
        )}
        
        <Button 
          onClick={handleDisconnect}
          variant="outline"
          className="w-full"
        >
          <Unlink className="h-4 w-4 mr-2" />
          Disconnect Account
        </Button>
      </CardContent>
    </Card>
  );
};