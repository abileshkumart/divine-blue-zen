import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sunrise, Sunset, Moon, Sparkles, Calendar as CalendarIcon, User, BookOpen, ListTodo } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import mandalaPattern from "@/assets/mandala-pattern.jpg";

interface YogaSession {
  id: string;
  title: string;
  session_type: string;
  time_of_day: string;
}

interface MoonPhase {
  phase_type: string;
  description: string;
}

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<YogaSession[]>([]);
  const [todayMoonPhase, setTodayMoonPhase] = useState<MoonPhase | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchSessions();
      fetchTodayMoonPhase();
    }
  }, [user]);
  const fetchUserData = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('streak_count')
      .eq('id', user!.id)
      .single();

    if (profile) {
      setStreakCount(profile.streak_count || 0);
    }

    const { count } = await supabase
      .from('session_logs')
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

  const getMoonDisplay = () => {
    if (todayMoonPhase) {
      return {
        phase: todayMoonPhase.phase_type === 'pournami' ? 'Full Moon (Pournami)' : 'New Moon (Amavasai)',
        icon: todayMoonPhase.phase_type === 'pournami' ? '🌕' : '🌑',
      };
    }
    return { phase: 'Waxing Crescent', icon: '🌒' };
  };

  const moonData = getMoonDisplay();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-border/50 backdrop-blur-sm bg-card/50">
        <div>
          <h1 className="text-2xl font-bold text-glow">Namaste</h1>
          <p className="text-sm text-muted-foreground">
            {user ? `Welcome back, ${user.email?.split('@')[0]}` : 'Welcome back to your practice'}
          </p>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl animate-float">{moonData.icon}</div>
              <div>
                <h3 className="text-lg font-semibold">{moonData.phase}</h3>
                <p className="text-sm text-muted-foreground">Perfect for meditation</p>
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
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="p-5 bg-gradient-to-br from-accent/20 to-transparent border-accent/40 hover:shadow-glow transition-all cursor-pointer"
            onClick={() => navigate('/sessions')}
          >
            <ListTodo className="w-8 h-8 text-accent mb-3" />
            <h3 className="font-semibold text-sm">Yoga Sessions</h3>
            <p className="text-xs text-muted-foreground">Manage schedule</p>
          </Card>

          <Card 
            className="p-5 bg-gradient-to-br from-indigo/20 to-transparent border-indigo/40 hover:shadow-glow transition-all cursor-pointer"
            onClick={() => navigate('/reflection')}
          >
            <BookOpen className="w-8 h-8 text-indigo mb-3" />
            <h3 className="font-semibold text-sm">Daily Reflection</h3>
            <p className="text-xs text-muted-foreground">Journal today</p>
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
