import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ChevronLeft, 
  Settings, 
  TrendingUp, 
  Award, 
  Flame, 
  LogOut,
  Calendar as CalendarIcon,
  Clock,
  Target,
  Activity,
  Brain,
  Dumbbell,
  Wind,
  Sparkles,
  User,
  BarChart3,
  PieChart,
  TrendingDown,
  Zap,
  Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import moonBg from "@/assets/moon-bg.jpg";
import LoadingSpinner from "@/components/LoadingSpinner";
import PullToRefresh from "@/components/PullToRefresh";

interface Profile {
  display_name: string;
  streak_count: number;
  total_sessions?: number;
  total_minutes?: number;
}

interface SessionLog {
  id: string;
  session_type: string;
  log_date: string;
  actual_duration_minutes: number;
  mood_before: string;
  mood_after: string;
}

interface WeeklyData {
  day: string;
  hours: number;
  sessions: number;
}

interface SessionTypeStats {
  type: string;
  count: number;
  totalMinutes: number;
  percentage: number;
  color: string;
  icon: any;
}

interface MoodTrend {
  mood: string;
  count: number;
  emoji: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [sessionTypeStats, setSessionTypeStats] = useState<SessionTypeStats[]>([]);
  const [moodTrends, setMoodTrends] = useState<{ before: MoodTrend[], after: MoodTrend[] }>({ before: [], after: [] });
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  const loadAllData = async () => {
    setIsLoadingData(true);
    await Promise.all([
      fetchProfile(),
      fetchSessionLogs()
    ]);
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  useEffect(() => {
    if (sessionLogs.length > 0) {
      calculateWeeklyData();
      calculateSessionTypeStats();
      calculateMoodTrends();
      calculateStreaks();
    }
  }, [sessionLogs]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user!.id)
      .single();

    setProfile(data);
  };

  const fetchSessionLogs = async () => {
    // Fetch last 30 days of logs
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from('session_logs' as any)
      .select('*')
      .eq('user_id', user!.id)
      .gte('log_date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('log_date', { ascending: false });

    if (data) {
      setSessionLogs(data as unknown as SessionLog[]);
    }
  };

  const calculateWeeklyData = () => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const weekData: WeeklyData[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayLogs = sessionLogs.filter(log => log.log_date === dateStr);
      const totalMinutes = dayLogs.reduce((sum, log) => sum + (log.actual_duration_minutes || 0), 0);
      
      weekData.push({
        day: dayNames[date.getDay()],
        hours: totalMinutes / 60,
        sessions: dayLogs.length
      });
    }

    setWeeklyData(weekData);
  };

  const calculateSessionTypeStats = () => {
    const typeCounts: Record<string, { count: number, minutes: number }> = {};
    let totalSessions = 0;

    sessionLogs.forEach(log => {
      const type = log.session_type || 'other';
      if (!typeCounts[type]) {
        typeCounts[type] = { count: 0, minutes: 0 };
      }
      typeCounts[type].count++;
      typeCounts[type].minutes += log.actual_duration_minutes || 0;
      totalSessions++;
    });

    const typeColors: Record<string, string> = {
      yoga: '#8B5CF6',
      meditation: '#3B82F6',
      stretching: '#10B981',
      breathing: '#06B6D4',
      other: '#6366F1'
    };

    const typeIcons: Record<string, any> = {
      yoga: Activity,
      meditation: Brain,
      stretching: Dumbbell,
      breathing: Wind,
      other: Sparkles
    };

    const stats: SessionTypeStats[] = Object.entries(typeCounts).map(([type, data]) => ({
      type,
      count: data.count,
      totalMinutes: data.minutes,
      percentage: Math.round((data.count / totalSessions) * 100),
      color: typeColors[type] || typeColors.other,
      icon: typeIcons[type] || typeIcons.other
    })).sort((a, b) => b.count - a.count);

    setSessionTypeStats(stats);
  };

  const calculateMoodTrends = () => {
    const moodEmojis: Record<string, string> = {
      calm: '🌙',
      focused: '⚡️',
      energized: '😊',
      tired: '😐',
      stressed: '😟'
    };

    const beforeCounts: Record<string, number> = {};
    const afterCounts: Record<string, number> = {};

    sessionLogs.forEach(log => {
      if (log.mood_before) {
        beforeCounts[log.mood_before] = (beforeCounts[log.mood_before] || 0) + 1;
      }
      if (log.mood_after) {
        afterCounts[log.mood_after] = (afterCounts[log.mood_after] || 0) + 1;
      }
    });

    const before: MoodTrend[] = Object.entries(beforeCounts).map(([mood, count]) => ({
      mood,
      count,
      emoji: moodEmojis[mood] || '😊'
    })).sort((a, b) => b.count - a.count);

    const after: MoodTrend[] = Object.entries(afterCounts).map(([mood, count]) => ({
      mood,
      count,
      emoji: moodEmojis[mood] || '😊'
    })).sort((a, b) => b.count - a.count);

    setMoodTrends({ before, after });
  };

