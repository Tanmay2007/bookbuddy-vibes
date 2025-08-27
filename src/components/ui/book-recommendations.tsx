import { Card, CardContent } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Star, ExternalLink, Heart } from 'lucide-react';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  description: string;
  coverColor: string;
  matchPercentage: number;
}

interface BookRecommendationsProps {
  books?: Book[];
  showPremiumUpgrade?: boolean;
  onUpgradeToPremium?: () => void;
}

const defaultBooks: Book[] = [
  {
    id: "1",
    title: "The Name of the Wind",
    author: "Patrick Rothfuss",
    genre: "Fantasy",
    rating: 4.8,
    description: "A beautifully written fantasy epic about Kvothe, a legendary figure whose story unfolds through flashbacks.",
    coverColor: "bg-primary",
    matchPercentage: 94
  },
  {
    id: "2",
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    genre: "Romance",
    rating: 4.6,
    description: "A captivating story of love, ambition, and the price of fame told through the eyes of a reclusive Hollywood icon.",
    coverColor: "bg-secondary",
    matchPercentage: 89
  },
  {
    id: "3",
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Adventure",
    rating: 4.7,
    description: "A thrilling space adventure about humanity's last hope, filled with science, humor, and heart.",
    coverColor: "bg-accent",
    matchPercentage: 87
  }
];

export const BookRecommendations = ({ 
  books = defaultBooks, 
  showPremiumUpgrade = true,
  onUpgradeToPremium 
}: BookRecommendationsProps) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-4">
          Your Perfect
          <span className="bg-gradient-hero bg-clip-text text-transparent ml-2">
            Book Matches
          </span>
        </h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Based on your musical personality analysis, here are books that perfectly align with your vibe
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book, index) => (
          <Card key={book.id} className="bg-gradient-card border-border hover:shadow-book transition-smooth group">
            <CardContent className="p-6">
              {/* Book Cover Mockup */}
              <div className="relative mb-4">
                <div className={`w-full h-48 ${book.coverColor} rounded-lg shadow-vinyl flex items-center justify-center text-white group-hover:scale-105 transition-transform`}>
                  <div className="text-center p-4">
                    <h4 className="font-bold text-lg leading-tight mb-2">{book.title}</h4>
                    <p className="text-sm opacity-90">{book.author}</p>
                  </div>
                </div>
                <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground">
                  {book.matchPercentage}% match
                </Badge>
              </div>

              {/* Book Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{book.genre}</Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-secondary text-secondary" />
                    <span className="text-sm font-medium">{book.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3">
                  {book.description}
                </p>

                <div className="flex items-center space-x-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Premium Upgrade CTA */}
      {showPremiumUpgrade && (
        <Card className="bg-gradient-accent border-accent shadow-glow">
          <CardContent className="p-8 text-center">
            <h4 className="text-2xl font-bold text-primary-foreground mb-4">
              Want More Recommendations?
            </h4>
            <p className="text-primary-foreground/90 mb-6 max-w-md mx-auto">
              Unlock unlimited personalized book recommendations, detailed analysis, and advanced filters with BookBuddy Premium.
            </p>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={onUpgradeToPremium}
              className="px-8 py-3 font-semibold shadow-book hover:shadow-glow transition-smooth"
            >
              Upgrade to Premium
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};