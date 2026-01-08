import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  Plus, 
  ChevronRight,
  Sparkles, 
  User,
  Calendar as CalendarIcon,
  Activity,
  Brain,
  Dumbbell,
  Wind,
  Check,
  Play,
  Edit2,
  Trash2,
  MoreVertical,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CreateSessionForm } from "@/components/CreateSessionForm";
import type { Session } from "@/types/session";
import LoadingSpinner from "@/components/LoadingSpinner";
import PullToRefresh from "@/components/PullToRefresh";
import BottomNav from "@/components/BottomNav";

interface DaySession {
  date: Date;
  dateStr: string;
  dayName: string;
  dayNum: number;
  sessions: Session[];
  completedSessionIds: string[];
}

interface SessionLog {
  id: string;
  session_id: string;
  log_date: string;
  actual_duration_minutes: number;
}

const Sessions = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [isNewSessionDialogOpen, setIsNewSessionDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getWeekStart(new Date()));
  const [weekDays, setWeekDays] = useState<DaySession[]>([]);
  const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set([new Date().toISOString().split('T')[0]]));

  const loadAllData = async () => {
    setIsLoadingData(true);
    await Promise.all([
      fetchSessions(),
      fetchSessionLogs()
    ]);
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, currentWeekStart]);

  useEffect(() => {
    if (sessions.length > 0) {
      generateWeekView();
    }
  }, [sessions, sessionLogs, currentWeekStart]);

  function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday as first day
    d.setDate(d.getDate() - diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  const fetchSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('sessions' as any)
        .select('*')
        .eq('is_active', true)
        .order('scheduled_time', { ascending: true });

      if (!error && data) {
        setSessions(data as unknown as Session[]);
      }
    } catch (err) {
      console.log('Sessions table not yet created. Please run SQL migration.');
    }
  };

  const fetchSessionLogs = async () => {
    if (!user) return;

    try {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const { data } = await supabase
        .from('session_logs' as any)
        .select('*')
        .eq('user_id', user.id)
        .gte('log_date', currentWeekStart.toISOString().split('T')[0])
        .lt('log_date', weekEnd.toISOString().split('T')[0]);

      if (data) {
        setSessionLogs(data as unknown as SessionLog[]);
      }
    } catch (err) {
      console.log('Error fetching session logs');
    }
  };

  const generateWeekView = () => {
    const days: DaySession[] = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      // Find sessions scheduled for this day
      const dayOfWeek = dayNames[i];
      const daySessions = sessions.filter(s => 
        s.days_of_week.some(d => d.toLowerCase().startsWith(dayOfWeek.toLowerCase()))
      );

      // Find completed sessions for this day
      const completedSessionIds = sessionLogs
        .filter(log => log.log_date === dateStr)
        .map(log => log.session_id);

      days.push({
        date,
        dateStr,
        dayName: dayNames[i],
        dayNum: date.getDate(),
        sessions: daySessions,
        completedSessionIds
      });
    }

    setWeekDays(days);
  };

  const handleStartSession = (session: Session, date: Date) => {
    navigate('/session-tracker', { state: { session, date: date.toISOString() } });
  };

  const handleEditSession = (session: Session) => {
    setEditingSession(session);
    setIsNewSessionDialogOpen(true);
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!window.confirm('Are you sure you want to delete this session?')) {
      return;
    }

    const { error } = await supabase
      .from('sessions' as any)
      .update({ is_active: false })
      .eq('id', sessionId);

    if (error) {
      toast.error("Failed to delete session");
      return;
    }

    toast.success("Session deleted successfully");
    fetchSessions();
    fetchSessionLogs();
  };

  const handleSessionSuccess = () => {
    setIsNewSessionDialogOpen(false);
    setEditingSession(null);
    fetchSessions();
    fetchSessionLogs();
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newStart);
  };

  const goToToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const toggleDayExpansion = (dateStr: string) => {
    setExpandedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr);
      } else {
        newSet.add(dateStr);
      }
      return newSet;
    });
  };

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
      case 'yoga': return 'bg-purple-500/10 text-purple-500 border-purple-500/30';
      case 'meditation': return 'bg-blue-500/10 text-blue-500 border-blue-500/30';
      case 'stretching': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'breathing': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30';
      default: return 'bg-accent/10 text-accent border-accent/30';
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isFutureDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  // Calculate weekly completion stats
  const getWeeklyStats = () => {
    const totalScheduled = weekDays.reduce((sum, day) => sum + day.sessions.length, 0);
    const totalCompleted = weekDays.reduce((sum, day) => sum + day.completedSessionIds.length, 0);
    const completionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
    
    // Count days with all sessions completed
    const perfectDays = weekDays.filter(day => 
      day.sessions.length > 0 && day.sessions.length === day.completedSessionIds.length && !isFutureDate(day.date)
    ).length;

    return { totalScheduled, totalCompleted, completionRate, perfectDays };
  };

  const weeklyStats = getWeeklyStats();

  if (loading || isLoadingData) {
    return (
      <LoadingSpinner
        message="Loading your sessions..."
        subMessage="Preparing your weekly schedule"
      />
    );
  }

  return (
    <>
    <PullToRefresh onRefresh={loadAllData}>
      <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="relative border-b border-border/50 backdrop-blur-sm bg-gradient-to-r from-card/80 via-accent/5 to-indigo/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative p-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/home')}
              className="rounded-full hover:bg-accent/20"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold text-glow">My Sessions</h1>
            <Button 
              size="icon" 
              onClick={() => setIsNewSessionDialogOpen(true)}
              className="rounded-full bg-gradient-to-r from-accent to-indigo hover:from-accent/90 hover:to-indigo/90 shadow-glow"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Week Navigation with Day Pills */}
      <div className="p-4 border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateWeek('prev')}
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-center">
            <h2 className="font-semibold text-sm">
              {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {' '}
              {new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </h2>
            <Button
              variant="link"
              size="sm"
              onClick={goToToday}
              className="text-xs text-accent h-auto p-0"
            >
              Today
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigateWeek('next')}
            className="rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Weekly Progress Summary */}
        {weeklyStats.totalScheduled > 0 && (
          <Card className="p-3 bg-gradient-to-r from-accent/10 to-indigo/10 border-accent/20 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {weeklyStats.perfectDays > 0 && (
                    <span className="text-xl">🔥</span>
                  )}
                  <span className="text-sm font-medium">
                    {weeklyStats.totalCompleted}/{weeklyStats.totalScheduled} Sessions
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-sm font-semibold text-accent">{weeklyStats.completionRate}%</span>
              </div>
              {weeklyStats.perfectDays > 0 && (
                <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
                  {weeklyStats.perfectDays} Perfect {weeklyStats.perfectDays === 1 ? 'Day' : 'Days'}
                </Badge>
              )}
            </div>
          </Card>
        )}

        {/* Enhanced Weekly Calendar Pills with Visual Hierarchy */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-indigo/5 to-accent/5 rounded-xl blur-xl" />
          <div className="relative grid grid-cols-7 gap-2 p-3 bg-gradient-to-br from-card/60 to-secondary/20 rounded-xl border border-accent/10 backdrop-blur-sm">
            {weekDays.map((day) => {
              const allCompleted = day.sessions.length > 0 && day.sessions.length === day.completedSessionIds.length;
              const someCompleted = day.completedSessionIds.length > 0 && day.completedSessionIds.length < day.sessions.length;
              const noSessions = day.sessions.length === 0;
              
              return (
                <div 
                  key={day.dateStr}
                  className={`relative p-3 rounded-xl text-center transition-all cursor-pointer hover:scale-105 ${
                    isToday(day.date) 
                      ? 'bg-gradient-to-br from-accent via-accent/90 to-indigo shadow-lg shadow-accent/50 ring-2 ring-accent/30' 
                      : allCompleted && !isFutureDate(day.date)
                      ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-md shadow-green-500/30'
                      : someCompleted
                      ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/20'
                      : isFutureDate(day.date)
                      ? 'bg-gradient-to-br from-card/40 to-secondary/20 border border-border/20 opacity-60'
                      : noSessions
                      ? 'bg-gradient-to-br from-card/30 to-secondary/10 border border-border/10'
                      : 'bg-gradient-to-br from-card to-secondary/30 border border-border/20 shadow-sm'
                  }`}
                  onClick={() => {
                    // Expand the day and scroll to its card
                    if (!expandedDays.has(day.dateStr)) {
                      toggleDayExpansion(day.dateStr);
                    }
                    setTimeout(() => {
                      const dayCard = document.getElementById(`day-${day.dateStr}`);
                      if (dayCard) dayCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 100);
                  }}
                >
                  {/* Day Name */}
                  <div className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
                    isToday(day.date) 
                      ? 'text-white' 
                      : allCompleted && !isFutureDate(day.date)
                      ? 'text-white/90'
                      : someCompleted
                      ? 'text-white/90'
                      : 'text-muted-foreground'
                  }`}>
                    {day.dayName}
                  </div>
                  
                  {/* Day Number */}
                  <div className={`text-lg font-extrabold mb-1 ${
                    isToday(day.date) 
                      ? 'text-white' 
                      : allCompleted && !isFutureDate(day.date)
                      ? 'text-white'
                      : someCompleted
                      ? 'text-white'
                      : 'text-foreground'
                  }`}>
                    {day.dayNum}
                  </div>
                  
                  {/* Session Progress Indicator */}
                  {day.sessions.length > 0 && (
                    <div className="flex items-center justify-center gap-0.5">
                      {allCompleted && !isFutureDate(day.date) ? (
                        <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Check className="w-3 h-3 text-white font-bold" />
                        </div>
                      ) : (
                        <div className="flex gap-0.5">
                          {Array.from({ length: Math.min(day.sessions.length, 4) }).map((_, i) => (
                            <div 
                              key={i} 
                              className={`w-1.5 h-1.5 rounded-full transition-all ${
                                i < day.completedSessionIds.length 
                                  ? isToday(day.date) || allCompleted || someCompleted
                                    ? 'bg-white shadow-sm'
                                    : 'bg-green-500 shadow-sm shadow-green-500/50' 
                                  : isToday(day.date) || allCompleted || someCompleted
                                  ? 'bg-white/30'
                                  : 'bg-muted-foreground/20'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Today Badge */}
                  {isToday(day.date) && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-white animate-pulse shadow-lg shadow-white/50" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekly Calendar View */}
      <main className="p-4 space-y-2">
        {sessions.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-card/80 to-secondary/30 backdrop-blur-sm border-accent/20">
            <div className="max-w-md mx-auto space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 to-indigo/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Begin Your Practice Journey</h3>
              <p className="text-muted-foreground">
                Create personalized sessions for yoga, meditation, stretching, or breathing exercises. 
                Build consistency and track your spiritual growth.
              </p>
              <Button
                onClick={() => setIsNewSessionDialogOpen(true)}
                className="bg-gradient-to-r from-accent to-indigo hover:from-accent/90 hover:to-indigo/90 shadow-glow"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Session
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {weekDays.map((day) => {
              const isExpanded = expandedDays.has(day.dateStr);
              const allCompleted = day.sessions.length > 0 && day.sessions.length === day.completedSessionIds.length;
              const someCompleted = day.completedSessionIds.length > 0 && day.completedSessionIds.length < day.sessions.length;
              
              return (
              <Card 
                key={day.dateStr}
                id={`day-${day.dateStr}`}
                className={`bg-card/80 backdrop-blur-sm transition-all scroll-mt-20 cursor-pointer ${
                  isToday(day.date) 
                    ? 'border-accent/50 shadow-glow' 
                    : 'border-border/30'
                }`}
                onClick={() => day.sessions.length > 0 && toggleDayExpansion(day.dateStr)}
              >
                {/* Day Header - Clickable */}
                <div className={`flex items-center justify-between ${isExpanded ? 'p-4 pb-3 border-b border-border/30' : 'p-4'}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
                      isToday(day.date)
                        ? 'bg-gradient-to-br from-accent to-indigo'
                        : 'bg-secondary/50'
                    }`}>
                      <span className={`text-[10px] font-medium ${
                        isToday(day.date) ? 'text-white' : 'text-muted-foreground'
                      }`}>
                        {day.dayName}
                      </span>
                      <span className={`text-lg font-bold ${
                        isToday(day.date) ? 'text-white' : 'text-foreground'
                      }`}>
                        {day.dayNum}
                      </span>
                    </div>
                    <div>
                      <h3 className={`font-semibold text-base ${isToday(day.date) ? 'text-accent' : ''}`}>
                        {day.dayName === 'Mon' ? 'Monday' : 
                         day.dayName === 'Tue' ? 'Tuesday' :
                         day.dayName === 'Wed' ? 'Wednesday' :
                         day.dayName === 'Thu' ? 'Thursday' :
                         day.dayName === 'Fri' ? 'Friday' :
                         day.dayName === 'Sat' ? 'Saturday' : 'Sunday'}
                      </h3>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-muted-foreground">
                          {day.sessions.length} {day.sessions.length === 1 ? 'session' : 'sessions'}
                        </p>
                        {allCompleted && !isFutureDate(day.date) && (
                          <Badge className="text-[10px] px-1.5 py-0 h-4 bg-green-500/20 text-green-500 border-green-500/30">
                            ✓ Complete
                          </Badge>
                        )}
                        {someCompleted && (
                          <Badge className="text-[10px] px-1.5 py-0 h-4 bg-orange-500/20 text-orange-500 border-orange-500/30">
                            {day.completedSessionIds.length}/{day.sessions.length}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isToday(day.date) && (
                      <Badge className="bg-accent/20 text-accent border-accent/30 animate-pulse">
                        Today
                      </Badge>
                    )}
                    {day.sessions.length > 0 && (
                      <ChevronRight className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    )}
                  </div>
                </div>

                {/* Day Sessions - Collapsible */}
                {isExpanded && (
                  <div className="p-4 pt-3 space-y-2">
                    {day.sessions.map((session) => {
                      const Icon = getSessionIcon(session.session_type);
                      const isCompleted = day.completedSessionIds.includes(session.id);
                      const canLog = isToday(day.date) && !isCompleted;
                      const isFuture = isFutureDate(day.date);

                      return (
                        <div 
                          key={session.id}
                          className={`p-3 rounded-lg border transition-all relative group ${
                            isCompleted 
                              ? 'bg-green-500/10 border-green-500/30' 
                              : isFuture
                              ? 'bg-card/30 border-border/20 opacity-60'
                              : getSessionColor(session.session_type)
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${getSessionColor(session.session_type)}`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{session.session_name}</h4>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  <span>{session.scheduled_time}</span>
                                  <span>•</span>
                                  <span>{session.duration_minutes} mins</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {isCompleted ? (
                                <div className="flex items-center gap-1 text-green-500">
                                  <Check className="w-5 h-5" />
                                  <span className="text-xs font-medium">Done</span>
                                </div>
                              ) : canLog ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleStartSession(session, day.date)}
                                  className="bg-gradient-to-r from-accent to-indigo hover:from-accent/90 hover:to-indigo/90"
                                >
                                  <Play className="w-4 h-4 mr-1" />
                                  Log
                                </Button>
                              ) : isFuture ? (
                                <Badge variant="secondary" className="text-xs">
                                  Yet to Begin
                                </Badge>
                              ) : null}
                              
                              {/* Edit/Delete Menu */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const menu = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (menu) menu.classList.toggle('hidden');
                                  }}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                                <div className="hidden absolute right-2 top-12 bg-card border border-border rounded-lg shadow-lg p-1 z-10 min-w-[120px]">
                                  <button
                                    onClick={() => handleEditSession(session)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent/10 rounded"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSession(session.id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive rounded"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* No sessions message */}
                {isExpanded && day.sessions.length === 0 && (
                  <div className="px-4 pb-4 pt-2">
                    <p className="text-sm text-muted-foreground text-center py-4">No sessions scheduled</p>
                  </div>
                )}
              </Card>
            );
            })}
          </>
        )}
      </main>

      {/* Create/Edit Session Dialog */}
      <Dialog open={isNewSessionDialogOpen} onOpenChange={(open) => {
        setIsNewSessionDialogOpen(open);
        if (!open) setEditingSession(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card/95 backdrop-blur-xl border-accent/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-accent to-indigo bg-clip-text text-transparent">
              {editingSession ? 'Edit Session' : 'Create New Session'}
            </DialogTitle>
          </DialogHeader>
          <CreateSessionForm
            session={editingSession}
            onSuccess={handleSessionSuccess}
            onCancel={() => {
              setIsNewSessionDialogOpen(false);
              setEditingSession(null);
            }}
          />
        </DialogContent>
      </Dialog>

      </div>
    </PullToRefresh>
    
    {/* Bottom Navigation */}
    <BottomNav />
    </>
  );
};

export default Sessions;
