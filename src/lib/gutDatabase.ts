// Gut Health Database Operations
// Helper functions for interacting with Supabase gut health tables
// 
// IMPORTANT: Run the migration first:
// supabase/migrations/20260115_gut_health_tables.sql

import { supabase } from '@/integrations/supabase/client';

// ============================================
// TYPE DEFINITIONS
// ============================================

export type GutTypeId = 'balanced' | 'fiery' | 'airy' | 'slow' | 'inflamed' | 'lowFermenter';

// Gut Profile
export interface GutProfile {
  id: string;
  user_id: string;
  gut_type: GutTypeId;
  quiz_completed_at: string | null;
  quiz_scores: Record<string, number> | null;
  dietary_preferences: {
    isVegetarian?: boolean;
    isVegan?: boolean;
    allergens?: string[];
  } | null;
  goals: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface GutProfileInsert {
  user_id: string;
  gut_type: GutTypeId;
  quiz_scores?: Record<string, number>;
  dietary_preferences?: GutProfile['dietary_preferences'];
  goals?: string[];
}

// Gut Check-in
export type BowelMovement = 'none' | 'constipated' | 'normal' | 'loose' | 'mixed';
export type Bloating = 'none' | 'mild' | 'moderate' | 'severe';

export interface GutCheckin {
  id: string;
  user_id: string;
  checkin_date: string;
  overall_feeling: number | null;
  energy_level: number | null;
  stress_level: number | null;
  bowel_movement: BowelMovement | null;
  bowel_frequency: number | null;
  bloating: Bloating | null;
  symptoms: string[] | null;
  water_intake: number | null;
  sleep_quality: number | null;
  exercise_done: boolean | null;
  notes: string | null;
  triggers: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface GutCheckinInsert {
  user_id: string;
  checkin_date?: string;
  overall_feeling?: number;
  energy_level?: number;
  stress_level?: number;
  bowel_movement?: BowelMovement;
  bowel_frequency?: number;
  bloating?: Bloating;
  symptoms?: string[];
  water_intake?: number;
  sleep_quality?: number;
  exercise_done?: boolean;
  notes?: string;
  triggers?: string[];
}

// Saved Recipes
export interface GutSavedRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  is_favorite: boolean;
  times_cooked: number;
  last_cooked_at: string | null;
  personal_notes: string | null;
  rating: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface GutSavedRecipeInsert {
  user_id: string;
  recipe_id: string;
  is_favorite?: boolean;
  personal_notes?: string;
  rating?: number;
}

// Meal Logs
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'drink';
export type PortionSize = 'small' | 'medium' | 'large' | 'very_large';
export type MealFeeling = 'great' | 'good' | 'okay' | 'uncomfortable' | 'bad';

export interface GutMealLog {
  id: string;
  user_id: string;
  log_date: string;
  meal_type: MealType;
  meal_time: string | null;
  recipe_id: string | null;
  meal_description: string | null;
  foods: string[] | null;
  portion_size: PortionSize | null;
  satisfaction: number | null;
  post_meal_feeling: MealFeeling | null;
  post_meal_symptoms: string[] | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface GutMealLogInsert {
  user_id: string;
  log_date?: string;
  meal_type: MealType;
  meal_time?: string;
  recipe_id?: string;
  meal_description?: string;
  foods?: string[];
  portion_size?: PortionSize;
  satisfaction?: number;
  notes?: string;
}

// Meal Plans
export interface GutMealPlan {
  id: string;
  user_id: string;
  week_start_date: string;
  gut_type: string;
  plan_data: {
    day: string;
    meals: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
      snack?: string;
    };
  }[];
  preferences: {
    isVegetarian?: boolean;
    isVegan?: boolean;
    avoidAllergens?: string[];
  } | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface GutMealPlanInsert {
  user_id: string;
  week_start_date: string;
  gut_type: string;
  plan_data: GutMealPlan['plan_data'];
  preferences?: GutMealPlan['preferences'];
  is_active?: boolean;
}

// ============================================
// HELPER - Get typed table reference
// ============================================
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const table = (name: string) => supabase.from(name) as any;

// ============================================
// GUT PROFILE OPERATIONS
// ============================================

export async function getGutProfile(userId: string): Promise<GutProfile | null> {
  const { data, error } = await table('gut_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code !== 'PGRST116') console.error('Error fetching gut profile:', error);
    return null;
  }
  return data;
}

export async function saveGutProfile(profile: GutProfileInsert): Promise<GutProfile | null> {
  const { data, error } = await table('gut_profiles')
    .upsert(profile, { onConflict: 'user_id' })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving gut profile:', error);
    return null;
  }
  return data;
}

export async function updateGutProfile(
  userId: string, 
  updates: Partial<GutProfile>
): Promise<boolean> {
  const { error } = await table('gut_profiles')
    .update(updates)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error updating gut profile:', error);
    return false;
  }
  return true;
}

// ============================================
// GUT CHECK-IN OPERATIONS
// ============================================

export async function getTodayCheckin(userId: string): Promise<GutCheckin | null> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await table('gut_checkins')
    .select('*')
    .eq('user_id', userId)
    .eq('checkin_date', today)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching today\'s checkin:', error);
  }
  return data || null;
}

