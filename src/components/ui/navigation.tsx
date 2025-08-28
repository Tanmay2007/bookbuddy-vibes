import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Brain, BarChart3, Crown, User, Headphones, LogOut } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NavigationProps {
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

export const Navigation = ({ currentPage = 'home', onNavigate }: NavigationProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'quiz', label: 'Personality Quiz', icon: Brain },
    { id: 'results', label: 'My Results', icon: BarChart3 },
    { id: 'premium', label: 'Premium', icon: Crown },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

  const handleNavigation = (pageId: string) => {
    onNavigate?.(pageId);
    setIsDrawerOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between px-4 h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center shadow-vinyl">
              <Headphones className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              BookBuddy
            </h1>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <nav className="flex items-center space-x-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-xl transition-smooth",
                      currentPage === item.id
                        ? "bg-primary text-primary-foreground shadow-vinyl"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            
            {user ? (
              <div className="flex items-center space-x-3 pl-6 border-l border-border">
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            ) : (
              <Link to="/auth" className="pl-6 border-l border-border">
                <Button variant="secondary" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDrawer}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-80 bg-gradient-card shadow-book transform transition-transform duration-300 ease-in-out lg:hidden",
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Menu</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleDrawer}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <nav className="flex flex-col p-6 space-y-4">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-xl transition-smooth text-left",
                  currentPage === item.id
                    ? "bg-primary text-primary-foreground shadow-vinyl"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
          
          <div className="pt-6 border-t border-border">
            {user ? (
              <div className="space-y-4">
                <div className="px-4">
                  <p className="text-sm text-muted-foreground">
                    Signed in as
                  </p>
                  <p className="text-sm font-medium truncate">
                    {user.email}
                  </p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl transition-smooth text-left text-muted-foreground hover:text-foreground hover:bg-muted w-full"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            ) : (
              <Link to="/auth" onClick={() => setIsDrawerOpen(false)}>
                <Button variant="secondary" className="w-full">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </nav>
      </div>
    </>
  );
};