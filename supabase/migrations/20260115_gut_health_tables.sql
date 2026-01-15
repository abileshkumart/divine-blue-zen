-- ============================================
-- DIVINE BLUE ZEN - GUT HEALTH TABLES
-- ============================================
-- Complete Gut Health Schema for Mind-Gut Wellness App
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. GUT PROFILES TABLE
-- ============================================
-- Stores user's gut type from the quiz

CREATE TABLE IF NOT EXISTS public.gut_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gut_type TEXT NOT NULL CHECK (gut_type IN ('balanced', 'fiery', 'airy', 'slow', 'inflamed', 'lowFermenter')),
  quiz_completed_at TIMESTAMPTZ DEFAULT now(),
  quiz_scores JSONB, -- Store individual scores: {"balanced": 12, "fiery": 8, ...}
  dietary_preferences JSONB DEFAULT '{}', -- {"isVegetarian": true, "isVegan": false, "allergens": ["dairy"]}
  goals TEXT[], -- ["reduce_bloating", "improve_energy", "better_digestion"]
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id) -- One gut profile per user
);

-- Enable RLS
ALTER TABLE public.gut_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gut_profiles
CREATE POLICY "Users can view their own gut profile"
  ON public.gut_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gut profile"
  ON public.gut_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gut profile"
  ON public.gut_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gut profile"
  ON public.gut_profiles FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gut_profiles_user_id ON public.gut_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_gut_profiles_gut_type ON public.gut_profiles(gut_type);

-- ============================================
-- 2. GUT CHECK-INS TABLE
-- ============================================
-- Daily symptom and wellness tracking

CREATE TABLE IF NOT EXISTS public.gut_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Core metrics (1-5 scale)
  overall_feeling INTEGER CHECK (overall_feeling >= 1 AND overall_feeling <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5),
  
  -- Bowel movement tracking
  bowel_movement TEXT CHECK (bowel_movement IN ('none', 'constipated', 'normal', 'loose', 'mixed')),
  bowel_frequency INTEGER DEFAULT 0, -- Number of times today
  
  -- Symptoms
  bloating TEXT CHECK (bloating IN ('none', 'mild', 'moderate', 'severe')),
  symptoms TEXT[], -- Array of symptoms: ["gas", "cramping", "heartburn", etc.]
  
  -- Additional tracking
  water_intake INTEGER, -- Glasses of water
  sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
  exercise_done BOOLEAN DEFAULT false,
  
  -- Notes
  notes TEXT,
  triggers TEXT[], -- Foods or situations that triggered symptoms
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, checkin_date)
);

-- Enable RLS
ALTER TABLE public.gut_checkins ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gut_checkins
CREATE POLICY "Users can view their own gut checkins"
  ON public.gut_checkins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gut checkins"
  ON public.gut_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gut checkins"
  ON public.gut_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gut checkins"
  ON public.gut_checkins FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gut_checkins_user_id ON public.gut_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_gut_checkins_user_date ON public.gut_checkins(user_id, checkin_date DESC);
CREATE INDEX IF NOT EXISTS idx_gut_checkins_date ON public.gut_checkins(checkin_date);

-- ============================================
-- 3. GUT MEAL LOGS TABLE
-- ============================================
-- Track what users eat for pattern recognition

CREATE TABLE IF NOT EXISTS public.gut_meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Meal details
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'drink')),
  meal_time TIME,
  
  -- What was eaten
  recipe_id TEXT, -- Reference to static recipe from gutHealth.ts
  meal_description TEXT, -- Free text description
  foods TEXT[], -- Array of food items: ["rice", "dal", "vegetables"]
  
  -- Portion and satisfaction
  portion_size TEXT CHECK (portion_size IN ('small', 'medium', 'large', 'very_large')),
  satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 5),
  
  -- Post-meal feedback (optional, can be filled later)
  post_meal_feeling TEXT CHECK (post_meal_feeling IN ('great', 'good', 'okay', 'uncomfortable', 'bad')),
  post_meal_symptoms TEXT[],
  
  -- Metadata
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gut_meal_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gut_meal_logs
CREATE POLICY "Users can view their own meal logs"
  ON public.gut_meal_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal logs"
  ON public.gut_meal_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal logs"
  ON public.gut_meal_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal logs"
  ON public.gut_meal_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_gut_meal_logs_user_id ON public.gut_meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_gut_meal_logs_user_date ON public.gut_meal_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_gut_meal_logs_meal_type ON public.gut_meal_logs(meal_type);
