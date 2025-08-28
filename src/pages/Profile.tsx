import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '@/components/ui/navigation';
import { UserProfile } from '@/components/ui/user-profile';
import { SpotifyConnect } from '@/components/ui/spotify-connect';
import { useAuth } from '@/hooks/useAuth';

export const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Navigation />
        <main className="container mx-auto px-4 pt-20">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-96 bg-muted rounded"></div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Navigation currentPage="profile" />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Profile Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your account and connect your music services for personalized recommendations.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <UserProfile />
            <SpotifyConnect />
          </div>
        </div>
      </main>
    </div>
  );
};