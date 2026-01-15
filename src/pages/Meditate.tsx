import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Moon, Play, Clock, Wind, Sparkles, BookOpen, 
  Calendar as CalendarIcon, ChevronRight, Plus,
  Activity, Brain, Dumbbell, Check, Flower2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getMoonPhase, getMoonTheme, MoonPhaseInfo } from "@/lib/moonPhase";
import MeditationTimer from "@/components/MeditationTimer";
import MantraCard from "@/components/MantraCard";
import ManifestationLogger from "@/components/ManifestationLogger";
import { BreathingExercise } from "@/components/breathing-exercise";
import { CreateSessionForm } from "@/components/CreateSessionForm";
import ChakraFlow from "@/components/ChakraFlow";
import BottomNav from "@/components/BottomNav";
import { cn } from "@/lib/utils";
import type { Session } from "@/types/session";

interface SessionType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  duration: number;
  color: string;
  type: "meditation" | "breathing" | "manifestation" | "chakra";
}

interface SessionLog {
  session_id: string;
  log_date: string;
}

const Meditate = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [moonPhase, setMoonPhase] = useState<MoonPhaseInfo | null>(null);
  const [moonTheme, setMoonTheme] = useState<ReturnType<typeof getMoonTheme> | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [showBreathing, setShowBreathing] = useState(false);
  const [showManifestation, setShowManifestation] = useState(false);
  const [showChakra, setShowChakra] = useState(false);
  const [selectedSession, setSelectedSession] = useState<SessionType | null>(null);
  
  // User Sessions State
  const [userSessions, setUserSessions] = useState<Session[]>([]);
  const [todayLogs, setTodayLogs] = useState<SessionLog[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [showCreateSession, setShowCreateSession] = useState(false);

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

  // Fetch user's custom sessions for today
  const fetchUserSessions = async () => {
    if (!user) return;
    
    setIsLoadingSessions(true);
    try {
      const today = new Date();
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayName = dayNames[today.getDay()];
      const todayStr = today.toISOString().split('T')[0];

      // Fetch all active sessions
      const { data: sessions } = await supabase
        .from('sessions' as any)
        .select('*')
        .eq('is_active', true)
        .order('scheduled_time', { ascending: true });

      if (sessions) {
        // Filter sessions scheduled for today
        const todaySessions = (sessions as unknown as Session[]).filter(s => 
          s.days_of_week.some(d => d.toLowerCase().startsWith(todayName.toLowerCase()))
        );
        setUserSessions(todaySessions);
      }

      // Fetch today's completion logs
      const { data: logs } = await supabase
        .from('session_logs' as any)
        .select('session_id, log_date')
        .eq('user_id', user.id)
        .eq('log_date', todayStr);

      if (logs) {
        setTodayLogs(logs as unknown as SessionLog[]);
      }
    } catch (error) {
      console.log('Error fetching sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserSessions();
    }
  }, [user]);

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'yoga': return Activity;
      case 'meditation': return Brain;
      case 'stretching': return Dumbbell;
      case 'breathing': return Wind;
      default: return Sparkles;
    }
  };

  const getSessionColor = (type: string) => {
    switch (type) {
      case 'yoga': return 'from-purple-500 to-purple-600';
      case 'meditation': return 'from-blue-500 to-blue-600';
      case 'stretching': return 'from-green-500 to-green-600';
      case 'breathing': return 'from-cyan-500 to-cyan-600';
      default: return 'from-accent to-indigo';
    }
  };

  const isSessionCompleted = (sessionId: string) => {
    return todayLogs.some(log => log.session_id === sessionId);
  };

  const handleStartUserSession = (session: Session) => {
    navigate('/session-tracker', { 
      state: { session, date: new Date().toISOString() } 
    });
  };

  const handleSessionCreated = () => {
    setShowCreateSession(false);
    fetchUserSessions();
  };

  const handleSessionStart = (session: SessionType) => {
    setSelectedSession(session);
    if (session.type === "meditation") {
      setShowTimer(true);
    } else if (session.type === "breathing") {
      setShowBreathing(true);
    } else if (session.type === "manifestation") {
      setShowManifestation(true);
    } else if (session.type === "chakra") {
      setShowChakra(true);
    }
  };

  const sessions: SessionType[] = [
    {
      id: "chakra",
      title: "Chakra Healing",
      description: "Balance your energy centers",
      icon: <Flower2 className="w-6 h-6" />,
      duration: 15,
      color: "from-rose-500/20 to-violet-500/20",
      type: "chakra",
    },
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
      <header className="p-6 pt-[max(1.5rem,env(safe-area-inset-top))] border-b border-border/50 backdrop-blur-sm bg-card/50">
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

        {/* My Sessions - Today's Schedule */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Today's Sessions
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateSession(true)}
                className="text-accent text-xs h-7 px-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/sessions')}
                className="text-muted-foreground text-xs h-7 px-2"
              >
                View All
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>

          {isLoadingSessions ? (
            <Card className="p-4 bg-card/60 border-border/50">
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
            </Card>
          ) : userSessions.length > 0 ? (
            <div className="space-y-2">
              {userSessions.map((session) => {
                const Icon = getSessionIcon(session.session_type);
                const isCompleted = isSessionCompleted(session.id);
                
                return (
                  <Card 
                    key={session.id}
                    className={cn(
                      "p-3 transition-all",
                      isCompleted 
                        ? "bg-green-500/10 border-green-500/30" 
                        : "bg-card/60 border-border/50 hover:bg-card/80"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-lg bg-gradient-to-br",
                          getSessionColor(session.session_type)
                        )}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-sm">{session.session_name}</h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{session.scheduled_time}</span>
                            <span>•</span>
                            <span>{session.duration_minutes} min</span>
                          </div>
                        </div>
                      </div>
                      
                      {isCompleted ? (
                        <div className="flex items-center gap-1 text-green-500">
                          <Check className="w-5 h-5" />
                          <span className="text-xs font-medium">Done</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleStartUserSession(session)}
                          className="bg-gradient-to-r from-accent to-indigo hover:from-accent/90 hover:to-indigo/90"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-5 bg-card/60 border-border/50 text-center">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                  <CalendarIcon className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">No sessions for today</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Create personalized sessions to build your routine
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowCreateSession(true)}
                  className="bg-gradient-to-r from-accent to-indigo"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create Session
                </Button>
              </div>
            </Card>
          )}
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

      {/* Chakra Healing Flow */}
      {showChakra && (
        <ChakraFlow onClose={() => setShowChakra(false)} />
      )}

      {/* Create Session Dialog */}
      <Dialog open={showCreateSession} onOpenChange={setShowCreateSession}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-accent/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-accent to-indigo bg-clip-text text-transparent">
              Create New Session
            </DialogTitle>
          </DialogHeader>
          <CreateSessionForm
            onSuccess={handleSessionCreated}
            onCancel={() => setShowCreateSession(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Meditate;
