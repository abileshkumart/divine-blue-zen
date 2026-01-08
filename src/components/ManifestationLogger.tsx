import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Sparkles, X, Plus, Target, Calendar, CheckCircle2, 
  Circle, Flame, Star, TrendingUp, Edit2, Trash2,
  Eye, ChevronRight, Trophy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate: string;
  affirmation: string;
  manifestedDays: number;
  totalDays: number;
  isCompleted: boolean;
  lastManifestedAt: string | null;
  createdAt: string;
}

interface ManifestationLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  moonPhase?: string;
  moonEmoji?: string;
}

const GOAL_CATEGORIES = [
  { id: "health", label: "Health & Fitness", emoji: "💪", color: "from-green-500/20 to-emerald-500/20" },
  { id: "career", label: "Career & Growth", emoji: "🚀", color: "from-blue-500/20 to-indigo-500/20" },
  { id: "relationships", label: "Relationships", emoji: "❤️", color: "from-pink-500/20 to-rose-500/20" },
  { id: "wealth", label: "Wealth & Abundance", emoji: "💰", color: "from-amber-500/20 to-yellow-500/20" },
  { id: "spiritual", label: "Spiritual Growth", emoji: "🧘", color: "from-purple-500/20 to-violet-500/20" },
  { id: "learning", label: "Learning & Skills", emoji: "📚", color: "from-cyan-500/20 to-teal-500/20" },
];

const SAMPLE_AFFIRMATIONS = {
  health: [
    "I am strong, healthy, and full of energy",
    "Every cell in my body radiates health",
    "I nourish my body with love and care",
  ],
  career: [
    "I am attracting my dream opportunities",
    "Success flows naturally to me",
    "I am confident in my abilities and value",
  ],
  relationships: [
    "I attract loving and supportive relationships",
    "I give and receive love freely",
    "My connections are deep and meaningful",
  ],
  wealth: [
    "Abundance flows freely into my life",
    "I am a magnet for prosperity",
    "Money comes to me easily and effortlessly",
  ],
  spiritual: [
    "I am connected to my higher self",
    "Inner peace guides my every step",
    "I trust the universe's plan for me",
  ],
  learning: [
    "I learn and grow every single day",
    "Knowledge comes easily to me",
    "I am becoming an expert in my field",
  ],
};

