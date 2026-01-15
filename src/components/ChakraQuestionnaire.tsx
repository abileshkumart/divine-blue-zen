import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  chakraQuestions, 
  answerOptions, 
  QuestionnaireAnswer,
  ChakraResult,
  calculateChakraScores 
} from '@/lib/chakraQuestionnaire';
import { cn } from '@/lib/utils';

interface ChakraQuestionnaireProps {
  onClose: () => void;
  onComplete: (result: ChakraResult) => void;
}

const ChakraQuestionnaire = ({ onClose, onComplete }: ChakraQuestionnaireProps) => {
  const [currentIndex, setCurrentIndex] = useState(-1); // -1 is intro screen
  const [answers, setAnswers] = useState<QuestionnaireAnswer[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shuffledQuestions] = useState(() => {
    // Shuffle questions once on mount
    const shuffled = [...chakraQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  const totalQuestions = shuffledQuestions.length;
  const currentQuestion = currentIndex >= 0 ? shuffledQuestions[currentIndex] : null;
  const progress = currentIndex >= 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const handleAnswer = (value: number) => {
    if (!currentQuestion || isTransitioning) return;

    setIsTransitioning(true);

    // Save answer
    const newAnswer: QuestionnaireAnswer = {
      questionId: currentQuestion.id,
      chakraId: currentQuestion.chakraId,
      value
    };

    const existingIndex = answers.findIndex(a => a.questionId === currentQuestion.id);
    const updatedAnswers = existingIndex >= 0
      ? answers.map((a, i) => i === existingIndex ? newAnswer : a)
      : [...answers, newAnswer];

    setAnswers(updatedAnswers);

    // Transition to next question
    setTimeout(() => {
      if (currentIndex < totalQuestions - 1) {
        setCurrentIndex(prev => prev + 1);
      } else {
        // Calculate and show results
        const result = calculateChakraScores(updatedAnswers);
        onComplete(result);
      }
      setIsTransitioning(false);
    }, 300);
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else if (currentIndex === 0) {
      setCurrentIndex(-1);
    } else {
      onClose();
    }
  };

  const handleStart = () => {
    setCurrentIndex(0);
  };

  // Calm gradient backgrounds based on progress - solid backgrounds
  const getBackgroundGradient = () => {
    if (currentIndex < 0) return 'from-slate-950 via-indigo-950 to-slate-950';
    const progressSection = Math.floor((currentIndex / totalQuestions) * 7);
    const gradients = [
      'from-slate-950 via-red-950 to-slate-950',
      'from-slate-950 via-orange-950 to-slate-950',
      'from-slate-950 via-yellow-950 to-slate-950',
      'from-slate-950 via-green-950 to-slate-950',
      'from-slate-950 via-blue-950 to-slate-950',
      'from-slate-950 via-purple-950 to-slate-950',
      'from-slate-950 via-violet-950 to-slate-950',
    ];
    return gradients[progressSection] || gradients[0];
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-gradient-to-b transition-all duration-700",
        getBackgroundGradient()
      )}
    >
      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack} 
          className="text-white/60 hover:text-white hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        
        {currentIndex >= 0 && (
          <span className="text-white/40 text-sm">
            {currentIndex + 1} of {totalQuestions}
          </span>
        )}
        
        <div className="w-10" />
      </header>

      {/* Progress Bar */}
      {currentIndex >= 0 && (
        <div className="px-6">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-safe">
        <AnimatePresence mode="wait">
          {currentIndex < 0 ? (
            /* Intro Screen */
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md text-center space-y-8"
            >
              {/* Icon */}
              <motion.div 
                className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-10 h-10 text-purple-300" />
              </motion.div>

              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-2xl font-light text-white leading-relaxed">
                  Let's find the energy center that needs your attention
                </h1>
                <p className="text-white/50 text-base leading-relaxed">
                  Answer a few simple questions based on how you've been feeling recently. 
                  This will help us guide you to the chakra that needs care.
                </p>
              </div>

              {/* What to expect */}
              <div className="bg-white/5 rounded-2xl p-4 text-left space-y-3">
                <p className="text-white/70 text-sm">
                  ✨ {totalQuestions} simple questions
                </p>
                <p className="text-white/70 text-sm">
                  🕐 Takes about 3-4 minutes
                </p>
                <p className="text-white/70 text-sm">
                  🌿 Based on how you feel, not what you know
                </p>
              </div>

              {/* Start Button */}
              <motion.button
                onClick={handleStart}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium flex items-center justify-center gap-3 shadow-lg shadow-purple-500/25"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>Begin Assessment</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          ) : (
            /* Question Screen */
            <motion.div
              key={`question-${currentIndex}`}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md space-y-10"
            >
              {/* Question */}
              <div className="text-center">
                <motion.p 
                  className="text-2xl font-light text-white leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {currentQuestion?.question}
                </motion.p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {answerOptions.map((option, index) => (
                  <motion.button
                    key={option.value}
                    onClick={() => handleAnswer(option.value)}
                    className={cn(
                      "w-full py-4 px-5 rounded-2xl text-left transition-all",
                      "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20",
                      "text-white/80 hover:text-white"
                    )}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isTransitioning}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-medium">
                        {option.value}
                      </div>
                      <span className="font-medium">{option.label}</span>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Skip hint */}
              <p className="text-center text-white/30 text-sm">
                Tap your answer to continue
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ChakraQuestionnaire;
