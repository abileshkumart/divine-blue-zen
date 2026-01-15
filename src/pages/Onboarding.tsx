import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, Moon, Sun, Wind, Heart, Brain, ChevronRight, ChevronLeft } from "lucide-react";
import onboardingBg from "@/assets/onboarding-bg.jpg";
import { useEffect, useState } from "react";
import MeditateIcon from "@/components/icons/MeditateIcon";

// Preload the background image
const preloadImage = new Image();
preloadImage.src = onboardingBg;

interface OnboardingSlide {
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  features?: { icon: React.ReactNode; text: string }[];
}

const slides: OnboardingSlide[] = [
  {
    title: "WanderWithin",
    subtitle: "Welcome to Your Journey",
    description: "Discover inner peace through meditation, mindful practices, and holistic wellness for your mind and gut.",
    icon: <Sparkles className="w-12 h-12" />,
    features: [
      { icon: <Sun className="w-5 h-5" />, text: "Daily Practices" },
      { icon: <Moon className="w-5 h-5" />, text: "Moon Meditation" },
      { icon: <Heart className="w-5 h-5" />, text: "Gut Wellness" },
    ],
  },
  {
    title: "Meditate",
    subtitle: "Find Your Calm",
    description: "Experience guided meditations synced with lunar phases, breathing exercises, and sacred mantras to find your center.",
    icon: <MeditateIcon className="w-12 h-12" />,
    features: [
      { icon: <Moon className="w-5 h-5" />, text: "Moon-Synced Sessions" },
      { icon: <Wind className="w-5 h-5" />, text: "Breathing Exercises" },
      { icon: <Sparkles className="w-5 h-5" />, text: "Sacred Mantras" },
    ],
  },
  {
    title: "Daily Ideas",
    subtitle: "Manifest Your Vision",
    description: "Set powerful intentions, practice daily affirmations, and track your goals to manifest the life you desire.",
    icon: <Sparkles className="w-12 h-12" />,
    features: [
      { icon: <Sparkles className="w-5 h-5" />, text: "Daily Affirmations" },
      { icon: <Brain className="w-5 h-5" />, text: "Vision Board" },
      { icon: <Sun className="w-5 h-5" />, text: "Goal Tracking" },
    ],
  },
  {
    title: "Gut Health",
    subtitle: "Heal Your Second Brain",
    description: "Discover your gut type through our personalized quiz, get tailored food recommendations, and track your digestive wellness.",
    icon: <Heart className="w-12 h-12" />,
    features: [
      { icon: <Heart className="w-5 h-5" />, text: "Gut Type Quiz" },
      { icon: <Sun className="w-5 h-5" />, text: "Food Recipes" },
      { icon: <Brain className="w-5 h-5" />, text: "Mind-Gut Connection" },
    ],
  },
  {
    title: "Track Progress",
    subtitle: "Your Wellness Journey",
    description: "Build streaks, track sessions, reflect daily, and watch your transformation unfold with insightful analytics.",
    icon: <Moon className="w-12 h-12" />,
    features: [
      { icon: <Sun className="w-5 h-5" />, text: "Daily Reflections" },
      { icon: <Moon className="w-5 h-5" />, text: "Moon Calendar" },
      { icon: <Sparkles className="w-5 h-5" />, text: "Streak Tracking" },
    ],
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setSlideDirection('right');
      setCurrentSlide(prev => prev + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setSlideDirection('left');
      setCurrentSlide(prev => prev - 1);
    }
  };

  const goToSlide = (index: number) => {
    setSlideDirection(index > currentSlide ? 'right' : 'left');
    setCurrentSlide(index);
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;
  const isFirstSlide = currentSlide === 0;

  return (
    <div 
      className={`min-h-screen flex flex-col items-center justify-between relative overflow-hidden transition-opacity duration-500 ${
        isLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        backgroundImage: `url(${onboardingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#1a1b1e',
      }}
    >
      {/* Overlay with subtle gradient */}
      <div className="absolute inset-0 bg-background/85" />

      {/* Skip button */}
      {!isLastSlide && (
        <div className="relative z-20 w-full flex justify-end p-4 pt-[max(1rem,env(safe-area-inset-top))]">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auth')}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip
          </Button>
        </div>
      )}

      {/* Spacer for when skip button is hidden */}
      {isLastSlide && (
        <div className="w-full p-4 pt-[max(1rem,env(safe-area-inset-top))]" />
      )}

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-md px-6 py-8">
        {/* Simple Icon */}
        <div 
          className="mb-6 text-accent animate-fade-in-up"
          key={`icon-${currentSlide}`}
        >
          {slide.icon}
        </div>

        {/* Title & Description */}
        <div 
          className="text-center space-y-4 mb-8 animate-fade-in-up"
          key={`content-${currentSlide}`}
          style={{ animationDelay: '100ms' }}
        >
          <p className="text-accent text-sm font-medium tracking-wider uppercase">
            {slide.subtitle}
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-glow">
            {slide.title}
          </h1>
          <p className="text-base text-muted-foreground/90 leading-relaxed max-w-sm mx-auto">
            {slide.description}
          </p>
        </div>

        {/* Features */}
        {slide.features && (
          <div 
            className="flex items-center justify-center gap-6 w-full max-w-sm animate-fade-in-up"
            key={`features-${currentSlide}`}
            style={{ animationDelay: '200ms' }}
          >
            {slide.features.map((feature) => (
              <div
                key={feature.text}
                className="flex flex-col items-center gap-2"
              >
                <div className="text-accent">
                  {feature.icon}
                </div>
                <span className="text-xs text-muted-foreground text-center">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="relative z-10 w-full max-w-md px-6 pb-8 space-y-6">
        {/* Progress Dots */}
        <div className="flex items-center justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'w-8 bg-accent' 
                  : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3">
          {!isFirstSlide && (
            <Button
              variant="outline"
              size="lg"
              onClick={prevSlide}
              className="h-14 px-6 rounded-full border-accent/30 hover:bg-accent/10"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          
          {isLastSlide ? (
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="flex-1 h-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg shadow-glow hover:shadow-float transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              Get Started
            </Button>
          ) : (
            <Button
              size="lg"
              onClick={nextSlide}
              className="flex-1 h-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg shadow-glow hover:shadow-float transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>

        {/* Already have account */}
        {isFirstSlide && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/auth')}
            className="w-full text-muted-foreground hover:text-foreground"
          >
            I already have an account
          </Button>
        )}

        {isLastSlide && (
          <p className="text-center text-sm text-muted-foreground/80">
            🌟 Join thousands finding peace in every breath
          </p>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
