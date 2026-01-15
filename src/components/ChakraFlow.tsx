import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import ChakraHome from './ChakraHome';
import ChakraQuestionnaire from './ChakraQuestionnaire';
import ChakraResult from './ChakraResult';
import ChakraMeditation from './ChakraMeditation';
import ChakraLearnMore from './ChakraLearnMore';
import { Chakra } from '@/lib/chakras';
import { ChakraResult as ChakraResultType } from '@/lib/chakraQuestionnaire';

type FlowStep = 'home' | 'questionnaire' | 'result' | 'meditation' | 'learn-more';

interface ChakraFlowProps {
  onClose: () => void;
}

const ChakraFlow = ({ onClose }: ChakraFlowProps) => {
  const [currentStep, setCurrentStep] = useState<FlowStep>('home');
  const [selectedChakraId, setSelectedChakraId] = useState<string>('heart');
  const [questionnaireResult, setQuestionnaireResult] = useState<ChakraResultType | null>(null);

  // Handle navigation from home
  const handleSelectChakra = (chakra: Chakra) => {
    setSelectedChakraId(chakra.id);
    setCurrentStep('meditation');
  };

  const handleStartQuestionnaire = () => {
    setCurrentStep('questionnaire');
  };

  // Handle questionnaire completion
  const handleQuestionnaireComplete = (result: ChakraResultType) => {
    setQuestionnaireResult(result);
    setSelectedChakraId(result.primary.chakraId);
    setCurrentStep('result');
  };

  // Handle result actions
  const handleStartMeditation = (chakraId: string) => {
    setSelectedChakraId(chakraId);
    setCurrentStep('meditation');
  };

  const handleLearnMore = (chakraId: string) => {
    setSelectedChakraId(chakraId);
    setCurrentStep('learn-more');
  };

  // Handle back navigation
  const handleBack = () => {
    switch (currentStep) {
      case 'questionnaire':
        setCurrentStep('home');
        break;
      case 'result':
        setCurrentStep('questionnaire');
        break;
      case 'meditation':
        // If coming from result, go back to result, otherwise go home
        if (questionnaireResult) {
          setCurrentStep('result');
        } else {
          setCurrentStep('home');
        }
        break;
      case 'learn-more':
        if (questionnaireResult) {
          setCurrentStep('result');
        } else {
          setCurrentStep('home');
        }
        break;
      default:
        onClose();
    }
  };

  const handleCloseFromMeditation = () => {
    // Reset and close
    setCurrentStep('home');
    setQuestionnaireResult(null);
    onClose();
  };

  return (
    <AnimatePresence mode="wait">
      {currentStep === 'home' && (
        <ChakraHome
          key="home"
          onClose={onClose}
          onSelectChakra={handleSelectChakra}
          onStartQuestionnaire={handleStartQuestionnaire}
        />
      )}

      {currentStep === 'questionnaire' && (
        <ChakraQuestionnaire
          key="questionnaire"
          onClose={handleBack}
          onComplete={handleQuestionnaireComplete}
        />
      )}

      {currentStep === 'result' && questionnaireResult && (
        <ChakraResult
          key="result"
          result={questionnaireResult}
          onClose={handleBack}
          onStartMeditation={handleStartMeditation}
          onLearnMore={handleLearnMore}
        />
      )}

      {currentStep === 'meditation' && (
        <ChakraMeditation
          key="meditation"
          onClose={handleCloseFromMeditation}
          initialChakra={selectedChakraId}
        />
      )}

      {currentStep === 'learn-more' && (
        <ChakraLearnMore
          key="learn-more"
          chakraId={selectedChakraId}
          onClose={handleBack}
          onStartMeditation={() => {
            setCurrentStep('meditation');
          }}
        />
      )}
    </AnimatePresence>
  );
};

export default ChakraFlow;
