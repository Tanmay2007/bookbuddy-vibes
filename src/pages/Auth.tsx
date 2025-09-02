import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isResetMode) {
      if (!email) {
        toast({
          title: "Error",
          description: "Please enter your email address",
          variant: "destructive",
        });
        return;
      }
      await handlePasswordReset();
      return;
    }

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password);

    if (error) {
      let errorMessage = "An error occurred";
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Try resetting your password if you're having trouble signing in.";
      } else if (error.message.includes('User already registered')) {
        errorMessage = "An account with this email already exists. Try signing in instead.";
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = "Password should be at least 6 characters";
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = "Please check your email and confirm your account before signing in.";
      } else {
        errorMessage = error.message;
      }

      toast({
        title: isSignUp ? "Sign Up Error" : "Sign In Error",
        description: errorMessage,
        variant: "destructive",
      });
    } else if (isSignUp) {
      toast({
        title: "Success!",
        description: "Account created successfully. Please check your email to verify your account.",
      });
    }

    setLoading(false);
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth?reset=true`,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password.",
      });
      setIsResetMode(false);
    }

    setLoading(false);
  };


  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-glow">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {isResetMode ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {isResetMode 
              ? 'Enter your email to receive a password reset link'
              : isSignUp 
                ? 'Sign up to discover your perfect book matches'
                : 'Sign in to continue your reading journey'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {!isResetMode && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full" 
              variant="hero"
              disabled={loading}
            >
              {loading 
                ? (isResetMode ? 'Sending Reset Email...' : isSignUp ? 'Creating Account...' : 'Signing In...') 
                : (isResetMode ? 'Send Reset Email' : isSignUp ? 'Create Account' : 'Sign In')
              }
            </Button>
          </form>
          
          <div className="mt-6 text-center space-y-2">
            {!isResetMode && (
              <>
                <p className="text-sm text-muted-foreground">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </p>
                <Button
                  variant="link"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="mt-1"
                >
                  {isSignUp ? 'Sign in instead' : 'Create an account'}
                </Button>
              </>
            )}
            
            {!isSignUp && (
              <Button
                variant="link"
                onClick={() => {
                  setIsResetMode(!isResetMode);
                  if (isResetMode) setPassword('');
                }}
                className="text-xs"
              >
                {isResetMode ? 'Back to sign in' : 'Forgot your password?'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};