import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SessionCard } from "@/components/SessionCard";
import { CreateSessionForm } from "@/components/CreateSessionForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Session } from "@/types/session";
import { toast } from "sonner";

const SessionsNew = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user]);

  const fetchSessions = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('sessions' as any)
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } else {
      setSessions((data as unknown as Session[]) || []);
    }
    setIsLoading(false);
  };

  const handleStartSession = (session: Session) => {
    // Navigate to session tracker with session details
    navigate(`/session-tracker/${session.id}`, { state: { session } });
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    fetchSessions();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-border/50 backdrop-blur-sm bg-card/50 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="rounded-full hover:bg-accent/20"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">My Sessions</h1>
            <p className="text-sm text-muted-foreground">
              {sessions.length} active {sessions.length === 1 ? 'session' : 'sessions'}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-accent hover:bg-accent/90 rounded-full"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Session
        </Button>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">
              No sessions yet. Create your first one!
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-accent hover:bg-accent/90"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Session
            </Button>
          </div>
        ) : (
          sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onStart={handleStartSession}
            />
          ))
        )}
      </main>

      {/* Create Session Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Create New Session</DialogTitle>
          </DialogHeader>
          <CreateSessionForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SessionsNew;
