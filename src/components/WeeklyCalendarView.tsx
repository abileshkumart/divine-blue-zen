import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Dumbbell, CheckCircle2, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Session, SessionLog } from "@/types/session";
import { DailyReflectionDrawer } from "@/components/daily-reflection-drawer";

interface DailyReflection {
  id: string;
  reflection_date: string;
  mood: string;
  day_summary: string;
}

interface DayData {
  date: Date;
  dateString: string;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  hasJournal: boolean;
  journalId?: string;
  journalEntry?: string;
  mood?: string;
  scheduledSessions: Session[];
  completedSessionIds: string[];
}

const WeeklyCalendarView = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [isDayDrawerOpen, setIsDayDrawerOpen] = useState(false);
  const [isJournalDrawerOpen, setIsJournalDrawerOpen] = useState(false);
  const [selectedDateForJournal, setSelectedDateForJournal] = useState("");
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [selectedSessionForLog, setSelectedSessionForLog] = useState<Session | null>(null);
  const [quickLogDuration, setQuickLogDuration] = useState("");
  const [loading, setLoading] = useState(false);

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    // Start week on Monday (Indian convention): if Sunday (0), go back 6 days, else go back (day-1) days
    const diff = day === 0 ? 6 : day - 1;
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - diff);
    return weekStart;
  }

  useEffect(() => {
    if (user) {
      loadWeekData();
    }
  }, [user, weekStart]);

  const loadWeekData = async () => {
    const days: DayData[] = [];
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];

    // Fetch all data for the week
    const [reflectionsRes, sessionsRes, logsRes] = await Promise.all([
      supabase
        .from('daily_reflections')
        .select('*')
        .eq('user_id', user!.id)
        .gte('reflection_date', startStr)
        .lte('reflection_date', endStr),
      supabase
        .from('sessions' as any)
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true),
      supabase
        .from('session_logs' as any)
        .select('*')
        .eq('user_id', user!.id)
        .gte('log_date', startStr)
        .lte('log_date', endStr)
    ]);

    const reflections = reflectionsRes.data || [];
    const allSessions = (sessionsRes.data || []) as unknown as Session[];
    const logs = (logsRes.data || []) as unknown as SessionLog[];

    // Build week data
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
      
      const dayReflection = reflections.find(r => r.reflection_date === dateString);
      
      // Filter sessions that are scheduled for this day of week
      // If days_of_week is empty or null, show all sessions on all days
      const daySessions = allSessions.filter(s => 
        !s.days_of_week || s.days_of_week.length === 0 || s.days_of_week.includes(dayOfWeek)
      );
      
      const dayLogs = logs.filter(l => l.log_date === dateString);
      const completedIds = dayLogs.map(log => log.session_id).filter(id => id !== null) as string[];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      days.push({
        date,
        dateString,
        dayName: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        dayNumber: date.getDate(),
        isToday: date.getTime() === today.getTime(),
        hasJournal: !!dayReflection,
        journalId: dayReflection?.id,
        journalEntry: dayReflection?.day_summary,
        mood: dayReflection?.mood,
        scheduledSessions: daySessions,
        completedSessionIds: completedIds
      });
    }

    setWeekData(days);
  };

  const handlePreviousWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() - 7);
    setWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() + 7);
    setWeekStart(newStart);
  };

  const handleDayClick = (day: DayData) => {
    setSelectedDay(day);
    setIsDayDrawerOpen(true);
  };

  const handleOpenJournal = (dateString: string) => {
    setSelectedDateForJournal(dateString);
    setIsJournalDrawerOpen(true);
  };

  const handleJournalClose = () => {
    setIsJournalDrawerOpen(false);
    loadWeekData(); // Refresh week data after journal is saved
  };

  const handleQuickLogSession = async () => {
    if (!selectedSessionForLog || !selectedDay || !user) return;
    
    setLoading(true);
    try {
      const duration = parseInt(quickLogDuration) || selectedSessionForLog.duration_minutes;
      
      const { error } = await supabase
        .from('session_logs' as any)
        .insert({
          user_id: user.id,
          session_id: selectedSessionForLog.id,
          session_name: selectedSessionForLog.session_name,
          session_type: selectedSessionForLog.session_type,
          log_date: selectedDay.dateString,
          actual_duration_minutes: duration,
          mood_before: "neutral",
          mood_after: "neutral",
          notes: "Quick logged from home screen",
          completed: true
        });

      if (error) throw error;

      // Update profile stats
      const { data: profile } = await supabase
        .from('profiles' as any)
        .select('streak_count, total_minutes_practiced')
        .eq('id', user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles' as any)
          .update({
            total_minutes_practiced: ((profile as any).total_minutes_practiced || 0) + duration
          })
          .eq('id', user.id);
      }

      toast({
        title: "Session Logged",
        description: `${selectedSessionForLog.session_name} has been marked complete.`
      });
      
      setIsQuickLogOpen(false);
      setSelectedSessionForLog(null);
      setQuickLogDuration("");
      loadWeekData();
    } catch (error) {
      console.error("Error logging session:", error);
      toast({
        title: "Error",
        description: "Failed to log session.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood?: string) => {
    switch (mood) {
      case "happy": return "😊";
      case "calm": return "😌";
      case "energized": return "✨";
      case "peaceful": return "🕊️";
      case "grateful": return "🙏";
      case "tired": return "😴";
      case "anxious": return "😰";
      case "sad": return "😢";
      default: return "😐";
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case "yoga": return "🧘";
      case "meditation": return "🧘‍♀️";
      case "stretching": return "🤸";
      case "breathing": return "💨";
      default: return "🏃";
    }
  };

  const getCompletionPercentage = (day: DayData) => {
    if (day.scheduledSessions.length === 0) return 0;
    return Math.round((day.completedSessionIds.length / day.scheduledSessions.length) * 100);
  };

  return (
    <div className="space-y-4">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">This Week</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousWeek}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[140px] text-center">
            {weekStart.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} - {
              new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
            }
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNextWeek}
            className="h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day) => {
          const completionPct = getCompletionPercentage(day);
          const allCompleted = day.scheduledSessions.length > 0 && 
                               completionPct === 100;
          
          return (
            <Card
              key={day.dateString}
              className={`
                relative p-2 cursor-pointer transition-all hover:shadow-lg
                ${day.isToday ? 'ring-2 ring-accent shadow-glow' : ''}
                ${allCompleted ? 'bg-gradient-to-br from-green-500/20 to-transparent border-green-500/40' : 'bg-card/60'}
              `}
              onClick={() => handleDayClick(day)}
            >
              {/* Day Header */}
              <div className="text-center mb-2">
                <div className="text-xs text-muted-foreground font-medium">{day.dayName}</div>
                <div className={`text-lg font-bold ${day.isToday ? 'text-accent' : ''}`}>
                  {day.dayNumber}
                </div>
              </div>

              {/* Indicators - Minimal Compact View */}
              <div className="space-y-1.5">
                {/* Session Progress Dots */}
                {day.scheduledSessions.length > 0 && (
                  <div className="flex items-center justify-center gap-1">
                    {allCompleted ? (
                      <div className="flex items-center justify-center w-full">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: Math.min(day.scheduledSessions.length, 4) }).map((_, idx) => (
                          <div
                            key={idx}
                            className={`w-1.5 h-1.5 rounded-full ${
                              idx < day.completedSessionIds.length
                                ? 'bg-green-500'
                                : 'bg-muted-foreground/30'
                            }`}
                          />
                        ))}
                        {day.scheduledSessions.length > 4 && (
                          <span className="text-[9px] text-muted-foreground ml-0.5">
                            +{day.scheduledSessions.length - 4}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Journal Indicator */}
                {day.hasJournal && (
                  <div className="flex items-center justify-center">
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-indigo/10">
                      <BookOpen className="w-2.5 h-2.5 text-indigo" />
                      <span className="text-[10px]">{getMoodEmoji(day.mood)}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Day Details Drawer */}
      {selectedDay && (
        <Drawer open={isDayDrawerOpen} onOpenChange={setIsDayDrawerOpen}>
          <DrawerContent className="bg-background">
            <div className="mx-auto w-full max-w-2xl">
              <DrawerHeader className="text-center relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-4 rounded-full"
                  onClick={() => setIsDayDrawerOpen(false)}
                >
                  <ChevronDown className="w-6 h-6" />
                </Button>
                <DrawerTitle className="flex items-center justify-center gap-2">
                  {selectedDay.dayName}, {selectedDay.date.toLocaleDateString('en-IN', { month: 'long', day: 'numeric' })}
                  {selectedDay.isToday && (
                    <Badge variant="outline" className="text-accent border-accent">Today</Badge>
                  )}
                </DrawerTitle>
              </DrawerHeader>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto pb-safe">
                {/* Journal Section */}
                <Card className="p-4 bg-indigo/10 border-indigo/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-indigo" />
                      <h3 className="font-semibold text-sm">Daily Journal</h3>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 text-indigo"
                      onClick={() => {
                        setIsDayDrawerOpen(false);
                        handleOpenJournal(selectedDay.dateString);
                      }}
                    >
                      {selectedDay.hasJournal ? "Edit" : "Add"}
                    </Button>
                  </div>
                  {selectedDay.hasJournal ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getMoodEmoji(selectedDay.mood)}</span>
                        <span className="text-sm font-medium capitalize">{selectedDay.mood}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {selectedDay.journalEntry}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No journal entry yet</p>
                  )}
                </Card>

                {/* Sessions Section */}
                <Card className="p-4 bg-accent/10 border-accent/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Dumbbell className="w-4 h-4 text-accent" />
                    <h3 className="font-semibold text-sm">Sessions</h3>
                  </div>
                  {selectedDay.scheduledSessions.length > 0 ? (
                    <div className="space-y-2">
                      {selectedDay.scheduledSessions.map((session) => {
                        const isCompleted = selectedDay.completedSessionIds.includes(session.id);
                        return (
                          <div 
                            key={session.id}
                            className={`
                              flex items-center justify-between p-2 rounded-lg border
                              ${isCompleted ? 'bg-green-500/10 border-green-500/30' : 'bg-card border-border/50'}
                            `}
                          >
                            <div className="flex items-center gap-2">
                              <span>{getSessionIcon(session.session_type)}</span>
                              <div>
                                <div className="text-sm font-medium">{session.session_name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {session.duration_minutes} min
                                </div>
                              </div>
                            </div>
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs"
                                  onClick={() => {
                                    setIsDayDrawerOpen(false);
                                    navigate('/session-tracker', { state: { session } });
                                  }}
                                >
                                  Start
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 text-xs"
                                  onClick={() => {
                                    setSelectedSessionForLog(session);
                                    setQuickLogDuration(session.duration_minutes.toString());
                                    setIsDayDrawerOpen(false);
                                    setIsQuickLogOpen(true);
                                  }}
                                >
                                  Log
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      No sessions scheduled. <Button 
                        variant="link" 
                        className="p-0 h-auto text-accent"
                        onClick={() => navigate('/calendar')}
                      >
                        Add one?
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* Daily Reflection Drawer - Reuse existing component */}
      <DailyReflectionDrawer 
        date={selectedDateForJournal}
        isOpen={isJournalDrawerOpen}
        onClose={handleJournalClose}
      />

      {/* Quick Log Dialog */}
      <Dialog open={isQuickLogOpen} onOpenChange={setIsQuickLogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Quick Log Session</DialogTitle>
          </DialogHeader>
          {selectedSessionForLog && (
            <div className="space-y-4">
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
                <div className="flex items-center gap-2 mb-1">
                  <span>{getSessionIcon(selectedSessionForLog.session_type)}</span>
                  <span className="font-medium">{selectedSessionForLog.session_name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Scheduled: {selectedSessionForLog.duration_minutes} minutes
                </div>
              </div>
              <div>
                <Label>Actual Duration (minutes)</Label>
                <input
                  type="number"
                  value={quickLogDuration}
                  onChange={(e) => setQuickLogDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  placeholder="Enter minutes"
                />
              </div>
              <Button 
                onClick={handleQuickLogSession} 
                className="w-full"
                disabled={loading || !quickLogDuration}
              >
                {loading ? "Logging..." : "Log as Complete"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyCalendarView;
