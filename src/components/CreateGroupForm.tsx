import { useState } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface CreateGroupFormProps {
  onSuccess?: (groupId: string, inviteCode: string) => void;
  onCancel?: () => void;
}

export const CreateGroupForm = ({
  onSuccess,
  onCancel,
}: CreateGroupFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [groupType, setGroupType] = useState<string>('general');
  const [isPrivate, setIsPrivate] = useState(false);
  const [memberLimit, setMemberLimit] = useState<number>(50);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a group name');
      return;
    }

    if (memberLimit < 2 || memberLimit > 1000) {
      toast.error('Member limit must be between 2 and 1000');
      return;
    }

    setLoading(true);

    try {
      const groupData = {
        name: name.trim(),
        description: description.trim() || null,
        group_type: groupType,
        created_by: user?.id,
        is_private: isPrivate,
        member_limit: memberLimit,
      };

      const { data, error } = await supabase
        .from('practice_groups')
        .insert(groupData)
        .select()
        .single();

      if (error) throw error;

      toast.success('Practice group created! 🎉');
      
      if (onSuccess) {
        onSuccess(data.id, data.invite_code);
      }

      // Reset form
      setName('');
      setDescription('');
      setGroupType('general');
      setIsPrivate(false);
      setMemberLimit(50);
    } catch (error: any) {
      console.error('Error creating group:', error);
      toast.error(error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Group Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Group Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Morning Meditators"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          disabled={loading}
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What is this group about? Who should join?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          maxLength={500}
          disabled={loading}
        />
      </div>

      {/* Group Type */}
      <div className="space-y-2">
        <Label htmlFor="type">Practice Focus *</Label>
        <Select
          value={groupType}
          onValueChange={setGroupType}
          disabled={loading}
        >
          <SelectTrigger id="type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="meditation">🧘 Meditation</SelectItem>
            <SelectItem value="yoga">🤸 Yoga</SelectItem>
            <SelectItem value="breathing">🌬️ Breathing</SelectItem>
            <SelectItem value="general">✨ All Practices</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Member Limit */}
      <div className="space-y-2">
        <Label htmlFor="limit">Member Limit</Label>
        <Input
          id="limit"
          type="number"
          min={2}
          max={1000}
          value={memberLimit}
          onChange={(e) => setMemberLimit(parseInt(e.target.value) || 50)}
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          Maximum number of members (2-1000)
        </p>
      </div>

      {/* Private Group */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Private Group</Label>
          <p className="text-xs text-muted-foreground">
            Only members with invite link can see and join
          </p>
        </div>
        <Switch
          checked={isPrivate}
          onCheckedChange={setIsPrivate}
          disabled={loading}
        />
      </div>

      {/* Info Box */}
      <div className="p-4 rounded-lg bg-accent/5 border border-accent/10">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Tip:</strong> After creating the group, you'll get a unique invite link to share with friends. When they join your group, they'll automatically be added to any active group challenges!
        </p>
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
          disabled={loading}
          className="flex-1 bg-gradient-to-r from-accent to-indigo hover:from-accent/90 hover:to-indigo/90 shadow-glow"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Group'
          )}
        </Button>
      </div>
    </form>
  );
};
