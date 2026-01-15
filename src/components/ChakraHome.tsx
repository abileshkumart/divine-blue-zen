import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, Heart, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { chakras, Chakra } from '@/lib/chakras';
import { getChakraKeyword } from '@/lib/chakraQuestionnaire';
import { cn } from '@/lib/utils';

interface ChakraHomeProps {
  onClose: () => void;
  onSelectChakra: (chakra: Chakra) => void;
  onStartQuestionnaire: () => void;
}

const ChakraHome = ({ onClose, onSelectChakra, onStartQuestionnaire }: ChakraHomeProps) => {
  const [showChakraList, setShowChakraList] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950 overflow-hidden"
    >
      {/* Solid background with subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-slate-950 to-slate-950" />
      
      {/* Subtle animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-pink-500/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-white/40 text-sm">Chakra Healing</span>
        <div className="w-10" /> {/* Spacer */}
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-safe">
        <AnimatePresence mode="wait">
          {!showChakraList ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md text-center space-y-10"
            >
              {/* Chakra Symbol */}
              <motion.div 
                className="relative mx-auto w-32 h-32"
                animate={{ rotate: 360 }}
                transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              >
                {chakras.map((chakra, i) => (
                  <motion.div
                    key={chakra.id}
                    className="absolute w-8 h-8 rounded-full"
                    style={{ 
                      backgroundColor: chakra.colorHex,
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${i * 51.4}deg) translateY(-48px)`,
                      opacity: 0.8
                    }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                ))}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white/80" />
                  </div>
                </div>
              </motion.div>

              {/* Title */}
              <div className="space-y-3">
                <h1 className="text-3xl font-light text-white tracking-tight">
                  Reconnect With Your
                </h1>
                <p className="text-3xl font-semibold bg-gradient-to-r from-purple-300 via-pink-300 to-amber-200 bg-clip-text text-transparent">
                  Inner Energy
                </p>
              </div>

              {/* Description */}
              <p className="text-white/50 text-base leading-relaxed max-w-xs mx-auto">
                Balance your energy centers through guided meditation and healing sounds
              </p>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                {/* Primary CTA */}
                <motion.button
                  onClick={onStartQuestionnaire}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium flex items-center justify-center gap-3 shadow-lg shadow-purple-500/25"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Heart className="w-5 h-5" />
                  <span>Help Me Find My Chakra</span>
                </motion.button>

                {/* Secondary CTA */}
                <motion.button
                  onClick={() => setShowChakraList(true)}
                  className="w-full py-4 px-6 rounded-2xl bg-white/5 border border-white/10 text-white/80 font-medium flex items-center justify-center gap-3 hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>I Know My Chakra</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md space-y-4"
            >
              {/* Back Button */}
              <button
                onClick={() => setShowChakraList(false)}
                className="flex items-center gap-2 text-white/60 hover:text-white mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back</span>
              </button>

              {/* Section Title */}
              <div className="text-center mb-6">
                <h2 className="text-xl font-medium text-white">Choose Your Chakra</h2>
                <p className="text-white/50 text-sm mt-1">Select the energy center you want to balance</p>
              </div>

              {/* Chakra Cards */}
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pb-8">
                {chakras.map((chakra, index) => (
                  <motion.button
                    key={chakra.id}
                    onClick={() => onSelectChakra(chakra)}
                    className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4 hover:bg-white/10 transition-all text-left group"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                  >
                    {/* Chakra Color Circle */}
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-white/20"
                      style={{ backgroundColor: chakra.colorHex }}
                    >
                      <span className="text-white font-semibold">{chakra.number}</span>
                    </div>

                    {/* Chakra Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white">{chakra.name} Chakra</h3>
                      <p className="text-white/50 text-sm">{getChakraKeyword(chakra.id)}</p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-white/60 transition-colors" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-900 to-transparent pointer-events-none" />
    </motion.div>
  );
};

export default ChakraHome;
