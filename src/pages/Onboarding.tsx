import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Moon, Sun, Wind } from "lucide-react";
import onboardingBg from "@/assets/onboarding-bg.jpg";
import { useEffect, useState } from "react";

// Preload the background image
const preloadImage = new Image();
preloadImage.src = onboardingBg;

const features = [
  { icon: Sun, text: "Daily Guided Practices" },
  { icon: Moon, text: "Moon Phase Meditation" },
  { icon: Wind, text: "Breathing Exercises" },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Add a small delay to ensure smooth animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-opacity duration-500 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundImage: `url(${onboardingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#1a1b1e', // Fallback color while image loads
      }}
    >
      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-background/40 to-background/60 backdrop-blur-[2px]" />
      
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
              opacity: 0.6 + Math.random() * 0.4,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 max-w-md w-full px-6 animate-fade-in-up">
        {/* Logo and Title */}
        <div className="space-y-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-accent/20 backdrop-blur-sm animate-float">
            <Sparkles className="w-12 h-12 text-accent" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-glow leading-tight">
            WanderWithin
          </h1>
          
          <p className="text-base md:text-lg text-muted-foreground/90 leading-relaxed max-w-sm mx-auto">
            Your journey to inner peace begins here. Track your practice, reflect daily, and discover the wisdom within.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 py-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.text}
                className="flex flex-col items-center gap-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-12 h-12 rounded-full bg-accent/20 backdrop-blur-sm flex items-center justify-center">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <span className="text-xs md:text-sm text-muted-foreground text-center">
                  {feature.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 w-full max-w-sm mx-auto">
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg h-14 rounded-full shadow-glow hover:shadow-float transition-all duration-300 hover:scale-105 active:scale-95"
          >
            Get Started
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/auth')}
            className="w-full border-accent/50 text-foreground hover:bg-accent/10 font-medium text-lg h-14 rounded-full backdrop-blur-sm active:scale-95"
          >
            I Already Have an Account
          </Button>
        </div>

        <p className="text-sm text-muted-foreground/80 pt-2">
          🌟 Join thousands finding peace in every breath
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
