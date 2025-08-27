import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Brain, Clock, Target, Zap } from 'lucide-react';

interface QuizPreviewProps {
  onStartQuiz?: () => void;
}

export const QuizPreview = ({ onStartQuiz }: QuizPreviewProps) => {
  const quizFeatures = [
    {
      icon: Brain,
      title: "Personality Analysis",
      description: "7 scientifically-backed questions to understand your reading preferences"
    },
    {
      icon: Clock,
      title: "Quick & Fun",
      description: "Takes only 3-5 minutes to complete with engaging visuals"
    },
    {
      icon: Target,
      title: "Precision Matching",
      description: "Combines music mood analysis with personality insights"
    },
    {
      icon: Zap,
      title: "Instant Results",
      description: "Get your genre breakdown and book recommendations immediately"
    }
  ];

  const sampleQuestions = [
    "When choosing a weekend activity, you prefer...",
    "Your ideal vacation would be...",
    "In a group setting, you typically...",
    "When facing a challenge, you..."
  ];

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
            Personality Quiz
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Discover Your
            <span className="bg-gradient-hero bg-clip-text text-transparent ml-3">
              Reading DNA
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered quiz analyzes your personality traits and combines them with your Spotify music mood for incredibly accurate book recommendations.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Features */}
          <div className="space-y-6">
            {quizFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-gradient-card border-border hover:shadow-book transition-smooth">
                  <CardContent className="flex items-start space-x-4 p-6">
                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quiz Preview */}
          <div className="space-y-6">
            <Card className="bg-gradient-card border-border shadow-book">
              <CardHeader>
                <CardTitle className="text-xl text-center">Sample Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {sampleQuestions.map((question, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                        {index + 1}
                      </div>
                      <p className="text-foreground font-medium">{question}</p>
                    </div>
                  </div>
                ))}
                <div className="text-center pt-4">
                  <span className="text-muted-foreground">+ 3 more personalized questions</span>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                size="lg"
                onClick={onStartQuiz}
                className="bg-gradient-accent text-primary-foreground px-8 py-6 text-lg font-semibold shadow-vinyl hover:shadow-glow transition-smooth"
              >
                Take the Quiz Now
              </Button>
              <p className="text-sm text-muted-foreground mt-3">
                Free • No spam • Instant results
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};