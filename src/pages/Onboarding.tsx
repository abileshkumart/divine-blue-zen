import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import onboardingBg from "@/assets/onboarding-bg.jpg";

const Onboarding = () => {
  const navigate = useNavigate();

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{
        backgroundImage: `url(${onboardingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
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
      <div className="relative z-10 text-center space-y-8 max-w-md animate-fade-in-up">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/20 backdrop-blur-sm animate-float">
            <Sparkles className="w-10 h-10 text-accent" />
          </div>
          
          <h1 className="text-5xl font-bold text-glow leading-tight">
            Welcome to Your Daily Yoga Journey
          </h1>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Connect with your inner self through guided meditation, 
            mindful practices, and the ancient wisdom of yoga
          </p>
        </div>

        <div className="space-y-4 pt-4">
          <Button
            size="lg"
            onClick={() => navigate('/home')}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg h-14 rounded-full shadow-glow hover:shadow-float transition-all duration-300 hover:scale-105"
          >
            Begin Your Journey
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/auth')}
            className="w-full border-accent/50 text-foreground hover:bg-accent/10 font-medium text-lg h-14 rounded-full backdrop-blur-sm"
          >
            Sign In
          </Button>
        </div>

        <p className="text-sm text-muted-foreground pt-4">
          Find peace in every breath • Track your spiritual growth
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
