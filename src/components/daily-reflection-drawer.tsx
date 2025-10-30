import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronDown, Smile, Frown, Meh, Zap, Moon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

const moods = [
  { value: 'calm', label: 'Calm', icon: Moon },
  { value: 'focused', label: 'Focused', icon: Zap },
  { value: 'energized', label: 'Energized', icon: Smile },
  { value: 'tired', label: 'Tired', icon: Meh },
  { value: 'stressed', label: 'Stressed', icon: Frown },
];

interface DailyReflectionDrawerProps {
  date: string;
  isOpen: boolean;
  onClose: () => void;
}

export const DailyReflectionDrawer = ({ date, isOpen, onClose }: DailyReflectionDrawerProps) => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState('');
  const [daySummary, setDaySummary] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasReflection, setHasReflection] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      loadReflection();
    }
  }, [user, date, isOpen]);

  const loadReflection = async () => {
    const { data } = await supabase
      .from('daily_reflections')
      .select('*')
      .eq('reflection_date', date)
      .maybeSingle();

    if (data) {
      setSelectedMood(data.mood || '');
      setDaySummary(data.day_summary || '');
      setKeyTakeaway(data.key_takeaway || '');
      setHasReflection(true);
    } else {
      setSelectedMood('');
      setDaySummary('');
      setKeyTakeaway('');
      setHasReflection(false);
    }
  };

  const saveReflection = async () => {
    if (!user) return;
    
    setSaving(true);

    const reflectionData = {
      user_id: user.id,
      reflection_date: date,
      mood: selectedMood || null,
      day_summary: daySummary || null,
      key_takeaway: keyTakeaway || null,
    };

    const { error } = await supabase
      .from('daily_reflections')
      .upsert(reflectionData, {
        onConflict: 'user_id,reflection_date'
      });

    setSaving(false);

    if (error) {
      toast.error("Failed to save reflection");
      return;
    }

    toast.success(hasReflection ? "Reflection updated! 📝" : "Reflection saved! 📝");
    setHasReflection(true);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="bg-background">
        <div className="mx-auto w-full max-w-2xl">
          <DrawerHeader className="text-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-4 rounded-full md:hidden"
              onClick={onClose}
            >
              <ChevronDown className="w-6 h-6" />
            </Button>
            <DrawerTitle className="text-2xl font-bold text-glow">Daily Reflection</DrawerTitle>
            <p className="text-sm text-muted-foreground">
              {new Date(date).toLocaleDateString('default', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          </DrawerHeader>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto pb-safe">
            <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20 animate-in slide-in-from-bottom-2">
              <Label className="text-lg font-semibold mb-4 block">How are you feeling today?</Label>
              <div className="grid grid-cols-5 gap-3">
                {moods.map((mood, index) => {
                  const Icon = mood.icon;
                  return (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`
                        flex flex-col items-center gap-2 p-4 rounded-xl transition-all
                        ${selectedMood === mood.value
                          ? 'bg-accent/30 border-2 border-accent shadow-glow'
                          : 'bg-secondary/30 border border-border/30 hover:bg-secondary/50'
                        }
                      `}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <Icon className={`w-6 h-6 ${selectedMood === mood.value ? 'text-accent' : 'text-muted-foreground'}`} />
                      <span className={`text-xs ${selectedMood === mood.value ? 'text-accent font-semibold' : 'text-muted-foreground'}`}>
                        {mood.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card 
              className="p-6 bg-card/80 backdrop-blur-sm border-accent/20 animate-in slide-in-from-bottom-4"
              style={{ animationDelay: '200ms' }}
            >
              <Label className="text-lg font-semibold mb-3 block">How was your day?</Label>
              <Textarea
                value={daySummary}
                onChange={(e) => setDaySummary(e.target.value)}
                placeholder="Share your thoughts about today..."
                className="min-h-[120px] bg-background/50 border-accent/30 resize-none"
              />
            </Card>

            <Card 
              className="p-6 bg-card/80 backdrop-blur-sm border-accent/20 animate-in slide-in-from-bottom-4"
              style={{ animationDelay: '300ms' }}
            >
              <Label className="text-lg font-semibold mb-3 block">What's your key takeaway?</Label>
              <Textarea
                value={keyTakeaway}
                onChange={(e) => setKeyTakeaway(e.target.value)}
                placeholder="What did you learn or discover today?"
                className="min-h-[100px] bg-background/50 border-accent/30 resize-none"
              />
            </Card>

            <Button
              onClick={saveReflection}
              disabled={saving}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-12 rounded-full shadow-glow animate-in slide-in-from-bottom-4"
              style={{ animationDelay: '400ms' }}
            >
              {saving ? 'Saving...' : hasReflection ? 'Update Reflection' : 'Save Reflection'}
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
