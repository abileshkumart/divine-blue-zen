import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Moon, BookOpen, Pencil, Smile, Frown, Meh, Zap, Plus, Activity, Brain, Dumbbell, Wind } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { DailyReflectionDrawer } from "@/components/daily-reflection-drawer";
import { Session, SessionType } from "@/types/session";
import { CreateSessionForm } from "@/components/CreateSessionForm";
import LoadingSpinner from "@/components/LoadingSpinner";
import BottomNav from "@/components/BottomNav";

const moods = [
  { value: 'calm', label: 'Calm' },
  { value: 'focused', label: 'Focused' },
  { value: 'energized', label: 'Energized' },
  { value: 'tired', label: 'Tired' },
  { value: 'stressed', label: 'Stressed' },
];

interface MoonPhase {
  phase_date: string;
  phase_type: string;
  description: string;
}

interface SessionLog {
  completed_at?: string;
  log_date?: string;
  session_type: string;
  actual_duration_minutes: number;
}

interface DailyReflection {
  id: string;
  reflection_date: string;
  mood: string;
  day_summary: string;
  key_takeaway: string;
}

interface DaySchedule {
  [date: string]: Session[];
}

const Calendar = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [moonPhases, setMoonPhases] = useState<MoonPhase[]>([]);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [daySchedule, setDaySchedule] = useState<DaySchedule>({});
  const [reflections, setReflections] = useState<DailyReflection[]>([]);
  const [selectedReflection, setSelectedReflection] = useState<DailyReflection | null>(null);
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);
  const [weeklyReflections, setWeeklyReflections] = useState<DailyReflection[]>([]);
  const [selectedMoonPhase, setSelectedMoonPhase] = useState<MoonPhase | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  // Adjust for Monday start (Indian calendar convention)
  const firstDayOfMonthRaw = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();
  const firstDayOfMonth = firstDayOfMonthRaw === 0 ? 6 : firstDayOfMonthRaw - 1;

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  const loadAllData = async () => {
    setIsLoadingData(true);
    await Promise.all([
      fetchMoonPhases(),
      fetchSessionLogs(),
      fetchSessions(),
      fetchMonthReflections()
    ]);
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [currentMonth, user]);

  const fetchMonthReflections = async () => {
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const { data } = await supabase
      .from('daily_reflections')
      .select('*')
      .gte('reflection_date', startDate.toISOString().split('T')[0])
      .lte('reflection_date', endDate.toISOString().split('T')[0]);

    setReflections(data || []);
  };

  const fetchMoonPhases = async () => {
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    const { data } = await supabase
      .from('moon_phases')
      .select('*')
      .gte('phase_date', startDate.toISOString().split('T')[0])
      .lte('phase_date', endDate.toISOString().split('T')[0]);

    setMoonPhases(data || []);
  };

  const fetchSessionLogs = async () => {
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    try {
      const { data } = await supabase
        .from('session_logs' as any)
        .select('log_date, session_type, actual_duration_minutes')
        .gte('log_date', startDate.toISOString().split('T')[0])
        .lte('log_date', endDate.toISOString().split('T')[0]);

      if (data) {
        setSessionLogs(data as unknown as SessionLog[]);
      }
    } catch (error) {
      console.error('Error fetching session logs:', error);
    }
  };

  const fetchSessions = async () => {
    const { data } = await supabase
      .from('sessions' as any)
      .select('*')
      .eq('is_active', true);

    if (data) {
      setSessions(data as unknown as Session[]);
      // Calculate which days have scheduled sessions
      calculateDaySchedule(data as unknown as Session[]);
    }
  };

  const calculateDaySchedule = (allSessions: Session[]) => {
    const schedule: DaySchedule = {};
    const startDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    // For each day in the month
    for (let day = startDate; day <= endDate; day.setDate(day.getDate() + 1)) {
      const dayOfWeek = day.toLocaleDateString('en-US', { weekday: 'long' });
      const dateStr = new Date(day).toISOString().split('T')[0];
      
      // Find sessions scheduled for this day of week
      const daySessions = allSessions.filter(session => 
        session.days_of_week.includes(dayOfWeek)
      );
      
      if (daySessions.length > 0) {
        schedule[dateStr] = daySessions;
      }
    }

    setDaySchedule(schedule);
  };

  const fetchWeeklyReport = async (date: Date) => {
    // Start week on Monday (Indian convention)
    const startOfWeek = new Date(date);
    const dayOfWeek = date.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday as first day
    startOfWeek.setDate(date.getDate() - diff);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const { data } = await supabase
      .from('daily_reflections')
      .select('*')
      .gte('reflection_date', startOfWeek.toISOString().split('T')[0])
      .lte('reflection_date', endOfWeek.toISOString().split('T')[0])
      .order('reflection_date', { ascending: true });

    setWeeklyReflections(data || []);
    setShowWeeklyReport(true);
  };

  const changeMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const completedDays = sessionLogs.map(log => {
    const date = log.log_date || log.completed_at;
    return date ? new Date(date).getDate() : 0;
  }).filter((v, i, a) => v > 0 && a.indexOf(v) === i);

  const getSessionTypeColor = (type: SessionType) => {
    switch (type) {
      case 'yoga': return 'text-purple-500';
      case 'meditation': return 'text-blue-500';
      case 'stretching': return 'text-green-500';
      case 'breathing': return 'text-cyan-500';
      default: return 'text-accent';
    }
  };

  const getSessionTypeIcon = (type: SessionType) => {
    switch (type) {
      case 'yoga': return Activity;
      case 'meditation': return Brain;
      case 'stretching': return Dumbbell;
      case 'breathing': return Wind;
      default: return Activity;
    }
  };

  const handleDayClick = (dateStr: string, scheduledSessions: Session[]) => {
    // Only open journal drawer for any date clicked
    setSelectedDate(dateStr);
  };

  const moonDays = moonPhases.reduce((acc, phase) => {
    const day = new Date(phase.phase_date).getDate();
    acc[day] = phase;
    return acc;
  }, {} as Record<number, MoonPhase>);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const handleTodayClick = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    navigate('/home');
  };

  if (loading || isLoadingData) {
    return (
      <LoadingSpinner
        message="Loading your calendar..."
        subMessage="Gathering sessions and reflections"
      />
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-card/50">
        {/* Top Navigation Bar */}
        <div className="p-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="rounded-full hover:bg-accent/20"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-glow">WanderWithin</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fetchWeeklyReport(new Date())}
            className="rounded-full hover:bg-accent/20"
          >
            <BookOpen className="w-6 h-6" />
          </Button>
        </div>
        
        {/* Month Selector - Separated with Card Background */}
        <div className="px-6 pb-6">
          <Card className="p-3 bg-gradient-to-r from-accent/10 via-indigo/10 to-accent/10 border-accent/20">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-accent/20 h-9 w-9" 
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="text-center">
                <h2 className="text-xl font-bold text-accent">{monthName}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {reflections.length} reflections • {sessionLogs.length} sessions
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-accent/20 h-9 w-9" 
                onClick={() => changeMonth(1)}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      </header>

      {/* Calendar Grid */}
      <main className="p-6">
        {/* Monthly Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="p-4 bg-card/80 backdrop-blur-sm border-accent/20">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium">Monthly Overview</h3>
              <span className="text-xs text-muted-foreground">{monthName}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-accent">
                  {reflections.length}
                </div>
                <div className="text-xs text-muted-foreground">Reflections</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo">
                  {sessionLogs.length}
                </div>
                <div className="text-xs text-muted-foreground">Sessions</div>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/80 backdrop-blur-sm border-indigo/20">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-sm font-medium">Mood Trends</h3>
              <span className="text-xs text-muted-foreground">This Month</span>
            </div>
            <div className="flex gap-2">
              {moods.map(mood => {
                const count = reflections.filter(r => r.mood === mood.value).length;
                if (count === 0) return null;
                return (
                  <div key={mood.value} className="flex items-center gap-1">
                    <span className="text-lg">{
                      mood.value === 'calm' ? '🌙' :
                      mood.value === 'focused' ? '⚡️' :
                      mood.value === 'energized' ? '😊' :
                      mood.value === 'tired' ? '😐' :
                      '😟'
                    }</span>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-6">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="text-center text-xs text-muted-foreground font-medium">
              {day}
            </div>
          ))}
          
          {emptyDays.map((index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          
          {days.map((day) => {
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const dateStr = date.toISOString().split('T')[0];
            const moonPhase = moonDays[day];
            const hasSessionLog = sessionLogs.some(log => {
              const logDate = log.log_date || log.completed_at;
              return logDate && logDate.startsWith(dateStr);
            });
            const scheduledSessions = daySchedule[dateStr] || [];
            const reflection = reflections.find(r => r.reflection_date === dateStr);
            
            // Fix timezone issue: compare dates in local timezone
            const today = new Date();
            const isToday = date.getFullYear() === today.getFullYear() && 
                           date.getMonth() === today.getMonth() && 
                           date.getDate() === today.getDate();
            const isFuture = date > new Date();

            return (
              <div
                key={day}
                className={`flex flex-col items-center p-1.5 min-h-[75px] rounded-lg relative cursor-pointer group
                  ${hasSessionLog ? 'bg-accent/10' : 'hover:bg-secondary/20'}
                  ${moonPhase ? 'ring-1 ring-indigo/30' : ''}
                  ${isToday ? 'ring-2 ring-accent' : ''}
                  ${reflection ? 'bg-secondary/10' : ''}
                  ${scheduledSessions.length > 0 ? 'border border-accent/30' : ''}
                  transition-all duration-200 hover:shadow-md
                `}
                onClick={() => handleDayClick(dateStr, scheduledSessions)}
              >
                <span className={`text-sm ${hasSessionLog ? 'text-accent font-medium' : ''} ${isToday ? 'text-accent font-bold' : ''}`}>
                  {day}
                </span>
                <div className="flex flex-wrap gap-0.5 justify-center mt-1">
                  {moonPhase && (
                    <span className="text-xs group-hover:scale-110 transition-transform" onClick={(e) => {
                      e.stopPropagation();
                      setSelectedMoonPhase(moonPhase);
                    }}>
                      {moonPhase.phase_type === 'pournami' ? '🌕' : '🌑'}
                    </span>
                  )}
                  {scheduledSessions.length > 0 && (
                    <div className="flex gap-0.5">
                      {scheduledSessions.slice(0, 3).map((session, idx) => {
                        const Icon = getSessionTypeIcon(session.session_type);
                        return (
                          <Icon 
                            key={idx} 
                            className={`w-3 h-3 ${getSessionTypeColor(session.session_type)}`}
                          />
                        );
                      })}
                      {scheduledSessions.length > 3 && (
                        <span className="text-[8px] text-muted-foreground">+{scheduledSessions.length - 3}</span>
                      )}
                    </div>
                  )}
                  {hasSessionLog && (
                    <span className="px-1 py-0.5 bg-accent/20 rounded-full text-[9px] text-accent">
                      ✓
                    </span>
                  )}
                  {reflection && (
                    <span className="inline-flex items-center px-1 py-0.5 bg-secondary/30 rounded-full text-[9px] text-secondary-foreground">
                      <BookOpen className="w-2 h-2 mr-0.5" />
                      Note
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Reflection Dialog */}
        <Dialog open={!!selectedReflection} onOpenChange={() => setSelectedReflection(null)}>
          <DialogContent className="bg-card border-accent/40 max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                Daily Reflection
                <span className="text-sm text-muted-foreground">
                  {selectedReflection && new Date(selectedReflection.reflection_date).toLocaleDateString('default', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </DialogTitle>
            </DialogHeader>

            {selectedReflection && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Mood</h3>
                  <div className="flex items-center gap-2">
                    {selectedReflection.mood === 'calm' && <Moon className="w-4 h-4 text-accent" />}
                    {selectedReflection.mood === 'focused' && <Zap className="w-4 h-4 text-accent" />}
                    {selectedReflection.mood === 'energized' && <Smile className="w-4 h-4 text-accent" />}
                    {selectedReflection.mood === 'tired' && <Meh className="w-4 h-4 text-accent" />}
                    {selectedReflection.mood === 'stressed' && <Frown className="w-4 h-4 text-accent" />}
                    <span className="text-sm capitalize">{selectedReflection.mood}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Day Summary</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {selectedReflection.day_summary}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Key Takeaway</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedReflection.key_takeaway}
                  </p>
                </div>

                <Button
                  onClick={() => {
                    navigate('/reflection', { 
                      state: { 
                        date: selectedReflection.reflection_date,
                        edit: true 
                      } 
                    });
                  }}
                  className="w-full"
                  variant="outline"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Reflection
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Daily Reflection Drawer */}
        <DailyReflectionDrawer
          isOpen={!!selectedDate}
          date={selectedDate || ''}
          onClose={() => setSelectedDate(null)}
        />

        {/* Weekly Report Dialog */}
        <Dialog open={showWeeklyReport} onOpenChange={setShowWeeklyReport}>
          <DialogContent className="bg-card border-accent/40 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-accent" />
                Weekly Reflection Summary
              </DialogTitle>
              <DialogDescription>
                {weeklyReflections.length > 0 && `Week of ${new Date(weeklyReflections[0].reflection_date).toLocaleDateString('default', {
                  month: 'long',
                  day: 'numeric'
                })}`}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Mood Summary */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Mood Overview</h3>
                <div className="grid grid-cols-5 gap-2">
                  {moods.map(mood => {
                    const count = weeklyReflections.filter(r => r.mood === mood.value).length;
                    return (
                      <div
                        key={mood.value}
                        className="flex flex-col items-center p-2 rounded-lg bg-secondary/20"
                      >
                        <span className="text-lg mb-1">{
                          mood.value === 'calm' ? '🌙' :
                          mood.value === 'focused' ? '⚡️' :
                          mood.value === 'energized' ? '😊' :
                          mood.value === 'tired' ? '😐' :
                          '😟'
                        }</span>
                        <span className="text-sm font-medium">{count}</span>
                        <span className="text-xs text-muted-foreground">{mood.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daily Summaries */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Daily Entries</h3>
                <div className="space-y-3">
                  {weeklyReflections.map(reflection => (
                    <Card key={reflection.id} className="p-4 bg-card/80 backdrop-blur-sm border-accent/20">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium">
                          {new Date(reflection.reflection_date).toLocaleDateString('default', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-xs capitalize px-2 py-1 rounded-full bg-secondary/20">
                          {reflection.mood}
                        </span>
                      </div>
                      {reflection.key_takeaway && (
                        <p className="text-sm text-muted-foreground mt-2">
                          {reflection.key_takeaway}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      {/* Moon Phase Dialog */}
      <Dialog open={!!selectedMoonPhase} onOpenChange={() => setSelectedMoonPhase(null)}>
        <DialogContent className="bg-card border-accent/40">
          <DialogHeader>
            <DialogTitle className="text-center">
              <Moon className="w-8 h-8 text-indigo mx-auto mb-2 animate-glow-pulse" />
              {selectedMoonPhase?.phase_type === 'pournami' ? 'Pournami (Full Moon)' : 'Amavasai (New Moon)'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-center text-muted-foreground">
            {selectedMoonPhase?.description}
          </p>
          <p className="text-center text-sm text-muted-foreground">
            {selectedMoonPhase && new Date(selectedMoonPhase.phase_date).toLocaleDateString('default', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </DialogContent>
      </Dialog>


      </div>
    
    {/* Bottom Navigation */}
    <BottomNav />
    </>
  );
};

export default Calendar;
