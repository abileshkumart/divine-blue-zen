import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Moon, Play, Clock, Wind, Sparkles, BookOpen, 
  Calendar as CalendarIcon, ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getMoonPhase, getMoonTheme, MoonPhaseInfo } from "@/lib/moonPhase";
import MeditationTimer from "@/components/MeditationTimer";
import MantraCard from "@/components/MantraCard";
import ManifestationLogger from "@/components/ManifestationLogger";
import { BreathingExercise } from "@/components/breathing-exercise";
import BottomNav from "@/components/BottomNav";
import { cn } from "@/lib/utils";

interface SessionType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
  color: string;
  type: "meditation" | "breathing" | "manifestation";
}

const Meditate = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [moonPhase, setMoonPhase] = useState<MoonPhaseInfo | null>(null);
  const [moonTheme, setMoonTheme] = useState<ReturnType<typeof getMoonTheme> | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showManifestation, setShowManifestation] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionType | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const phase = getMoonPhase();
    setMoonPhase(phase);
    setMoonTheme(getMoonTheme(phase.phase));
  }, []);

  const handleSessionStart = (session: SessionType) => {
    setSelectedSession(session);
    if (session.type === "meditation") {
      setShowTimer(true);
    } else if (session.type === "breathing") {
      setShowBreathing(true);
    } else if (session.type === "manifestation") {
      setShowManifestation(true);
    }
  };

  const sessions: SessionType[] = [
    {
      id: "moon-sync",
      title: "Moon-Synced",
      description: moonTheme?.theme || "Align with lunar energy",
      icon: <Moon className="w-6 h-6" />,
      duration: 10,
      color: "from-indigo-500/20 to-purple-500/20",
      type: "meditation",
    },
    {
      id: "breathing",
      title: "Breathing",
      description: "Box breathing for calm",
      icon: <Wind className="w-6 h-6" />,
      duration: 5,
      color: "from-cyan-500/20 to-blue-500/20",
      type: "breathing",
    },
    {
      id: "manifestation",
      title: "Manifestation",
      description: "Set your intentions",
      icon: <Sparkles className="w-6 h-6" />,
      duration: 0,
      color: "from-amber-500/20 to-orange-500/20",
      type: "manifestation",
    },
    {
      id: "quick",
      title: "Quick Calm",
      description: "3-minute reset",
      icon: <Clock className="w-6 h-6" />,
      duration: 3,
      color: "from-emerald-500/20 to-teal-500/20",
      type: "meditation",
    },
  ];

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with Moon Phase */}
      <header className="p-6 border-b border-border/50 backdrop-blur-sm bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Meditate</h1>
            <p className="text-sm text-muted-foreground">Find your inner peace</p>
          </div>
          {moonPhase && (
            <div className="text-center">
              <div className="text-3xl">{moonPhase.emoji}</div>
              <p className="text-xs text-muted-foreground mt-1">{moonPhase.phaseName}</p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* Moon Phase Card */}
        {moonPhase && moonTheme && (
          <Card className="p-5 bg-gradient-to-br from-accent/20 via-card to-card border-accent/30">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{moonPhase.emoji}</div>
              <div className="flex-1">
                <h2 className="font-semibold text-lg">{moonTheme.theme}</h2>
                <p className="text-sm text-muted-foreground mb-3">{moonTheme.energy}</p>
                <div className="flex flex-wrap gap-2">
                  {moonTheme.activities.slice(0, 3).map((activity, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full"
                    >
                      {activity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Moon cycle progress */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>🌑 New</span>
                <span>Day {moonPhase.dayOfCycle} of 29</span>
                <span>🌕 Full</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent/50 to-accent transition-all"
                  style={{ width: `${moonPhase.cycleProgress}%` }}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Session Types Grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Choose Your Practice
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className={cn(
                  "p-4 bg-gradient-to-br border-border/50 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]",
                  session.color
                )}
                onClick={() => handleSessionStart(session)}
              >
                <div className="text-accent mb-3">{session.icon}</div>
                <h4 className="font-semibold">{session.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{session.description}</p>
                {session.duration > 0 && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{session.duration} min</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Daily Mantra */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Today's Mantra
          </h3>
          <MantraCard moonPhase={moonPhase?.phase} />
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Card 
              className="p-4 bg-card/80 border-border/50 flex items-center justify-between cursor-pointer hover:bg-card/90 transition-colors"
              onClick={() => navigate('/calendar')}
            >
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium">Meditation Calendar</p>
                  <p className="text-xs text-muted-foreground">View your practice history</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Card>
            
            <Card 
              className="p-4 bg-card/80 border-border/50 flex items-center justify-between cursor-pointer hover:bg-card/90 transition-colors"
              onClick={() => setShowManifestation(true)}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium">Journal Entry</p>
                  <p className="text-xs text-muted-foreground">Log your reflections</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </Card>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Modals */}
      <MeditationTimer
        isOpen={showTimer}
        onClose={() => {
          setShowTimer(false);
          setSelectedSession(null);
        }}
        duration={selectedSession?.duration || 5}
        title={selectedSession?.title || "Meditation"}
        moonEmoji={moonPhase?.emoji || "🌙"}
      />

      {showBreathing && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center">
          <div className="text-center">
            <BreathingExercise
              isOpen={showBreathing}
              onComplete={() => setShowBreathing(false)}
            />
            <Button
              variant="ghost"
              onClick={() => setShowBreathing(false)}
              className="mt-8"
            >
              Close
            </Button>
          </div>
        </div>
      )}

      <ManifestationLogger
        isOpen={showManifestation}
        onClose={() => setShowManifestation(false)}
        userId={user?.id}
        moonPhase={moonPhase?.phase}
        moonEmoji={moonPhase?.emoji}
      />
    </div>
  );
};

export default Meditate;
