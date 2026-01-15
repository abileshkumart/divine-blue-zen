import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, RotateCcw, Info, X } from 'lucide-react';
import { chakras, Chakra, getChakraById } from '@/lib/chakras';
import { playChakraSound, stopChakraSound, setChakraVolume, transitionChakra, ChakraSoundMode } from '@/lib/chakraSound';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface ChakraMeditationProps {
  onClose: () => void;
  initialChakra?: string;
  isJourneyMode?: boolean;
}

const ChakraMeditation = ({ onClose, initialChakra = 'heart', isJourneyMode = false }: ChakraMeditationProps) => {
  const [selectedChakra, setSelectedChakra] = useState<Chakra | null>(
    getChakraById(initialChakra) || chakras[3]
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [soundMode, setSoundMode] = useState<ChakraSoundMode>('layered');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(300);
  const [showChakraInfo, setShowChakraInfo] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [journeyIndex, setJourneyIndex] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const breathRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const runBreathCycle = () => {
        setBreathPhase('inhale');
        breathRef.current = setTimeout(() => {
          setBreathPhase('hold');
          breathRef.current = setTimeout(() => {
            setBreathPhase('exhale');
            breathRef.current = setTimeout(() => {
              runBreathCycle();
            }, 4000);
          }, 4000);
        }, 4000);
      };
      runBreathCycle();
    }
    return () => {
      if (breathRef.current) clearTimeout(breathRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => {
          if (prev >= sessionDuration) {
            handleSessionComplete();
            return prev;
          }
          if (isJourneyMode && prev > 0 && prev % 180 === 0) {
            const nextIndex = (journeyIndex + 1) % chakras.length;
            setJourneyIndex(nextIndex);
            setSelectedChakra(chakras[nextIndex]);
            transitionChakra(chakras[nextIndex].id, 5000);
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, sessionDuration, journeyIndex, isJourneyMode]);

  const handleSessionComplete = useCallback(() => {
    setIsPlaying(false);
    stopChakraSound();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      stopChakraSound();
      setIsPlaying(false);
    } else {
      if (selectedChakra) {
        playChakraSound(selectedChakra.id, soundMode, isMuted ? 0 : volume);
      }
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    setChakraVolume(isMuted ? volume : 0);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (!isMuted) {
      setChakraVolume(newVolume);
    }
  };

  const handleChakraSelect = (chakra: Chakra) => {
    setSelectedChakra(chakra);
    if (isPlaying) {
      transitionChakra(chakra.id, 3000);
    }
  };

  const handleReset = () => {
    setTimeElapsed(0);
    setJourneyIndex(0);
    if (isJourneyMode) {
      setSelectedChakra(chakras[0]);
    }
    stopChakraSound();
    setIsPlaying(false);
  };

  const handleSoundModeChange = (mode: ChakraSoundMode) => {
    setSoundMode(mode);
    if (isPlaying && selectedChakra) {
      stopChakraSound();
      setTimeout(() => {
        playChakraSound(selectedChakra.id, mode, isMuted ? 0 : volume);
      }, 500);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (timeElapsed / sessionDuration) * 100;

  useEffect(() => {
    return () => {
      stopChakraSound();
      if (timerRef.current) clearInterval(timerRef.current);
      if (breathRef.current) clearTimeout(breathRef.current);
    };
  }, []);

  const durationOptions = [
    { label: '5 min', value: 300 },
    { label: '10 min', value: 600 },
    { label: '15 min', value: 900 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-slate-950"
    >
      {/* Solid background overlay with chakra color tint */}
      <div 
        className="absolute inset-0"
        style={{
          background: selectedChakra 
            ? `linear-gradient(180deg, ${selectedChakra.colorHex}50 0%, #020617 35%, #020617 100%)`
            : 'linear-gradient(180deg, #1a1a2e 0%, #020617 100%)'
        }}
      />
      <header className="relative z-10 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white/60 hover:text-white hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-white/80 font-medium">
          {isJourneyMode ? 'Chakra Journey' : `${selectedChakra?.name} Meditation`}
        </h1>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowChakraInfo(!showChakraInfo)}
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          <Info className="w-5 h-5" />
        </Button>
      </header>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative mb-8">
          <motion.div
            className="absolute inset-0 rounded-full blur-3xl"
            style={{ 
              background: `radial-gradient(circle, ${selectedChakra?.colorHex}40 0%, transparent 70%)`,
              width: '300px',
              height: '300px',
              left: '-75px',
              top: '-75px'
            }}
            animate={{
              scale: isPlaying ? [1, 1.2, 1] : 1,
              opacity: isPlaying ? [0.3, 0.6, 0.3] : 0.3,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          
          <motion.div
            className="relative w-40 h-40 rounded-full flex items-center justify-center border-4"
            style={{ 
              borderColor: selectedChakra?.colorHex,
              backgroundColor: `${selectedChakra?.colorHex}20`
            }}
            animate={{
              scale: isPlaying ? [1, 1.05, 1] : 1,
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <div className="text-center">
              <motion.p 
                className="text-4xl font-bold text-white mb-1"
                animate={{ opacity: isPlaying ? [0.7, 1, 0.7] : 1 }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {selectedChakra?.mantra}
              </motion.p>
              <p className="text-white/50 text-sm">{selectedChakra?.frequency} Hz</p>
            </div>
          </motion.div>
        </div>

        <AnimatePresence>
          {isPlaying && (
            <motion.div
              className="mb-6 text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <motion.p 
                className="text-xl text-white/80 capitalize font-light"
                key={breathPhase}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                {breathPhase === 'hold' ? 'Hold' : breathPhase === 'inhale' ? 'Breathe In' : 'Breathe Out'}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-light text-white mb-1">
            {selectedChakra?.name} Chakra
          </h2>
          <p className="text-white/50 text-sm">{selectedChakra?.sanskrit} • {selectedChakra?.location}</p>
        </div>

        <div className="text-center mb-8">
          <p className="text-5xl font-light text-white mb-2 tabular-nums">{formatTime(timeElapsed)}</p>
          <p className="text-white/30 text-sm">/ {formatTime(sessionDuration)}</p>
          
          <div className="w-48 h-1 bg-white/10 rounded-full mt-4 mx-auto overflow-hidden">
            <motion.div 
              className="h-full rounded-full"
              style={{ backgroundColor: selectedChakra?.colorHex }}
              animate={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {chakras.map((chakra) => (
            <button
              key={chakra.id}
              onClick={() => handleChakraSelect(chakra)}
              className={cn(
                "w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center",
                selectedChakra?.id === chakra.id 
                  ? "ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110" 
                  : "opacity-50 hover:opacity-80"
              )}
              style={{ backgroundColor: chakra.colorHex }}
            >
              <span className="text-xs font-bold text-white/90">{chakra.number}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-4">
        {!isPlaying && timeElapsed === 0 && (
          <div className="flex justify-center gap-2 mb-2">
            {durationOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSessionDuration(option.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm transition-all",
                  sessionDuration === option.value
                    ? "bg-white text-slate-900 font-medium"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {!isPlaying && timeElapsed === 0 && (
          <div className="flex justify-center gap-2">
            {(['pure', 'binaural', 'layered'] as ChakraSoundMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => handleSoundModeChange(mode)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs capitalize transition-all",
                  soundMode === mode
                    ? "bg-white/20 text-white font-medium"
                    : "bg-white/5 text-white/50 hover:bg-white/10"
                )}
              >
                {mode}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="text-white/40 hover:text-white hover:bg-white/10 w-12 h-12"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>

          <motion.button
            onClick={togglePlay}
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{ 
              background: `linear-gradient(135deg, ${selectedChakra?.colorHex} 0%, ${selectedChakra?.colorHex}99 100%)`,
              boxShadow: `0 10px 40px ${selectedChakra?.colorHex}50`
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" fill="white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" fill="white" />
            )}
          </motion.button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="text-white/40 hover:text-white hover:bg-white/10 w-12 h-12"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </Button>
        </div>

        <div className="flex items-center justify-center gap-3 max-w-[200px] mx-auto">
          <VolumeX className="w-4 h-4 text-white/30" />
          <Slider
            value={[volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.01}
            className="flex-1"
          />
          <Volume2 className="w-4 h-4 text-white/30" />
        </div>
      </div>

      <AnimatePresence>
        {showChakraInfo && selectedChakra && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl rounded-t-3xl p-6 pb-[max(2rem,env(safe-area-inset-bottom))] max-h-[70vh] overflow-y-auto border-t border-white/10"
          >
            <button 
              onClick={() => setShowChakraInfo(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20"
            >
              <X className="w-5 h-5 text-white/60" />
            </button>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: selectedChakra.colorHex }}
                >
                  <span className="text-xl">{selectedChakra.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-white">{selectedChakra.name}</h3>
                  <p className="text-white/50">{selectedChakra.sanskrit}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/40 text-xs uppercase mb-1">Location</p>
                  <p className="text-white/80 text-sm">{selectedChakra.location}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/40 text-xs uppercase mb-1">Element</p>
                  <p className="text-white/80 text-sm">{selectedChakra.element}</p>
                </div>
              </div>
              
              <div className="bg-white/5 rounded-xl p-3">
                <p className="text-white/40 text-xs uppercase mb-1">Benefits</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {selectedChakra.benefits.map((benefit, i) => (
                    <span key={i} className="text-xs bg-white/10 text-white/70 px-2 py-1 rounded-full">
                      {benefit}
                    </span>
                  ))}
                </div>
              </div>
              
              <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor: `${selectedChakra.colorHex}15` }}
              >
                <p className="text-white/40 text-xs uppercase mb-2">Affirmation</p>
                <p className="text-white/90 italic">"{selectedChakra.affirmation}"</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ChakraMeditation;
