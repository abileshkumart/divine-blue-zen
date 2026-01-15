// Chakra Questionnaire - Spiritual Assessment
// Each chakra has 4 questions with a 5-point scale

export interface ChakraQuestion {
  id: string;
  chakraId: string;
  question: string;
}

export interface QuestionnaireAnswer {
  questionId: string;
  chakraId: string;
  value: number; // 1-5
}

export interface ChakraScore {
  chakraId: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface ChakraResult {
  primary: ChakraScore;
  secondary: ChakraScore;
  allScores: ChakraScore[];
}

// Answer options with their values
export const answerOptions = [
  { label: 'Not at all', value: 1 },
  { label: 'Rarely', value: 2 },
  { label: 'Sometimes', value: 3 },
  { label: 'Often', value: 4 },
  { label: 'Almost always', value: 5 },
];

// Chakra questions in spiritual, easy language
export const chakraQuestions: ChakraQuestion[] = [
  // Root Chakra – Safety & Grounding
  { id: 'root-1', chakraId: 'root', question: 'I feel safe and supported in my life' },
  { id: 'root-2', chakraId: 'root', question: 'I feel calm about my future' },
  { id: 'root-3', chakraId: 'root', question: 'I feel connected to my body and surroundings' },
  { id: 'root-4', chakraId: 'root', question: 'I feel stable in my daily routine' },

  // Sacral Chakra – Joy & Emotions
  { id: 'sacral-1', chakraId: 'sacral', question: 'I allow myself to feel joy' },
  { id: 'sacral-2', chakraId: 'sacral', question: 'I feel emotionally balanced' },
  { id: 'sacral-3', chakraId: 'sacral', question: 'I express my emotions freely' },
  { id: 'sacral-4', chakraId: 'sacral', question: 'I feel creative or inspired' },

  // Solar Plexus Chakra – Confidence & Power
  { id: 'solar-1', chakraId: 'solar', question: 'I trust myself and my choices' },
  { id: 'solar-2', chakraId: 'solar', question: 'I feel confident being myself' },
  { id: 'solar-3', chakraId: 'solar', question: 'I feel motivated and energetic' },
  { id: 'solar-4', chakraId: 'solar', question: 'I set healthy boundaries' },

  // Heart Chakra – Love & Connection
  { id: 'heart-1', chakraId: 'heart', question: 'I feel open to giving and receiving love' },
  { id: 'heart-2', chakraId: 'heart', question: 'I feel at peace with my past' },
  { id: 'heart-3', chakraId: 'heart', question: 'I am kind to myself' },
  { id: 'heart-4', chakraId: 'heart', question: 'I feel connected to others' },

  // Throat Chakra – Expression & Truth
  { id: 'throat-1', chakraId: 'throat', question: 'I express my thoughts clearly' },
  { id: 'throat-2', chakraId: 'throat', question: 'I feel heard when I speak' },
  { id: 'throat-3', chakraId: 'throat', question: 'I speak honestly and calmly' },
  { id: 'throat-4', chakraId: 'throat', question: 'I communicate with ease' },

  // Third Eye Chakra – Clarity & Intuition
  { id: 'third-eye-1', chakraId: 'third-eye', question: 'I trust my inner guidance' },
  { id: 'third-eye-2', chakraId: 'third-eye', question: 'I feel mentally clear' },
  { id: 'third-eye-3', chakraId: 'third-eye', question: 'I listen to my intuition' },
  { id: 'third-eye-4', chakraId: 'third-eye', question: 'I make decisions with clarity' },

  // Crown Chakra – Purpose & Awareness
  { id: 'crown-1', chakraId: 'crown', question: 'I feel connected to a deeper purpose' },
  { id: 'crown-2', chakraId: 'crown', question: 'I feel inner peace' },
  { id: 'crown-3', chakraId: 'crown', question: 'I feel aligned with life' },
  { id: 'crown-4', chakraId: 'crown', question: 'I experience stillness within' },
];

// Shuffle questions for a mixed experience (but keep them grouped for analysis)
export const getShuffledQuestions = (): ChakraQuestion[] => {
  const shuffled = [...chakraQuestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Calculate chakra scores from answers
export const calculateChakraScores = (answers: QuestionnaireAnswer[]): ChakraResult => {
  const chakraIds = ['root', 'sacral', 'solar', 'heart', 'throat', 'third-eye', 'crown'];
  
  const scores: ChakraScore[] = chakraIds.map(chakraId => {
    const chakraAnswers = answers.filter(a => a.chakraId === chakraId);
    const totalScore = chakraAnswers.reduce((sum, a) => sum + a.value, 0);
    const maxScore = 20; // 4 questions × 5 max points
    
    return {
      chakraId,
      score: totalScore,
      maxScore,
      percentage: Math.round((totalScore / maxScore) * 100)
    };
  });

  // Sort by score (ascending) - lowest score needs most attention
  const sortedScores = [...scores].sort((a, b) => a.score - b.score);

  return {
    primary: sortedScores[0], // Chakra needing most attention
    secondary: sortedScores[1], // Supporting chakra
    allScores: scores
  };
};

// Get healing message for a chakra
export const getChakraHealingMessage = (chakraId: string): { title: string; message: string } => {
  const messages: Record<string, { title: string; message: string }> = {
    'root': {
      title: 'Your Root Chakra is calling for balance',
      message: 'This energy center is connected to safety, stability, and grounding. A gentle meditation can help restore your sense of security.'
    },
    'sacral': {
      title: 'Your Sacral Chakra is calling for balance',
      message: 'This energy center is connected to emotions, creativity, and joy. A gentle meditation can help restore your emotional flow.'
    },
    'solar': {
      title: 'Your Solar Plexus Chakra is calling for balance',
      message: 'This energy center is connected to confidence, self-belief, and inner strength. A gentle meditation can help restore your personal power.'
    },
    'heart': {
      title: 'Your Heart Chakra is calling for balance',
      message: 'This energy center is connected to love, compassion, and connection. A gentle meditation can help open your heart to give and receive love.'
    },
    'throat': {
      title: 'Your Throat Chakra is calling for balance',
      message: 'This energy center is connected to expression, truth, and communication. A gentle meditation can help you speak your truth clearly.'
    },
    'third-eye': {
      title: 'Your Third Eye Chakra is calling for balance',
      message: 'This energy center is connected to intuition, clarity, and inner wisdom. A gentle meditation can help sharpen your inner vision.'
    },
    'crown': {
      title: 'Your Crown Chakra is calling for balance',
      message: 'This energy center is connected to purpose, awareness, and spiritual connection. A gentle meditation can help you find deeper meaning.'
    }
  };

  return messages[chakraId] || messages['heart'];
};

// Get emotional keyword for each chakra
export const getChakraKeyword = (chakraId: string): string => {
  const keywords: Record<string, string> = {
    'root': 'Stability',
    'sacral': 'Joy',
    'solar': 'Confidence',
    'heart': 'Love',
    'throat': 'Expression',
    'third-eye': 'Clarity',
    'crown': 'Purpose'
  };
  return keywords[chakraId] || 'Balance';
};
