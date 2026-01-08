// Gut Health Data & Logic for India-focused wellness app

// ===================
// GUT TYPES
// ===================
export interface GutType {
  id: string;
  name: string;
  nameHindi: string;
  emoji: string;
  color: string;
  description: string;
  descriptionShort: string;
  characteristics: string[];
  actionPoints: string[];
  avoidFoods: string[];
  recommendedFoods: string[];
  lifestyle: string[];
}

export const gutTypes: Record<string, GutType> = {
  balanced: {
    id: "balanced",
    name: "Balanced Gut",
    nameHindi: "संतुलित पेट",
    emoji: "⚖️",
    color: "from-green-500/20 to-emerald-500/20",
    description: "Your gut is in good balance with healthy diversity of microbiome. Focus on maintaining this harmony through consistent habits.",
    descriptionShort: "Well-balanced microbiome with good diversity",
    characteristics: [
      "Regular bowel movements (1-2 times daily)",
      "Minimal bloating or discomfort",
      "Good energy after meals",
      "Strong immunity"
    ],
    actionPoints: [
      "Continue varied diet with seasonal foods",
      "Include fermented foods daily (curd, kanji)",
      "Stay hydrated with warm water"
    ],
    avoidFoods: ["Excessive processed foods", "Too much sugar", "Late night heavy meals"],
    recommendedFoods: ["Seasonal fruits", "Whole grains (millets, rice)", "Dal varieties", "Fresh vegetables", "Curd/Buttermilk"],
    lifestyle: ["Regular meal times", "30 min daily walk", "7-8 hours sleep"]
  },
  fiery: {
    id: "fiery",
    name: "Fiery Gut (Pitta)",
    nameHindi: "तेज पाचन",
    emoji: "🔥",
    color: "from-orange-500/20 to-red-500/20",
    description: "You have strong digestive fire but may be prone to acidity, heartburn, and inflammation. Your gut processes food quickly but can get irritated easily.",
    descriptionShort: "Strong digestion prone to acidity & inflammation",
    characteristics: [
      "Strong appetite, gets irritable when hungry",
      "Prone to acidity and heartburn",
      "Loose stools when stressed",
      "Sensitive to spicy foods"
    ],
    actionPoints: [
      "Avoid spicy, sour, and fried foods",
      "Eat cooling foods: coconut, cucumber, ghee",
      "Don't skip meals - eat at regular times"
    ],
    avoidFoods: ["Red chilies", "Pickles (achar)", "Citrus fruits", "Tomatoes", "Fried foods", "Coffee", "Alcohol"],
    recommendedFoods: ["Coconut water", "Cucumber raita", "Bottle gourd (lauki)", "Mint chutney", "Ghee", "Moong dal", "Rice"],
    lifestyle: ["Avoid eating when angry", "Cool down before meals", "Avoid midday sun exposure"]
  },
  airy: {
    id: "airy",
    name: "Airy Gut (Vata)",
    nameHindi: "वायु प्रधान",
    emoji: "🌬️",
    color: "from-sky-500/20 to-blue-500/20",
    description: "Your digestion tends to be irregular with gas and bloating as common issues. The gut-brain axis is sensitive, and stress affects your digestion significantly.",
    descriptionShort: "Irregular digestion with gas & bloating",
    characteristics: [
      "Variable appetite",
      "Frequent gas and bloating",
      "Irregular bowel movements",
      "Digestion affected by stress/anxiety"
    ],
    actionPoints: [
      "Eat warm, cooked, slightly oily foods",
      "Maintain strict meal timings",
      "Avoid raw salads and cold drinks"
    ],
    avoidFoods: ["Raw vegetables", "Cold drinks", "Beans (rajma, chole)", "Cabbage family", "Carbonated drinks", "Dry snacks"],
    recommendedFoods: ["Khichdi", "Warm soups", "Cooked vegetables", "Ghee", "Ginger tea", "Ajwain water", "Bananas"],
    lifestyle: ["Eat in calm environment", "Chew food thoroughly", "Warm oil massage on belly"]
  },
  slow: {
    id: "slow",
    name: "Slow Gut (Kapha)",
    nameHindi: "मंद पाचन",
    emoji: "🐢",
    color: "from-amber-500/20 to-yellow-500/20",
    description: "Your digestion is sluggish and you may feel heavy after meals. Prone to constipation and weight gain. Metabolism needs regular stimulation.",
    descriptionShort: "Sluggish digestion, prone to heaviness",
    characteristics: [
      "Slow metabolism",
      "Feeling heavy after meals",
      "Constipation tendency",
      "Low appetite in morning"
    ],
    actionPoints: [
      "Eat light, warm, spiced foods",
      "Practice intermittent fasting (skip heavy dinner)",
      "Include digestive spices: ginger, cumin, black pepper"
    ],
    avoidFoods: ["Heavy dairy (paneer, cheese)", "Fried foods", "Sweets", "Cold foods", "Excess rice", "Bananas"],
    recommendedFoods: ["Warm lemon water", "Light dal", "Steamed vegetables", "Millets (ragi, jowar)", "Ginger", "Honey", "Sprouts"],
    lifestyle: ["Morning exercise essential", "Eat largest meal at lunch", "Light dinner before 7 PM"]
  },
  inflamed: {
    id: "inflamed",
    name: "Sensitive/IBS-Prone",
    nameHindi: "संवेदनशील",
    emoji: "🔴",
    color: "from-rose-500/20 to-pink-500/20",
    description: "Your gut lining may be irritated with symptoms of IBS. Certain foods trigger strong reactions. Focus on healing and soothing the gut.",
    descriptionShort: "Irritated gut lining, food sensitivities",
    characteristics: [
      "Alternating constipation and loose stools",
      "Abdominal pain or cramping",
      "Food sensitivities",
      "Mucus in stool occasionally"
    ],
    actionPoints: [
      "Follow low-FODMAP diet initially",
      "Keep a food diary to identify triggers",
      "Include gut-healing foods: ghee, bone broth, aloe"
    ],
    avoidFoods: ["Wheat/gluten", "Onion & garlic (initially)", "Milk", "Beans & lentils", "Apples, mangoes", "Spicy foods"],
    recommendedFoods: ["Rice", "Ghee", "Well-cooked vegetables", "Coconut", "Fennel tea", "Papaya", "Pumpkin"],
    lifestyle: ["Stress management crucial", "Eat slowly", "Avoid eating when upset"]
  },
  lowFermenter: {
    id: "lowFermenter",
    name: "Low Diversity Gut",
    nameHindi: "कम विविधता",
    emoji: "🌱",
    color: "from-lime-500/20 to-green-500/20",
    description: "Your gut microbiome needs more diversity. Limited beneficial bacteria variety due to diet or antibiotic use. Focus on rebuilding gut flora.",
    descriptionShort: "Low microbiome diversity, needs rebuilding",
    characteristics: [
      "Weak immunity, frequent colds",
      "Low energy levels",
      "Recent antibiotic use",
      "Limited diet variety"
    ],
    actionPoints: [
      "Eat 30+ different plant foods weekly",
      "Include fermented foods daily",
      "Add prebiotic fibers (banana, onion, garlic)"
    ],
    avoidFoods: ["Processed foods", "Refined sugar", "Artificial sweeteners", "Excessive antibiotics"],
    recommendedFoods: ["Variety of vegetables", "Curd & buttermilk", "Idli/dosa (fermented)", "Kanji", "Pickled vegetables", "Different dals daily"],
    lifestyle: ["Spend time in nature", "Reduce stress", "Get adequate sleep"]
  }
};

