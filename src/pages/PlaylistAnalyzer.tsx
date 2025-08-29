import { PlaylistAnalyzer } from '@/components/ui/playlist-analyzer';

export const PlaylistAnalyzerPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Playlist to 
            <span className="bg-gradient-hero bg-clip-text text-transparent ml-3">
              Books
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Upload your Spotify playlist and discover books that match your musical taste
          </p>
        </div>
        
        <PlaylistAnalyzer />
      </div>
    </div>
  );
};