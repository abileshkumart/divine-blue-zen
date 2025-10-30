import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface BreathingExerciseProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const BreathingExercise = ({ isOpen, onComplete }: BreathingExerciseProps) => {
  const [phase, setPhase] = useState<"intro" | "countdown" | "inhale" | "hold1" | "exhale" | "hold2">("intro");
  const [count, setCount] = useState(0);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isOpen) {
      setPhase("intro");
      setCount(0);
      setCountdown(3);
      return;
    }

    if (phase === "countdown") {
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setPhase("inhale");
            return 3;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(countdownTimer);
    }

    if (phase === "intro") {
      const startTimer = setTimeout(() => {
        setPhase("countdown");
      }, 2000);
      return () => clearTimeout(startTimer);
    }

    const timer = setInterval(() => {
      setPhase((currentPhase) => {
        switch (currentPhase) {
          case "inhale":
            return "hold1";
          case "hold1":
            return "exhale";
          case "exhale":
            return "hold2";
          case "hold2":
            setCount((c) => c + 1);
            return "inhale";
          default:
            return currentPhase;
        }
      });
    }, 4000); // 4 seconds per phase for box breathing

    return () => clearInterval(timer);
  }, [isOpen, phase]);

  useEffect(() => {
    if (count >= 3) {
      onComplete();
    }
  }, [count, onComplete]);

  const getMessage = () => {
    switch (phase) {
      case "intro":
        return "Ready";
      case "countdown":
        return countdown.toString();
      case "inhale":
        return "Inhale...";
      case "hold1":
        return "Hold...";
      case "exhale":
        return "Exhale...";
      case "hold2":
        return "Hold...";
    }
  };

  const getScale = (currentPhase: typeof phase) => {
    switch (currentPhase) {
      case "inhale":
        return 1.5;
      case "hold1":
        return 1.5;
      case "exhale":
        return 1;
      case "hold2":
        return 1;
      default:
        return 1;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%", borderRadius: "2rem 2rem 0 0" }}
          animate={{ 
            y: 0, 
            borderRadius: 0,
            transition: { 
              type: "spring",
              stiffness: 100,
              damping: 20
            }
          }}
          exit={{ 
            y: "100%",
            borderRadius: "2rem 2rem 0 0",
            transition: { 
              type: "spring",
              stiffness: 100,
              damping: 20
            }
          }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center gap-8"
        >
          {/* Intro text */}
          {(phase === "intro" || phase === "countdown") && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-2"
            >
              <h2 className="text-4xl md:text-5xl font-semibold text-accent mb-2">Let's Start</h2>
              <p className="text-muted-foreground">
                {phase === "countdown" ? "Get ready..." : "Find a comfortable position and relax"}
              </p>
            </motion.div>
          )}
          
          <motion.div 
            className="relative w-64 h-64"
            animate={{
              scale: getScale(phase)
            }}
            transition={{
              duration: 4,
              ease: "easeInOut"
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <motion.div
                  className="absolute inset-0 rounded-full bg-accent/20"
                  animate={{
                    scale: getScale(phase),
                    opacity: phase === "intro" ? 0 : 0.2,
                  }}
                  transition={{
                    duration: 4,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full bg-accent/40"
                  animate={{
                    scale: phase === "inhale" ? 1.3 : 
                           phase === "hold1" ? 1.3 : 1,
                    opacity: phase === "intro" ? 0 : 0.4,
                  }}
                  transition={{
                    duration: 4,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className={cn(
                    "relative rounded-full bg-accent flex items-center justify-center",
                    (phase === "intro" || phase === "countdown") ? "w-40 h-40" : "w-32 h-32"
                  )}
                  animate={{
                    scale: phase === "inhale" ? 1.2 : 
                           phase === "hold1" ? 1.2 : 1
                  }}
                  transition={{
                    duration: 4,
                    ease: "easeInOut"
                  }}
                >
                  <motion.span 
                    className={cn(
                      "text-accent-foreground font-medium tracking-wide",
                      (phase === "intro" || phase === "countdown") ? "text-5xl" : "text-2xl"
                    )}
                    animate={{
                      opacity: phase === "countdown" ? [1, 0.7, 1] : 1
                    }}
                    transition={{
                      duration: phase === "countdown" ? 1 : 4,
                      repeat: phase === "countdown" ? Infinity : 0,
                      ease: "easeInOut",
                    }}
                  >
                    {getMessage()}
                  </motion.span>
                </motion.div>
              </div>
            </div>
          </motion.div>
          
          <div className="absolute bottom-12 left-0 right-0 flex justify-center">
            <div className="px-4 py-2 rounded-full bg-accent/20 backdrop-blur-sm">
              <span className="text-sm text-accent">
                Breath {count + 1} of 3
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