// ===================
// RECIPES
// ===================
export interface Recipe {
  id: string;
  name: string;
  nameHindi?: string;
  description: string;
  image?: string;
  region: string;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  prepTime: number; // minutes
  cookTime: number; // minutes
  servings: number;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  suitableFor: string[]; // gut type IDs
  ingredients: { item: string; quantity: string; substitute?: string }[];
  instructions: string[];
  nutritionPer100g?: {
    calories: number;
    protein: number;
    fiber: number;
    carbs: number;
  };
  cost: "low" | "medium" | "high";
  isVegetarian: boolean;
  isVegan: boolean;
  allergens: string[];
}

export const recipes: Recipe[] = [
  // BREAKFAST
  {
    id: "moong-dal-chilla",
    name: "Moong Dal Chilla",
    nameHindi: "मूंग दाल चीला",
    description: "Protein-rich savory pancakes made from soaked moong dal. Easy to digest and gut-friendly.",
    region: "North India",
    mealType: "breakfast",
    prepTime: 10,
    cookTime: 15,
    servings: 2,
    difficulty: "easy",
    tags: ["high-protein", "prebiotic", "low-FODMAP", "gluten-free"],
    suitableFor: ["balanced", "fiery", "inflamed", "slow"],
    ingredients: [
      { item: "Yellow moong dal (soaked)", quantity: "1 cup" },
      { item: "Ginger", quantity: "1 inch" },
      { item: "Green chili", quantity: "1", substitute: "Skip for inflamed gut" },
      { item: "Cumin seeds", quantity: "½ tsp" },
      { item: "Salt", quantity: "to taste" },
      { item: "Ghee/oil", quantity: "for cooking" }
    ],
    instructions: [
      "Soak moong dal for 4-6 hours or overnight",
      "Blend dal with ginger, chili, and minimal water to smooth batter",
      "Add cumin and salt, mix well",
      "Heat tawa, add ghee, pour batter in thin circle",
      "Cook on medium heat until golden, flip and cook other side",
      "Serve hot with mint chutney or curd"
    ],
    nutritionPer100g: { calories: 120, protein: 8, fiber: 4, carbs: 18 },
    cost: "low",
    isVegetarian: true,
    isVegan: false,
    allergens: []
  },
  {
    id: "poha",
    name: "Poha (Flattened Rice)",
    nameHindi: "पोहा",
    description: "Light and fluffy flattened rice with peanuts and mild spices. Perfect for gentle digestion.",
    region: "Maharashtra/MP",
    mealType: "breakfast",
    prepTime: 5,
    cookTime: 10,
    servings: 2,
    difficulty: "easy",
    tags: ["light", "prebiotic", "easy-digest", "gluten-free"],
    suitableFor: ["balanced", "airy", "slow"],
    ingredients: [
      { item: "Thick poha", quantity: "1 cup" },
      { item: "Peanuts", quantity: "2 tbsp" },
      { item: "Mustard seeds", quantity: "½ tsp" },
      { item: "Curry leaves", quantity: "8-10" },
      { item: "Turmeric", quantity: "¼ tsp" },
      { item: "Onion (chopped)", quantity: "1 small", substitute: "Skip for inflamed/IBS" },
      { item: "Green chili", quantity: "1" },
      { item: "Lemon juice", quantity: "1 tbsp" }
    ],
    instructions: [
      "Rinse poha in water, drain and set aside for 5 mins",
      "Heat oil, add mustard seeds and let splutter",
      "Add peanuts, curry leaves, green chili",
      "Add onion, sauté until translucent",
      "Add turmeric, salt, and poha",
      "Mix gently, cover and cook 2 mins",
      "Add lemon juice, garnish with coriander"
    ],
    nutritionPer100g: { calories: 130, protein: 3, fiber: 2, carbs: 25 },
    cost: "low",
    isVegetarian: true,
    isVegan: true,
    allergens: ["peanuts"]
  },
  {
    id: "ragi-porridge",
    name: "Ragi Porridge",
    nameHindi: "रागी दलिया",
    description: "Nutritious finger millet porridge rich in calcium and fiber. Great for slow gut types.",
    region: "Karnataka/South",
    mealType: "breakfast",
    prepTime: 5,
    cookTime: 10,
    servings: 1,
    difficulty: "easy",
    tags: ["high-fiber", "prebiotic", "gluten-free", "millet"],
    suitableFor: ["slow", "balanced", "lowFermenter"],
    ingredients: [
      { item: "Ragi flour", quantity: "3 tbsp" },
      { item: "Water", quantity: "1 cup" },
      { item: "Jaggery/honey", quantity: "1 tbsp", substitute: "Dates for diabetics" },
      { item: "Cardamom powder", quantity: "¼ tsp" },
      { item: "Ghee", quantity: "1 tsp" }
    ],
    instructions: [
      "Mix ragi flour with ½ cup cold water to avoid lumps",
      "Boil remaining water in a pan",
      "Slowly pour ragi mixture while stirring continuously",
      "Cook on low heat for 5-7 mins until thick",
      "Add jaggery and cardamom, mix well",
      "Serve warm topped with ghee"
    ],
    nutritionPer100g: { calories: 110, protein: 4, fiber: 5, carbs: 22 },
    cost: "low",
    isVegetarian: true,
    isVegan: false,
    allergens: []
  },
  {
    id: "idli-sambar",
    name: "Idli with Sambar",
    nameHindi: "इडली सांभर",
    description: "Steamed fermented rice cakes with lentil vegetable stew. Probiotic-rich and easy to digest.",
    region: "South India",
    mealType: "breakfast",
    prepTime: 20,
    cookTime: 20,
    servings: 4,
    difficulty: "medium",
    tags: ["probiotic", "fermented", "protein-rich", "steamed"],
    suitableFor: ["balanced", "airy", "lowFermenter"],
    ingredients: [
      { item: "Idli rice", quantity: "2 cups" },
      { item: "Urad dal", quantity: "1 cup" },
      { item: "Salt", quantity: "1 tsp" },
      { item: "Toor dal (for sambar)", quantity: "½ cup" },
      { item: "Sambar powder", quantity: "1 tbsp" },
      { item: "Mixed vegetables", quantity: "1 cup" },
      { item: "Tamarind", quantity: "small ball" }
    ],
    instructions: [
      "Soak rice and dal separately for 6 hours",
      "Grind to smooth batter, ferment overnight",
      "Add salt, pour in idli molds, steam 12-15 mins",
      "For sambar: cook dal with vegetables",
      "Add tamarind water and sambar powder",
      "Temper with mustard, curry leaves, serve hot"
    ],
    nutritionPer100g: { calories: 90, protein: 4, fiber: 2, carbs: 18 },
    cost: "low",
    isVegetarian: true,
    isVegan: true,
    allergens: []
  },
  // LUNCH
  {
    id: "khichdi",
    name: "Classic Khichdi",
    nameHindi: "खिचड़ी",
    description: "The ultimate comfort food - rice and lentils cooked together with mild spices. Healing and easy to digest.",
    region: "Pan India",
    mealType: "lunch",
    prepTime: 10,
    cookTime: 25,
    servings: 2,
    difficulty: "easy",
    tags: ["healing", "easy-digest", "protein", "one-pot", "low-FODMAP"],
    suitableFor: ["airy", "inflamed", "balanced", "fiery"],
    ingredients: [
      { item: "Rice", quantity: "½ cup" },
      { item: "Yellow moong dal", quantity: "½ cup" },
      { item: "Ghee", quantity: "2 tbsp" },
      { item: "Cumin seeds", quantity: "1 tsp" },
      { item: "Turmeric", quantity: "½ tsp" },
      { item: "Ginger (grated)", quantity: "1 tsp" },
      { item: "Salt", quantity: "to taste" },
      { item: "Water", quantity: "3 cups" }
    ],
    instructions: [
      "Wash rice and dal together, soak 20 mins",
      "Heat ghee in pressure cooker, add cumin seeds",
      "Add ginger, turmeric, sauté 30 seconds",
      "Add rice, dal, salt, and water",
      "Pressure cook for 3-4 whistles",
      "Mash slightly, serve with extra ghee and pickle"
    ],
    nutritionPer100g: { calories: 140, protein: 5, fiber: 3, carbs: 22 },
    cost: "low",
    isVegetarian: true,
    isVegan: false,
    allergens: []
  },
  {
    id: "lauki-sabzi",
    name: "Lauki Sabzi (Bottle Gourd)",
    nameHindi: "लौकी की सब्जी",
    description: "Cooling bottle gourd curry, excellent for fiery gut types. Light and hydrating.",
    region: "North India",
    mealType: "lunch",
    prepTime: 10,
    cookTime: 15,
    servings: 3,
    difficulty: "easy",
    tags: ["cooling", "hydrating", "low-calorie", "easy-digest"],
    suitableFor: ["fiery", "balanced", "inflamed"],
    ingredients: [
      { item: "Bottle gourd (lauki)", quantity: "500g" },
      { item: "Tomato", quantity: "1 medium" },
      { item: "Cumin seeds", quantity: "1 tsp" },
      { item: "Coriander powder", quantity: "1 tsp" },
      { item: "Ghee", quantity: "1 tbsp" },
      { item: "Fresh coriander", quantity: "for garnish" }
    ],
    instructions: [
      "Peel and chop lauki into cubes",
      "Heat ghee, add cumin seeds",
      "Add tomato, cook until soft",
      "Add lauki, coriander powder, salt",
      "Cover and cook until tender (10-12 mins)",
      "Garnish with fresh coriander"
    ],
    nutritionPer100g: { calories: 45, protein: 1, fiber: 2, carbs: 8 },
    cost: "low",
    isVegetarian: true,
    isVegan: false,
    allergens: []
  },
  {
    id: "dal-tadka",
    name: "Dal Tadka",
    nameHindi: "दाल तड़का",
    description: "Yellow lentils with aromatic tempering. Protein-rich staple good for most gut types.",
    region: "Pan India",
    mealType: "lunch",
    prepTime: 10,
    cookTime: 25,
    servings: 4,
    difficulty: "easy",
    tags: ["protein-rich", "prebiotic", "comfort-food"],
    suitableFor: ["balanced", "slow", "lowFermenter"],
    ingredients: [
      { item: "Toor dal or moong dal", quantity: "1 cup" },
      { item: "Turmeric", quantity: "½ tsp" },
      { item: "Ghee", quantity: "2 tbsp" },
      { item: "Cumin seeds", quantity: "1 tsp" },
      { item: "Garlic (sliced)", quantity: "4 cloves" },
      { item: "Dry red chili", quantity: "2" },
      { item: "Tomato", quantity: "1 medium" }
    ],
    instructions: [
      "Wash dal, cook with turmeric until soft",
      "Mash lightly with spoon",
      "Heat ghee for tadka, add cumin",
      "Add garlic, red chili, sauté until golden",
      "Add chopped tomato, cook 2 mins",
      "Pour tadka over dal, mix and serve"
    ],
    nutritionPer100g: { calories: 120, protein: 8, fiber: 4, carbs: 18 },
    cost: "low",
    isVegetarian: true,
    isVegan: false,
    allergens: []
  },
  // DINNER
  {
    id: "vegetable-soup",
    name: "Mixed Vegetable Soup",
    nameHindi: "सब्जी का सूप",
    description: "Light and nourishing vegetable soup with Indian spices. Perfect light dinner.",
    region: "Pan India",
    mealType: "dinner",
    prepTime: 10,
    cookTime: 20,
    servings: 2,
    difficulty: "easy",
    tags: ["light", "hydrating", "low-calorie", "easy-digest"],
    suitableFor: ["slow", "airy", "balanced", "inflamed"],
    ingredients: [
      { item: "Mixed vegetables", quantity: "2 cups" },
      { item: "Ginger", quantity: "1 inch" },
      { item: "Garlic", quantity: "2 cloves" },
      { item: "Black pepper", quantity: "½ tsp" },
      { item: "Ghee", quantity: "1 tsp" },
      { item: "Vegetable stock/water", quantity: "3 cups" }
    ],
    instructions: [
      "Chop all vegetables into small pieces",
      "Heat ghee, sauté ginger and garlic",
      "Add vegetables, sauté 2 mins",
      "Add water/stock, bring to boil",
      "Simmer until vegetables are soft",
      "Blend partially or serve chunky with pepper"
    ],
    nutritionPer100g: { calories: 35, protein: 1, fiber: 2, carbs: 6 },
    cost: "low",
    isVegetarian: true,
    isVegan: false,
    allergens: []
  },
  {
    id: "dahi-rice",
    name: "Curd Rice (Thayir Sadam)",
    nameHindi: "दही चावल",
    description: "Probiotic-rich curd mixed with rice and tempered with mustard. Cooling and soothing.",
    region: "South India",
    mealType: "dinner",
    prepTime: 5,
    cookTime: 5,
    servings: 2,
    difficulty: "easy",
    tags: ["probiotic", "cooling", "fermented", "quick"],
    suitableFor: ["fiery", "balanced", "lowFermenter"],
    ingredients: [
      { item: "Cooked rice", quantity: "1 cup" },
      { item: "Fresh curd", quantity: "1 cup" },
      { item: "Milk", quantity: "¼ cup" },
      { item: "Mustard seeds", quantity: "½ tsp" },
      { item: "Curry leaves", quantity: "8-10" },
      { item: "Green chili", quantity: "1" },
      { item: "Ginger", quantity: "½ inch" }
    ],
    instructions: [
      "Mix warm rice with curd and milk",
      "Add salt and mash slightly",
      "Heat oil, add mustard seeds, let splutter",
      "Add curry leaves, green chili, ginger",
      "Pour tempering over rice",
      "Mix well and serve room temperature or cold"
    ],
    nutritionPer100g: { calories: 110, protein: 4, fiber: 0, carbs: 20 },
    cost: "low",
    isVegetarian: true,
    isVegan: false,
    allergens: ["dairy"]
  },
  // SNACKS
  {
    id: "buttermilk",
    name: "Masala Chaas (Buttermilk)",
    nameHindi: "मसाला छाछ",
    description: "Spiced probiotic buttermilk. Excellent digestive aid especially after meals.",
    region: "Pan India",
    mealType: "snack",
    prepTime: 5,
    cookTime: 0,
    servings: 2,
    difficulty: "easy",
    tags: ["probiotic", "digestive", "cooling", "quick"],
    suitableFor: ["fiery", "balanced", "slow", "lowFermenter"],
    ingredients: [
      { item: "Fresh curd", quantity: "½ cup" },
      { item: "Water", quantity: "1.5 cups" },
      { item: "Roasted cumin powder", quantity: "½ tsp" },
      { item: "Black salt", quantity: "¼ tsp" },
      { item: "Fresh mint", quantity: "few leaves" },
      { item: "Ginger (grated)", quantity: "¼ tsp" }
    ],
    instructions: [
      "Blend curd and water until smooth",
      "Add cumin powder, black salt, ginger",
      "Blend again for 30 seconds",
      "Pour in glasses, garnish with mint",
      "Serve chilled or room temperature"
    ],
    nutritionPer100g: { calories: 25, protein: 2, fiber: 0, carbs: 3 },
    cost: "low",
    isVegetarian: true,
    isVegan: false,
    allergens: ["dairy"]
  },
  {
    id: "ajwain-water",
    name: "Ajwain Water",
    nameHindi: "अजवाइन पानी",
    description: "Carom seed infused water for instant relief from bloating and gas.",
    region: "Pan India",
    mealType: "snack",
    prepTime: 2,
    cookTime: 5,
    servings: 1,
    difficulty: "easy",
    tags: ["digestive", "anti-bloating", "quick", "remedy"],
    suitableFor: ["airy", "slow", "balanced"],
    ingredients: [
      { item: "Ajwain (carom seeds)", quantity: "1 tsp" },
      { item: "Water", quantity: "1 cup" },
      { item: "Black salt", quantity: "pinch" }
    ],
    instructions: [
      "Boil water with ajwain seeds",
      "Simmer for 2-3 minutes",
      "Strain into a cup",
      "Add pinch of black salt",
      "Sip warm after meals"
    ],
    nutritionPer100g: { calories: 5, protein: 0, fiber: 0, carbs: 1 },
    cost: "low",
    isVegetarian: true,
    isVegan: true,
    allergens: []
  },
  {
    id: "banana-smoothie",
    name: "Banana Curd Smoothie",
    nameHindi: "केला दही स्मूदी",
    description: "Prebiotic banana with probiotic curd. Perfect gut-healing combo.",
    region: "Pan India",
    mealType: "snack",
    prepTime: 5,
    cookTime: 0,
    servings: 1,
    difficulty: "easy",
    tags: ["prebiotic", "probiotic", "synbiotic", "quick"],
    suitableFor: ["balanced", "airy", "lowFermenter"],
    ingredients: [
      { item: "Ripe banana", quantity: "1 medium" },
      { item: "Fresh curd", quantity: "½ cup" },
      { item: "Honey", quantity: "1 tsp" },
      { item: "Cardamom powder", quantity: "pinch" }
    ],
    instructions: [
      "Blend banana and curd until smooth",
      "Add honey and cardamom",
      "Blend for 10 more seconds",
      "Serve immediately"
    ],
    nutritionPer100g: { calories: 85, protein: 3, fiber: 2, carbs: 18 },
    cost: "low",
    isVegetarian: true,
    isVegan: false,
    allergens: ["dairy"]
  }
];

