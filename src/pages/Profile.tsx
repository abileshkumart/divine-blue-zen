import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Settings, TrendingUp, Award, Flame, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import moonBg from "@/assets/moon-bg.jpg";

interface Profile {
  display_name: string;
  streak_count: number;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchTotalSessions();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single();

    setProfile(data);
  };

  const fetchTotalSessions = async () => {
    const { count } = await supabase
      .from('session_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user!.id);

    setTotalSessions(count || 0);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <div 
        className="relative h-48 overflow-hidden"
        style={{
          backgroundImage: `url(${moonBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        
        <div className="relative z-10 p-6 flex items-start justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="rounded-full bg-background/20 backdrop-blur-md hover:bg-background/40"
          >
            <LogOut className="w-5 h-5 text-white" />
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-6 -mt-16 relative z-20">
        <div className="flex items-end gap-4 mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-indigo flex items-center justify-center text-3xl font-bold shadow-float border-4 border-background">
            {(profile?.display_name || user?.email || 'YJ').substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 pb-2">
            <h1 className="text-2xl font-bold mb-1">{profile?.display_name || user?.email?.split('@')[0] || 'Yoga Journey'}</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 bg-gradient-to-br from-accent/20 to-transparent border-accent/40 text-center">
            <Flame className="w-6 h-6 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-accent">{profile?.streak_count || 0}</div>
            <div className="text-xs text-muted-foreground">Day Streak</div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-indigo/20 to-transparent border-indigo/40 text-center">
            <Award className="w-6 h-6 text-indigo mx-auto mb-2" />
            <div className="text-2xl font-bold text-indigo">{Math.floor(totalSessions / 10)}</div>
            <div className="text-xs text-muted-foreground">Achievements</div>
          </Card>
          
          <Card className="p-4 bg-gradient-to-br from-glow/20 to-transparent border-glow/40 text-center">
            <TrendingUp className="w-6 h-6 text-glow mx-auto mb-2" />
            <div className="text-2xl font-bold text-glow">{totalSessions}</div>
            <div className="text-xs text-muted-foreground">Sessions</div>
          </Card>
        </div>

        {/* Activity Graph */}
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20 mb-6">
          <h3 className="text-lg font-semibold mb-4">Practice Activity</h3>
          
          {/* Simple activity bars */}
          <div className="space-y-3">
            {[
              { day: 'Mon', hours: 0.5, color: 'accent' },
              { day: 'Tue', hours: 1, color: 'accent' },
              { day: 'Wed', hours: 0.75, color: 'accent' },
              { day: 'Thu', hours: 0, color: 'muted' },
              { day: 'Fri', hours: 1.25, color: 'indigo' },
              { day: 'Sat', hours: 0.5, color: 'accent' },
              { day: 'Sun', hours: 1, color: 'accent' },
            ].map((item) => (
              <div key={item.day} className="flex items-center gap-3">
                <span className="text-xs font-medium w-8 text-muted-foreground">{item.day}</span>
                <div className="flex-1 h-8 bg-secondary/30 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.color === 'accent' ? 'bg-accent shadow-glow' : 
                      item.color === 'indigo' ? 'bg-indigo shadow-glow' : 'bg-muted'
                    }`}
                    style={{ width: `${(item.hours / 1.5) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-12 text-right text-muted-foreground">
                  {item.hours > 0 ? `${item.hours}h` : '-'}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total this week</span>
              <span className="text-lg font-bold text-accent">5h</span>
            </div>
          </div>
        </Card>

        {/* Mood & Energy Tracker */}
        <Card className="p-6 bg-gradient-to-br from-indigo/20 to-transparent border-indigo/40 mb-6">
          <h3 className="text-lg font-semibold mb-4">Energy Levels</h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Physical Energy</span>
                <span className="text-sm font-semibold text-accent">85%</span>
              </div>
              <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                <div className="h-full w-[85%] bg-accent rounded-full shadow-glow" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Mental Clarity</span>
                <span className="text-sm font-semibold text-indigo">92%</span>
              </div>
              <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                <div className="h-full w-[92%] bg-indigo rounded-full shadow-glow" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Spiritual Balance</span>
                <span className="text-sm font-semibold text-glow">78%</span>
              </div>
              <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                <div className="h-full w-[78%] bg-glow rounded-full shadow-glow" />
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Achievements */}
        <div className="space-y-3 mb-6">
          <h3 className="text-lg font-semibold">Recent Achievements</h3>
          
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-accent/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h4 className="font-semibold">7 Day Streak</h4>
                <p className="text-xs text-muted-foreground">Unlocked today</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/60 backdrop-blur-sm border-indigo/20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo/20 flex items-center justify-center">
                <Award className="w-6 h-6 text-indigo" />
              </div>
              <div>
                <h4 className="font-semibold">100 Sessions Complete</h4>
                <p className="text-xs text-muted-foreground">Unlocked 3 days ago</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 p-4">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <div className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/calendar')}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <div className="w-6 h-6" />
            <span className="text-xs">Calendar</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/affirmation')}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <div className="w-6 h-6" />
            <span className="text-xs">Affirmations</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col gap-1 h-auto py-2 text-accent"
          >
            <div className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Profile;
