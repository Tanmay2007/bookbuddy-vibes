import { Button } from './button';
import { Headphones, Music, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import heroImage from '@/assets/hero-books-music.jpg';

interface HeroSectionProps {
  onGetStarted?: () => void;
}

export const HeroSection = ({ onGetStarted }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-background/80" />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="animate-float absolute top-20 left-10 w-8 h-8 bg-primary/20 rounded-full blur-sm" />
        <div className="animate-float absolute top-32 right-20 w-12 h-12 bg-secondary/20 rounded-full blur-sm" style={{ animationDelay: '1s' }} />
        <div className="animate-float absolute bottom-40 left-1/4 w-6 h-6 bg-accent/20 rounded-full blur-sm" style={{ animationDelay: '2s' }} />
        <div className="animate-float absolute bottom-20 right-1/3 w-10 h-10 bg-primary/20 rounded-full blur-sm" style={{ animationDelay: '0.5s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Logo Animation */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-accent rounded-2xl flex items-center justify-center shadow-vinyl animate-pulse-glow">
                <Headphones className="w-10 h-10 text-primary-foreground" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-secondary-foreground" />
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              BookBuddy
            </span>
            <br />
            <span className="text-3xl md:text-4xl text-muted-foreground font-normal">
              AI Spotify Personality Book Recommender
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Connect your Spotify, reveal your personality through music, and discover books that perfectly match your vibe
          </p>

          {/* Feature Icons */}
          <div className="flex justify-center items-center space-x-8 mb-12">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-gradient-card rounded-xl flex items-center justify-center shadow-book">
                <Music className="w-8 h-8 text-accent" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Analyze Music</span>
            </div>
            
            <ArrowRight className="w-6 h-6 text-muted-foreground animate-pulse" />
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-gradient-card rounded-xl flex items-center justify-center shadow-book">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Find Personality</span>
            </div>
            
            <ArrowRight className="w-6 h-6 text-muted-foreground animate-pulse" />
            
            <div className="flex flex-col items-center space-y-2">
              <div className="w-16 h-16 bg-gradient-card rounded-xl flex items-center justify-center shadow-book">
                <BookOpen className="w-8 h-8 text-secondary" />
              </div>
              <span className="text-sm text-muted-foreground font-medium">Get Books</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="bg-gradient-accent text-primary-foreground px-8 py-6 text-lg font-semibold shadow-vinyl hover:shadow-glow transition-smooth group"
            >
              Start Your Journey
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg font-semibold border-border hover:bg-muted transition-smooth"
            >
              How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50K+</div>
              <div className="text-muted-foreground">Songs Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-secondary mb-2">10K+</div>
              <div className="text-muted-foreground">Books Recommended</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-2">95%</div>
              <div className="text-muted-foreground">Match Accuracy</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};