export const ManifestationLogger = ({
  isOpen,
  onClose,
  userId,
  moonPhase = "new",
  moonEmoji = "🌙",
}: ManifestationLoggerProps) => {
  const { toast } = useToast();
  const [view, setView] = useState<"dashboard" | "create" | "manifest" | "details">("dashboard");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Create goal form
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "",
    targetDate: "",
    affirmation: "",
  });

  useEffect(() => {
    if (isOpen && userId) {
      loadGoals();
    }
  }, [isOpen, userId]);

  const loadGoals = async () => {
    setIsLoading(true);
    try {
      // Load from localStorage
      const stored = localStorage.getItem(`manifestation_goals_${userId}`);
      if (stored) {
        setGoals(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading goals:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveGoals = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem(`manifestation_goals_${userId}`, JSON.stringify(updatedGoals));
  };

  const createGoal = async () => {
    if (!newGoal.title || !newGoal.category || !newGoal.affirmation) {
      toast({
        title: "Fill required fields",
        description: "Title, category, and affirmation are required",
        variant: "destructive",
      });
      return;
    }

    const goal: Goal = {
      id: `goal_${Date.now()}`,
      title: newGoal.title,
      description: newGoal.description,
      category: newGoal.category,
      targetDate: newGoal.targetDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      affirmation: newGoal.affirmation,
      manifestedDays: 0,
      totalDays: 0,
      isCompleted: false,
      lastManifestedAt: null,
      createdAt: new Date().toISOString(),
    };

    // Calculate total days
    const startDate = new Date();
    const endDate = new Date(goal.targetDate);
    goal.totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));

    const updatedGoals = [goal, ...goals];
    saveGoals(updatedGoals);

    toast({
      title: "Goal created! ✨",
      description: "Start manifesting your vision daily",
    });

    setNewGoal({ title: "", description: "", category: "", targetDate: "", affirmation: "" });
    setView("dashboard");
  };

  const manifestGoal = async (goal: Goal) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (goal.lastManifestedAt === today) {
      toast({
        title: "Already manifested today",
        description: "Come back tomorrow to continue your practice",
      });
      return;
    }

    const updatedGoal = {
      ...goal,
      manifestedDays: goal.manifestedDays + 1,
      lastManifestedAt: today,
    };

    const updatedGoals = goals.map(g => g.id === goal.id ? updatedGoal : g);
    saveGoals(updatedGoals);
    setSelectedGoal(updatedGoal);

    // Save to daily reflections
    try {
      await supabase.from('daily_reflections').insert({
        user_id: userId,
        reflection_text: `Manifested: ${goal.affirmation}`,
        mood: "intentional",
        reflection_date: today,
      });
    } catch (error) {
      console.error("Error saving reflection:", error);
    }

    toast({
      title: "Manifested! 🌟",
      description: `Day ${updatedGoal.manifestedDays} of your journey`,
    });

    setView("dashboard");
  };

  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter(g => g.id !== goalId);
    saveGoals(updatedGoals);
    setSelectedGoal(null);
    setView("dashboard");
    toast({
      title: "Goal removed",
      description: "Focus on what matters most",
    });
  };

  const getCategoryInfo = (categoryId: string) => {
    return GOAL_CATEGORIES.find(c => c.id === categoryId) || GOAL_CATEGORIES[0];
  };

  const getProgressPercentage = (goal: Goal) => {
    if (goal.totalDays === 0) return 0;
    return Math.min(100, Math.round((goal.manifestedDays / goal.totalDays) * 100));
  };

  const canManifestToday = (goal: Goal) => {
    const today = new Date().toISOString().split('T')[0];
    return goal.lastManifestedAt !== today;
  };

  const getStreak = (goal: Goal) => {
    if (!goal.lastManifestedAt) return 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    if (goal.lastManifestedAt === today || goal.lastManifestedAt === yesterday) {
      return goal.manifestedDays;
    }
    return 0;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl h-[90vh] max-h-[700px] bg-background rounded-t-3xl lg:rounded-3xl overflow-hidden flex flex-col mx-4"
        >
          {/* Header */}
          <header className="p-4 flex items-center justify-between border-b border-border/50 bg-card/50">
            <Button variant="ghost" size="icon" onClick={() => view === "dashboard" ? onClose() : setView("dashboard")}>
              <X className="w-5 h-5" />
            </Button>
            <div className="text-center">
              <h1 className="text-lg font-semibold flex items-center gap-2 justify-center">
                <Sparkles className="w-5 h-5 text-accent" />
                {view === "dashboard" && "Vision Board"}
                {view === "create" && "New Goal"}
                {view === "manifest" && "Manifest"}
                {view === "details" && "Goal Details"}
              </h1>
              <p className="text-xs text-muted-foreground">
                {view === "dashboard" && "Your path to your better self"}
                {view === "create" && "Set your intention"}
                {view === "manifest" && "Daily practice"}
                {view === "details" && "Track your progress"}
              </p>
            </div>
            <div className="w-10" />
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Dashboard View */}
            {view === "dashboard" && (
              <>
                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <Card className="p-3 bg-gradient-to-br from-accent/20 to-transparent border-accent/30 text-center">
                    <Target className="w-5 h-5 text-accent mx-auto mb-1" />
                    <div className="text-xl font-bold">{goals.length}</div>
                    <div className="text-xs text-muted-foreground">Goals</div>
                  </Card>
                  <Card className="p-3 bg-gradient-to-br from-orange-500/20 to-transparent border-orange-500/30 text-center">
                    <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <div className="text-xl font-bold">
                      {goals.reduce((sum, g) => sum + getStreak(g), 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </Card>
                  <Card className="p-3 bg-gradient-to-br from-green-500/20 to-transparent border-green-500/30 text-center">
                    <Trophy className="w-5 h-5 text-green-500 mx-auto mb-1" />
                    <div className="text-xl font-bold">
                      {goals.filter(g => g.isCompleted).length}
                    </div>
                    <div className="text-xs text-muted-foreground">Achieved</div>
                  </Card>
                </div>

                {/* Moon Context */}
                <Card className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{moonEmoji}</div>
                    <div>
                      <p className="text-sm font-medium">Today's Energy</p>
                      <p className="text-xs text-muted-foreground">
                        {moonPhase.includes("new") && "Perfect for setting new intentions"}
                        {moonPhase.includes("waxing") && "Energy is building - manifest with power"}
                        {moonPhase.includes("full") && "Maximum energy - celebrate & release"}
                        {moonPhase.includes("waning") && "Time to integrate & reflect"}
                        {!moonPhase.includes("new") && !moonPhase.includes("waxing") && 
                         !moonPhase.includes("full") && !moonPhase.includes("waning") && 
                         "Focus on your daily practice"}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Goals to Manifest Today */}
                {goals.filter(g => canManifestToday(g) && !g.isCompleted).length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500" />
                      Manifest Today
                    </h3>
                    {goals.filter(g => canManifestToday(g) && !g.isCompleted).map(goal => {
                      const category = getCategoryInfo(goal.category);
                      return (
                        <Card 
                          key={goal.id}
                          className={`p-4 bg-gradient-to-br ${category.color} border-border/50 cursor-pointer hover:scale-[1.02] transition-all`}
                          onClick={() => {
                            setSelectedGoal(goal);
                            setView("manifest");
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{category.emoji}</div>
                              <div>
                                <h4 className="font-medium">{goal.title}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">{goal.affirmation}</p>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>{goal.manifestedDays} days manifested</span>
                              <span>{getProgressPercentage(goal)}%</span>
                            </div>
                            <Progress value={getProgressPercentage(goal)} className="h-1.5" />
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {/* All Goals */}
                {goals.length > 0 ? (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground">All Goals</h3>
                    {goals.map(goal => {
                      const category = getCategoryInfo(goal.category);
                      const manifested = !canManifestToday(goal);
                      return (
                        <Card 
                          key={goal.id}
                          className={`p-3 bg-card/60 border-border/50 cursor-pointer hover:bg-card/80 transition-all ${manifested ? 'opacity-60' : ''}`}
                          onClick={() => {
                            setSelectedGoal(goal);
                            setView("details");
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-xl">{category.emoji}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-sm truncate">{goal.title}</h4>
                                {manifested && <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{goal.manifestedDays}/{goal.totalDays} days</span>
                                <span>•</span>
                                <span>{getProgressPercentage(goal)}%</span>
                              </div>
                            </div>
                            <Progress value={getProgressPercentage(goal)} className="w-16 h-1.5" />
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card className="p-8 text-center bg-card/50 border-dashed border-2 border-border/50">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No Goals Yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Create your first goal and start manifesting your better self
                    </p>
                    <Button onClick={() => setView("create")} className="bg-accent hover:bg-accent/90">
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Goal
                    </Button>
                  </Card>
                )}
              </>
            )}

            {/* Create Goal View */}
            {view === "create" && (
              <div className="space-y-4">
                {/* Category Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GOAL_CATEGORIES.map(category => (
                      <Card
                        key={category.id}
                        className={`p-3 cursor-pointer transition-all ${
                          newGoal.category === category.id 
                            ? `bg-gradient-to-br ${category.color} border-accent` 
                            : 'bg-card/60 border-border/50 hover:bg-card/80'
                        }`}
                        onClick={() => setNewGoal({ ...newGoal, category: category.id })}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{category.emoji}</span>
                          <span className="text-xs font-medium">{category.label}</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Goal Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Goal Title *</label>
                  <Input
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="e.g., Run a marathon, Learn Spanish..."
                    className="bg-card/50"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="Describe your vision in detail..."
                    className="bg-card/50 min-h-[80px]"
                  />
                </div>

                {/* Target Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Date</label>
                  <Input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="bg-card/50"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                {/* Affirmation */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Daily Affirmation *</label>
                  <Textarea
                    value={newGoal.affirmation}
                    onChange={(e) => setNewGoal({ ...newGoal, affirmation: e.target.value })}
                    placeholder="I am becoming..."
                    className="bg-card/50 min-h-[80px]"
                  />
                  {newGoal.category && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Suggestions:</p>
                      <div className="flex flex-wrap gap-1">
                        {(SAMPLE_AFFIRMATIONS[newGoal.category as keyof typeof SAMPLE_AFFIRMATIONS] || []).map((aff, idx) => (
                          <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            className="text-xs h-auto py-1 px-2"
                            onClick={() => setNewGoal({ ...newGoal, affirmation: aff })}
                          >
                            {aff.slice(0, 30)}...
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Manifest View */}
            {view === "manifest" && selectedGoal && (
              <div className="space-y-6 text-center">
                {/* Goal Visual */}
                <div className="relative">
                  <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-accent/30 to-purple-500/30 flex items-center justify-center">
                    <span className="text-5xl">{getCategoryInfo(selectedGoal.category).emoji}</span>
                  </div>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
                    Day {selectedGoal.manifestedDays + 1}
                  </div>
                </div>

                {/* Goal Title */}
                <div>
                  <h2 className="text-xl font-bold">{selectedGoal.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {getProgressPercentage(selectedGoal)}% of your journey
                  </p>
                </div>

                {/* Affirmation Card */}
                <Card className="p-6 bg-gradient-to-br from-accent/10 to-purple-500/10 border-accent/30">
                  <Eye className="w-6 h-6 text-accent mx-auto mb-3" />
                  <p className="text-lg font-medium italic leading-relaxed">
                    "{selectedGoal.affirmation}"
                  </p>
                </Card>

                {/* Instructions */}
                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Take a deep breath. Close your eyes.</p>
                  <p>See yourself having achieved this goal.</p>
                  <p>Feel the emotions of your success.</p>
                  <p className="font-medium text-foreground">Now, manifest it into existence.</p>
                </div>

                {/* Manifest Button */}
                <Button
                  onClick={() => manifestGoal(selectedGoal)}
                  className="w-full h-14 text-lg bg-gradient-to-r from-accent to-purple-500 hover:from-accent/90 hover:to-purple-500/90"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  I Have Manifested This
                </Button>
              </div>
            )}

            {/* Goal Details View */}
            {view === "details" && selectedGoal && (
              <div className="space-y-4">
                {/* Goal Header */}
                <Card className={`p-4 bg-gradient-to-br ${getCategoryInfo(selectedGoal.category).color} border-border/50`}>
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{getCategoryInfo(selectedGoal.category).emoji}</div>
                    <div>
                      <h2 className="font-bold text-lg">{selectedGoal.title}</h2>
                      <p className="text-sm text-muted-foreground">{getCategoryInfo(selectedGoal.category).label}</p>
                    </div>
                  </div>
                </Card>

                {/* Progress */}
                <Card className="p-4 bg-card/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-accent font-bold">{getProgressPercentage(selectedGoal)}%</span>
                  </div>
                  <Progress value={getProgressPercentage(selectedGoal)} className="h-3 mb-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{selectedGoal.manifestedDays} days manifested</span>
                    <span>{selectedGoal.totalDays} days total</span>
                  </div>
                </Card>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3 bg-card/60 text-center">
                    <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                    <div className="text-lg font-bold">{getStreak(selectedGoal)}</div>
                    <div className="text-xs text-muted-foreground">Current Streak</div>
                  </Card>
                  <Card className="p-3 bg-card/60 text-center">
                    <Calendar className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                    <div className="text-lg font-bold">
                      {Math.max(0, Math.ceil((new Date(selectedGoal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
                    </div>
                    <div className="text-xs text-muted-foreground">Days Left</div>
                  </Card>
                </div>

                {/* Affirmation */}
                <Card className="p-4 bg-accent/10 border-accent/30">
                  <p className="text-sm font-medium mb-2">Your Daily Affirmation</p>
                  <p className="italic text-muted-foreground">"{selectedGoal.affirmation}"</p>
                </Card>

                {/* Description */}
                {selectedGoal.description && (
                  <Card className="p-4 bg-card/60">
                    <p className="text-sm font-medium mb-2">Description</p>
                    <p className="text-sm text-muted-foreground">{selectedGoal.description}</p>
                  </Card>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  {canManifestToday(selectedGoal) && (
                    <Button
                      onClick={() => setView("manifest")}
                      className="flex-1 bg-accent hover:bg-accent/90"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Manifest Now
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => deleteGoal(selectedGoal.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </main>

          {/* Footer - Create Button */}
          {view === "dashboard" && goals.length > 0 && (
            <footer className="p-4 border-t border-border/50">
              <Button
                onClick={() => setView("create")}
                className="w-full bg-accent hover:bg-accent/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Goal
              </Button>
            </footer>
          )}

          {view === "create" && (
            <footer className="p-4 border-t border-border/50">
              <Button
                onClick={createGoal}
                disabled={!newGoal.title || !newGoal.category || !newGoal.affirmation}
                className="w-full bg-accent hover:bg-accent/90"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
            </footer>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ManifestationLogger;