export async function saveGutCheckin(checkin: GutCheckinInsert): Promise<GutCheckin | null> {
  const { data, error } = await table('gut_checkins')
    .upsert(checkin, { onConflict: 'user_id,checkin_date' })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving gut checkin:', error);
    return null;
  }
  return data;
}

export async function getCheckinHistory(
  userId: string, 
  days: number = 30
): Promise<GutCheckin[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await table('gut_checkins')
    .select('*')
    .eq('user_id', userId)
    .gte('checkin_date', startDate.toISOString().split('T')[0])
    .order('checkin_date', { ascending: false });
  
  if (error) {
    console.error('Error fetching checkin history:', error);
    return [];
  }
  return data || [];
}

/**
 * Calculate consecutive check-in streak for a user
 */
export async function getCheckinStreak(userId: string): Promise<number> {
  const history = await getCheckinHistory(userId, 365); // Check up to a year
  if (history.length === 0) return 0;
  
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const checkinDates = history.map(c => {
    const date = new Date(c.checkin_date);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  });
  
  // Check if today or yesterday has a checkin (start of streak)
  const todayTime = today.getTime();
  const yesterdayTime = todayTime - 86400000;
  
  if (!checkinDates.includes(todayTime) && !checkinDates.includes(yesterdayTime)) {
    return 0; // Streak broken
  }
  
  // Count consecutive days backwards
  let checkDate = checkinDates.includes(todayTime) ? todayTime : yesterdayTime;
  while (checkinDates.includes(checkDate)) {
    streak++;
    checkDate -= 86400000; // Go back one day
  }
  
  return streak;
}

// ============================================
// SAVED RECIPES OPERATIONS
// ============================================

/**
 * Get all saved/favorite recipes for a user
 */
export async function getSavedRecipes(userId: string): Promise<GutSavedRecipe[]> {
  const { data, error } = await table('gut_saved_recipes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_favorite', true)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching saved recipes:', error);
    return [];
  }
  return data || [];
}

/**
 * Get all recipe interactions (favorites, ratings, cook history) for a user
 */
export async function getAllRecipeInteractions(userId: string): Promise<GutSavedRecipe[]> {
  const { data, error } = await table('gut_saved_recipes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching recipe interactions:', error);
    return [];
  }
  return data || [];
}

/**
 * Get a specific recipe's saved data for a user
 */
export async function getRecipeData(userId: string, recipeId: string): Promise<GutSavedRecipe | null> {
  const { data, error } = await table('gut_saved_recipes')
    .select('*')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching recipe data:', error);
  }
  return data || null;
}

