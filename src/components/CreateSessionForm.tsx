import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity, Brain, Dumbbell, Wind } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { SessionType } from "@/types/session";

const sessionTypes = [
  { value: 'yoga', label: 'Yoga', icon: Activity, color: 'text-purple-500' },
  { value: 'meditation', label: 'Meditation', icon: Brain, color: 'text-blue-500' },
  { value: 'stretching', label: 'Stretching', icon: Dumbbell, color: 'text-green-500' },
  { value: 'breathing', label: 'Breathing', icon: Wind, color: 'text-cyan-500' },
];

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface CreateSessionFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreateSessionForm = ({ onSuccess, onCancel }: CreateSessionFormProps) => {
  const { user } = useAuth();
  const [sessionName, setSessionName] = useState('');
  const [sessionType, setSessionType] = useState<SessionType>('meditation');
  const [scheduledTime, setScheduledTime] = useState('07:00');
  const [duration, setDuration] = useState(15);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to create a session');
      return;
    }

    if (!sessionName.trim()) {
      toast.error('Please enter a session name');
      return;
    }

    if (selectedDays.length === 0) {
      toast.error('Please select at least one day');
      return;
    }

    setSaving(true);

    const { error } = await supabase.from('sessions' as any).insert({
      user_id: user.id,
      session_name: sessionName,
      session_type: sessionType,
      scheduled_time: scheduledTime,
      duration_minutes: duration,
      days_of_week: selectedDays,
      reminder_enabled: reminderEnabled,
    });

    setSaving(false);

    if (error) {
      toast.error('Failed to create session');
      console.error(error);
      return;
    }

    toast.success('Session created successfully! 🎉');
    
    // Reset form
    setSessionName('');
    setSelectedDays([]);
    setDuration(15);
    
    onSuccess?.();
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="sessionName">Session Name</Label>
          <Input
            id="sessionName"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="e.g., Morning Yoga"
            className="mt-2"
          />
        </div>

        <div>
          <Label>Session Type</Label>
          <div className="grid grid-cols-2 gap-3 mt-2">
            {sessionTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSessionType(type.value as SessionType)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    sessionType === type.value
                      ? 'border-accent bg-accent/10'
                      : 'border-border hover:border-accent/50'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${type.color}`} />
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="time">Time</Label>
            <Input
              id="time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="duration">Duration (mins)</Label>
            <Select value={duration.toString()} onValueChange={(v) => setDuration(Number(v))}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="20">20 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Days of Week</Label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {daysOfWeek.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(day)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedDays.includes(day)
                    ? 'bg-accent text-accent-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="reminder"
            checked={reminderEnabled}
            onCheckedChange={(checked) => setReminderEnabled(checked as boolean)}
          />
          <Label htmlFor="reminder" className="cursor-pointer">
            Enable reminders for this session
          </Label>
        </div>

        <div className="flex gap-3">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={saving}
            className="flex-1 bg-accent hover:bg-accent/90"
          >
            {saving ? 'Creating...' : 'Create Session'}
          </Button>
        </div>
      </form>
    </Card>
  );
};