CREATE INDEX IF NOT EXISTS idx_gut_meal_logs_recipe ON public.gut_meal_logs(recipe_id);

-- ============================================
-- 4. GUT SAVED RECIPES TABLE
-- ============================================
-- User's favorite/saved recipes

CREATE TABLE IF NOT EXISTS public.gut_saved_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id TEXT NOT NULL, -- Reference to static recipe ID from gutHealth.ts
  is_favorite BOOLEAN DEFAULT true,
  times_cooked INTEGER DEFAULT 0,
  last_cooked_at DATE,
  personal_notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, recipe_id)
);

-- Enable RLS
ALTER TABLE public.gut_saved_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gut_saved_recipes
CREATE POLICY "Users can view their own saved recipes"
  ON public.gut_saved_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saved recipes"
  ON public.gut_saved_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved recipes"
  ON public.gut_saved_recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved recipes"
  ON public.gut_saved_recipes FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gut_saved_recipes_user_id ON public.gut_saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_gut_saved_recipes_recipe ON public.gut_saved_recipes(recipe_id);
CREATE INDEX IF NOT EXISTS idx_gut_saved_recipes_favorite ON public.gut_saved_recipes(user_id, is_favorite);

-- ============================================
-- 5. GUT MEAL PLANS TABLE
-- ============================================
-- Store generated weekly meal plans

CREATE TABLE IF NOT EXISTS public.gut_meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Plan details
  week_start_date DATE NOT NULL,
  gut_type TEXT NOT NULL,
  
  -- The meal plan data (JSONB for flexibility)
  plan_data JSONB NOT NULL, 
  -- Structure: [
  --   { "day": "Monday", "meals": { "breakfast": "recipe-id", "lunch": "recipe-id", ... } },
  --   ...
  -- ]
  
  -- Preferences used to generate this plan
  preferences JSONB DEFAULT '{}',
  -- Structure: { "isVegetarian": true, "avoidAllergens": ["dairy"] }
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gut_meal_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gut_meal_plans
CREATE POLICY "Users can view their own meal plans"
  ON public.gut_meal_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal plans"
  ON public.gut_meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans"
  ON public.gut_meal_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans"
  ON public.gut_meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gut_meal_plans_user_id ON public.gut_meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_gut_meal_plans_user_week ON public.gut_meal_plans(user_id, week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_gut_meal_plans_active ON public.gut_meal_plans(user_id, is_active);

-- ============================================
-- 6. GUT FOOD DIARY TABLE
-- ============================================
-- Quick food logging for pattern analysis

CREATE TABLE IF NOT EXISTS public.gut_food_diary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  entry_time TIME DEFAULT CURRENT_TIME,
  
  -- Food details
  food_item TEXT NOT NULL,
  food_category TEXT CHECK (food_category IN (
    'grain', 'protein', 'dairy', 'vegetable', 'fruit', 
    'legume', 'fermented', 'spice', 'drink', 'sweet', 'other'
  )),
  
  -- Quick assessment
  is_recommended BOOLEAN, -- Based on user's gut type
  reaction TEXT CHECK (reaction IN ('good', 'neutral', 'bad')),
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gut_food_diary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gut_food_diary
CREATE POLICY "Users can view their own food diary"
  ON public.gut_food_diary FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own food diary entries"
  ON public.gut_food_diary FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food diary"
  ON public.gut_food_diary FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food diary entries"
  ON public.gut_food_diary FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gut_food_diary_user_id ON public.gut_food_diary(user_id);
CREATE INDEX IF NOT EXISTS idx_gut_food_diary_user_date ON public.gut_food_diary(user_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_gut_food_diary_food ON public.gut_food_diary(food_item);
CREATE INDEX IF NOT EXISTS idx_gut_food_diary_reaction ON public.gut_food_diary(user_id, reaction);

-- ============================================
-- 7. GUT INSIGHTS TABLE
-- ============================================
-- Store AI/algorithm generated insights for users

CREATE TABLE IF NOT EXISTS public.gut_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Insight details
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'pattern', 'trigger', 'improvement', 'recommendation', 'streak', 'weekly_summary'
  )),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Relevance
  severity TEXT CHECK (severity IN ('info', 'success', 'warning', 'alert')),
  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,
  
  -- Data that generated this insight
  source_data JSONB,
  
  -- Validity
  valid_from DATE DEFAULT CURRENT_DATE,
  valid_until DATE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.gut_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gut_insights