/**
 * Save/favorite a recipe
 */
export async function saveRecipe(userId: string, recipeId: string, notes?: string): Promise<boolean> {
  const { error } = await table('gut_saved_recipes')
    .upsert({
      user_id: userId,
      recipe_id: recipeId,
      is_favorite: true,
      personal_notes: notes || null
    }, { onConflict: 'user_id,recipe_id' });
  
  if (error) {
    console.error('Error saving recipe:', error);
    return false;
  }
  return true;
}

/**
 * Unsave/unfavorite a recipe
 */
export async function unsaveRecipe(userId: string, recipeId: string): Promise<boolean> {
  const { error } = await table('gut_saved_recipes')
    .update({ is_favorite: false })
    .eq('user_id', userId)
    .eq('recipe_id', recipeId);
  
  if (error) {
    console.error('Error unsaving recipe:', error);
    return false;
  }
  return true;
}

/**
 * Toggle recipe favorite status
 */
export async function toggleRecipeFavorite(userId: string, recipeId: string): Promise<boolean> {
  // First check if it exists
  const existing = await getRecipeData(userId, recipeId);
  
  if (existing) {
    // Toggle the favorite status
    const { error } = await table('gut_saved_recipes')
      .update({ is_favorite: !existing.is_favorite })
      .eq('user_id', userId)
      .eq('recipe_id', recipeId);
    
    if (error) {
      console.error('Error toggling recipe favorite:', error);
      return false;
    }
    return !existing.is_favorite;
  } else {
    // Create new with favorite = true
    return await saveRecipe(userId, recipeId);
  }
}

/**
 * Check if a recipe is saved/favorited
 */
export async function isRecipeSaved(userId: string, recipeId: string): Promise<boolean> {
  const { data } = await table('gut_saved_recipes')
    .select('is_favorite')
    .eq('user_id', userId)
    .eq('recipe_id', recipeId)
    .single();
  
  return data?.is_favorite ?? false;
}

/**
 * Rate a recipe (1-5 stars)
 */
export async function rateRecipe(userId: string, recipeId: string, rating: number): Promise<boolean> {
  if (rating < 1 || rating > 5) {
    console.error('Rating must be between 1 and 5');
    return false;
  }
  
  const { error } = await table('gut_saved_recipes')
    .upsert({
      user_id: userId,
      recipe_id: recipeId,
      rating: rating
    }, { onConflict: 'user_id,recipe_id' });
  
  if (error) {
    console.error('Error rating recipe:', error);
    return false;
  }
  return true;
}

/**
 * Mark a recipe as cooked (increments times_cooked)
 */
export async function markRecipeCooked(userId: string, recipeId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  
  // Get existing data
  const existing = await getRecipeData(userId, recipeId);
  const timesCooked = (existing?.times_cooked || 0) + 1;
  
  const { error } = await table('gut_saved_recipes')
    .upsert({
      user_id: userId,
      recipe_id: recipeId,
      times_cooked: timesCooked,
      last_cooked_at: today
    }, { onConflict: 'user_id,recipe_id' });
  
  if (error) {
    console.error('Error marking recipe as cooked:', error);
    return false;
  }
  return true;
}

/**
 * Add personal notes to a recipe
 */
export async function addRecipeNotes(userId: string, recipeId: string, notes: string): Promise<boolean> {
  const { error } = await table('gut_saved_recipes')
    .upsert({
      user_id: userId,
      recipe_id: recipeId,
      personal_notes: notes
    }, { onConflict: 'user_id,recipe_id' });
  
  if (error) {
    console.error('Error adding recipe notes:', error);
    return false;
  }
  return true;
}

/**
 * Get most cooked recipes for a user
 */
