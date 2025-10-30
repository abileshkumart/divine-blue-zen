-- ============================================
-- DIVINE BLUE ZEN - COMPLETE DATABASE SETUP
-- ============================================
-- Run this entire script in your Supabase SQL Editor
-- https://app.supabase.com/project/izsfjwnbtfdqsbgjwlnz/sql

-- ============================================
-- 1. PROFILES TABLE (Extended User Information)
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  streak_count INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  total_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. MOON PHASES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.moon_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_date DATE NOT NULL UNIQUE,
  phase_type TEXT NOT NULL CHECK (phase_type IN ('pournami', 'amavasai')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (public read access)
ALTER TABLE public.moon_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view moon phases"
  ON public.moon_phases FOR SELECT
  TO public
  USING (true);

-- Index for faster date lookups
CREATE INDEX IF NOT EXISTS idx_moon_phases_date ON public.moon_phases(phase_date);

-- ============================================
-- 3. SESSIONS TABLE (New Enhanced System)
-- ============================================

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('yoga', 'meditation', 'stretching', 'breathing')),
  scheduled_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  days_of_week TEXT[] NOT NULL DEFAULT '{}',
  reminder_enabled BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_duration CHECK (duration_minutes > 0 AND duration_minutes <= 180)
);

-- Enable RLS
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can view their own sessions"
  ON public.sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON public.sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON public.sessions(session_type);

-- ============================================
-- 4. SESSION LOGS TABLE (Track Actual Practice)
-- ============================================

CREATE TABLE IF NOT EXISTS public.session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  session_name TEXT,
  session_type TEXT NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  actual_duration_minutes INTEGER NOT NULL,
  mood_before TEXT,
  mood_after TEXT,
  notes TEXT,
  completed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_log_duration CHECK (actual_duration_minutes > 0 AND actual_duration_minutes <= 180)
);

-- Enable RLS
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for session_logs
CREATE POLICY "Users can view their own logs"
  ON public.session_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own logs"
  ON public.session_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
  ON public.session_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
  ON public.session_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_session_logs_user_id ON public.session_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_user_date ON public.session_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_session_logs_session ON public.session_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_session_logs_type ON public.session_logs(session_type);

-- ============================================
-- 5. DAILY REFLECTIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reflection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood TEXT,
  day_summary TEXT,
  key_takeaway TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, reflection_date)
);

-- Enable RLS
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_reflections
CREATE POLICY "Users can view their own reflections"
  ON public.daily_reflections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reflections"
  ON public.daily_reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reflections"
  ON public.daily_reflections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reflections"
  ON public.daily_reflections FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_reflections_user_date ON public.daily_reflections(user_id, reflection_date DESC);

-- ============================================
-- 6. YOGA SESSIONS TABLE (Legacy - Keep for backward compatibility)
-- ============================================

CREATE TABLE IF NOT EXISTS public.yoga_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  session_type TEXT NOT NULL,
  time_of_day TEXT NOT NULL,
  scheduled_time TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.yoga_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for yoga_sessions
CREATE POLICY "Users can view their own yoga sessions"
  ON public.yoga_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own yoga sessions"
  ON public.yoga_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own yoga sessions"
  ON public.yoga_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own yoga sessions"
  ON public.yoga_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. AFFIRMATIONS TABLE (Future Feature)
-- ============================================

CREATE TABLE IF NOT EXISTS public.affirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  category TEXT,
  language TEXT DEFAULT 'en',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS (public read access)
ALTER TABLE public.affirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active affirmations"
  ON public.affirmations FOR SELECT
  TO public
  USING (is_active = true);

-- ============================================
-- 8. USER AFFIRMATIONS (Favorites) TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.user_affirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  affirmation_id UUID REFERENCES public.affirmations(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, affirmation_id)
);

-- Enable RLS
ALTER TABLE public.user_affirmations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_affirmations
CREATE POLICY "Users can view their own affirmations"
  ON public.user_affirmations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own affirmations"
  ON public.user_affirmations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own affirmations"
  ON public.user_affirmations FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 9. FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for sessions
DROP TRIGGER IF EXISTS update_sessions_updated_at ON public.sessions;
CREATE TRIGGER update_sessions_updated_at
    BEFORE UPDATE ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for daily_reflections
