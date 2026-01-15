import { motion } from 'framer-motion';
import { ArrowLeft, Play, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chakras, getChakraById } from '@/lib/chakras';
import { ChakraResult as ChakraResultType, getChakraHealingMessage } from '@/lib/chakraQuestionnaire';
import { cn } from '@/lib/utils';

interface ChakraResultProps {
  result: ChakraResultType;
  onClose: () => void;
  onStartMeditation: (chakraId: string) => void;
  onLearnMore: (chakraId: string) => void;
}

const ChakraResult = ({ result, onClose, onStartMeditation, onLearnMore }: ChakraResultProps) => {
  const primaryChakra = getChakraById(result.primary.chakraId);
  const secondaryChakra = getChakraById(result.secondary.chakraId);
  const healingMessage = getChakraHealingMessage(result.primary.chakraId);

  if (!primaryChakra) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-slate-950"
    >
      {/* Solid background overlay with chakra color tint */}
      <div 
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${primaryChakra.colorHex}40 0%, #020617 40%, #020617 100%)`
        }}
      />
      
      {/* Animated background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ backgroundColor: `${primaryChakra.colorHex}30` }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose} 
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-white/40 text-sm">Your Result</span>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-8 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          {/* Sparkle Icon */}
          <motion.div 
            className="mx-auto"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
          >
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto ring-4 ring-white/20"
              style={{ backgroundColor: primaryChakra.colorHex }}
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-10 h-10 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Result Text */}
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-2xl font-light text-white leading-relaxed">
              ✨ {healingMessage.title}
            </h1>
            <p className="text-white/60 text-base leading-relaxed">
              {healingMessage.message}
            </p>
          </motion.div>

          {/* Chakra Info Card */}
          <motion.div
            className="bg-white/5 rounded-3xl p-5 border border-white/10 space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-4">
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: primaryChakra.colorHex }}
              >
                <span className="text-2xl">{primaryChakra.icon}</span>
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">{primaryChakra.name} Chakra</h3>
                <p className="text-white/50 text-sm">{primaryChakra.sanskrit} • {primaryChakra.location}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Balance Level</span>
                <span className="text-white">{result.primary.percentage}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: primaryChakra.colorHex }}
                  initial={{ width: 0 }}
                  animate={{ width: `${result.primary.percentage}%` }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                />
              </div>
            </div>

            <p className="text-white/60 text-sm italic">
              "{primaryChakra.affirmation}"
            </p>
          </motion.div>

          {/* Secondary Chakra */}
          {secondaryChakra && (
            <motion.div
              className="bg-white/5 rounded-2xl p-4 border border-white/10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-white/40 text-xs uppercase tracking-wide mb-2">Also needs attention</p>
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: secondaryChakra.colorHex }}
                >
                  <span className="text-lg">{secondaryChakra.icon}</span>
                </div>
                <div>
                  <h4 className="font-medium text-white text-sm">{secondaryChakra.name} Chakra</h4>
                  <p className="text-white/40 text-xs">{result.secondary.percentage}% balanced</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* All Chakras Overview */}
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-white/40 text-xs uppercase tracking-wide">Your Energy Overview</p>
            <div className="flex justify-between gap-1">
              {result.allScores.map((score) => {
                const chakra = getChakraById(score.chakraId);
                if (!chakra) return null;
                return (
                  <div key={score.chakraId} className="flex-1 space-y-1">
                    <div 
                      className="h-16 rounded-lg relative overflow-hidden bg-white/5"
                    >
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 rounded-lg"
                        style={{ backgroundColor: chakra.colorHex }}
                        initial={{ height: 0 }}
                        animate={{ height: `${score.percentage}%` }}
                        transition={{ delay: 0.7 + chakras.indexOf(chakra) * 0.05, duration: 0.5 }}
                      />
                    </div>
                    <p className="text-center text-[10px] text-white/40">{chakra.number}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            className="space-y-3 pt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              onClick={() => onStartMeditation(primaryChakra.id)}
              className="w-full py-4 px-6 rounded-2xl text-white font-medium flex items-center justify-center gap-3 shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${primaryChakra.colorHex} 0%, ${primaryChakra.colorHex}cc 100%)`,
                boxShadow: `0 10px 40px ${primaryChakra.colorHex}40`
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Play className="w-5 h-5" fill="currentColor" />
              <span>Begin My Meditation</span>
            </motion.button>

            <motion.button
              onClick={() => onLearnMore(primaryChakra.id)}
              className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-white/80 font-medium flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <BookOpen className="w-5 h-5" />
              <span>Learn About This Chakra</span>
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChakraResult;