export async function getMostCookedRecipes(userId: string, limit: number = 5): Promise<GutSavedRecipe[]> {
  const { data, error } = await table('gut_saved_recipes')
    .select('*')
    .eq('user_id', userId)
    .gt('times_cooked', 0)
    .order('times_cooked', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching most cooked recipes:', error);
    return [];
  }
  return data || [];
}

/**
 * Get recently cooked recipes for a user
 */
export async function getRecentlyCookedRecipes(userId: string, limit: number = 5): Promise<GutSavedRecipe[]> {
  const { data, error } = await table('gut_saved_recipes')
    .select('*')
    .eq('user_id', userId)
    .not('last_cooked_at', 'is', null)
    .order('last_cooked_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching recently cooked recipes:', error);
    return [];
  }
  return data || [];
}

/**
 * Get top rated recipes by a user
 */
export async function getTopRatedRecipes(userId: string, limit: number = 5): Promise<GutSavedRecipe[]> {
  const { data, error } = await table('gut_saved_recipes')
    .select('*')
    .eq('user_id', userId)
    .not('rating', 'is', null)
    .order('rating', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching top rated recipes:', error);
    return [];
  }
  return data || [];
}

// ============================================
// MEAL LOG OPERATIONS
// ============================================

/**
 * Log a meal
 */
export async function logMeal(meal: GutMealLogInsert): Promise<GutMealLog | null> {
  const { data, error } = await table('gut_meal_logs')
    .insert(meal)
    .select()
    .single();
  
  if (error) {
    console.error('Error logging meal:', error);
    return null;
  }
  return data;
}

/**
 * Log a recipe as a meal
 */
export async function logRecipeAsMeal(
  userId: string,
  recipeId: string,
  mealType: MealType,
  options?: {
    portionSize?: PortionSize;
    satisfaction?: number;
    notes?: string;
  }
): Promise<GutMealLog | null> {
  const now = new Date();
  const logDate = now.toISOString().split('T')[0];
  const mealTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
  
  return logMeal({
    user_id: userId,
    log_date: logDate,
    meal_type: mealType,
    meal_time: mealTime,
    recipe_id: recipeId,
    portion_size: options?.portionSize,
    satisfaction: options?.satisfaction,
    notes: options?.notes
  });
}

/**
 * Get today's meals
 */
export async function getTodayMeals(userId: string): Promise<GutMealLog[]> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await table('gut_meal_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', today)
    .order('meal_time', { ascending: true });
  
  if (error) {
    console.error('Error fetching today\'s meals:', error);
    return [];
  }
  return data || [];
}

/**
 * Get meal history
 */
export async function getMealHistory(
  userId: string,
  days: number = 7
): Promise<GutMealLog[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await table('gut_meal_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', startDate.toISOString().split('T')[0])
    .order('log_date', { ascending: false })
    .order('meal_time', { ascending: false });
  
  if (error) {
    console.error('Error fetching meal history:', error);
    return [];
  }
  return data || [];
}

/**
 * Update post-meal feedback
 */
export async function updateMealFeedback(
  mealId: string,
  feeling: MealFeeling,
  symptoms?: string[]
): Promise<boolean> {
  const { error } = await table('gut_meal_logs')
    .update({
      post_meal_feeling: feeling,
      post_meal_symptoms: symptoms || []
    })
    .eq('id', mealId);
  
  if (error) {
    console.error('Error updating meal feedback:', error);
    return false;
  }
  return true;
}

/**
 * Get meals that caused discomfort
 */
export async function getProblematicMeals(userId: string, limit: number = 10): Promise<GutMealLog[]> {
  const { data, error } = await table('gut_meal_logs')
    .select('*')
    .eq('user_id', userId)
    .in('post_meal_feeling', ['uncomfortable', 'bad'])
    .order('log_date', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching problematic meals:', error);
    return [];
  }
  return data || [];
}

// ============================================
// MEAL PLAN OPERATIONS
// ============================================

/**
 * Get active meal plan
 */
