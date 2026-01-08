import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/LoadingSpinner";
import { supabase } from "@/integrations/supabase/client";
import { gutTypes, getRecipesForGutType, GutType } from "@/lib/gutHealth";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  question: string;
  subtitle?: string;
  options: { text: string; types: Record<string, number> }[];
}

// Enhanced quiz with India-specific questions and nuanced scoring
const questions: Question[] = [
  {
    id: 1,
    question: "How would you describe your appetite?",
    subtitle: "Think about your typical hunger patterns",
    options: [
      { text: "Very strong - I get irritable when hungry", types: { fiery: 3, balanced: 0, airy: 0, slow: 0 } },
      { text: "Variable - sometimes strong, sometimes weak", types: { airy: 3, balanced: 0, fiery: 0, slow: 0 } },
      { text: "Low - I can easily skip meals", types: { slow: 3, balanced: 0, fiery: 0, airy: 0 } },
      { text: "Consistent - I eat regular portions", types: { balanced: 3, fiery: 0, airy: 0, slow: 0 } },
    ],
  },
  {
    id: 2,
    question: "How do you typically feel 30 minutes after a meal?",
    options: [
      { text: "Light and energized", types: { balanced: 3, fiery: 1, airy: 0, slow: 0 } },
      { text: "Heavy and sleepy", types: { slow: 3, balanced: 0, fiery: 0, airy: 0 } },
      { text: "Bloated or gassy", types: { airy: 3, inflamed: 1, balanced: 0, fiery: 0 } },
      { text: "Burning or acidic", types: { fiery: 3, inflamed: 1, balanced: 0, airy: 0 } },
    ],
  },
  {
    id: 3,
    question: "What is your typical bowel movement pattern?",
    subtitle: "This tells us a lot about gut health",
    options: [
      { text: "Regular, 1-2 times daily, well-formed", types: { balanced: 3, fiery: 0, airy: 0, slow: 0 } },
      { text: "Frequent (2-3+), often loose or urgent", types: { fiery: 3, inflamed: 1, balanced: 0, slow: 0 } },
      { text: "Irregular, alternating between hard and loose", types: { airy: 2, inflamed: 2, balanced: 0, slow: 0 } },
      { text: "Less than once daily, often hard", types: { slow: 3, airy: 1, balanced: 0, fiery: 0 } },
    ],
  },
  {
    id: 4,
    question: "How does stress affect your digestion?",
    options: [
      { text: "Causes acidity, heartburn, or loose stools", types: { fiery: 3, inflamed: 1, balanced: 0, airy: 0 } },
      { text: "Causes gas, bloating, or butterflies", types: { airy: 3, inflamed: 1, balanced: 0, fiery: 0 } },
      { text: "Makes me lose appetite completely", types: { slow: 2, airy: 1, balanced: 0, fiery: 0 } },
      { text: "Minimal effect on my digestion", types: { balanced: 3, fiery: 0, airy: 0, slow: 0 } },
    ],
  },
  {
    id: 5,
    question: "Which foods commonly upset your stomach?",
    subtitle: "Select what bothers you most",
    options: [
      { text: "Spicy, sour, or fried foods (mirchi, pickle)", types: { fiery: 3, inflamed: 1, balanced: 0, airy: 0 } },
      { text: "Beans, rajma, chole, raw salads", types: { airy: 3, inflamed: 1, balanced: 0, fiery: 0 } },
      { text: "Heavy foods - paneer, fried items, sweets", types: { slow: 3, balanced: 0, fiery: 0, airy: 0 } },
      { text: "Very few foods bother me", types: { balanced: 3, fiery: 0, airy: 0, slow: 0 } },
    ],
  },
  {
    id: 6,
    question: "Do you experience any of these regularly?",
    options: [
      { text: "Heartburn, acid reflux, sour burps", types: { fiery: 3, inflamed: 1, balanced: 0, airy: 0 } },
      { text: "Bloating, gas, gurgling sounds", types: { airy: 3, balanced: 0, fiery: 0, slow: 0 } },
      { text: "Heaviness, incomplete evacuation", types: { slow: 3, balanced: 0, fiery: 0, airy: 0 } },
      { text: "None of these regularly", types: { balanced: 3, lowFermenter: 1, fiery: 0, airy: 0 } },
    ],
  },
  {
    id: 7,
    question: "How often do you consume fermented foods?",
    subtitle: "Curd, buttermilk, idli, dosa, kanji, etc.",
    options: [
      { text: "Daily - curd/buttermilk is part of every meal", types: { balanced: 2, lowFermenter: 0, fiery: 0, airy: 0 } },
      { text: "Few times a week", types: { balanced: 1, lowFermenter: 1, fiery: 0, airy: 0 } },
      { text: "Rarely - maybe once a week or less", types: { lowFermenter: 3, balanced: 0, fiery: 0, airy: 0 } },
      { text: "Almost never", types: { lowFermenter: 4, balanced: 0, fiery: 0, airy: 0 } },
    ],
  },
  {
    id: 8,
    question: "Have you taken antibiotics in the past 6 months?",
    options: [
      { text: "Yes, multiple courses", types: { lowFermenter: 4, inflamed: 1, balanced: 0, fiery: 0 } },
      { text: "Yes, one course", types: { lowFermenter: 2, balanced: 0, fiery: 0, airy: 0 } },
      { text: "No antibiotics recently", types: { balanced: 1, lowFermenter: 0, fiery: 0, airy: 0 } },
    ],
  },
  {
    id: 9,
    question: "How is your energy level throughout the day?",
    options: [
      { text: "High in morning, crashes in afternoon", types: { fiery: 2, slow: 1, balanced: 0, airy: 0 } },
      { text: "Up and down, unpredictable", types: { airy: 2, lowFermenter: 1, balanced: 0, fiery: 0 } },
      { text: "Generally low, struggle to feel energetic", types: { slow: 2, lowFermenter: 2, balanced: 0, fiery: 0 } },
      { text: "Steady and stable most of the time", types: { balanced: 3, fiery: 0, airy: 0, slow: 0 } },
    ],
  },
  {
    id: 10,
    question: "How does your gut feel right now?",
    subtitle: "Be honest about this moment",
    options: [
      { text: "Warm, slightly acidic or burning", types: { fiery: 3, balanced: 0, airy: 0, slow: 0 } },
      { text: "Gassy, bloated, or rumbling", types: { airy: 3, balanced: 0, fiery: 0, slow: 0 } },
      { text: "Heavy, full, or sluggish", types: { slow: 3, balanced: 0, fiery: 0, airy: 0 } },
      { text: "Calm and comfortable", types: { balanced: 3, fiery: 0, airy: 0, slow: 0 } },
    ],
  },
];

