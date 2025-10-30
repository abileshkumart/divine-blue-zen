import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Activity, Brain, Dumbbell, Wind, Play, Pause, X, Check, ChevronLeft } from "lucide-react";
import { Session, SessionType } from "@/types/session";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion } from "framer-motion";

const moods = [
  { value: 'calm', emoji: '🌙', label: 'Calm' },
  { value: 'focused', emoji: '⚡️', label: 'Focused' },
  { value: 'energized', emoji: '😊', label: 'Energized' },
  { value: 'tired', emoji: '😐', label: 'Tired' },
  { value: 'stressed', emoji: '😟', label: 'Stressed' },
];

const SessionTracker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const session = location.state?.session as Session | undefined;

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [moodBefore, setMoodBefore] = useState<string>('');
  const [moodAfter, setMoodAfter] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [actualDuration, setActualDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session) {
      toast.error('No session selected');
      navigate('/sessions');
      return;
    }
    // Initialize with session duration in seconds
    setTimeRemaining(session.duration_minutes * 60);
  }, [session, navigate]);

  useEffect(() => {
    if (isRunning && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            if (intervalRef.current) clearInterval(intervalRef.current);
            // Calculate actual duration
            setActualDuration(session?.duration_minutes || 0);
            toast.success('Session complete! 🎉');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, isPaused, timeRemaining, session]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!moodBefore) {
      toast.error('Please select your mood before starting');
      return;
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Calculate actual duration based on time elapsed
    const elapsedSeconds = (session!.duration_minutes * 60) - timeRemaining;
    const elapsedMinutes = Math.ceil(elapsedSeconds / 60);
    setActualDuration(elapsedMinutes);
    setIsComplete(true);
    setIsRunning(false);
  };

  const handleComplete = async () => {
    if (!moodAfter) {
      toast.error('Please select your mood after practice');
      return;
    }

    try {
      const { error } = await supabase
        .from('session_logs' as any)
        .insert({
          user_id: user?.id,
          session_id: session?.id,
          session_name: session?.session_name,
          session_type: session?.session_type,
          log_date: new Date().toISOString().split('T')[0],
          actual_duration_minutes: actualDuration || session?.duration_minutes,
          mood_before: moodBefore,
          mood_after: moodAfter,
          notes: notes.trim() || null,
          completed: true,
        });

      if (error) throw error;

      // Update profile stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({
            total_sessions: ((profile as any).total_sessions || 0) + 1,
            total_minutes: ((profile as any).total_minutes || 0) + (actualDuration || session?.duration_minutes || 0),
          } as any)
          .eq('id', user?.id);
      }

      toast.success('Session logged successfully! 🎉');
      navigate('/calendar');
    } catch (error) {
      console.error('Error logging session:', error);
      toast.error('Failed to log session');
    }
  };

  const getSessionIcon = (type: SessionType) => {
    switch (type) {
      case 'yoga': return Activity;
      case 'meditation': return Brain;
      case 'stretching': return Dumbbell;
      case 'breathing': return Wind;
      default: return Activity;
    }
  };

  const getSessionColor = (type: SessionType) => {
    switch (type) {
      case 'yoga': return 'from-purple-500/20 to-purple-600/20';
      case 'meditation': return 'from-blue-500/20 to-blue-600/20';
      case 'stretching': return 'from-green-500/20 to-green-600/20';
      case 'breathing': return 'from-cyan-500/20 to-cyan-600/20';
      default: return 'from-accent/20 to-accent/30';
    }
  };

  const getAccentColor = (type: SessionType) => {
    switch (type) {
      case 'yoga': return 'text-purple-500';
      case 'meditation': return 'text-blue-500';
      case 'stretching': return 'text-green-500';
      case 'breathing': return 'text-cyan-500';
      default: return 'text-accent';
    }
  };

  if (!session) return null;

  const Icon = getSessionIcon(session.session_type);
  const progress = session.duration_minutes > 0 
    ? ((session.duration_minutes * 60 - timeRemaining) / (session.duration_minutes * 60)) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="p-6 border-b border-border/50 backdrop-blur-sm bg-card/50 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold">Practice Session</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="p-6 space-y-6 max-w-2xl mx-auto">
        {/* Session Info Card */}
        <Card className={`p-6 bg-gradient-to-br ${getSessionColor(session.session_type)} border-accent/20`}>
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-secondary/30">
              <Icon className={`w-8 h-8 ${getAccentColor(session.session_type)}`} />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">{session.session_name}</h2>
              <p className="text-muted-foreground capitalize">
                {session.session_type} • {session.duration_minutes} minutes
              </p>
            </div>
          </div>
        </Card>

        {/* Timer Display */}
        <Card className="p-8 bg-card/80 backdrop-blur-sm border-accent/40">
          <div className="text-center space-y-6">
            <motion.div
              className="relative w-64 h-64 mx-auto"
              animate={{ scale: isRunning && !isPaused ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 2, repeat: isRunning && !isPaused ? Infinity : 0 }}
            >
              {/* Progress Circle */}
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-secondary/30"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className={getAccentColor(session.session_type)}
                  strokeDasharray={`${2 * Math.PI * 120}`}
                  strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              
              {/* Time Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-6xl font-bold text-glow">
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-sm text-muted-foreground mt-2">
                  {isComplete ? 'Complete!' : isPaused ? 'Paused' : isRunning ? 'In Progress' : 'Ready to Start'}
                </span>
              </div>
            </motion.div>

            {/* Control Buttons */}
            {!isComplete && (
              <div className="flex gap-4 justify-center">
                {!isRunning ? (
                  <Button
                    size="lg"
                    onClick={handleStart}
                    className="w-40 bg-accent hover:bg-accent/90 shadow-glow"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handlePause}
                      className="w-32"
                    >
                      <Pause className="w-5 h-5 mr-2" />
                      {isPaused ? 'Resume' : 'Pause'}
                    </Button>
                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={handleStop}
                      className="w-32"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Stop
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Mood Selector - Before */}
        {!isRunning && !isComplete && (
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20">
            <h3 className="text-lg font-semibold mb-4">How are you feeling now?</h3>
            <div className="grid grid-cols-5 gap-3">
              {moods.map((mood) => (
                <Button
                  key={mood.value}
                  variant={moodBefore === mood.value ? 'default' : 'outline'}
                  className="flex flex-col h-auto py-3"
                  onClick={() => setMoodBefore(mood.value)}
                >
                  <span className="text-2xl mb-1">{mood.emoji}</span>
                  <span className="text-xs">{mood.label}</span>
                </Button>
              ))}
            </div>
          </Card>
        )}

        {/* Mood Selector - After & Complete */}
        {isComplete && (
          <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20">
            <h3 className="text-lg font-semibold mb-4">How do you feel now?</h3>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {moods.map((mood) => (
                <Button
                  key={mood.value}
                  variant={moodAfter === mood.value ? 'default' : 'outline'}
                  className="flex flex-col h-auto py-3"
                  onClick={() => setMoodAfter(mood.value)}
                >
                  <span className="text-2xl mb-1">{mood.emoji}</span>
                  <span className="text-xs">{mood.label}</span>
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Session Notes (Optional)
                </label>
                <Textarea
                  placeholder="How was your practice? Any insights or observations..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="bg-background/50"
                />
              </div>

              <Button
                size="lg"
                onClick={handleComplete}
                className="w-full bg-accent hover:bg-accent/90 shadow-glow"
              >
                <Check className="w-5 h-5 mr-2" />
                Complete & Save Session
              </Button>
            </div>
          </Card>
        )}

        {/* Breathing Instructions (for breathing sessions) */}
        {session.session_type === 'breathing' && isRunning && !isPaused && (
          <Card className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Box Breathing</h3>
              <motion.div
                animate={{
                  scale: [1, 1.3, 1.3, 1],
                }}
                transition={{
                  duration: 16,
                  repeat: Infinity,
                  times: [0, 0.25, 0.75, 1],
                }}
                className="w-24 h-24 mx-auto rounded-full bg-cyan-500/20 border-2 border-cyan-500/50"
              />
              <p className="text-sm text-muted-foreground">
                Inhale (4s) → Hold (4s) → Exhale (4s) → Hold (4s)
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SessionTracker;