export async function getActiveMealPlan(userId: string): Promise<GutMealPlan | null> {
  const { data, error } = await table('gut_meal_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('week_start_date', { ascending: false })
    .limit(1)
    .single();
  
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching active meal plan:', error);
  }
  return data || null;
}

/**
 * Save a new meal plan (deactivates previous)
 */
export async function saveMealPlan(plan: GutMealPlanInsert): Promise<GutMealPlan | null> {
  // Deactivate previous plans first
  await table('gut_meal_plans')
    .update({ is_active: false })
    .eq('user_id', plan.user_id);
  
  const { data, error } = await table('gut_meal_plans')
    .insert({ ...plan, is_active: true })
    .select()
    .single();
  
  if (error) {
    console.error('Error saving meal plan:', error);
    return null;
  }
  return data;
}

/**
 * Get meal plan history
 */
export async function getMealPlanHistory(userId: string, limit: number = 4): Promise<GutMealPlan[]> {
  const { data, error } = await table('gut_meal_plans')
    .select('*')
    .eq('user_id', userId)
    .order('week_start_date', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching meal plan history:', error);
    return [];
  }
  return data || [];
}

// ============================================
// ANALYTICS & INSIGHTS
// ============================================

/**
 * Get recipe cooking statistics
 */
export async function getRecipeStats(userId: string): Promise<{
  totalSaved: number;
  totalCooked: number;
  averageRating: number | null;
}> {
  const { data: saved, error: savedError } = await table('gut_saved_recipes')
    .select('id', { count: 'exact' })
    .eq('user_id', userId)
    .eq('is_favorite', true);
  
  const { data: cooked, error: cookedError } = await table('gut_saved_recipes')
    .select('times_cooked')
    .eq('user_id', userId)
    .gt('times_cooked', 0);
  
  const { data: rated, error: ratedError } = await table('gut_saved_recipes')
    .select('rating')
    .eq('user_id', userId)
    .not('rating', 'is', null);
  
  if (savedError || cookedError || ratedError) {
    console.error('Error fetching recipe stats');
    return { totalSaved: 0, totalCooked: 0, averageRating: null };
  }
  
  const totalCooked = (cooked || []).reduce((sum, r) => sum + (r.times_cooked || 0), 0);
  const ratings = (rated || []).map(r => r.rating).filter(Boolean);
  const averageRating = ratings.length > 0 
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
    : null;
  
  return {
    totalSaved: saved?.length || 0,
    totalCooked,
    averageRating: averageRating ? Math.round(averageRating * 10) / 10 : null
  };
}

/**
 * Get recipe IDs that worked well for user (based on post-meal feeling)
 */
export async function getWellToleratedRecipes(userId: string): Promise<string[]> {
  const { data, error } = await table('gut_meal_logs')
    .select('recipe_id')
    .eq('user_id', userId)
    .not('recipe_id', 'is', null)
    .in('post_meal_feeling', ['great', 'good']);
  
  if (error) {
    console.error('Error fetching well-tolerated recipes:', error);
    return [];
  }
  
  // Return unique recipe IDs
  const recipeIds = (data || []).map((m: { recipe_id: string }) => m.recipe_id).filter(Boolean) as string[];
  return [...new Set(recipeIds)];
}

/**
 * Get recipe IDs that caused issues (based on post-meal feeling)
 */
export async function getProblematicRecipes(userId: string): Promise<string[]> {
  const { data, error } = await table('gut_meal_logs')
    .select('recipe_id')
    .eq('user_id', userId)
    .not('recipe_id', 'is', null)
    .in('post_meal_feeling', ['uncomfortable', 'bad']);
  
  if (error) {
    console.error('Error fetching problematic recipes:', error);
    return [];
  }
  
  // Return unique recipe IDs
  const recipeIds = (data || []).map((m: { recipe_id: string }) => m.recipe_id).filter(Boolean) as string[];
  return [...new Set(recipeIds)];
}