// ===================
// DAILY GUT TIPS
// ===================
export interface GutTip {
  id: string;
  category: "tip" | "fact" | "recipe-quick" | "myth-buster" | "exercise";
  title: string;
  content: string;
  forGutTypes?: string[]; // specific gut types, or all if undefined
  emoji: string;
}

export const dailyGutTips: GutTip[] = [
  // Tips
  { id: "t1", category: "tip", title: "Morning Ritual", content: "Start your day with a glass of warm water with lemon. It gently wakes up your digestive system.", emoji: "🌅" },
  { id: "t2", category: "tip", title: "Chew Your Food", content: "Digestion starts in the mouth. Chew each bite 20-30 times for better nutrient absorption.", emoji: "🦷" },
  { id: "t3", category: "tip", title: "Millet Magic", content: "Add 1 small bowl of cooked millet this week — it's a gentle prebiotic and suits many Indian diets.", emoji: "🌾" },
  { id: "t4", category: "tip", title: "Dinner Timing", content: "Try to eat dinner 2-3 hours before bedtime. Your gut needs rest too!", emoji: "🌙" },
  { id: "t5", category: "tip", title: "Fermented Foods", content: "Include one fermented food daily: curd, buttermilk, idli, dosa, or kanji.", emoji: "🥛", forGutTypes: ["balanced", "lowFermenter"] },
  { id: "t6", category: "tip", title: "Cooling Foods", content: "For acidity, include cooling foods like coconut, cucumber, and bottle gourd in your meals.", emoji: "🥒", forGutTypes: ["fiery"] },
  { id: "t7", category: "tip", title: "Warm Foods", content: "Avoid cold drinks and raw salads. Your gut prefers warm, cooked foods.", emoji: "🍲", forGutTypes: ["airy"] },
  { id: "t8", category: "tip", title: "Light Dinner", content: "Keep dinner light - soup, khichdi, or just fruits. Helps with morning freshness.", emoji: "🥣", forGutTypes: ["slow"] },
  
  // Facts
  { id: "f1", category: "fact", title: "Gut-Brain Connection", content: "Your gut has 500 million neurons — it's called your 'second brain' for a reason!", emoji: "🧠" },
  { id: "f2", category: "fact", title: "Microbiome Weight", content: "The bacteria in your gut weigh about 1-2 kg — as much as your brain!", emoji: "⚖️" },
  { id: "f3", category: "fact", title: "Serotonin Source", content: "90% of your serotonin (the happiness hormone) is made in your gut, not your brain.", emoji: "😊" },
  { id: "f4", category: "fact", title: "Bacterial Diversity", content: "A healthy gut has over 1000 different species of bacteria. Diversity is key!", emoji: "🦠" },
  
  // Quick Recipes
  { id: "r1", category: "recipe-quick", title: "Digestive Tea", content: "Boil 1 cup water with ½ tsp cumin, ½ tsp fennel, few mint leaves. Strain & sip after meals.", emoji: "🍵" },
  { id: "r2", category: "recipe-quick", title: "Quick Raita", content: "Mix ½ cup curd + pinch roasted cumin + salt + chopped cucumber. Instant probiotic boost!", emoji: "🥒" },
  { id: "r3", category: "recipe-quick", title: "Golden Milk", content: "Warm milk + ½ tsp turmeric + pinch black pepper + honey. Anti-inflammatory nightcap.", emoji: "🥛" },
  
  // Myth Busters
  { id: "m1", category: "myth-buster", title: "Myth: Curd at Night", content: "Ayurveda cautions against cold curd at night, but warm/spiced curd or buttermilk is fine!", emoji: "❌" },
  { id: "m2", category: "myth-buster", title: "Myth: All Fiber is Good", content: "Too much insoluble fiber can worsen bloating. Balance is key - start slow!", emoji: "❌" },
  { id: "m3", category: "myth-buster", title: "Myth: Probiotics = Curd Only", content: "Many Indian foods are probiotic: idli, dosa, kanji, achaar, dhokla!", emoji: "✅" },
  
  // Exercises
  { id: "e1", category: "exercise", title: "Belly Breathing", content: "Lie down, place hand on belly. Breathe deep so belly rises. 5 mins daily improves digestion.", emoji: "🧘" },
  { id: "e2", category: "exercise", title: "Walking After Meals", content: "A 10-15 minute slow walk after meals aids digestion better than lying down.", emoji: "🚶" },
  { id: "e3", category: "exercise", title: "Pawanmuktasana", content: "Wind-relieving pose: Lie down, hug knees to chest, rock gently. Releases trapped gas.", emoji: "🧘" },
];

