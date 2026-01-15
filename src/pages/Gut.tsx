import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Apple, ClipboardList, TrendingUp, ChevronRight, 
  Sparkles, BookOpen, Calendar, Utensils, Heart, Flame
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { getGutProfile, getTodayCheckin, getCheckinStreak } from "@/lib/gutDatabase";
import { gutTypes, getDailyTip, getRecipesForGutType, GutType, GutTip, Recipe } from "@/lib/gutHealth";
import { cn } from "@/lib/utils";
import BottomNav from "@/components/BottomNav";

const Gut = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [userGutType, setUserGutType] = useState<GutType | null>(null);
  const [dailyTip, setDailyTip] = useState<GutTip | null>(null);
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [checkingQuiz, setCheckingQuiz] = useState(true);
  const [checkinStreak, setCheckinStreak] = useState(0);
  const [todayCheckinDone, setTodayCheckinDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Check if user has completed gut quiz and load data
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        // First check localStorage (faster)
        const localGutType = localStorage.getItem('userGutType');
        
        // Then check database for gut profile
        const profile = await getGutProfile(user.id);
        
        if (profile) {
          const gutTypeId = profile.gut_type;
          const gutType = gutTypes[gutTypeId];
          if (gutType) {
            localStorage.setItem('userGutType', gutTypeId);
            setUserGutType(gutType);
            setDailyTip(getDailyTip(gutTypeId));
            setRecommendedRecipes(getRecipesForGutType(gutTypeId).slice(0, 4));
          }
        } else if (localGutType && gutTypes[localGutType]) {
          // Fallback to localStorage
          console.log("Found gut type in localStorage:", localGutType);
          setUserGutType(gutTypes[localGutType]);
          setDailyTip(getDailyTip(localGutType));
          setRecommendedRecipes(getRecipesForGutType(localGutType).slice(0, 4));
        } else {
          setDailyTip(getDailyTip());
        }

        // Check today's checkin and streak
        const todayCheckin = await getTodayCheckin(user.id);
        setTodayCheckinDone(!!todayCheckin);
        
        const streak = await getCheckinStreak(user.id);
        setCheckinStreak(streak);
        
      } catch (error) {
        console.error("Error loading user data:", error);
        setDailyTip(getDailyTip());
      }
      setCheckingQuiz(false);
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  if (loading || checkingQuiz) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-6 pt-[max(1.5rem,env(safe-area-inset-top))] border-b border-border/50 backdrop-blur-sm bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gut Health</h1>
            <p className="text-sm text-muted-foreground">Heal your second brain</p>
          </div>
          <div className="text-3xl">🦠</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {!userGutType ? (
          /* Quiz Prompt - No quiz completed yet */
          <Card className="p-8 bg-gradient-to-br from-green-900/20 to-transparent border-green-500/30 text-center">
            <div className="text-5xl mb-4">🔬</div>
            <h2 className="text-xl font-semibold mb-2">Discover Your Gut Type</h2>
            <p className="text-muted-foreground mb-6">
              Take a quick 10-question quiz to understand your gut health and get personalized food recommendations.
            </p>
            <Button 
              onClick={() => navigate('/gut/quiz')}
              className="bg-green-600 hover:bg-green-700"
            >
              Start Gut Quiz
            </Button>
            <p className="text-xs text-muted-foreground mt-3">Takes only 2 minutes</p>
          </Card>
        ) : (
          /* Gut Dashboard - Quiz completed */
          <>
            {/* User's Gut Type Card */}
            <Card className={cn(
              "p-5 bg-gradient-to-br border-green-500/30",
              userGutType.color
            )}>
              <div className="flex items-start gap-4">
                <div className="text-4xl">{userGutType.emoji}</div>
                <div className="flex-1">
                  <h2 className="font-semibold text-lg">{userGutType.name}</h2>
                  <p className="text-xs text-muted-foreground mb-1">{userGutType.nameHindi}</p>
                  <p className="text-sm text-muted-foreground">{userGutType.descriptionShort}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate('/gut/quiz')}
                  className="text-xs"
                >
                  Retake
                </Button>
              </div>
            </Card>

            {/* Streak & Status Bar */}
            <div className="flex gap-3">
              <Card className={cn(
                "flex-1 p-3 border-border/50",
                todayCheckinDone ? "bg-green-500/10 border-green-500/30" : "bg-muted/30"
              )}>
                <div className="flex items-center gap-2">
                  <ClipboardList className={cn(
                    "w-5 h-5",
                    todayCheckinDone ? "text-green-400" : "text-muted-foreground"
                  )} />
                  <div className="text-sm">
                    {todayCheckinDone ? "✓ Checked in today" : "Check in today"}
                  </div>
                </div>
              </Card>
              {checkinStreak > 0 && (
                <Card className="p-3 bg-orange-500/10 border-orange-500/30 flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <div>
                    <span className="font-bold text-orange-400">{checkinStreak}</span>
                    <span className="text-xs text-muted-foreground ml-1">day streak</span>
                  </div>
                </Card>
              )}
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card 
                className={cn(
                  "p-4 bg-gradient-to-br from-blue-500/20 to-transparent border-blue-500/40 cursor-pointer hover:scale-[1.02] transition-all",
                  todayCheckinDone && "opacity-75"
                )}
                onClick={() => navigate('/gut/checkin')}
              >
                <ClipboardList className="w-7 h-7 text-blue-400 mb-2" />
                <h3 className="font-semibold text-sm">Daily Check-in</h3>
                <p className="text-xs text-muted-foreground">
                  {todayCheckinDone ? "Done! Update anytime" : "Log how you feel"}
                </p>
              </Card>

              <Card 
                className="p-4 bg-gradient-to-br from-orange-500/20 to-transparent border-orange-500/40 cursor-pointer hover:scale-[1.02] transition-all"
                onClick={() => navigate('/gut/recipes')}
              >
                <Utensils className="w-7 h-7 text-orange-400 mb-2" />
                <h3 className="font-semibold text-sm">Recipe Bank</h3>
                <p className="text-xs text-muted-foreground">{recommendedRecipes.length}+ recipes for you</p>
              </Card>

              <Card 
                className="p-4 bg-gradient-to-br from-purple-500/20 to-transparent border-purple-500/40 cursor-pointer hover:scale-[1.02] transition-all"
                onClick={() => navigate('/gut/mealplan')}
              >
                <Calendar className="w-7 h-7 text-purple-400 mb-2" />
                <h3 className="font-semibold text-sm">Meal Plan</h3>
                <p className="text-xs text-muted-foreground">7-day personalized</p>
              </Card>

              <Card 
                className="p-4 bg-gradient-to-br from-green-500/20 to-transparent border-green-500/40 cursor-pointer hover:scale-[1.02] transition-all"
                onClick={() => navigate('/gut/learn')}
              >
                <BookOpen className="w-7 h-7 text-green-400 mb-2" />
                <h3 className="font-semibold text-sm">Learn</h3>
                <p className="text-xs text-muted-foreground">Daily gut tips</p>
              </Card>
            </div>

            {/* Recommended Recipes */}
            {recommendedRecipes.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Recipes For You</h3>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/gut/recipes')}>
                    See All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {recommendedRecipes.map((recipe) => (
                    <Card 
                      key={recipe.id}
                      className="p-4 bg-card/80 border-border/50 min-w-[160px] cursor-pointer hover:border-green-500/50 transition-all"
                    >
                      <div className="text-2xl mb-2">
                        {recipe.mealType === "breakfast" ? "🍳" : 
                         recipe.mealType === "lunch" ? "🍛" : 
                         recipe.mealType === "dinner" ? "🥘" : "🥤"}
                      </div>
                      <h4 className="font-medium text-sm line-clamp-1">{recipe.name}</h4>
                      <p className="text-xs text-muted-foreground capitalize">{recipe.mealType}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {recipe.tags.slice(0, 1).map((tag, idx) => (
                          <span key={idx} className="text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Daily Gut Tip */}
        {dailyTip && (
          <Card className="p-5 bg-gradient-to-br from-accent/10 to-transparent border-accent/30">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{dailyTip.emoji}</div>
              <div className="flex-1">
                <p className="text-xs text-accent uppercase tracking-wide mb-1">
                  {dailyTip.category === "tip" ? "Gut Tip of the Day" :
                   dailyTip.category === "fact" ? "Did You Know?" :
                   dailyTip.category === "recipe-quick" ? "Quick Recipe" :
                   dailyTip.category === "myth-buster" ? "Myth Buster" : "Gut Exercise"}
                </p>
                <h3 className="font-semibold text-sm mb-1">{dailyTip.title}</h3>
                <p className="text-sm text-muted-foreground">{dailyTip.content}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Gut-Brain Connection Card */}
        <Card className="p-5 bg-card/60 border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="font-semibold">Gut-Brain Insights</h3>
          </div>
          {userGutType ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Based on your <span className="text-foreground">{userGutType.name}</span> profile, 
                here's what to focus on:
              </p>
              <ul className="space-y-2">
                {userGutType.lifestyle.slice(0, 2).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Complete the gut quiz to see personalized insights about your gut-brain connection.
            </p>
          )}
        </Card>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Gut;
