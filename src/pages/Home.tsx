import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sunrise, Sunset, Moon, Sparkles, Calendar as CalendarIcon, User, BookOpen, ListTodo } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import mandalaPattern from "@/assets/mandala-pattern.jpg";
import WeeklyCalendarView from "@/components/WeeklyCalendarView";

interface Profile {
  id: string;
  first_name: string;
  streak_count: number;
}

interface YogaSession {
  id: string;
  title: string;
  session_type: string;
  time_of_day: string;
}

interface MoonPhase {
  phase_type: string;
  description: string;
  phase_date: string;
}

interface UpcomingMoonPhases {
  pournami: MoonPhase[];
  amavasai: MoonPhase[];
}

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchSessions();
      fetchTodayMoonPhase();
      fetchUpcomingMoonPhases();
    }
  }, [user]);
  const [sessions, setSessions] = useState<YogaSession[]>([]);
  const [todayMoonPhase, setTodayMoonPhase] = useState<MoonPhase | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [upcomingPhases, setUpcomingPhases] = useState<UpcomingMoonPhases>({ pournami: [], amavasai: [] });

  const fetchUserData = async () => {
    const { data: profile } = await supabase
      .from('profiles' as any)
      .select('streak_count, first_name')
      .eq('id', user!.id)
      .single();

    if (profile) {
      setUserName((profile as any).first_name || "");
      setStreakCount((profile as any).streak_count || 0);
    }

    const { count } = await supabase
      .from('session_logs' as any)
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id);

    setTotalSessions(count || 0);
  };

  const fetchSessions = async () => {
    const { data } = await supabase
      .from('yoga_sessions')
      .select('*')
      .eq('is_active', true)
      .order('time_of_day', { ascending: true })
      .limit(2);

    setSessions(data || []);
  };

  const fetchTodayMoonPhase = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('moon_phases')
      .select('*')
      .eq('phase_date', today)
      .maybeSingle();

    setTodayMoonPhase(data);
  };

  const fetchUpcomingMoonPhases = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('moon_phases')
      .select('*')
      .gte('phase_date', today)
      .order('phase_date', { ascending: true })
      .limit(6);

    if (data) {
      setUpcomingPhases({
        pournami: data.filter(phase => phase.phase_type === 'pournami'),
        amavasai: data.filter(phase => phase.phase_type === 'amavasai')
      });
    }
  };

  const getMoonDisplay = () => {
    if (todayMoonPhase) {
      return {
        phase: todayMoonPhase.phase_type === 'pournami' ? 'Full Moon (Pournami)' : 'New Moon (Amavasai)',
        icon: todayMoonPhase.phase_type === 'pournami' ? '🌕' : '🌑',
      };
    }
    return { phase: 'Waxing Crescent', icon: '🌒' };
  };

  const getTimeBasedIcon = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return <Sunrise className="w-6 h-6 text-yellow-500" />;
    if (hour >= 12 && hour < 18) return <Sparkles className="w-6 h-6 text-accent" />;
    if (hour >= 18 && hour < 22) return <Sunset className="w-6 h-6 text-orange-500" />;
    return <Moon className="w-6 h-6 text-indigo-400" />;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour >= 12 && hour < 18) return "Good afternoon";
    if (hour >= 18 && hour < 22) return "Good evening";
    return "Good night";
  };

  const getWellnessQuote = () => {
    const quotes = [
      "Time to nurture your inner peace",
      "Your journey to tranquility begins here",
      "Let's create harmony in mind and body",
      "Embrace the calm within",
      "A moment of mindfulness awaits",
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const moonData = getMoonDisplay();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-border/50 backdrop-blur-sm bg-card/50">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            {getTimeBasedIcon()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-glow flex items-center gap-2">
              {getGreeting()}{userName ? `, ${userName}` : ''}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {getWellnessQuote()}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/profile')}
          className="rounded-full hover:bg-accent/20"
        >
          <User className="w-6 h-6 text-accent" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6 pb-24">
        {/* Weekly Calendar View - NEW */}
        <Card 
          className="p-5 bg-card/80 backdrop-blur-sm border-accent/30 shadow-card animate-fade-in-up"
          style={{ animationDelay: '0.05s' }}
        >
          <WeeklyCalendarView />
        </Card>

        {/* Daily Affirmation */}
        <Card 
          className="p-6 bg-gradient-to-br from-card to-secondary border-accent/30 shadow-glow relative overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url(${mandalaPattern})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-accent animate-glow-pulse" />
              <h2 className="text-sm font-semibold text-accent uppercase tracking-wider">Today's Affirmation</h2>
            </div>
            <p className="text-xl font-medium leading-relaxed mb-4">
              "I am at peace with myself and the universe flows through me"
            </p>
            <Button
              onClick={() => navigate('/affirmation')}
              variant="ghost"
              className="text-accent hover:text-accent hover:bg-accent/10"
            >
              View More Affirmations →
            </Button>
          </div>
        </Card>

        {/* Moon Phase Card */}
        <Card 
          className="p-6 bg-card/80 backdrop-blur-sm border-indigo/30 shadow-card animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex flex-col space-y-4">
            {/* Current Moon Phase */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-5xl animate-float">{moonData.icon}</div>
                <div>
                  <h3 className="text-lg font-semibold">{moonData.phase}</h3>
                  <p className="text-sm text-muted-foreground">Today's Moon Phase</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/calendar')}
                className="rounded-full hover:bg-indigo/20"
              >
                <CalendarIcon className="w-5 h-5 text-indigo" />
              </Button>
            </div>

            {/* Upcoming Phases */}
            <div className="border-t border-border/50 pt-4 mt-2">
              <div className="grid grid-cols-2 gap-4">
                {/* Pournami Dates */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <span className="text-lg">🌕</span>
                    Upcoming Pournami
                  </h4>
                  <div className="space-y-1">
                    {upcomingPhases.pournami.slice(0, 2).map((phase) => (
                      <p key={phase.phase_date} className="text-xs text-muted-foreground">
                        {new Date(phase.phase_date).toLocaleDateString('default', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    ))}
                  </div>
                </div>

                {/* Amavasai Dates */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <span className="text-lg">🌑</span>
                    Upcoming Amavasai
                  </h4>
                  <div className="space-y-1">
                    {upcomingPhases.amavasai.slice(0, 2).map((phase) => (
                      <p key={phase.phase_date} className="text-xs text-muted-foreground">
                        {new Date(phase.phase_date).toLocaleDateString('default', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="p-5 bg-gradient-to-br from-accent/20 to-transparent border-accent/40 hover:shadow-glow transition-all cursor-pointer animate-fade-in-up"
            onClick={() => navigate('/sessions')}
            style={{ animationDelay: '0.3s' }}
          >
            <ListTodo className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold text-sm">Manage Sessions</h3>
            <p className="text-xs text-muted-foreground">Create & edit</p>
          </Card>

          <Card 
            className="p-5 bg-gradient-to-br from-indigo/20 to-transparent border-indigo/40 hover:shadow-glow transition-all cursor-pointer animate-fade-in-up"
            onClick={() => navigate('/calendar')}
            style={{ animationDelay: '0.35s' }}
          >
            <CalendarIcon className="w-8 h-8 text-indigo mb-3" />
            <h3 className="font-semibold text-sm">Full Calendar</h3>
            <p className="text-xs text-muted-foreground">Month view</p>
          </Card>
        </div>

        {/* Today's Sessions */}
        {sessions.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground/90">Today's Practice</h2>
            {sessions.map((session, idx) => (
              <Card 
                key={session.id}
                className="p-5 bg-gradient-to-r from-accent/20 to-transparent border-accent/40 hover:shadow-glow transition-all duration-300 cursor-pointer"
                style={{ animationDelay: `${0.3 + idx * 0.1}s` }}
                onClick={() => navigate('/sessions')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center">
                    {session.time_of_day === 'morning' ? (
                      <Sunrise className="w-6 h-6 text-accent" />
                    ) : (
                      <Sunset className="w-6 h-6 text-accent" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{session.title}</h3>
                    <p className="text-sm text-muted-foreground capitalize">{session.session_type}</p>
                  </div>
                  <div className="text-sm text-accent font-medium">View →</div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-accent/20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-1">{streakCount}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Day Streak</div>
            </div>
          </Card>
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-indigo/20 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo mb-1">{totalSessions}</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Sessions</div>
            </div>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 p-4">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="flex flex-col gap-1 h-auto py-2 text-accent"
          >
            <Sunrise className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/calendar')}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <CalendarIcon className="w-6 h-6" />
            <span className="text-xs">Calendar</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/affirmation')}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <Sparkles className="w-6 h-6" />
            <span className="text-xs">Affirmations</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Home;