// ===================
// SYMPTOM TRACKING
// ===================
export interface SymptomEntry {
  date: string;
  overallFeeling: 1 | 2 | 3 | 4 | 5; // 1=terrible, 5=great
  symptoms: string[];
  bowelMovement: "none" | "constipated" | "normal" | "loose" | "mixed";
  bloating: "none" | "mild" | "moderate" | "severe";
  energy: 1 | 2 | 3 | 4 | 5;
  stressLevel: 1 | 2 | 3 | 4 | 5;
  notes?: string;
  mealsLogged?: string[];
}

export const symptomOptions = [
  "Bloating",
  "Gas",
  "Constipation",
  "Loose stools",
  "Heartburn/Acidity",
  "Stomach pain",
  "Nausea",
  "Fatigue",
  "Headache",
  "Skin issues",
  "Brain fog",
  "Mood swings",
];

// ===================
// HELPER FUNCTIONS
// ===================
export function getRecipesForGutType(gutTypeId: string, mealType?: string): Recipe[] {
  return recipes.filter(recipe => {
    const matchesGutType = recipe.suitableFor.includes(gutTypeId);
    const matchesMealType = !mealType || recipe.mealType === mealType;
    return matchesGutType && matchesMealType;
  });
}

export function getTipsForGutType(gutTypeId: string): GutTip[] {
  return dailyGutTips.filter(tip => {
    return !tip.forGutTypes || tip.forGutTypes.includes(gutTypeId);
  });
}

