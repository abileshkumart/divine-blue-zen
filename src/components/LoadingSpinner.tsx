import { Sparkles } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  subMessage?: string;
}

const LoadingSpinner = ({ 
  message = "Loading your journey...", 
  subMessage = "Gathering your practice data" 
}: LoadingSpinnerProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        {/* Animated Lotus/Om Symbol */}
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-accent via-indigo to-accent animate-spin opacity-20 blur-xl"></div>
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-accent to-indigo animate-pulse"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-white animate-glow-pulse" />
          </div>
        </div>
        
        {/* Loading Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground animate-pulse">
            {message}
          </h2>
          <p className="text-sm text-muted-foreground">
            {subMessage}
          </p>
        </div>

        {/* Loading Dots */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-indigo animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
