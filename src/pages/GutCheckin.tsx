import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Check, Smile, Meh, Frown, Angry, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { symptomOptions } from "@/lib/gutHealth";
import { cn } from "@/lib/utils";

const feelingEmojis = [
  { value: 1, emoji: "😣", label: "Terrible" },
  { value: 2, emoji: "😕", label: "Not great" },
  { value: 3, emoji: "😐", label: "Okay" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Great!" },
];

const bowelOptions = [
  { value: "none", label: "None yet", emoji: "⏳" },
  { value: "constipated", label: "Hard/Constipated", emoji: "🧱" },
  { value: "normal", label: "Normal", emoji: "✅" },
  { value: "loose", label: "Loose/Watery", emoji: "💧" },
  { value: "mixed", label: "Mixed/Irregular", emoji: "🔄" },
];

const bloatingOptions = [
  { value: "none", label: "None", color: "bg-green-500" },
  { value: "mild", label: "Mild", color: "bg-yellow-500" },
  { value: "moderate", label: "Moderate", color: "bg-orange-500" },
  { value: "severe", label: "Severe", color: "bg-red-500" },
];

const GutCheckin = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Form state
  const [overallFeeling, setOverallFeeling] = useState<number | null>(null);
  const [bowelMovement, setBowelMovement] = useState<string | null>(null);
  const [bloating, setBloating] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async () => {
    if (!user || !overallFeeling) {
      toast({ title: "Please rate how you're feeling", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const checkInData = {
        overallFeeling,
        bowelMovement,
        bloating,
        symptoms: selectedSymptoms,
        energyLevel,
        stressLevel,
        notes,
      };

      const { error } = await supabase.from("daily_reflections").insert({
        user_id: user.id,
        reflection_text: `Gut Check-in: ${JSON.stringify(checkInData)}`,
        mood: `gut-checkin-${overallFeeling}`,
        reflection_date: new Date().toISOString().split("T")[0],
      });

      if (error) throw error;

      setSaved(true);
      toast({ title: "Check-in saved! 🎉" });
      
      setTimeout(() => {
        navigate('/gut');
      }, 1500);
    } catch (error) {
      console.error("Error saving check-in:", error);
      toast({ title: "Could not save check-in", variant: "destructive" });
    }
    setSaving(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (saved) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-sm w-full bg-green-500/10 border-green-500/30">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Check-in Complete!</h2>
          <p className="text-muted-foreground">
            Great job tracking your gut health today.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-6 flex items-center gap-3 border-b border-border/50 backdrop-blur-sm bg-card/50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/gut')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Daily Check-in</h1>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </p>
        </div>
      </header>

      {/* Form */}
      <main className="p-6 space-y-6">
        {/* Overall Feeling */}
        <Card className="p-5 bg-card/80 border-border/50">
          <h3 className="font-semibold mb-4">How is your gut feeling today?</h3>
          <div className="flex justify-between gap-2">
            {feelingEmojis.map((option) => (
              <button
                key={option.value}
                onClick={() => setOverallFeeling(option.value)}
                className={cn(
                  "flex-1 py-3 rounded-lg transition-all text-center",
                  overallFeeling === option.value
                    ? "bg-accent text-accent-foreground scale-105"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <div className="text-2xl mb-1">{option.emoji}</div>
                <div className="text-xs">{option.label}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Bowel Movement */}
        <Card className="p-5 bg-card/80 border-border/50">
          <h3 className="font-semibold mb-4">Bowel movement today?</h3>
          <div className="grid grid-cols-3 gap-2">
            {bowelOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setBowelMovement(option.value)}
                className={cn(
                  "py-3 px-2 rounded-lg transition-all text-center",
                  bowelMovement === option.value
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <div className="text-xl mb-1">{option.emoji}</div>
                <div className="text-xs">{option.label}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Bloating */}
        <Card className="p-5 bg-card/80 border-border/50">
          <h3 className="font-semibold mb-4">Any bloating?</h3>
          <div className="flex gap-2">
            {bloatingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setBloating(option.value)}
                className={cn(
                  "flex-1 py-3 rounded-lg transition-all text-center",
                  bloating === option.value
                    ? `${option.color} text-white`
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>
        </Card>

        {/* Symptoms */}
        <Card className="p-5 bg-card/80 border-border/50">
          <h3 className="font-semibold mb-4">Any symptoms? (Select all that apply)</h3>
          <div className="flex flex-wrap gap-2">
            {symptomOptions.map((symptom) => (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={cn(
                  "px-3 py-2 rounded-full text-sm transition-all",
                  selectedSymptoms.includes(symptom)
                    ? "bg-red-500/20 text-red-400 border border-red-500/50"
                    : "bg-muted/50 hover:bg-muted border border-transparent"
                )}
              >
                {symptom}
              </button>
            ))}
          </div>
        </Card>

        {/* Energy Level */}
        <Card className="p-5 bg-card/80 border-border/50">
          <h3 className="font-semibold mb-4">Energy level today?</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setEnergyLevel(level)}
                className={cn(
                  "flex-1 py-3 rounded-lg transition-all",
                  energyLevel === level
                    ? "bg-yellow-500 text-white"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <div className="text-lg">⚡</div>
                <div className="text-xs">{level}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
            <span>Very low</span>
            <span>Very high</span>
          </div>
        </Card>

        {/* Stress Level */}
        <Card className="p-5 bg-card/80 border-border/50">
          <h3 className="font-semibold mb-4">Stress level today?</h3>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                onClick={() => setStressLevel(level)}
                className={cn(
                  "flex-1 py-3 rounded-lg transition-all",
                  stressLevel === level
                    ? "bg-purple-500 text-white"
                    : "bg-muted/50 hover:bg-muted"
                )}
              >
                <div className="text-lg">🧠</div>
                <div className="text-xs">{level}</div>
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
            <span>Very calm</span>
            <span>Very stressed</span>
          </div>
        </Card>

        {/* Notes */}
        <Card className="p-5 bg-card/80 border-border/50">
          <h3 className="font-semibold mb-3">Any notes?</h3>
          <Textarea
            placeholder="What did you eat today? Any triggers? How's your sleep?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-muted/50 border-border/50 min-h-[100px]"
          />
        </Card>

        {/* Submit Button */}
        <Button 
          onClick={handleSubmit}
          disabled={saving || !overallFeeling}
          className="w-full bg-green-600 hover:bg-green-700 h-12"
        >
          {saving ? "Saving..." : "Save Check-in"}
        </Button>
      </main>
    </div>
  );
};

export default GutCheckin;