export function getDailyTip(gutTypeId?: string): GutTip {
  const applicableTips = gutTypeId 
    ? getTipsForGutType(gutTypeId)
    : dailyGutTips;
  
  // Use date to get consistent daily tip
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const tipIndex = dayOfYear % applicableTips.length;
  
  return applicableTips[tipIndex];
}

export function generateWeeklyMealPlan(gutTypeId: string, preferences: {
  isVegetarian?: boolean;
  isVegan?: boolean;
  avoidAllergens?: string[];
}): { day: string; meals: { breakfast?: Recipe; lunch?: Recipe; dinner?: Recipe; snack?: Recipe } }[] {
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const gutRecipes = getRecipesForGutType(gutTypeId);
  
  // Filter by preferences
  const filteredRecipes = gutRecipes.filter(recipe => {
    if (preferences.isVegan && !recipe.isVegan) return false;
    if (preferences.isVegetarian && !recipe.isVegetarian) return false;
    if (preferences.avoidAllergens?.some(a => recipe.allergens.includes(a))) return false;
    return true;
  });
  
  const byMealType = {
    breakfast: filteredRecipes.filter(r => r.mealType === "breakfast"),
    lunch: filteredRecipes.filter(r => r.mealType === "lunch"),
    dinner: filteredRecipes.filter(r => r.mealType === "dinner"),
    snack: filteredRecipes.filter(r => r.mealType === "snack"),
  };
  
  return days.map((day, index) => ({
    day,
    meals: {
      breakfast: byMealType.breakfast[index % byMealType.breakfast.length],
      lunch: byMealType.lunch[index % byMealType.lunch.length],
      dinner: byMealType.dinner[index % byMealType.dinner.length],
      snack: byMealType.snack[index % byMealType.snack.length],
    }
  }));
}
