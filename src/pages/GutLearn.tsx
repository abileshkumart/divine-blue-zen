import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Lightbulb, Utensils, AlertCircle, Activity, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { dailyGutTips, GutTip, gutTypes } from "@/lib/gutHealth";
import { getGutProfile } from "@/lib/gutDatabase";
import { cn } from "@/lib/utils";

const categoryIcons: Record<string, typeof Lightbulb> = {
  tip: Lightbulb,
  fact: BookOpen,
  "recipe-quick": Utensils,
  "myth-buster": AlertCircle,
  exercise: Activity,
};

const categoryColors: Record<string, string> = {
  tip: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  fact: "from-purple-500/20 to-indigo-500/20 border-purple-500/30",
  "recipe-quick": "from-orange-500/20 to-amber-500/20 border-orange-500/30",
  "myth-buster": "from-red-500/20 to-pink-500/20 border-red-500/30",
  exercise: "from-green-500/20 to-emerald-500/20 border-green-500/30",
};

const categoryLabels: Record<string, string> = {
  tip: "Gut Tip",
  fact: "Did You Know?",
  "recipe-quick": "Quick Recipe",
  "myth-buster": "Myth Buster",
  exercise: "Gut Exercise",
};

const GutLearn = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [userGutType, setUserGutType] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTip, setExpandedTip] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Check user's gut type
  useEffect(() => {
    const loadGutType = async () => {
      if (!user) return;
      
      try {
        const profile = await getGutProfile(user.id);
        if (profile) {
          setUserGutType(profile.gut_type);
        } else {
          // Fallback to localStorage
          const localGutType = localStorage.getItem('userGutType');
          if (localGutType) setUserGutType(localGutType);
        }
      } catch (error) {
        console.error("Error checking gut type:", error);
      }
    };

    if (user) {
      loadGutType();
    }
  }, [user]);

  // Filter tips based on gut type and category
  const filteredTips = dailyGutTips.filter(tip => {
    const matchesCategory = !selectedCategory || tip.category === selectedCategory;
    const matchesGutType = !tip.forGutTypes || !userGutType || tip.forGutTypes.includes(userGutType);
    return matchesCategory && matchesGutType;
  });

  // Get today's featured tip
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const featuredTip = filteredTips[dayOfYear % filteredTips.length];

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-6 border-b border-border/50 backdrop-blur-sm bg-card/50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gut')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Learn</h1>
            <p className="text-xs text-muted-foreground">Daily gut health insights</p>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Featured Tip of the Day */}
        {featuredTip && (
          <Card className={cn(
            "p-6 bg-gradient-to-br",
            categoryColors[featuredTip.category]
          )}>
            <div className="flex items-start gap-3">
              <div className="text-3xl">{featuredTip.emoji}</div>
              <div className="flex-1">
                <p className="text-xs text-accent uppercase tracking-wide mb-1 font-medium">
                  ⭐ Today's Featured
                </p>
                <h2 className="font-semibold text-lg mb-2">{featuredTip.title}</h2>
                <p className="text-sm text-muted-foreground">{featuredTip.content}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(null)}
            className="flex-shrink-0"
          >
            All
          </Button>
          {Object.entries(categoryLabels).map(([key, label]) => {
            const Icon = categoryIcons[key];
            return (
              <Button
                key={key}
                variant={selectedCategory === key ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className="flex-shrink-0 gap-1"
              >
                <Icon className="w-4 h-4" />
                {label}
              </Button>
            );
          })}
        </div>

        {/* Tips for your gut type */}
        {userGutType && gutTypes[userGutType] && (
          <Card className="p-4 bg-green-500/10 border-green-500/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{gutTypes[userGutType].emoji}</span>
              <span className="text-sm font-medium">Tips for your {gutTypes[userGutType].name}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Content is personalized based on your gut type quiz results.
            </p>
          </Card>
        )}

        {/* Tips List */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            All Content ({filteredTips.length})
          </h3>
          
          {filteredTips.map((tip) => {
            const Icon = categoryIcons[tip.category] || Lightbulb;
            const isExpanded = expandedTip === tip.id;
            
            return (
              <Card 
                key={tip.id}
                className={cn(
                  "p-4 bg-gradient-to-br cursor-pointer transition-all",
                  categoryColors[tip.category]
                )}
                onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{tip.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {categoryLabels[tip.category]}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm">{tip.title}</h3>
                    <p className={cn(
                      "text-sm text-muted-foreground mt-1 transition-all",
                      isExpanded ? "" : "line-clamp-2"
                    )}>
                      {tip.content}
                    </p>
                    
                    {/* Show gut type tags if specific */}
                    {tip.forGutTypes && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {tip.forGutTypes.map(typeId => {
                          const gutType = gutTypes[typeId];
                          return gutType ? (
                            <span key={typeId} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">
                              {gutType.emoji} {gutType.name}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform",
                    isExpanded && "rotate-90"
                  )} />
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Knowledge Cards */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Quick Facts
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-card/80 border-border/50 text-center">
              <div className="text-3xl mb-2">🦠</div>
              <div className="text-2xl font-bold">100T</div>
              <p className="text-xs text-muted-foreground">Bacteria in your gut</p>
            </Card>
            <Card className="p-4 bg-card/80 border-border/50 text-center">
              <div className="text-3xl mb-2">😊</div>
              <div className="text-2xl font-bold">90%</div>
              <p className="text-xs text-muted-foreground">Serotonin made in gut</p>
            </Card>
            <Card className="p-4 bg-card/80 border-border/50 text-center">
              <div className="text-3xl mb-2">🧠</div>
              <div className="text-2xl font-bold">500M</div>
              <p className="text-xs text-muted-foreground">Neurons in your gut</p>
            </Card>
            <Card className="p-4 bg-card/80 border-border/50 text-center">
              <div className="text-3xl mb-2">⚖️</div>
              <div className="text-2xl font-bold">1-2 kg</div>
              <p className="text-xs text-muted-foreground">Weight of gut bacteria</p>
            </Card>
          </div>
        </div>

        {/* Newsletter Opt-in (placeholder) */}
        <Card className="p-5 bg-accent/10 border-accent/30">
          <div className="flex items-start gap-3">
            <div className="text-2xl">📬</div>
            <div className="flex-1">
              <h3 className="font-semibold mb-1">Daily Gut Tips Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get a daily gut health tip delivered to your inbox every morning.
              </p>
              <Button size="sm" className="w-full">
                Coming Soon
              </Button>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default GutLearn;
