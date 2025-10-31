import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Brain, Dumbbell, Wind, Play, MoreVertical, Clock } from "lucide-react";
import type { Session } from "@/types/session";

const sessionIcons = {
  yoga: Activity,
  meditation: Brain,
  stretching: Dumbbell,
  breathing: Wind,
};

const sessionColors = {
  yoga: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  meditation: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  stretching: 'bg-green-500/10 text-green-500 border-green-500/20',
  breathing: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
};

interface SessionCardProps {
  session: Session;
  onStart: (session: Session) => void;
  onEdit?: (session: Session) => void;
  onDelete?: (sessionId: string) => void;
  recentMinutes?: number; // Last session duration
  weeklyCount?: number; // Times done this week
}

export const SessionCard = ({ session, onStart, onEdit, onDelete, recentMinutes, weeklyCount }: SessionCardProps) => {
  const Icon = sessionIcons[session.session_type];
  const colorClass = sessionColors[session.session_type];
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-accent/20 hover:border-accent/40 transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-lg">{session.session_name}</h3>
              {weeklyCount !== undefined && weeklyCount > 0 && (
                <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">
                  {weeklyCount}x this week
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span>{session.scheduled_time}</span>
              <span>•</span>
              <span>{session.duration_minutes} mins</span>
              {recentMinutes !== undefined && recentMinutes > 0 && (
                <>
                  <span>•</span>
                  <span className="text-accent font-medium">Last: {recentMinutes}m</span>
                </>
              )}
            </div>
            <div className="flex gap-1 flex-wrap">
              {session.days_of_week.map((day) => (
                <Badge key={day} variant="secondary" className="text-xs">
                  {day}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            onClick={() => onStart(session)}
            className="bg-gradient-to-r from-accent to-indigo hover:from-accent/90 hover:to-indigo/90"
          >
            <Play className="w-4 h-4 mr-1" />
            Start
          </Button>
          {(onEdit || onDelete) && (
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowMenu(!showMenu)}
                className="hover:bg-accent/10"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg p-1 z-10 min-w-[120px]">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(session);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent/10 rounded"
                    >
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(session.id);
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-destructive/10 text-destructive rounded"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
