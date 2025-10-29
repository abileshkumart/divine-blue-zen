import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ChevronLeft, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface YogaSession {
  id: string;
  title: string;
  session_type: string;
  time_of_day: string;
  scheduled_time: string | null;
  is_active: boolean;
}

const Sessions = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);
  const [sessions, setSessions] = useState<YogaSession[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSession, setNewSession] = useState({
    title: "",
    session_type: "pranayama",
    time_of_day: "morning",
    scheduled_time: "07:00",
  });

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('yoga_sessions')
      .select('*')
      .eq('is_active', true)
      .order('time_of_day', { ascending: true });

    if (error) {
      toast.error("Failed to load sessions");
      return;
    }

    setSessions(data || []);
  };

  const createSession = async () => {
    if (!user || !newSession.title) return;

    const { error } = await supabase
      .from('yoga_sessions')
      .insert({
        user_id: user.id,
        ...newSession,
      });

    if (error) {
      toast.error("Failed to create session");
      return;
    }

    toast.success("Session created!");
    setIsDialogOpen(false);
    setNewSession({
      title: "",
      session_type: "pranayama",
      time_of_day: "morning",
      scheduled_time: "07:00",
    });
    fetchSessions();
  };

  const deleteSession = async (id: string) => {
    const { error } = await supabase
      .from('yoga_sessions')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete session");
      return;
    }

    toast.success("Session removed");
    fetchSessions();
  };

  const logSession = async (session: YogaSession) => {
    if (!user) return;

    const { error } = await supabase
      .from('session_logs')
      .insert({
        user_id: user.id,
        session_id: session.id,
        session_title: session.title,
        session_type: session.session_type,
      });

    if (error) {
      toast.error("Failed to log session");
      return;
    }

    toast.success("Session logged! 🧘‍♀️");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="p-6 border-b border-border/50 backdrop-blur-sm bg-card/50">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-glow">Yoga Sessions</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="icon" className="rounded-full bg-accent hover:bg-accent/90">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-accent/40">
              <DialogHeader>
                <DialogTitle>Create New Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Session Title</Label>
                  <Input
                    value={newSession.title}
                    onChange={(e) => setNewSession({ ...newSession, title: e.target.value })}
                    placeholder="e.g., Morning Breathing Practice"
                    className="bg-background/50 border-accent/30"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={newSession.session_type}
                    onValueChange={(value) => setNewSession({ ...newSession, session_type: value })}
                  >
                    <SelectTrigger className="bg-background/50 border-accent/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pranayama">Pranayama (Breathing)</SelectItem>
                      <SelectItem value="asana">Asana (Postures)</SelectItem>
                      <SelectItem value="meditation">Meditation</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Time of Day</Label>
                  <Select
                    value={newSession.time_of_day}
                    onValueChange={(value) => setNewSession({ ...newSession, time_of_day: value })}
                  >
                    <SelectTrigger className="bg-background/50 border-accent/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Scheduled Time</Label>
                  <Input
                    type="time"
                    value={newSession.scheduled_time}
                    onChange={(e) => setNewSession({ ...newSession, scheduled_time: e.target.value })}
                    className="bg-background/50 border-accent/30"
                  />
                </div>
                <Button onClick={createSession} className="w-full bg-accent hover:bg-accent/90">
                  Create Session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-6 space-y-4">
        {sessions.length === 0 ? (
          <Card className="p-8 text-center bg-card/80 backdrop-blur-sm border-accent/20">
            <p className="text-muted-foreground mb-4">No sessions scheduled yet</p>
            <p className="text-sm text-muted-foreground">Click the + button to create your first yoga session</p>
          </Card>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="p-5 bg-card/80 backdrop-blur-sm border-accent/20">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{session.title}</h3>
                  <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span className="px-2 py-1 rounded-full bg-accent/20 text-accent">
                      {session.session_type}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-secondary/50">
                      {session.time_of_day}
                    </span>
                    {session.scheduled_time && (
                      <span className="px-2 py-1 rounded-full bg-secondary/50">
                        {session.scheduled_time}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => logSession(session)}
                    className="text-accent hover:text-accent/80"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteSession(session.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </main>
    </div>
  );
};

export default Sessions;
