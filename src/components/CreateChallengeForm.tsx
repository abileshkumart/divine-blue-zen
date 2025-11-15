import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Group {
  id: string;
  name: string;
}

interface CreateChallengeFormProps {
  onSuccess?: (challengeId: string) => void;
  onCancel?: () => void;
  preSelectedGroupId?: string;
}

export const CreateChallengeForm = ({
  onSuccess,
  onCancel,
  preSelectedGroupId,
}: CreateChallengeFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [challengeType, setChallengeType] = useState<string>('meditation');
  const [durationDays, setDurationDays] = useState<number>(21);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [groupId, setGroupId] = useState<string>(preSelectedGroupId || '');
  const [isGroupChallenge, setIsGroupChallenge] = useState(true);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserGroups();
    }
  }, [user]);

  useEffect(() => {
    if (preSelectedGroupId) {
      setGroupId(preSelectedGroupId);
      setIsGroupChallenge(true);
    }
  }, [preSelectedGroupId]);

  const loadUserGroups = async () => {
    try {
      setLoadingGroups(true);
      const { data, error } = await supabase
        .from('group_members')
        .select('group_id, practice_groups(id, name)')
        .eq('user_id', user?.id)
        .order('joined_at', { ascending: false });

      if (error) throw error;

      const groupsData = data
        ?.map((item: any) => item.practice_groups)
        .filter(Boolean) || [];
      
      setGroups(groupsData);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoadingGroups(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Please enter a challenge title');
      return;
    }

    if (durationDays < 1 || durationDays > 365) {
      toast.error('Duration must be between 1 and 365 days');
      return;
    }

    if (isGroupChallenge && !groupId) {
      toast.error('Please select a group for this challenge');
      return;
    }

    setLoading(true);

    try {
      const endDate = addDays(startDate, durationDays - 1);

      const challengeData = {
        title: title.trim(),
        description: description.trim() || null,
        challenge_type: challengeType,
        duration_days: durationDays,
        start_date: format(startDate, 'yyyy-MM-dd'),
        end_date: format(endDate, 'yyyy-MM-dd'),
        created_by: user?.id,
        group_id: isGroupChallenge ? groupId : null,
        is_group_challenge: isGroupChallenge,
        is_public: isPublic,
      };

      const { data, error } = await supabase
        .from('challenges')
        .insert(challengeData)
        .select()
        .single();

      if (error) throw error;

      // Auto-join the creator to the challenge
      const { error: participantError } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: data.id,
          user_id: user?.id,
        });

      if (participantError) throw participantError;

      toast.success('Challenge created successfully! 🎉');
      
      if (onSuccess) {
        onSuccess(data.id);
      }

      // Reset form
      setTitle('');
      setDescription('');
      setChallengeType('meditation');
      setDurationDays(21);
      setStartDate(new Date());
      setGroupId(preSelectedGroupId || '');
      setIsGroupChallenge(true);
      setIsPublic(true);
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      toast.error(error.message || 'Failed to create challenge');
    } finally {
      setLoading(false);
    }
  };

  const endDate = addDays(startDate, durationDays - 1);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Challenge Title *</Label>
        <Input
          id="title"
          placeholder="e.g., 21-Day Morning Meditation"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={100}
          disabled={loading}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe your challenge and what participants will achieve..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={500}
          disabled={loading}
        />
      </div>

      {/* Challenge Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Practice Type *</Label>
        <Select
          value={challengeType}
          onValueChange={setChallengeType}
          disabled={loading}
        >
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="meditation">🧘 Meditation</SelectItem>
            <SelectItem value="yoga">🤸 Yoga</SelectItem>
            <SelectItem value="breathing">🌬️ Breathing</SelectItem>
            <SelectItem value="stretching">💪 Stretching</SelectItem>
            <SelectItem value="all">✨ All Practices</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Duration */}
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (days) *</Label>
        <Input
          id="duration"
          type="number"
          min={1}
          max={365}
          value={durationDays}
          onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          Popular: 7 days, 21 days, 30 days, or 100 days
        </p>
      </div>

      {/* Start Date */}
      <div className="space-y-2">
        <Label>Start Date *</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !startDate && 'text-muted-foreground'
              )}
              disabled={loading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? format(startDate, 'PPP') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => date && setStartDate(date)}
              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <p className="text-xs text-muted-foreground">
          End date: {format(endDate, 'PPP')}
        </p>
      </div>

      {/* Group Selection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Group Challenge</Label>
            <p className="text-xs text-muted-foreground">
              Link this challenge to a practice group
            </p>
          </div>
          <Switch
            checked={isGroupChallenge}
            onCheckedChange={setIsGroupChallenge}
            disabled={loading || !!preSelectedGroupId}
          />
        </div>

        {isGroupChallenge && (
          <div className="space-y-2">
            <Label htmlFor="group">Select Group *</Label>
            {loadingGroups ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin text-accent" />
              </div>
            ) : groups.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                You're not a member of any groups yet. Create a group first!
              </p>
            ) : (
              <Select
                value={groupId}
                onValueChange={setGroupId}
                disabled={loading || !!preSelectedGroupId}
              >
                <SelectTrigger id="group">
                  <SelectValue placeholder="Choose a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>

      {/* Public/Private */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Public Challenge</Label>
          <p className="text-xs text-muted-foreground">
            Anyone can discover and join this challenge
          </p>
        </div>
        <Switch
          checked={isPublic}
          onCheckedChange={setIsPublic}
          disabled={loading}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading || (isGroupChallenge && groups.length === 0)}
          className="flex-1 bg-gradient-to-r from-accent to-indigo hover:from-accent/90 hover:to-indigo/90 shadow-glow"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Challenge'
          )}
        </Button>
      </div>
    </form>
  );
};
