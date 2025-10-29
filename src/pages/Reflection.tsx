import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Smile, Frown, Meh, Zap, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const moods = [
  { value: 'calm', label: 'Calm', icon: Moon },
  { value: 'focused', label: 'Focused', icon: Zap },
  { value: 'energized', label: 'Energized', icon: Smile },
  { value: 'tired', label: 'Tired', icon: Meh },
  { value: 'stressed', label: 'Stressed', icon: Frown },
];

const Reflection = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);
  const [selectedMood, setSelectedMood] = useState('');
  const [daySummary, setDaySummary] = useState('');
  const [keyTakeaway, setKeyTakeaway] = useState('');
  const [saving, setSaving] = useState(false);
  const [hasReflection, setHasReflection] = useState(false);

  useEffect(() => {
    if (user) {
      loadTodayReflection();
    }
  }, [user]);

  const loadTodayReflection = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('daily_reflections')
      .select('*')
      .eq('reflection_date', today)
      .maybeSingle();

    if (data) {
      setSelectedMood(data.mood || '');
      setDaySummary(data.day_summary || '');
      setKeyTakeaway(data.key_takeaway || '');
      setHasReflection(true);
    }
  };

  const saveReflection = async () => {
    if (!user) return;
    
    setSaving(true);
    const today = new Date().toISOString().split('T')[0];

    const reflectionData = {
      user_id: user.id,
      reflection_date: today,
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
          <h1 className="text-2xl font-bold text-glow">Daily Reflection</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="p-6 space-y-6">
        <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20">
          <Label className="text-lg font-semibold mb-4 block">How are you feeling today?</Label>
          <div className="grid grid-cols-5 gap-3">
            {moods.map((mood) => {
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

        <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20">
          <Label className="text-lg font-semibold mb-3 block">How was your day?</Label>
          <Textarea
            value={daySummary}
            onChange={(e) => setDaySummary(e.target.value)}
            placeholder="Share your thoughts about today..."
            className="min-h-[120px] bg-background/50 border-accent/30 resize-none"
          />
        </Card>

        <Card className="p-6 bg-card/80 backdrop-blur-sm border-accent/20">
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
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-12 rounded-full shadow-glow"
        >
          {saving ? 'Saving...' : hasReflection ? 'Update Reflection' : 'Save Reflection'}
        </Button>
      </main>
    </div>
  );
};

export default Reflection;