CREATE POLICY "Users can view their own insights"
  ON public.gut_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own insights"
  ON public.gut_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gut_insights_user_id ON public.gut_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_gut_insights_unread ON public.gut_insights(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_gut_insights_type ON public.gut_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_gut_insights_valid ON public.gut_insights(user_id, valid_from, valid_until);

-- ============================================
-- 8. TRIGGERS FOR UPDATED_AT
-- ============================================

-- Trigger for gut_profiles
DROP TRIGGER IF EXISTS update_gut_profiles_updated_at ON public.gut_profiles;
CREATE TRIGGER update_gut_profiles_updated_at
    BEFORE UPDATE ON public.gut_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for gut_checkins
DROP TRIGGER IF EXISTS update_gut_checkins_updated_at ON public.gut_checkins;
CREATE TRIGGER update_gut_checkins_updated_at
    BEFORE UPDATE ON public.gut_checkins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for gut_meal_logs
DROP TRIGGER IF EXISTS update_gut_meal_logs_updated_at ON public.gut_meal_logs;
CREATE TRIGGER update_gut_meal_logs_updated_at
    BEFORE UPDATE ON public.gut_meal_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for gut_saved_recipes
DROP TRIGGER IF EXISTS update_gut_saved_recipes_updated_at ON public.gut_saved_recipes;
CREATE TRIGGER update_gut_saved_recipes_updated_at
    BEFORE UPDATE ON public.gut_saved_recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for gut_meal_plans
DROP TRIGGER IF EXISTS update_gut_meal_plans_updated_at ON public.gut_meal_plans;
CREATE TRIGGER update_gut_meal_plans_updated_at
    BEFORE UPDATE ON public.gut_meal_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 9. USEFUL FUNCTIONS
-- ============================================

-- Function to get user's gut checkin streak
CREATE OR REPLACE FUNCTION get_gut_checkin_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  check_date DATE := CURRENT_DATE;
  has_checkin BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.gut_checkins 
      WHERE user_id = p_user_id AND checkin_date = check_date
    ) INTO has_checkin;
    
    IF has_checkin THEN
      streak := streak + 1;
      check_date := check_date - 1;
    ELSE
      EXIT;
    END IF;
    
    -- Safety limit
    IF streak > 365 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get weekly gut health summary
CREATE OR REPLACE FUNCTION get_weekly_gut_summary(p_user_id UUID)
RETURNS TABLE (
  avg_feeling NUMERIC,
  avg_energy NUMERIC,
  total_checkins INTEGER,
  most_common_symptoms TEXT[],
  streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG(overall_feeling)::numeric, 1) as avg_feeling,
    ROUND(AVG(energy_level)::numeric, 1) as avg_energy,
    COUNT(*)::INTEGER as total_checkins,
    ARRAY_AGG(DISTINCT unnest_symptom) FILTER (WHERE unnest_symptom IS NOT NULL) as most_common_symptoms,
    get_gut_checkin_streak(p_user_id) as streak
  FROM public.gut_checkins,
       LATERAL unnest(symptoms) AS unnest_symptom
  WHERE user_id = p_user_id 
    AND checkin_date >= CURRENT_DATE - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. VIEWS FOR ANALYTICS
-- ============================================

-- View for user's gut health trends (last 30 days)
CREATE OR REPLACE VIEW gut_health_trends AS
SELECT 
  user_id,
  checkin_date,
  overall_feeling,
  energy_level,
  stress_level,
  bloating,
  bowel_movement,
  ARRAY_LENGTH(symptoms, 1) as symptom_count
FROM public.gut_checkins
WHERE checkin_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY checkin_date DESC;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify tables were created
SELECT 
  tablename,
  'Created' as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename LIKE 'gut_%'
ORDER BY tablename;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Gut Health Tables Created Successfully!';
  RAISE NOTICE '📊 Tables: gut_profiles, gut_checkins, gut_meal_logs, gut_saved_recipes, gut_meal_plans, gut_food_diary, gut_insights';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '⚡ Indexes created for performance';
  RAISE NOTICE '🔄 Update triggers configured';
  RAISE NOTICE '📈 Analytics functions ready';
  RAISE NOTICE '🚀 Gut Health feature is ready!';
END $$;
