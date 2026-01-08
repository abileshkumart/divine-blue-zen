import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sunrise, Sunset, Moon, Sparkles, Calendar as CalendarIcon, User, BookOpen, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import mandalaPattern from "@/assets/mandala-pattern.jpg";
import WeeklyCalendarView from "@/components/WeeklyCalendarView";
import SphereImageGrid, { ImageData } from "@/components/ui/image-sphere";
import LoadingSpinner from "@/components/LoadingSpinner";
import PullToRefresh from "@/components/PullToRefresh";
import BottomNav from "@/components/BottomNav";

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

// Sample images for the sphere - spiritual and meditation themed
const JOURNEY_IMAGES: ImageData[] = [
  {
    id: "img-1",
    src: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=400&h=400&fit=crop",
    alt: "Meditation in Nature",
    title: "Morning Meditation",
    description: "Finding peace in nature's embrace"
  },
  {
    id: "img-2",
    src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop",
    alt: "Yoga Practice",
    title: "Inner Balance",
    description: "Embracing the calm within through yoga"
  },
  {
    id: "img-3",
    src: "https://images.unsplash.com/photo-1545389336-cf090694435e?w=400&h=400&fit=crop",
    alt: "Peaceful Meditation",
    title: "Mindful Moments",
    description: "Creating space for stillness"
  },
  {
    id: "img-4",
    src: "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=400&h=400&fit=crop",
    alt: "Breathing Exercise",
    title: "Breathwork Practice",
    description: "Every breath a new beginning"
  },
  {
    id: "img-5",
    src: "https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=400&fit=crop",
    alt: "Zen Garden",
    title: "Tranquil Space",
    description: "Journey to inner stillness"
  },
  {
    id: "img-6",
    src: "https://images.unsplash.com/photo-1593811167562-9cef47bfc4d7?w=400&h=400&fit=crop",
    alt: "Spiritual Symbols",
    title: "Sacred Space",
    description: "Finding your sanctuary within"
  },
  {
    id: "img-7",
    src: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400&h=400&fit=crop",
    alt: "Mindful Walking",
    title: "Mindful Awareness",
    description: "Present in every moment"
  },
  {
    id: "img-8",
    src: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop",
    alt: "Yoga Flow",
    title: "Flow State",
    description: "Moving with intention and grace"
  },
  {
    id: "img-9",
    src: "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400&h=400&fit=crop",
    alt: "Gentle Yoga",
    title: "Gentle Practice",
    description: "Honoring your body's wisdom"
  },
  {
    id: "img-10",
    src: "https://images.unsplash.com/photo-1447452001602-7090c7ab2db3?w=400&h=400&fit=crop",
    alt: "Lotus Position",
    title: "Daily Ritual",
    description: "Building a mindful practice"
  },
  {
    id: "img-11",
    src: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop&sat=-50",
    alt: "Evening Meditation",
    title: "Evening Reflection",
    description: "Closing the day with gratitude"
  },
  {
    id: "img-12",
    src: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&h=400&fit=crop",
    alt: "Centered Being",
    title: "Inner Peace",
    description: "Finding your center through practice"
  }
];

