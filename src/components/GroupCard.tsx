import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Lock,
  Globe,
  UserPlus,
  Share2,
  Trophy,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';

interface Group {
  id: string;
  name: string;
  description: string | null;
  group_type: 'meditation' | 'yoga' | 'breathing' | 'general';
  member_count: number;
  member_limit: number;
  is_private: boolean;
  invite_code: string;
  created_by: string;
}

interface GroupCardProps {
  group: Group;
  onJoin?: (groupId: string) => Promise<void>;
  onView?: (groupId: string) => void;
  onShare?: (inviteCode: string) => void;
  isMember?: boolean;
  currentUserId?: string;
}

const getGroupTypeIcon = (type: string) => {
  switch (type) {
    case 'meditation':
      return '🧘';
    case 'yoga':
      return '🤸';
    case 'breathing':
      return '🌬️';
    case 'general':
      return '✨';
    default:
      return '👥';
  }
};

const getGroupTypeColor = (type: string) => {
  switch (type) {
    case 'meditation':
      return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
    case 'yoga':
      return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    case 'breathing':
      return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
    case 'general':
      return 'bg-gradient-to-r from-accent/10 to-indigo/10 text-accent border-accent/20';
    default:
      return 'bg-accent/10 text-accent border-accent/20';
  }
};

export const GroupCard = ({
  group,
  onJoin,
  onView,
  onShare,
  isMember = false,
  currentUserId,
}: GroupCardProps) => {
  const [isJoining, setIsJoining] = useState(false);

  const isOwner = currentUserId === group.created_by;
  const isFull = group.member_count >= group.member_limit;
  const spotsLeft = group.member_limit - group.member_count;

  const handleJoin = async () => {
    if (onJoin && !isJoining) {
      setIsJoining(true);
      try {
        await onJoin(group.id);
      } finally {
        setIsJoining(false);
      }
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(group.invite_code);
    } else {
      // Default share behavior - copy invite link
      const inviteUrl = `${window.location.origin}/join-group/${group.invite_code}`;
      navigator.clipboard.writeText(inviteUrl);
    }
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
                className={getGroupTypeColor(group.group_type)}
              >
                {getGroupTypeIcon(group.group_type)}{' '}
                {group.group_type.charAt(0).toUpperCase() +
                  group.group_type.slice(1)}
              </Badge>
              {group.is_private ? (
                <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20">
                  <Lock className="w-3 h-3 mr-1" />
                  Private
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                  <Globe className="w-3 h-3 mr-1" />
                  Public
                </Badge>
              )}
              {isOwner && (
                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
                  Owner
                </Badge>
              )}
              {isMember && !isOwner && (
                <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Member
                </Badge>
              )}
            </div>
            <h3 className="text-xl font-bold text-glow leading-tight">
              {group.name}
            </h3>
            {group.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {group.description}
              </p>
            )}
          </div>
          <Users className="w-8 h-8 text-accent flex-shrink-0" />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">
              {group.member_count} / {group.member_limit} members
            </span>
          </div>
          {spotsLeft > 0 && spotsLeft <= 10 && (
            <span className="text-xs text-orange-500 font-medium">
              {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
            </span>
          )}
          {isFull && (
            <span className="text-xs text-red-500 font-medium">
              Full
            </span>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent to-indigo transition-all duration-500"
              style={{
                width: `${Math.min((group.member_count / group.member_limit) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        {/* Invite Code (for members/owner) */}
        {(isMember || isOwner) && (
          <div className="p-3 rounded-lg bg-accent/5 border border-accent/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Invite Code</p>
                <code className="text-sm font-mono font-bold text-accent">
                  {group.invite_code}
                </code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="flex-shrink-0"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex gap-2">
          {isMember || isOwner ? (
            <>
              <Button
                onClick={() => onView?.(group.id)}
                className="flex-1 bg-accent/10 text-accent hover:bg-accent/20 border border-accent/20"
                variant="outline"
              >
                <Trophy className="w-4 h-4 mr-2" />
                View Challenges
              </Button>
              {(isOwner || isMember) && (
                <Button
                  onClick={handleShare}
                  className="bg-gradient-to-r from-accent to-indigo hover:from-accent/90 hover:to-indigo/90 shadow-glow"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Invite
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={handleJoin}
              disabled={isJoining || isFull}
              className="w-full bg-gradient-to-r from-accent to-indigo hover:from-accent/90 hover:to-indigo/90 shadow-glow"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : isFull ? (
                'Group Full'
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Join Group
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
