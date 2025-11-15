import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Users,
  Calendar as CalendarIcon,
  Clock,
  Play,
  Check,
  Loader2,
} from 'lucide-react';
import { format, differenceInDays, isPast, isFuture } from 'date-fns';
import { useState } from 'react';

interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: 'meditation' | 'yoga' | 'breathing' | 'stretching' | 'all';
  duration_days: number;
  start_date: string;
  end_date: string;
  participant_count: number;
  is_group_challenge: boolean;
  practice_groups?: {
    name: string;
  } | null;
  challenge_participants?: Array<{
    user_id: string;
    completed_days: number;
    is_completed: boolean;
  }>;
}

interface ChallengeCardProps {
  challenge: Challenge;
  onJoin?: (challengeId: string) => Promise<void>;
  onView?: (challengeId: string) => void;
  currentUserId?: string;
}

const getChallengeTypeIcon = (type: string) => {
  switch (type) {
    case 'meditation':
      return '🧘';
    case 'yoga':
      return '🤸';
    case 'breathing':
      return '🌬️';
    case 'stretching':
      return '💪';
    case 'all':
      return '✨';
    default:
      return '🎯';
  }
};

const getChallengeTypeColor = (type: string) => {
  switch (type) {
    case 'meditation':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'yoga':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'breathing':
      return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
    case 'stretching':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'all':
      return 'bg-gradient-to-r from-accent/10 to-indigo/10 text-accent border-accent/20';
    default:
      return 'bg-accent/10 text-accent border-accent/20';
  }
};

export const ChallengeCard = ({
  challenge,
  onJoin,
  onView,
  currentUserId,
}: ChallengeCardProps) => {
  const [isJoining, setIsJoining] = useState(false);

  const startDate = new Date(challenge.start_date);
  const endDate = new Date(challenge.end_date);
  const today = new Date();

  const isUpcoming = isFuture(startDate);
  const isActive = !isPast(endDate) && !isFuture(startDate);
  const isCompleted = isPast(endDate);

  const daysRemaining = isActive
    ? differenceInDays(endDate, today) + 1
    : 0;

  const daysUntilStart = isUpcoming
    ? differenceInDays(startDate, today)
    : 0;

  // Check if user is participating
  const userParticipation = challenge.challenge_participants?.find(
    (p) => p.user_id === currentUserId
  );
  const isParticipating = !!userParticipation;
  const completedDays = userParticipation?.completed_days || 0;
  const completionPercentage = challenge.duration_days > 0
    ? Math.round((completedDays / challenge.duration_days) * 100)
    : 0;

  const handleJoin = async () => {
    if (onJoin && !isJoining) {
      setIsJoining(true);
      try {
        await onJoin(challenge.id);
      } finally {
        setIsJoining(false);
      }
    }
  };

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge variant="secondary" className="bg-muted text-muted-foreground">
          Completed
        </Badge>
      );
    }
    if (isUpcoming) {
      return (
        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          Starting Soon
        </Badge>
      );
    }
    if (isActive) {
      return (
        <Badge className="bg-green-500/10 text-green-500 border-green-500/20 animate-pulse">
          Active
        </Badge>
      );
    }
    return null;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-card/80 to-secondary/30 backdrop-blur-sm border-accent/20">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={getChallengeTypeColor(challenge.challenge_type)}
              >
                {getChallengeTypeIcon(challenge.challenge_type)}{' '}
                {challenge.challenge_type.charAt(0).toUpperCase() +
                  challenge.challenge_type.slice(1)}
              </Badge>
              {getStatusBadge()}
            </div>
            <h3 className="text-xl font-bold text-glow leading-tight">
              {challenge.title}
            </h3>
            {challenge.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {challenge.description}
              </p>
            )}
          </div>
          <Trophy className="w-8 h-8 text-accent flex-shrink-0" />
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{challenge.duration_days} days</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{challenge.participant_count} joined</span>
          </div>
        </div>

        {/* Group Info */}
        {challenge.is_group_challenge && challenge.practice_groups && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/5 border border-accent/10">
            <Users className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium">
              {challenge.practice_groups.name}
            </span>
          </div>
        )}

        {/* Dates */}
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4" />
              Start
            </span>
            <span className="font-medium">{format(startDate, 'MMM dd, yyyy')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4" />
              End
            </span>
            <span className="font-medium">{format(endDate, 'MMM dd, yyyy')}</span>
          </div>
        </div>

        {/* Time Status */}
        {isUpcoming && (
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
            <p className="text-sm font-medium text-blue-500">
              Starts in {daysUntilStart} {daysUntilStart === 1 ? 'day' : 'days'}
            </p>
          </div>
        )}

        {isActive && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
            <p className="text-sm font-medium text-green-500">
              {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
            </p>
          </div>
        )}

        {/* User Progress */}
        {isParticipating && isActive && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Your Progress</span>
              <span className="font-medium text-accent">
                {completedDays} / {challenge.duration_days} days
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            <p className="text-xs text-center text-muted-foreground">
              {completionPercentage}% Complete
            </p>
          </div>
        )}

        {isParticipating && userParticipation?.is_completed && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 text-center">
            <p className="text-sm font-medium text-green-500 flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              You completed this challenge! 🎉
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2">
          {isParticipating ? (
            <Button
              onClick={() => onView?.(challenge.id)}
              className="w-full bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
              variant="outline"
            >
              <Trophy className="w-4 h-4 mr-2" />
              View Progress
            </Button>
          ) : (
            <Button
              onClick={handleJoin}
              disabled={isJoining || isCompleted}
              className="w-full bg-gradient-to-r from-accent to-indigo hover:from-accent/90 hover:to-indigo/90 shadow-glow"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : isCompleted ? (
                'Challenge Ended'
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Join Challenge
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