const Home = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [userName, setUserName] = useState<string>("");
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);
  
  const [sessions, setSessions] = useState<YogaSession[]>([]);
  const [todayMoonPhase, setTodayMoonPhase] = useState<MoonPhase | null>(null);
  const [streakCount, setStreakCount] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [upcomingPhases, setUpcomingPhases] = useState<UpcomingMoonPhases>({ pournami: [], amavasai: [] });

  const loadAllData = async () => {
    setIsLoadingData(true);
    try {
      await Promise.all([
        fetchUserData(),
        fetchSessions(),
        fetchTodayMoonPhase(),
        fetchUpcomingMoonPhases()
      ]);
    } finally {
      setIsLoadingData(false);
    }
  };

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

  // Loading State
  if (loading || isLoadingData) {
    return (
      <LoadingSpinner
        message={loading ? "Preparing your sanctuary..." : "Loading your journey..."}
        subMessage={loading ? "Setting up your mindful space" : "Gathering your practice data"}
      />
    );
  }

  return (
    <>
    <PullToRefresh onRefresh={loadAllData}>
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
      <main className="p-6 space-y-6 pb-28">
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

        {/* Quick Actions - 4 Grid */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3">
            <Card 
              className="p-3 bg-card/60 border-border/50 hover:bg-card/80 transition-all cursor-pointer animate-fade-in-up flex flex-col items-center text-center"
              onClick={() => navigate('/meditate')}
              style={{ animationDelay: '0.3s' }}
            >
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center mb-2">
                <Moon className="w-5 h-5 text-cyan-500" />
              </div>
              <span className="text-xs font-medium">Meditate</span>
            </Card>

            <Card 
              className="p-3 bg-card/60 border-border/50 hover:bg-card/80 transition-all cursor-pointer animate-fade-in-up flex flex-col items-center text-center"
              onClick={() => navigate('/idea')}
              style={{ animationDelay: '0.35s' }}
            >
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-xs font-medium">Ideas</span>
            </Card>

            <Card 
              className="p-3 bg-card/60 border-border/50 hover:bg-card/80 transition-all cursor-pointer animate-fade-in-up flex flex-col items-center text-center"
              onClick={() => navigate('/gut')}
              style={{ animationDelay: '0.4s' }}
            >
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mb-2">
                <Heart className="w-5 h-5 text-green-500" />
              </div>
              <span className="text-xs font-medium">Gut</span>
            </Card>

            <Card 
              className="p-3 bg-card/60 border-border/50 hover:bg-card/80 transition-all cursor-pointer animate-fade-in-up flex flex-col items-center text-center"
              onClick={() => navigate('/calendar')}
              style={{ animationDelay: '0.45s' }}
            >
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center mb-2">
                <CalendarIcon className="w-5 h-5 text-indigo-500" />
              </div>
              <span className="text-xs font-medium">Calendar</span>
            </Card>
          </div>
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

        {/* Stats Row - Improved */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-2xl">🔥</span>
                <span className="text-2xl font-bold text-orange-500">{streakCount}</span>
              </div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-accent/10 to-transparent border-accent/30 animate-fade-in-up" style={{ animationDelay: '0.55s' }}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-2xl">🧘</span>
                <span className="text-2xl font-bold text-accent">{totalSessions}</span>
              </div>
              <div className="text-xs text-muted-foreground">Sessions</div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/30 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <span className="text-2xl">{moonData.icon}</span>
              </div>
              <div className="text-xs text-muted-foreground">Moon Phase</div>
            </div>
          </Card>
        </div>

        {/* Journey Sphere - Interactive 3D Memory Gallery */}
        <Card 
          className="p-6 bg-gradient-to-br from-card/80 to-secondary/30 backdrop-blur-sm border-accent/30 shadow-glow animate-fade-in-up overflow-hidden"
          style={{ animationDelay: '0.7s' }}
        >
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent animate-glow-pulse" />
                  Your Journey
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Explore moments of mindfulness
                </p>
              </div>
            </div>
            
            <div className="flex justify-center items-center py-4">
              <SphereImageGrid
                images={JOURNEY_IMAGES}
                containerSize={Math.min(400, window.innerWidth - 80)}
                sphereRadius={180}
                dragSensitivity={0.8}
                momentumDecay={0.96}
                maxRotationSpeed={6}
                baseImageScale={0.15}
                hoverScale={1.3}
                perspective={1000}
                autoRotate={true}
                autoRotateSpeed={0.2}
                className="mx-auto"
              />
            </div>

            <p className="text-xs text-center text-muted-foreground mt-4">
              Drag to explore • Tap any image to view details
            </p>
          </div>
        </Card>
      </main>
      </div>
    </PullToRefresh>
    
    {/* Bottom Navigation - Outside PullToRefresh */}
    <BottomNav />
    </>
  );
};

export default Home;
