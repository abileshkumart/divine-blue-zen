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
}

export const SessionCard = ({ session, onStart, onEdit }: SessionCardProps) => {
  const Icon = sessionIcons[session.session_type];
  const colorClass = sessionColors[session.session_type];

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-sm border-accent/20 hover:border-accent/40 transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className={`p-3 rounded-lg ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{session.session_name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Clock className="w-4 h-4" />
              <span>{session.scheduled_time}</span>
              <span>•</span>
              <span>{session.duration_minutes} mins</span>
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
            className="bg-accent hover:bg-accent/90"
          >
            <Play className="w-4 h-4 mr-1" />
            Start
          </Button>
          {onEdit && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onEdit(session)}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
