import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Pause, RotateCcw, X, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface MeditationTimerProps {
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // in minutes
  title?: string;
  moonEmoji?: string;
}

const PRESET_DURATIONS = [3, 5, 10, 15, 20, 30]; // minutes

export const MeditationTimer = ({
  isOpen,
  onClose,
  duration: initialDuration = 5,
  title = "Meditation",
  moonEmoji = "🌙",
}: MeditationTimerProps) => {
  const [selectedDuration, setSelectedDuration] = useState(initialDuration);
  const [timeRemaining, setTimeRemaining] = useState(initialDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [phase, setPhase] = useState<"setup" | "active" | "complete">("setup");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setPhase("setup");
      setIsRunning(false);
      setIsComplete(false);
      setTimeRemaining(selectedDuration * 60);
    }
  }, [isOpen, selectedDuration]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            setPhase("complete");
            // Play completion sound
            if (soundEnabled) {
              playBell();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, timeRemaining, soundEnabled]);

  const playBell = () => {
    // Create a simple bell sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 528; // Healing frequency
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 2);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 2);
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    setPhase("active");
    setIsRunning(true);
    if (soundEnabled) {
      playBell();
    }
  };

  const handlePauseResume = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsComplete(false);
    setTimeRemaining(selectedDuration * 60);
    setPhase("setup");
  };

  const handleDurationSelect = (mins: number) => {
    setSelectedDuration(mins);
    setTimeRemaining(mins * 60);
  };

  const progress = ((selectedDuration * 60 - timeRemaining) / (selectedDuration * 60)) * 100;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col"
      >
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold">{title}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </Button>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center justify-center p-6">
          {phase === "setup" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8 w-full max-w-sm"
            >
              <div className="text-6xl">{moonEmoji}</div>
              <h2 className="text-2xl font-bold">Choose Duration</h2>
              
              <div className="grid grid-cols-3 gap-3">
                {PRESET_DURATIONS.map((mins) => (
                  <Button
                    key={mins}
                    variant={selectedDuration === mins ? "default" : "outline"}
                    onClick={() => handleDurationSelect(mins)}
                    className={cn(
                      "h-16 text-lg",
                      selectedDuration === mins && "bg-accent text-accent-foreground"
                    )}
                  >
                    {mins} min
                  </Button>
                ))}
              </div>

              <Button
                onClick={handleStart}
                size="lg"
                className="w-full h-14 text-lg bg-accent hover:bg-accent/90"
              >
                <Play className="w-5 h-5 mr-2" />
                Begin Session
              </Button>
            </motion.div>
          )}

          {phase === "active" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              {/* Timer Circle */}
              <div className="relative w-64 h-64 mx-auto">
                {/* Background circle */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-muted/30"
                  />
                  <motion.circle
                    cx="128"
                    cy="128"
                    r="120"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="text-accent"
                    strokeDasharray={2 * Math.PI * 120}
                    strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
                    initial={{ strokeDashoffset: 2 * Math.PI * 120 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100) }}
                    transition={{ duration: 0.5 }}
                  />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    animate={{
                      scale: isRunning ? [1, 1.05, 1] : 1,
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                    className="text-4xl mb-2"
                  >
                    {moonEmoji}
                  </motion.div>
                  <div className="text-4xl font-mono font-bold">
                    {formatTime(timeRemaining)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {isRunning ? "Breathe..." : "Paused"}
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                  className="w-14 h-14 rounded-full"
                >
                  <RotateCcw className="w-6 h-6" />
                </Button>
                <Button
                  onClick={handlePauseResume}
                  size="icon"
                  className="w-20 h-20 rounded-full bg-accent hover:bg-accent/90"
                >
                  {isRunning ? (
                    <Pause className="w-8 h-8" />
                  ) : (
                    <Play className="w-8 h-8 ml-1" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onClose}
                  className="w-14 h-14 rounded-full"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
            </motion.div>
          )}

          {phase === "complete" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="text-8xl"
              >
                ✨
              </motion.div>
              <h2 className="text-2xl font-bold">Session Complete</h2>
              <p className="text-muted-foreground">
                You meditated for {selectedDuration} minutes
              </p>
              <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="lg"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Meditate Again
                </Button>
                <Button
                  onClick={onClose}
                  size="lg"
                  className="bg-accent hover:bg-accent/90"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </main>
      </motion.div>
    </AnimatePresence>
  );
};

export default MeditationTimer;
