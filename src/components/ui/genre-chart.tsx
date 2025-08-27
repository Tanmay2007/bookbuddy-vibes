import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Badge } from './badge';

interface GenreData {
  name: string;
  percentage: number;
  color: string;
  description: string;
}

interface GenreChartProps {
  genres?: GenreData[];
}

const defaultGenres: GenreData[] = [
  {
    name: "Adventure",
    percentage: 31,
    color: "bg-accent",
    description: "Thrilling journeys and exciting escapades"
  },
  {
    name: "Fantasy",
    percentage: 24,
    color: "bg-primary",
    description: "Magical worlds and mythical creatures"
  },
  {
    name: "Romance",
    percentage: 21,
    color: "bg-secondary",
    description: "Love stories and emotional connections"
  },
  {
    name: "Mystery",
    percentage: 12,
    color: "bg-destructive",
    description: "Puzzles, suspense and hidden truths"
  },
  {
    name: "Sci-Fi",
    percentage: 8,
    color: "bg-muted-foreground",
    description: "Future worlds and scientific wonders"
  },
  {
    name: "Non-Fiction",
    percentage: 4,
    color: "bg-border",
    description: "Real stories and factual knowledge"
  }
];

export const GenreChart = ({ genres = defaultGenres }: GenreChartProps) => {
  const maxPercentage = Math.max(...genres.map(g => g.percentage));

  return (
    <Card className="bg-gradient-card border-border shadow-book">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Your Reading Personality</CardTitle>
        <p className="text-muted-foreground text-center">
          Based on your music taste and personality quiz
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {genres.map((genre, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Badge variant="outline" className="px-3 py-1">
                  {genre.name}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {genre.description}
                </span>
              </div>
              <span className="text-lg font-bold text-foreground">
                {genre.percentage}%
              </span>
            </div>
            
            <div className="relative">
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full ${genre.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{ 
                    width: `${genre.percentage}%`,
                    animationDelay: `${index * 0.2}s`
                  }}
                />
              </div>
              {genre.percentage === maxPercentage && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    Dominant Genre
                  </Badge>
                </div>
              )}
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t border-border">
          <p className="text-center text-sm text-muted-foreground">
            Your unique reading profile combines multiple genres for diverse recommendations
          </p>
        </div>
      </CardContent>
    </Card>
  );
};