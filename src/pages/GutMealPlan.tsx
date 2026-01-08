import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Calendar, RefreshCw, Download, ChevronDown, ChevronUp, Utensils, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { generateWeeklyMealPlan, gutTypes, Recipe } from "@/lib/gutHealth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const mealTypeEmojis: Record<string, string> = {
  breakfast: "🍳",
  lunch: "🍛",
  dinner: "🥘",
  snack: "🥤",
};

interface MealPlanDay {
  day: string;
  meals: {
    breakfast?: Recipe;
    lunch?: Recipe;
    dinner?: Recipe;
    snack?: Recipe;
  };
}

const GutMealPlan = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [userGutType, setUserGutType] = useState<string | null>(null);
  const [mealPlan, setMealPlan] = useState<MealPlanDay[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Check user's gut type and generate meal plan
  useEffect(() => {
    const initializeMealPlan = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from("daily_reflections")
          .select("mood")
          .eq("user_id", user.id)
          .like("reflection_text", "Gut Type Quiz Result:%")
          .order("created_at", { ascending: false })
          .limit(1);

        if (data && data.length > 0 && data[0].mood) {
          const gutTypeId = data[0].mood;
          setUserGutType(gutTypeId);
          const plan = generateWeeklyMealPlan(gutTypeId, { isVegetarian: true });
          setMealPlan(plan);
          // Expand today's day
          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          setExpandedDay(today);
        }
      } catch (error) {
        console.error("Error initializing meal plan:", error);
      }
    };

    if (user) {
      initializeMealPlan();
    }
  }, [user]);

  const regeneratePlan = () => {
    if (!userGutType) return;
    setGenerating(true);
    setTimeout(() => {
      const plan = generateWeeklyMealPlan(userGutType, { isVegetarian: true });
      setMealPlan(plan);
      setGenerating(false);
      toast({ title: "New meal plan generated! 🎉" });
    }, 500);
  };

  // Generate shopping list
  const getShoppingList = (): { item: string; quantity: string }[] => {
    const ingredientMap = new Map<string, string>();
    
    mealPlan.forEach(day => {
      Object.values(day.meals).forEach(recipe => {
        if (recipe) {
          recipe.ingredients.forEach(ing => {
            if (!ingredientMap.has(ing.item)) {
              ingredientMap.set(ing.item, ing.quantity);
            }
          });
        }
      });
    });

    return Array.from(ingredientMap.entries()).map(([item, quantity]) => ({
      item,
      quantity
    }));
  };

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!userGutType) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="p-6 flex items-center gap-3 border-b border-border/50 backdrop-blur-sm bg-card/50">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gut')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">Meal Plan</h1>
        </header>
        
        <main className="p-6">
          <Card className="p-8 text-center bg-card/50">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-xl font-semibold mb-2">Take the Gut Quiz First</h2>
            <p className="text-muted-foreground mb-6">
              We need to know your gut type to create a personalized meal plan for you.
            </p>
            <Button onClick={() => navigate('/gut/quiz')} className="bg-green-600 hover:bg-green-700">
              Take Gut Quiz
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  const gutType = gutTypes[userGutType];
  const shoppingList = getShoppingList();

  // Shopping List View
  if (showShoppingList) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="p-6 flex items-center gap-3 border-b border-border/50 backdrop-blur-sm bg-card/50">
          <Button variant="ghost" size="icon" onClick={() => setShowShoppingList(false)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Shopping List</h1>
            <p className="text-xs text-muted-foreground">{shoppingList.length} items</p>
          </div>
        </header>
        
        <main className="p-6 space-y-4">
          <Card className="p-4 bg-green-500/10 border-green-500/30">
            <p className="text-sm text-muted-foreground">
              Based on your 7-day meal plan for <span className="text-foreground">{gutType?.name}</span>
            </p>
          </Card>

          <div className="space-y-2">
            {shoppingList.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-card/80 rounded-lg border border-border/50">
                <div className="w-5 h-5 rounded border border-border/50 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.item}</p>
                  <p className="text-xs text-muted-foreground">{item.quantity}</p>
                </div>
              </div>
            ))}
          </div>

          <Button className="w-full" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export List (Coming Soon)
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-6 border-b border-border/50 backdrop-blur-sm bg-card/50">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gut')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">7-Day Meal Plan</h1>
            <p className="text-xs text-muted-foreground">
              Personalized for {gutType?.emoji} {gutType?.name}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="icon"
            onClick={regeneratePlan}
            disabled={generating}
          >
            <RefreshCw className={cn("w-4 h-4", generating && "animate-spin")} />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => setShowShoppingList(true)}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Shopping List
          </Button>
        </div>
      </header>

      {/* Meal Plan */}
      <main className="p-4 space-y-3">
        {mealPlan.map((dayPlan) => {
          const isExpanded = expandedDay === dayPlan.day;
          const isToday = new Date().toLocaleDateString('en-US', { weekday: 'long' }) === dayPlan.day;
          
          return (
            <Card 
              key={dayPlan.day}
              className={cn(
                "overflow-hidden transition-all",
                isToday && "border-accent/50"
              )}
            >
              {/* Day Header */}
              <button
                className="w-full p-4 flex items-center justify-between bg-card/80 hover:bg-card transition-colors"
                onClick={() => setExpandedDay(isExpanded ? null : dayPlan.day)}
              >
                <div className="flex items-center gap-3">
                  <Calendar className={cn("w-5 h-5", isToday ? "text-accent" : "text-muted-foreground")} />
                  <div className="text-left">
                    <p className={cn("font-semibold", isToday && "text-accent")}>
                      {dayPlan.day}
                      {isToday && <span className="ml-2 text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">Today</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Object.values(dayPlan.meals).filter(Boolean).length} meals planned
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              {/* Meals */}
              {isExpanded && (
                <div className="p-4 pt-0 space-y-3">
                  {Object.entries(dayPlan.meals).map(([mealType, recipe]) => {
                    if (!recipe) return null;
                    
                    return (
                      <div 
                        key={mealType}
                        className="flex gap-3 p-3 bg-muted/30 rounded-lg"
                      >
                        <div className="text-2xl">
                          {mealTypeEmojis[mealType]}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground capitalize mb-1">
                            {mealType}
                          </p>
                          <p className="font-medium text-sm">{recipe.name}</p>
                          {recipe.nameHindi && (
                            <p className="text-xs text-muted-foreground">{recipe.nameHindi}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>⏱️ {recipe.prepTime + recipe.cookTime} mins</span>
                            <span>•</span>
                            <span className="capitalize">{recipe.region}</span>
                          </div>
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {recipe.tags.slice(0, 2).map((tag, idx) => (
                              <span key={idx} className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="flex-shrink-0"
                          onClick={() => navigate('/gut/recipes')}
                        >
                          <Utensils className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </main>

      {/* Floating Action */}
      <div className="fixed bottom-24 left-0 right-0 p-4">
        <Card className="p-4 bg-card/95 backdrop-blur-md border-border/50 mx-auto max-w-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">This week's focus</p>
              <p className="text-xs text-muted-foreground">
                {gutType?.actionPoints[0]}
              </p>
            </div>
            <span className="text-2xl">{gutType?.emoji}</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GutMealPlan;