DROP TRIGGER IF EXISTS update_daily_reflections_updated_at ON public.daily_reflections;
CREATE TRIGGER update_daily_reflections_updated_at
    BEFORE UPDATE ON public.daily_reflections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, created_at, updated_at)
  VALUES (NEW.id, now(), now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 10. SAMPLE DATA - Moon Phases for 2025-2027
-- ============================================
-- Accurate astronomical dates for Full Moon (Pournami) and New Moon (Amavasai)

-- 2025 Moon Phases (Complete Year)
INSERT INTO public.moon_phases (phase_date, phase_type, description) VALUES
  -- January 2025
  ('2025-01-13', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2025-01-29', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- February 2025
  ('2025-02-12', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2025-02-27', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- March 2025
  ('2025-03-14', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2025-03-29', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- April 2025
  ('2025-04-13', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2025-04-27', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- May 2025
  ('2025-05-12', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2025-05-27', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- June 2025
  ('2025-06-11', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2025-06-25', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- July 2025
  ('2025-07-10', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2025-07-24', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- August 2025
  ('2025-08-09', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2025-08-23', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- September 2025
  ('2025-09-07', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2025-09-21', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- October 2025
  ('2025-10-07', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2025-10-21', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- November 2025
  ('2025-11-05', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2025-11-20', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- December 2025
  ('2025-12-04', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2025-12-19', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices')
ON CONFLICT (phase_date) DO NOTHING;

-- 2026 Moon Phases (Complete Year)
INSERT INTO public.moon_phases (phase_date, phase_type, description) VALUES
  -- January 2026
  ('2026-01-03', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2026-01-18', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- February 2026
  ('2026-02-01', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2026-02-17', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- March 2026
  ('2026-03-03', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2026-03-18', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- April 2026
  ('2026-04-02', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2026-04-17', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- May 2026
  ('2026-05-01', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2026-05-16', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2026-05-31', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  -- June 2026
  ('2026-06-15', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2026-06-29', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  -- July 2026
  ('2026-07-14', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2026-07-29', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  -- August 2026
  ('2026-08-12', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2026-08-27', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  -- September 2026
  ('2026-09-11', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2026-09-26', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  -- October 2026
  ('2026-10-10', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2026-10-25', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  -- November 2026
  ('2026-11-09', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2026-11-24', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  -- December 2026
  ('2026-12-09', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2026-12-24', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation')
ON CONFLICT (phase_date) DO NOTHING;

-- 2027 Moon Phases (Complete Year)
INSERT INTO public.moon_phases (phase_date, phase_type, description) VALUES
  -- January 2027
  ('2027-01-07', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2027-01-23', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  -- February 2027
  ('2027-02-06', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2027-02-21', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  -- March 2027
  ('2027-03-07', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2027-03-23', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  -- April 2027
  ('2027-04-06', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2027-04-21', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  -- May 2027
  ('2027-05-05', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2027-05-20', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  -- June 2027
  ('2027-06-04', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2027-06-19', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  -- July 2027
  ('2027-07-03', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2027-07-18', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  -- August 2027
  ('2027-08-02', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  ('2027-08-17', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2027-08-31', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- September 2027
  ('2027-09-15', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2027-09-30', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- October 2027
  ('2027-10-15', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2027-10-29', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- November 2027
  ('2027-11-13', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2027-11-28', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices'),
  -- December 2027
  ('2027-12-13', 'pournami', 'Full Moon (Pournami) - Perfect for energizing meditation'),
  ('2027-12-27', 'amavasai', 'New Moon (Amavasai) - Ideal for introspective practices')
ON CONFLICT (phase_date) DO NOTHING;

-- ============================================
-- 11. SAMPLE AFFIRMATIONS
-- ============================================

INSERT INTO public.affirmations (text, category, is_active) VALUES
  ('I am at peace with myself and the universe flows through me', 'peace', true),
  ('My breath connects me to the infinite energy of life', 'breathing', true),
  ('I release all tension and embrace divine tranquility', 'relaxation', true),
  ('Every cell in my body vibrates with positive energy', 'energy', true),
  ('I am aligned with my highest purpose and inner wisdom', 'purpose', true),
  ('Peace and clarity guide my thoughts and actions', 'clarity', true),
  ('I trust the journey of my spiritual growth', 'growth', true),
  ('Divine light surrounds and protects me always', 'protection', true),
  ('I am grateful for this moment of stillness', 'gratitude', true),
  ('My mind is calm, my body is relaxed, my spirit is free', 'freedom', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Verify tables were created
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Divine Blue Zen Database Setup Complete!';
  RAISE NOTICE '📊 Tables created: profiles, sessions, session_logs, daily_reflections, moon_phases, yoga_sessions, affirmations, user_affirmations';
  RAISE NOTICE '🔒 Row Level Security enabled on all tables';
  RAISE NOTICE '🌙 Moon phases data loaded for 2025-2026';
  RAISE NOTICE '✨ Sample affirmations loaded';
  RAISE NOTICE '🚀 Your app is ready to use!';
END $$;