  const calculateStreaks = () => {
    if (sessionLogs.length === 0) return;

    // Get unique dates and sort them
    const uniqueDates = [...new Set(sessionLogs.map(log => log.log_date))].sort().reverse();
    
    // Calculate current streak
    let current = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      if (uniqueDates.includes(dateStr)) {
        current++;
      } else {
        break;
      }
    }

    // Calculate longest streak
    let longest = 0;
    let tempStreak = 0;
    let lastDate: Date | null = null;

    uniqueDates.reverse().forEach(dateStr => {
      const date = new Date(dateStr);
      
      if (lastDate) {
        const daysDiff = Math.floor((date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longest = Math.max(longest, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      lastDate = date;
    });
    
    longest = Math.max(longest, tempStreak);

    setCurrentStreak(current);
    setLongestStreak(longest);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const totalMinutes = sessionLogs.reduce((sum, log) => sum + (log.actual_duration_minutes || 0), 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const avgSessionMinutes = sessionLogs.length > 0 ? Math.round(totalMinutes / sessionLogs.length) : 0;
  const maxWeeklyHours = Math.max(...weeklyData.map(d => d.hours), 1);

  if (loading || isLoadingData) {
    return (
      <LoadingSpinner
        message="Loading your profile..."
        subMessage="Gathering your statistics"
      />
    );
  }

  return (
    <PullToRefresh onRefresh={loadAllData}>
      <div className="min-h-screen bg-background pb-24">
      {/* Hero Section with Glassmorphism */}
      <div 
        className="relative h-56 overflow-hidden"
        style={{
          backgroundImage: `url(${moonBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-background" />
        
        {/* Floating orbs */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-accent/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-indigo/20 rounded-full blur-3xl animate-pulse delay-700" />
        
        <div className="relative z-10 p-6 flex items-start justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20"
            >
              <Settings className="w-5 h-5 text-white" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSignOut}
              className="rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20"
            >
              <LogOut className="w-5 h-5 text-white" />
            </Button>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="px-6 -mt-20 relative z-20">
        <Card className="p-6 bg-card/95 backdrop-blur-xl border-accent/20 shadow-2xl mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent via-indigo to-accent flex items-center justify-center text-2xl font-bold shadow-lg">
                {(profile?.display_name || user?.email || 'YJ').substring(0, 2).toUpperCase()}
              </div>
              {currentStreak > 0 && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shadow-lg border-2 border-background">
                  {currentStreak}
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-1">{profile?.display_name || user?.email?.split('@')[0] || 'Wanderer'}</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              {currentStreak > 0 && (
                <Badge className="mt-2 bg-orange-500/20 text-orange-500 border-orange-500/30">
                  🔥 {currentStreak} Day Streak
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{sessionLogs.length}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo">{totalHours}h</div>
              <div className="text-[10px] text-muted-foreground uppercase">Total Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{avgSessionMinutes}m</div>
              <div className="text-[10px] text-muted-foreground uppercase">Avg/Session</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500">{longestStreak}</div>
              <div className="text-[10px] text-muted-foreground uppercase">Best Streak</div>
            </div>
          </div>
        </Card>

        {/* Tabs for Different Insights */}
        <Tabs defaultValue="activity" className="mb-6">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="activity" className="text-xs">
              <BarChart3 className="w-4 h-4 mr-1" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="text-xs">
              <PieChart className="w-4 h-4 mr-1" />
              Breakdown
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs">
              <Zap className="w-4 h-4 mr-1" />
              Insights
            </TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Last 7 Days</h3>
                <Badge variant="outline" className="text-xs">
                  <Clock className="w-3 h-3 mr-1" />
                  {weeklyData.reduce((sum, d) => sum + d.hours, 0).toFixed(1)}h total
                </Badge>
              </div>
              
              {weeklyData.length > 0 ? (
                <div className="space-y-3">
                  {weeklyData.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className={`text-xs font-medium w-10 ${
                        index === weeklyData.length - 1 ? 'text-accent' : 'text-muted-foreground'
                      }`}>
                        {item.day}
                      </span>
                      <div className="flex-1 h-10 bg-secondary/30 rounded-lg overflow-hidden relative">
                        <div
                          className={`h-full rounded-lg transition-all duration-500 ${
                            item.hours > 0 
                              ? index === weeklyData.length - 1
                                ? 'bg-gradient-to-r from-accent to-indigo shadow-lg' 
                                : 'bg-gradient-to-r from-accent/80 to-indigo/80'
                              : 'bg-muted/50'
                          }`}
                          style={{ width: `${(item.hours / maxWeeklyHours) * 100}%` }}
                        />
                        {item.sessions > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-white drop-shadow">
                              {item.sessions} session{item.sessions > 1 ? 's' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold w-14 text-right text-foreground">
                        {item.hours > 0 ? `${item.hours.toFixed(1)}h` : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No activity data yet</p>
                  <p className="text-xs">Complete sessions to see your progress</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Breakdown Tab */}
          <TabsContent value="breakdown" className="space-y-4">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20">
              <h3 className="text-lg font-semibold mb-4">Session Types</h3>
              
              {sessionTypeStats.length > 0 ? (
                <div className="space-y-4">
                  {sessionTypeStats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: `${stat.color}20` }}
                            >
                              <Icon className="w-4 h-4" style={{ color: stat.color }} />
                            </div>
                            <div>
                              <p className="text-sm font-medium capitalize">{stat.type}</p>
                              <p className="text-xs text-muted-foreground">
                                {stat.count} sessions • {Math.floor(stat.totalMinutes / 60)}h {stat.totalMinutes % 60}m
                              </p>
                            </div>
                          </div>
                          <Badge style={{ backgroundColor: `${stat.color}20`, color: stat.color, borderColor: `${stat.color}40` }}>
                            {stat.percentage}%
                          </Badge>
                        </div>
                        <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${stat.percentage}%`,
                              backgroundColor: stat.color,
                              boxShadow: `0 0 10px ${stat.color}40`
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <PieChart className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No session data yet</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-4">
            {/* Mood Trends */}
            {moodTrends.before.length > 0 && (
              <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20">
                <h3 className="text-lg font-semibold mb-4">Mood Insights</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Before Practice</p>
                    <div className="space-y-2">
                      {moodTrends.before.slice(0, 3).map((mood, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-2xl">{mood.emoji}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium capitalize">{mood.mood}</p>
                            <div className="h-1.5 bg-secondary/30 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-accent/60 rounded-full"
                                style={{ width: `${(mood.count / moodTrends.before[0].count) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-bold text-muted-foreground">{mood.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">After Practice</p>
                    <div className="space-y-2">
                      {moodTrends.after.slice(0, 3).map((mood, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-2xl">{mood.emoji}</span>
                          <div className="flex-1">
                            <p className="text-sm font-medium capitalize">{mood.mood}</p>
                            <div className="h-1.5 bg-secondary/30 rounded-full overflow-hidden mt-1">
                              <div
                                className="h-full bg-indigo/60 rounded-full"
                                style={{ width: `${(mood.count / moodTrends.after[0].count) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-xs font-bold text-muted-foreground">{mood.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Performance Metrics */}
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Your Progress
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Consistency</span>
                    <span className="text-sm font-bold text-green-500">
                      {sessionLogs.length > 0 ? Math.round((sessionLogs.length / 30) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${sessionLogs.length > 0 ? (sessionLogs.length / 30) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {sessionLogs.length} sessions in last 30 days
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Commitment</span>
                    <span className="text-sm font-bold text-indigo">
                      {currentStreak > 0 ? Math.min(Math.round((currentStreak / longestStreak) * 100), 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 bg-secondary/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo rounded-full"
                      style={{ width: `${currentStreak > 0 ? Math.min((currentStreak / longestStreak) * 100, 100) : 0}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current vs Best ({longestStreak} days)
                  </p>
                </div>
              </div>
            </Card>

            {/* Achievements Preview */}
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                Recent Milestones
              </h3>
              
              <div className="space-y-3">
                {currentStreak >= 7 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <Flame className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Week Warrior</p>
                      <p className="text-xs text-muted-foreground">7+ day streak achieved!</p>
                    </div>
                    <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">New</Badge>
                  </div>
                )}
                
                {sessionLogs.length >= 10 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
                    <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                      <Target className="w-5 h-5 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Dedicated Practitioner</p>
                      <p className="text-xs text-muted-foreground">10+ sessions completed</p>
                    </div>
                  </div>
                )}

                {sessionLogs.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Complete sessions to unlock achievements!</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 p-4 z-50">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <CalendarIcon className="w-6 h-6" />
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
            onClick={() => navigate('/community')}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs">Community</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col gap-1 h-auto py-2 text-accent"
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>
      </div>
    </PullToRefresh>
  );
};

export default Profile;