const GutQuiz = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    balanced: 0, fiery: 0, airy: 0, slow: 0, inflamed: 0, lowFermenter: 0
  });
  const [showResult, setShowResult] = useState(false);
  const [gutType, setGutType] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleAnswer = (optionTypes: Record<string, number>) => {
    // Add scores from this answer
    const newScores = { ...scores };
    Object.entries(optionTypes).forEach(([type, points]) => {
      newScores[type] = (newScores[type] || 0) + points;
    });
    setScores(newScores);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResult(newScores);
    }
  };

  const calculateResult = async (finalScores: Record<string, number>) => {
    // Find dominant type
    const dominantType = Object.entries(finalScores).reduce((a, b) => 
      a[1] > b[1] ? a : b
    )[0];
    
    setGutType(dominantType);
    setShowResult(true);

    // Save to localStorage as fallback (always works)
    localStorage.setItem('userGutType', dominantType);
    console.log("Gut type saved to localStorage:", dominantType);

    // Save to database
    if (user) {
      setSaving(true);
      try {
        const { data, error } = await supabase.from("daily_reflections").insert({
          user_id: user.id,
          reflection_text: `Gut Type Quiz Result: ${dominantType}`,
          mood: dominantType,
          reflection_date: new Date().toISOString().split("T")[0],
        }).select();
        
        if (error) {
          console.error("Error saving gut type to Supabase:", error);
        } else {
          console.log("Gut type saved to Supabase:", data);
        }
      } catch (error) {
        console.error("Error saving gut type:", error);
      }
      setSaving(false);
    }
  };

  const goBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScores({ balanced: 0, fiery: 0, airy: 0, slow: 0, inflamed: 0, lowFermenter: 0 });
    setShowResult(false);
    setGutType(null);
  };

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (showResult && gutType) {
    const result = gutTypes[gutType as keyof typeof gutTypes];
    const recommendedRecipes = getRecipesForGutType(gutType).slice(0, 3);
    
    return (
      <div className="min-h-screen bg-background pb-24">
        <header className="p-6 flex items-center gap-3 border-b border-border/50 backdrop-blur-sm bg-card/50">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gut')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">Your Gut Profile</h1>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Result Card */}
          <Card className={cn(
            "p-6 bg-gradient-to-br border-green-500/30 text-center",
            result.color
          )}>
            <div className="text-6xl mb-4">{result.emoji}</div>
            <h2 className="text-2xl font-bold mb-1">{result.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">{result.nameHindi}</p>
            <p className="text-muted-foreground">{result.descriptionShort}</p>
          </Card>

          {/* Key Characteristics */}
          <Card className="p-5 bg-card/80 border-border/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <span className="text-lg">📋</span> Key Characteristics
            </h3>
            <ul className="space-y-2">
              {result.characteristics.map((char, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  <span>{char}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Immediate Action Points */}
          <Card className="p-5 bg-green-500/10 border-green-500/30">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-400" /> 3 Things to Do Now
            </h3>
            <ul className="space-y-3">
              {result.actionPoints.map((action, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-sm">{action}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Foods to Eat & Avoid */}
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-green-500/10 border-green-500/30">
              <h4 className="font-semibold text-sm mb-2 text-green-400">✓ Eat More</h4>
              <ul className="text-xs space-y-1">
                {result.recommendedFoods.slice(0, 4).map((food, idx) => (
                  <li key={idx} className="text-muted-foreground">{food}</li>
                ))}
              </ul>
            </Card>
            <Card className="p-4 bg-red-500/10 border-red-500/30">
              <h4 className="font-semibold text-sm mb-2 text-red-400">✗ Avoid</h4>
              <ul className="text-xs space-y-1">
                {result.avoidFoods.slice(0, 4).map((food, idx) => (
                  <li key={idx} className="text-muted-foreground">{food}</li>
                ))}
              </ul>
            </Card>
          </div>

          {/* Recommended Recipes Preview */}
          {recommendedRecipes.length > 0 && (
            <Card className="p-5 bg-card/80 border-border/50">
              <h3 className="font-semibold mb-3">🍽️ Recipes For You</h3>
              <div className="space-y-2">
                {recommendedRecipes.map((recipe) => (
                  <div key={recipe.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{recipe.name}</p>
                      <p className="text-xs text-muted-foreground">{recipe.mealType} • {recipe.prepTime + recipe.cookTime} mins</p>
                    </div>
                    <div className="flex gap-1">
                      {recipe.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={() => navigate('/gut')}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Go to Gut Dashboard
            </Button>
            <Button 
              variant="outline"
              onClick={restartQuiz}
              className="w-full"
            >
              Retake Quiz
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-6 flex items-center gap-3 border-b border-border/50 backdrop-blur-sm bg-card/50">
        <Button variant="ghost" size="icon" onClick={() => navigate('/gut')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Gut Type Quiz</h1>
          <p className="text-xs text-muted-foreground">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-6 pt-4">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <main className="p-6 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">{question.question}</h2>
          {question.subtitle && (
            <p className="text-sm text-muted-foreground">{question.subtitle}</p>
          )}
        </div>

        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <Card
              key={idx}
              className="p-4 bg-card/80 border-border/50 hover:border-green-500/50 hover:bg-green-500/10 transition-all cursor-pointer active:scale-[0.98]"
              onClick={() => handleAnswer(option.types)}
            >
              <p className="text-sm">{option.text}</p>
            </Card>
          ))}
        </div>

        {currentQuestion > 0 && (
          <Button variant="ghost" onClick={goBack} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous Question
          </Button>
        )}
      </main>
    </div>
  );
};

export default GutQuiz;
