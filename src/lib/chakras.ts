export interface Chakra {
  id: string;
  number: number;
  name: string;
  sanskrit: string;
  location: string;
  color: string;
  colorHex: string;
  gradientFrom: string;
  gradientTo: string;
  frequency: number;
  mantra: string;
  element: string;
  benefits: string[];
  affirmation: string;
  bodyParts: string[];
  emotionalAspects: string[];
  icon: string;
}

export const chakras: Chakra[] = [
  {
    id: 'root',
    number: 1,
    name: 'Root',
    sanskrit: 'Muladhara',
    location: 'Base of spine',
    color: 'Red',
    colorHex: '#DC2626',
    gradientFrom: 'from-red-600',
    gradientTo: 'to-red-900',
    frequency: 396,
    mantra: 'LAM',
    element: 'Earth',
    benefits: ['Grounding', 'Stability', 'Security', 'Physical energy'],
    affirmation: 'I am safe, grounded, and connected to the earth.',
    bodyParts: ['Spine', 'Legs', 'Feet', 'Bones', 'Adrenal glands'],
    emotionalAspects: ['Safety', 'Survival', 'Trust', 'Belonging'],
    icon: '🔴'
  },
  {
    id: 'sacral',
    number: 2,
    name: 'Sacral',
    sanskrit: 'Svadhisthana',
    location: 'Lower abdomen',
    color: 'Orange',
    colorHex: '#EA580C',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-orange-800',
    frequency: 417,
    mantra: 'VAM',
    element: 'Water',
    benefits: ['Creativity', 'Pleasure', 'Emotional balance', 'Sensuality'],
    affirmation: 'I embrace pleasure, creativity, and abundance.',
    bodyParts: ['Reproductive organs', 'Bladder', 'Kidneys', 'Lower back'],
    emotionalAspects: ['Emotions', 'Creativity', 'Sexuality', 'Joy'],
    icon: '🟠'
  },
  {
    id: 'solar',
    number: 3,
    name: 'Solar Plexus',
    sanskrit: 'Manipura',
    location: 'Upper abdomen',
    color: 'Yellow',
    colorHex: '#CA8A04',
    gradientFrom: 'from-yellow-500',
    gradientTo: 'to-amber-700',
    frequency: 528,
    mantra: 'RAM',
    element: 'Fire',
    benefits: ['Confidence', 'Personal power', 'Self-esteem', 'Willpower'],
    affirmation: 'I am confident, powerful, and in control of my life.',
    bodyParts: ['Digestive system', 'Stomach', 'Liver', 'Pancreas'],
    emotionalAspects: ['Confidence', 'Self-worth', 'Personal power', 'Identity'],
    icon: '🟡'
  },
  {
    id: 'heart',
    number: 4,
    name: 'Heart',
    sanskrit: 'Anahata',
    location: 'Center of chest',
    color: 'Green',
    colorHex: '#16A34A',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-emerald-800',
    frequency: 639,
    mantra: 'YAM',
    element: 'Air',
    benefits: ['Love', 'Compassion', 'Forgiveness', 'Inner peace'],
    affirmation: 'I give and receive love freely and unconditionally.',
    bodyParts: ['Heart', 'Lungs', 'Chest', 'Arms', 'Hands'],
    emotionalAspects: ['Love', 'Compassion', 'Forgiveness', 'Connection'],
    icon: '💚'
  },
  {
    id: 'throat',
    number: 5,
    name: 'Throat',
    sanskrit: 'Vishuddha',
    location: 'Throat',
    color: 'Blue',
    colorHex: '#2563EB',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-800',
    frequency: 741,
    mantra: 'HAM',
    element: 'Ether',
    benefits: ['Communication', 'Expression', 'Truth', 'Authenticity'],
    affirmation: 'I speak my truth with clarity, love, and confidence.',
    bodyParts: ['Throat', 'Thyroid', 'Neck', 'Mouth', 'Ears'],
    emotionalAspects: ['Communication', 'Self-expression', 'Truth', 'Purpose'],
    icon: '��'
  },
  {
    id: 'third-eye',
    number: 6,
    name: 'Third Eye',
    sanskrit: 'Ajna',
    location: 'Between eyebrows',
    color: 'Purple',
    colorHex: '#9333EA',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-pink-700',
    frequency: 852,
    mantra: 'OM',
    element: 'Light',
    benefits: ['Intuition', 'Wisdom', 'Insight', 'Inner vision'],
    affirmation: 'I trust my intuition and see clearly with my inner eye.',
    bodyParts: ['Brain', 'Eyes', 'Pituitary gland', 'Pineal gland'],
    emotionalAspects: ['Intuition', 'Imagination', 'Wisdom', 'Clarity'],
    icon: '🟣'
  },
  {
    id: 'crown',
    number: 7,
    name: 'Crown',
    sanskrit: 'Sahasrara',
    location: 'Top of head',
    color: 'White',
    colorHex: '#A855F7',
    gradientFrom: 'from-violet-400',
    gradientTo: 'to-purple-200',
    frequency: 963,
    mantra: 'Silent OM',
    element: 'Cosmic Energy',
    benefits: ['Spiritual connection', 'Enlightenment', 'Unity', 'Divine consciousness'],
    affirmation: 'I am connected to the infinite source of divine wisdom.',
    bodyParts: ['Brain', 'Nervous system', 'Pineal gland', 'Crown of head'],
    emotionalAspects: ['Spirituality', 'Enlightenment', 'Bliss', 'Oneness'],
    icon: '⚪'
  }
];

export const getChakraById = (id: string): Chakra | undefined => {
  return chakras.find(c => c.id === id);
};

export const getChakraByNumber = (num: number): Chakra | undefined => {
  return chakras.find(c => c.number === num);
};
