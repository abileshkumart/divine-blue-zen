import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Heart, Share2, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Mantra {
  id: string;
  text: string;
  translation?: string;
  origin: string;
  moonPhase?: string;
}

// Mantras organized by moon phase energy
const mantras: Record<string, Mantra[]> = {
  new: [
    {
      id: "n1",
      text: "Om Gam Ganapataye Namaha",
      translation: "I bow to the remover of obstacles",
      origin: "Sanskrit",
      moonPhase: "new",
    },
    {
      id: "n2",
      text: "I plant seeds of intention with clarity and purpose",
      origin: "Modern Affirmation",
      moonPhase: "new",
    },
    {
      id: "n3",
      text: "In stillness, I find my beginning",
      origin: "Modern Affirmation",
      moonPhase: "new",
    },
  ],
  waxing: [
    {
      id: "w1",
      text: "Om Shreem Maha Lakshmiyei Namaha",
      translation: "I invoke abundance and prosperity",
      origin: "Sanskrit",
      moonPhase: "waxing",
    },
    {
      id: "w2",
      text: "I am building momentum toward my highest vision",
      origin: "Modern Affirmation",
      moonPhase: "waxing",
    },
    {
      id: "w3",
      text: "Each step forward strengthens my resolve",
      origin: "Modern Affirmation",
      moonPhase: "waxing",
    },
  ],
  full: [
    {
      id: "f1",
      text: "Om Mani Padme Hum",
      translation: "The jewel is in the lotus",
      origin: "Tibetan Buddhist",
      moonPhase: "full",
    },
    {
      id: "f2",
      text: "I release what no longer serves my highest good",
      origin: "Modern Affirmation",
      moonPhase: "full",
    },
    {
      id: "f3",
      text: "I celebrate my growth and honor my journey",
      origin: "Modern Affirmation",
      moonPhase: "full",
    },
  ],
  waning: [
    {
      id: "wn1",
      text: "Om Shanti Shanti Shanti",
      translation: "Peace, peace, peace",
      origin: "Sanskrit",
      moonPhase: "waning",
    },
    {
      id: "wn2",
      text: "I rest in the wisdom of completion",
      origin: "Modern Affirmation",
      moonPhase: "waning",
    },
    {
      id: "wn3",
      text: "In letting go, I make space for what's to come",
      origin: "Modern Affirmation",
      moonPhase: "waning",
    },
  ],
  universal: [
    {
      id: "u1",
      text: "So Hum",
      translation: "I am that",
      origin: "Sanskrit",
    },
    {
      id: "u2",
      text: "Om Namah Shivaya",
      translation: "I bow to the inner self",
      origin: "Sanskrit",
    },
    {
      id: "u3",
      text: "Sat Nam",
      translation: "Truth is my identity",
      origin: "Kundalini",
    },
    {
      id: "u4",
      text: "I am peace. I am love. I am light.",
      origin: "Modern Affirmation",
    },
    {
      id: "u5",
      text: "This moment is all there is",
      origin: "Present Awareness",
    },
  ],
};

interface MantraCardProps {
  moonPhase?: string;
  className?: string;
}

// Helper function to get moon phase key - defined outside component
const getMoonPhaseKey = (phase: string): string => {
  if (phase.includes("new")) return "new";
  if (phase.includes("waxing")) return "waxing";
  if (phase.includes("full")) return "full";
  if (phase.includes("waning")) return "waning";
  return "universal";
};

export const MantraCard = ({ moonPhase = "universal", className }: MantraCardProps) => {
  const { toast } = useToast();
  const [currentMantra, setCurrentMantra] = useState<Mantra>(() => {
    const phaseKey = getMoonPhaseKey(moonPhase);
    const available = [...(mantras[phaseKey] || []), ...mantras.universal];
    return available[Math.floor(Math.random() * available.length)];
  });
  const [isLiked, setIsLiked] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const getNextMantra = () => {
    setIsAnimating(true);
    const phaseKey = getMoonPhaseKey(moonPhase);
    const available = [...(mantras[phaseKey] || []), ...mantras.universal];
    const filtered = available.filter((m) => m.id !== currentMantra.id);
    const next = filtered[Math.floor(Math.random() * filtered.length)];
    
    setTimeout(() => {
      setCurrentMantra(next);
      setIsLiked(false);
      setIsAnimating(false);
    }, 200);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentMantra.text);
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: "Mantra copied to clipboard",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      toast({
        title: "Could not copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Daily Mantra",
          text: `${currentMantra.text}${currentMantra.translation ? `\n\n"${currentMantra.translation}"` : ""}\n\n- ${currentMantra.origin}`,
        });
      } catch (e) {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Card className={cn("p-6 bg-gradient-to-br from-accent/20 to-transparent border-accent/30", className)}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          Today's Mantra
        </span>
        <Button
          variant="ghost"
          size="icon"
          onClick={getNextMantra}
          disabled={isAnimating}
          className="h-8 w-8"
        >
          <RefreshCw className={cn("w-4 h-4", isAnimating && "animate-spin")} />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentMantra.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-3"
        >
          <p className="text-xl font-serif italic leading-relaxed">
            "{currentMantra.text}"
          </p>
          
          {currentMantra.translation && (
            <p className="text-sm text-muted-foreground">
              — {currentMantra.translation}
            </p>
          )}
          
          <p className="text-xs text-accent/80">
            {currentMantra.origin}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsLiked(!isLiked)}
          className={cn("h-9 w-9", isLiked && "text-red-400")}
        >
          <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-9 w-9"
        >
          {isCopied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleShare}
          className="h-9 w-9"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

// Simple mantra display for smaller spaces
export const MantraDisplay = ({ text, className }: { text: string; className?: string }) => {
  return (
    <div className={cn("text-center py-4", className)}>
      <p className="text-lg font-serif italic text-accent/90">"{text}"</p>
    </div>
  );
};

export default MantraCard;
