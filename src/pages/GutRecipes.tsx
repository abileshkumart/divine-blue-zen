import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Flame, Leaf, Search, Filter, ChevronDown, Heart, Share2, Star, ChefHat } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { recipes, Recipe, gutTypes } from "@/lib/gutHealth";
import { 
  getGutProfile, 
  getSavedRecipes, 
  toggleRecipeFavorite, 
  rateRecipe, 
  markRecipeCooked,
  GutSavedRecipe 
} from "@/lib/gutDatabase";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const mealTypeEmojis: Record<string, string> = {
  breakfast: "🍳",
  lunch: "🍛",
  dinner: "🥘",
  snack: "🥤",
};

const GutRecipes = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [userGutType, setUserGutType] = useState<string | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [likedRecipes, setLikedRecipes] = useState<Set<string>>(new Set());
  const [savedRecipesData, setSavedRecipesData] = useState<Map<string, GutSavedRecipe>>(new Map());

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Load user's gut profile and saved recipes
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        // Get gut profile from database
        const profile = await getGutProfile(user.id);
        if (profile) {
          setUserGutType(profile.gut_type);
        } else {
          // Fallback to localStorage
          const localGutType = localStorage.getItem('userGutType');
          if (localGutType) setUserGutType(localGutType);
        }

        // Get saved recipes
        const saved = await getSavedRecipes(user.id);
        const savedMap = new Map<string, GutSavedRecipe>();
        const likedSet = new Set<string>();
        saved.forEach(sr => {
          savedMap.set(sr.recipe_id, sr);
          if (sr.is_favorite) likedSet.add(sr.recipe_id);
        });
        setSavedRecipesData(savedMap);
        setLikedRecipes(likedSet);
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    if (user) {
      loadUserData();
    }
  }, [user]);

  // Filter recipes
  const filteredRecipes = recipes.filter(recipe => {
    const matchesMealType = !selectedMealType || recipe.mealType === selectedMealType;
    const matchesSearch = !searchQuery || 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGutType = !userGutType || recipe.suitableFor.includes(userGutType);
    
    return matchesMealType && matchesSearch && matchesGutType;
  });

  // Sort by suitability for user's gut type
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (!userGutType) return 0;
    const aMatch = a.suitableFor.includes(userGutType) ? 1 : 0;
    const bMatch = b.suitableFor.includes(userGutType) ? 1 : 0;
    return bMatch - aMatch;
  });

  const toggleLike = async (recipeId: string) => {
    if (!user) return;
    
    const isSaved = await toggleRecipeFavorite(user.id, recipeId);
    setLikedRecipes(prev => {
      const newSet = new Set(prev);
      if (isSaved) {
        newSet.add(recipeId);
        toast({ title: "Recipe saved! ❤️" });
      } else {
        newSet.delete(recipeId);
        toast({ title: "Recipe removed from favorites" });
      }
      return newSet;
    });
  };

  const handleRateRecipe = async (recipeId: string, rating: number) => {
    if (!user) return;
    const success = await rateRecipe(user.id, recipeId, rating);
    if (success) {
      toast({ title: `Rated ${rating} stars! ⭐` });
    }
  };

  const handleMarkCooked = async (recipeId: string) => {
    if (!user) return;
    const success = await markRecipeCooked(user.id, recipeId);
    if (success) {
      toast({ title: "Marked as cooked! 👨‍🍳" });
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  // Recipe Detail View
  if (selectedRecipe) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="p-6 flex items-center gap-3 border-b border-border/50 backdrop-blur-sm bg-card/50">
          <Button variant="ghost" size="icon" onClick={() => setSelectedRecipe(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">{selectedRecipe.name}</h1>
            {selectedRecipe.nameHindi && (
              <p className="text-xs text-muted-foreground">{selectedRecipe.nameHindi}</p>
            )}
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => toggleLike(selectedRecipe.id)}
          >
            <Heart className={cn("w-5 h-5", likedRecipes.has(selectedRecipe.id) && "fill-red-500 text-red-500")} />
          </Button>
        </header>

        <main className="p-6 space-y-6">
          {/* Recipe Meta */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{selectedRecipe.prepTime + selectedRecipe.cookTime} mins</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span className="text-lg">{mealTypeEmojis[selectedRecipe.mealType]}</span>
              <span className="capitalize">{selectedRecipe.mealType}</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <span>🍽️</span>
              <span>{selectedRecipe.servings} servings</span>
            </div>
            {selectedRecipe.isVegetarian && (
              <div className="flex items-center gap-1 text-sm text-green-400">
                <Leaf className="w-4 h-4" />
                <span>Veg</span>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {selectedRecipe.tags.map((tag, idx) => (
              <span key={idx} className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <Card className="p-4 bg-card/80 border-border/50">
            <p className="text-sm text-muted-foreground">{selectedRecipe.description}</p>
          </Card>

          {/* Suitable for gut types */}
          <Card className="p-4 bg-green-500/10 border-green-500/30">
            <h3 className="font-semibold text-sm mb-2">Best for:</h3>
            <div className="flex flex-wrap gap-2">
              {selectedRecipe.suitableFor.map((typeId) => {
                const gutType = gutTypes[typeId];
                return gutType ? (
                  <span key={typeId} className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                    {gutType.emoji} {gutType.name}
                  </span>
                ) : null;
              })}
            </div>
          </Card>

          {/* Ingredients */}
          <Card className="p-5 bg-card/80 border-border/50">
            <h3 className="font-semibold mb-4">Ingredients</h3>
            <ul className="space-y-2">
              {selectedRecipe.ingredients.map((ing, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-accent">•</span>
                  <span>
                    <span className="font-medium">{ing.quantity}</span> {ing.item}
                    {ing.substitute && (
                      <span className="text-muted-foreground text-xs ml-2">
                        (Substitute: {ing.substitute})
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Instructions */}
          <Card className="p-5 bg-card/80 border-border/50">
            <h3 className="font-semibold mb-4">How to Make</h3>
            <ol className="space-y-3">
              {selectedRecipe.instructions.map((step, idx) => (
                <li key={idx} className="flex gap-3 text-sm">
                  <span className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center flex-shrink-0 text-xs font-semibold">
                    {idx + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </Card>

          {/* Nutrition (if available) */}
          {selectedRecipe.nutritionPer100g && (
            <Card className="p-5 bg-card/80 border-border/50">
              <h3 className="font-semibold mb-4">Nutrition (per 100g)</h3>
              <div className="grid grid-cols-4 gap-3 text-center">
                <div>
                  <div className="text-lg font-semibold">{selectedRecipe.nutritionPer100g.calories}</div>
                  <div className="text-xs text-muted-foreground">kcal</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{selectedRecipe.nutritionPer100g.protein}g</div>
                  <div className="text-xs text-muted-foreground">Protein</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{selectedRecipe.nutritionPer100g.fiber}g</div>
                  <div className="text-xs text-muted-foreground">Fiber</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">{selectedRecipe.nutritionPer100g.carbs}g</div>
                  <div className="text-xs text-muted-foreground">Carbs</div>
                </div>
              </div>
            </Card>
          )}

          {/* Cost indicator */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated cost:</span>
            <span className={cn(
              "font-medium",
              selectedRecipe.cost === "low" ? "text-green-400" :
              selectedRecipe.cost === "medium" ? "text-yellow-400" : "text-red-400"
            )}>
              {selectedRecipe.cost === "low" ? "₹ Budget-friendly" :
               selectedRecipe.cost === "medium" ? "₹₹ Moderate" : "₹₹₹ Premium"}
            </span>
          </div>

          {/* Rating & Actions */}
          <Card className="p-4 bg-card/80 border-border/50">
            <h3 className="font-semibold text-sm mb-3">Rate this recipe</h3>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRateRecipe(selectedRecipe.id, star)}
                  className="p-1"
                >
                  <Star className={cn(
                    "w-6 h-6",
                    (savedRecipesData.get(selectedRecipe.id)?.rating || 0) >= star 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-muted-foreground"
                  )} />
                </Button>
              ))}
            </div>
            <Button 
              onClick={() => handleMarkCooked(selectedRecipe.id)}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <ChefHat className="w-4 h-4 mr-2" />
              I Made This!
            </Button>
          </Card>
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
          <div>
            <h1 className="text-xl font-bold">Recipe Bank</h1>
            <p className="text-xs text-muted-foreground">
              {userGutType ? `Recipes for your ${gutTypes[userGutType]?.name || 'gut type'}` : 'All gut-friendly recipes'}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search recipes, ingredients, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border/50 rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>
      </header>

      {/* Meal Type Filter */}
      <div className="p-4 border-b border-border/30">
        <div className="flex gap-2 overflow-x-auto">
          <Button
            variant={selectedMealType === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedMealType(null)}
            className="flex-shrink-0"
          >
            All
          </Button>
          {Object.entries(mealTypeEmojis).map(([type, emoji]) => (
            <Button
              key={type}
              variant={selectedMealType === type ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedMealType(type)}
              className="flex-shrink-0 gap-1"
            >
              <span>{emoji}</span>
              <span className="capitalize">{type}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Recipe List */}
      <main className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground">
          {sortedRecipes.length} recipe{sortedRecipes.length !== 1 ? 's' : ''} found
        </p>

        {sortedRecipes.map((recipe) => (
          <Card 
            key={recipe.id}
            className="p-4 bg-card/80 border-border/50 cursor-pointer hover:border-green-500/50 transition-all"
            onClick={() => setSelectedRecipe(recipe)}
          >
            <div className="flex gap-4">
              <div className="text-3xl">
                {mealTypeEmojis[recipe.mealType]}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{recipe.name}</h3>
                    {recipe.nameHindi && (
                      <p className="text-xs text-muted-foreground">{recipe.nameHindi}</p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(recipe.id);
                    }}
                  >
                    <Heart className={cn("w-4 h-4", likedRecipes.has(recipe.id) && "fill-red-500 text-red-500")} />
                  </Button>
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {recipe.description}
                </p>
                
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {recipe.prepTime + recipe.cookTime} mins
                  </span>
                  <span className="capitalize">{recipe.region}</span>
                  {recipe.isVegetarian && (
                    <span className="text-green-400 flex items-center gap-1">
                      <Leaf className="w-3 h-3" /> Veg
                    </span>
                  )}
                </div>
                
                <div className="flex gap-1 mt-2 flex-wrap">
                  {recipe.tags.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}

        {sortedRecipes.length === 0 && (
          <Card className="p-8 text-center bg-card/50">
            <div className="text-4xl mb-3">🍽️</div>
            <p className="text-muted-foreground">No recipes match your filters</p>
            <Button 
              variant="ghost" 
              className="mt-3"
              onClick={() => {
                setSearchQuery("");
                setSelectedMealType(null);
              }}
            >
              Clear filters
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
};

export default GutRecipes;
