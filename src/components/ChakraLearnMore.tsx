import { motion } from 'framer-motion';
import { ArrowLeft, Play, Heart, Zap, Wind, Droplets, Flame, Sun, Moon, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getChakraById } from '@/lib/chakras';
import { cn } from '@/lib/utils';

interface ChakraLearnMoreProps {
  chakraId: string;
  onClose: () => void;
  onStartMeditation: () => void;
}

const ChakraLearnMore = ({ chakraId, onClose, onStartMeditation }: ChakraLearnMoreProps) => {
  const chakra = getChakraById(chakraId);

  if (!chakra) return null;

  // Get element icon
  const getElementIcon = () => {
    switch (chakra.element.toLowerCase()) {
      case 'earth': return '🌍';
      case 'water': return '💧';
      case 'fire': return '🔥';
      case 'air': return '💨';
      case 'ether/space': return '✨';
      case 'light': return '💡';
      case 'cosmic energy / divine': return '🌌';
      default: return '⭐';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-slate-950"
    >
      {/* Header with gradient */}
      <div 
        className="relative pt-[max(1rem,env(safe-area-inset-top))] pb-8"
        style={{
          background: `linear-gradient(180deg, ${chakra.colorHex}50 0%, transparent 100%)`
        }}
      >
        <header className="flex items-center justify-between px-4 py-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <span className="text-white/40 text-sm">Learn More</span>
          <div className="w-10" />
        </header>

        {/* Chakra Header */}
        <div className="text-center px-6 mt-4">
          <motion.div 
            className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ring-4 ring-white/20"
            style={{ backgroundColor: chakra.colorHex }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
          >
            <span className="text-3xl">{chakra.icon}</span>
          </motion.div>
          <h1 className="text-2xl font-medium text-white">{chakra.name} Chakra</h1>
          <p className="text-white/50 mt-1">{chakra.sanskrit}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32">
        <div className="max-w-md mx-auto space-y-6">
          {/* Quick Info Row */}
          <motion.div 
            className="flex justify-between gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex-1 bg-white/5 rounded-2xl p-4 text-center">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Location</p>
              <p className="text-white text-sm">{chakra.location}</p>
            </div>
            <div className="flex-1 bg-white/5 rounded-2xl p-4 text-center">
              <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Element</p>
              <p className="text-white text-sm">{getElementIcon()} {chakra.element}</p>
            </div>
          </motion.div>

          {/* Sound Info */}
          <motion.div 
            className="bg-white/5 rounded-2xl p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Healing Sound</p>
                <p className="text-2xl font-light text-white">{chakra.mantra}</p>
              </div>
              <div className="text-right">
                <p className="text-white/40 text-xs uppercase tracking-wide mb-1">Frequency</p>
                <p className="text-lg text-white">{chakra.frequency} Hz</p>
              </div>
            </div>
          </motion.div>

          {/* Affirmation */}
          <motion.div 
            className="rounded-2xl p-5 border border-white/10"
            style={{ backgroundColor: `${chakra.colorHex}15` }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-white/40 text-xs uppercase tracking-wide mb-3">Affirmation</p>
            <p className="text-white text-lg font-light italic leading-relaxed">
              "{chakra.affirmation}"
            </p>
          </motion.div>

          {/* Benefits */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <p className="text-white/40 text-xs uppercase tracking-wide">Benefits of Balancing</p>
            <div className="flex flex-wrap gap-2">
              {chakra.benefits.map((benefit, i) => (
                <span 
                  key={i}
                  className="px-3 py-1.5 rounded-full text-sm text-white/80 bg-white/10"
                >
                  {benefit}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Emotional Aspects */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-white/40 text-xs uppercase tracking-wide">Emotional Connection</p>
            <div className="grid grid-cols-2 gap-2">
              {chakra.emotionalAspects.map((aspect, i) => (
                <div 
                  key={i}
                  className="p-3 rounded-xl bg-white/5 flex items-center gap-2"
                >
                  <Heart className="w-4 h-4" style={{ color: chakra.colorHex }} />
                  <span className="text-white/80 text-sm">{aspect}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Body Parts */}
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <p className="text-white/40 text-xs uppercase tracking-wide">Physical Connection</p>
            <p className="text-white/70 text-sm leading-relaxed">
              This chakra is connected to your {chakra.bodyParts.join(', ').toLowerCase()}.
            </p>
          </motion.div>

          {/* Signs of Imbalance */}
          <motion.div 
            className="bg-white/5 rounded-2xl p-4 space-y-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-white/40 text-xs uppercase tracking-wide">When Out of Balance</p>
            <p className="text-white/70 text-sm leading-relaxed">
              You may experience feelings of 
              {chakra.id === 'root' && ' fear, anxiety, insecurity, or disconnection from your body.'}
              {chakra.id === 'sacral' && ' emotional instability, creative blocks, or difficulty experiencing joy.'}
              {chakra.id === 'solar' && ' low confidence, powerlessness, or difficulty making decisions.'}
              {chakra.id === 'heart' && ' loneliness, jealousy, or difficulty giving and receiving love.'}
              {chakra.id === 'throat' && ' difficulty expressing yourself, fear of speaking, or feeling unheard.'}
              {chakra.id === 'third-eye' && ' confusion, lack of clarity, or difficulty trusting your intuition.'}
              {chakra.id === 'crown' && ' disconnection from purpose, lack of direction, or spiritual emptiness.'}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
        <motion.button
          onClick={onStartMeditation}
          className="w-full max-w-md mx-auto py-4 px-6 rounded-2xl text-white font-medium flex items-center justify-center gap-3 shadow-lg"
          style={{ 
            background: `linear-gradient(135deg, ${chakra.colorHex} 0%, ${chakra.colorHex}cc 100%)`,
            boxShadow: `0 10px 40px ${chakra.colorHex}40`
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Play className="w-5 h-5" fill="currentColor" />
          <span>Begin {chakra.name} Meditation</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ChakraLearnMore;
