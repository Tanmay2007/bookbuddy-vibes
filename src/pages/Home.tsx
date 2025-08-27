import { useState } from 'react';
import { Navigation } from '@/components/ui/navigation';
import { HeroSection } from '@/components/ui/hero-section';
import { QuizPreview } from '@/components/ui/quiz-preview';
import { GenreChart } from '@/components/ui/genre-chart';
import { BookRecommendations } from '@/components/ui/book-recommendations';

export const Home = () => {
  const [currentPage, setCurrentPage] = useState('home');

  const handleGetStarted = () => {
    // In a real app, this would check if user is authenticated
    // For now, we'll show a message about needing Spotify/auth integration
    alert('To get started, you\'ll need to connect your Spotify account and sign up! This requires backend integration with Supabase.');
  };

  const handleNavigation = (page: string) => {
    setCurrentPage(page);
    // In a real app, this would handle routing
    if (page === 'quiz') {
      alert('Quiz feature requires Spotify integration and user authentication via Supabase!');
    } else if (page === 'premium') {
      alert('Premium features require payment integration with Razorpay via Supabase backend!');
    } else if (page === 'results') {
      alert('Results page requires user authentication and stored quiz data via Supabase!');
    } else if (page === 'profile') {
      alert('Profile page requires user authentication via Supabase!');
    }
  };

  const handleUpgradeToPremium = () => {
    alert('Premium upgrade requires Razorpay payment integration via Supabase backend!');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        currentPage={currentPage} 
        onNavigate={handleNavigation} 
      />
      
      <main className="pt-16">
        <HeroSection onGetStarted={handleGetStarted} />
        
        {/* Features Section */}
        <section className="py-20 px-4 bg-card/50">
          <div className="container mx-auto max-w-6xl">
            <QuizPreview onStartQuiz={() => handleNavigation('quiz')} />
          </div>
        </section>

        {/* Demo Results Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                See Your
                <span className="bg-gradient-hero bg-clip-text text-transparent ml-3">
                  Results Preview
                </span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                This is what your personalized reading profile and book recommendations would look like
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <GenreChart />
              <BookRecommendations 
                onUpgradeToPremium={handleUpgradeToPremium}
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-4 border-t border-border bg-card/30">
          <div className="container mx-auto text-center">
            <div className="mb-8">
              <h3 className="text-2xl font-bold mb-4">
                Ready to discover your next favorite book?
              </h3>
              <p className="text-muted-foreground mb-6">
                Connect your Spotify and let AI find books that match your musical soul
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 BookBuddy. Made with ♥ for book and music lovers.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
};