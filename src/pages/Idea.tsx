import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Heart, Share2, Wind } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";
import mandalaPattern from "@/assets/mandala-pattern.jpg";
import { BreathingExercise } from '@/components/breathing-exercise';
import BottomNav from "@/components/BottomNav";

const affirmations = [
  "I am at peace with myself and the universe flows through me",
  "My breath connects me to the infinite energy of life",
  "I release all tension and embrace divine tranquility",
  "Every cell in my body vibrates with positive energy",
  "I am aligned with my highest purpose and inner wisdom",
  "Peace and clarity guide my thoughts and actions",
  "I trust the journey of my spiritual growth",
  "Divine light surrounds and protects me always",
  "My gut is balanced and healthy. I nourish it with wisdom",
  "I trust my gut instincts - they guide me toward what is right",
  "The connection between my gut and brain is strong and healthy",
  "I am grateful for this moment and all the blessings in my life",
];

const Idea = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const nextAffirmation = () => {
    setCurrentIndex((prev) => (prev + 1) % affirmations.length);
    setIsLiked(false);
  };

  const handleBreathingComplete = () => {
    setShowBreathing(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <div
      className="min-h-screen bg-background relative overflow-hidden"
      style={{
        backgroundImage: `url(${mandalaPattern})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full animate-glow-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 pt-[max(1.5rem,env(safe-area-inset-top))] flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Daily Ideas</h1>
            <p className="text-sm text-muted-foreground">Affirmations for mind & soul</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-accent/20"
          >
            <Share2 className="w-5 h-5" />
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-6 pb-24">
          <div className="max-w-2xl w-full space-y-8 animate-fade-in-up">
            {/* Affirmation Card */}
            <Card className="p-8 bg-gradient-to-br from-card/80 to-secondary/60 backdrop-blur-xl border-accent/40 shadow-float">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto rounded-full bg-accent/20 flex items-center justify-center animate-float">
                  <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-accent animate-glow-pulse" />
                  </div>
                </div>

                <p className="text-2xl md:text-3xl font-medium leading-relaxed text-foreground">
                  "{affirmations[currentIndex]}"
                </p>

                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsLiked(!isLiked)}
                    className={`rounded-full hover:bg-accent/20 transition-colors ${
                      isLiked ? "text-accent" : ""
                    }`}
                  >
                    <Heart
                      className={`w-6 h-6 ${
                        isLiked ? "fill-current" : ""
                      }`}
                    />
                  </Button>
                  <Button
                    onClick={() => setShowBreathing(true)}
                    className="rounded-full px-6 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30"
                  >
                    <Wind className="w-4 h-4 mr-2" />
                    Practice Breathing
                  </Button>
                </div>
              </div>
            </Card>

            {/* Action Button */}
            <div className="text-center">
              <Button
                size="lg"
                onClick={nextAffirmation}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-full shadow-glow hover:shadow-float transition-all duration-300 hover:scale-105 px-8"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Next Affirmation
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                {currentIndex + 1} of {affirmations.length}
              </p>
            </div>

            {/* Breathing Guide */}
            <Card className="p-6 bg-card/60 backdrop-blur-sm border-indigo/30 text-center">
              <h3 className="text-sm font-semibold text-accent mb-2 uppercase tracking-wider">
                Breathe & Reflect
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Take three deep breaths. Inhale positivity, exhale tension.
                Let this affirmation resonate within you.
              </p>
            </Card>
          </div>
        </main>
      </div>

      {/* Breathing Exercise */}
      <BreathingExercise
        isOpen={showBreathing}
        onComplete={handleBreathingComplete}
      />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Idea;