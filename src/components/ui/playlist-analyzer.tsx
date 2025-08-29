import { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Textarea } from './textarea';
import { Badge } from './badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Music, BookOpen, Sparkles } from 'lucide-react';

interface PlaylistTrack {
  name: string;
  artist: string;
  album?: string;
  genre?: string;
}

interface AnalysisResult {
  genres: { [key: string]: number };
  moods: string[];
  bookRecommendations: {
    title: string;
    author: string;
    reason: string;
    genre: string;
  }[];
}

export const PlaylistAnalyzer = () => {
  const [playlistName, setPlaylistName] = useState('');
  const [playlistData, setPlaylistData] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const parsePlaylistData = (data: string): PlaylistTrack[] => {
    const lines = data.split('\n').filter(line => line.trim());
    const tracks: PlaylistTrack[] = [];
    
    for (const line of lines) {
      // Try different formats: "Artist - Song", "Song by Artist", etc.
      let artist = '', name = '';
      
      if (line.includes(' - ')) {
        [artist, name] = line.split(' - ', 2);
      } else if (line.includes(' by ')) {
        [name, artist] = line.split(' by ', 2);
      } else {
        // If no clear format, treat whole line as song name
        name = line;
        artist = 'Unknown Artist';
      }
      
      tracks.push({
        name: name.trim(),
        artist: artist.trim()
      });
    }
    
    return tracks;
  };

  const analyzePlaylist = async () => {
    if (!playlistName.trim() || !playlistData.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both playlist name and track data.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const tracks = parsePlaylistData(playlistData);
      
      if (tracks.length === 0) {
        throw new Error('No valid tracks found in the playlist data');
      }

      const { data, error } = await supabase.functions.invoke('analyze-playlist', {
        body: {
          playlistName,
          tracks
        }
      });

      if (error) throw error;

      setAnalysis(data.analysis);
      
      // Save to database
      await supabase
        .from('playlist_analysis')
        .insert({
          playlist_name: playlistName,
          playlist_data: tracks as any,
          analysis_result: data.analysis as any,
          user_id: null // Allow anonymous analysis
        });

      toast({
        title: "Analysis Complete!",
        description: "Your playlist has been analyzed and book recommendations generated.",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze playlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-6 w-6" />
            Playlist Analyzer
          </CardTitle>
          <CardDescription>
            Upload your Spotify playlist data and get personalized book recommendations based on your music taste.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="playlistName">Playlist Name</Label>
            <Input
              id="playlistName"
              placeholder="My Awesome Playlist"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="playlistData">Playlist Tracks</Label>
            <Textarea
              id="playlistData"
              placeholder={`Enter your tracks in any of these formats:
Artist - Song Title
Song Title by Artist
Just Song Title

Example:
The Beatles - Hey Jude
Bohemian Rhapsody by Queen
Imagine`}
              value={playlistData}
              onChange={(e) => setPlaylistData(e.target.value)}
              className="min-h-[200px]"
            />
            <p className="text-sm text-muted-foreground">
              Paste your playlist tracks here, one per line. You can export this from Spotify or manually enter tracks.
            </p>
          </div>

          <Button 
            onClick={analyzePlaylist}
            disabled={loading}
            className="w-full"
            variant="hero"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {loading ? 'Analyzing Playlist...' : 'Analyze & Get Book Recommendations'}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Music Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Top Genres</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.genres).map(([genre, count]) => (
                    <Badge key={genre} variant="secondary">
                      {genre} ({count})
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Detected Moods</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.moods.map((mood) => (
                    <Badge key={mood} variant="outline">
                      {mood}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Book Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analysis.bookRecommendations.map((book, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold">{book.title}</h4>
                  <p className="text-sm text-muted-foreground">by {book.author}</p>
                  <Badge variant="secondary" className="mt-1 mb-2">
                    {book.genre}
                  </Badge>
                  <p className="text-sm">{book.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};