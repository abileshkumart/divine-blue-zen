-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  streak_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create yoga_sessions table
CREATE TABLE public.yoga_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  session_type TEXT NOT NULL, -- 'asana', 'pranayama', 'meditation', 'other'
  time_of_day TEXT NOT NULL, -- 'morning', 'afternoon', 'evening'
  scheduled_time TIME,
  recurrence TEXT DEFAULT 'daily', -- 'daily', 'weekly', 'custom'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on yoga_sessions
ALTER TABLE public.yoga_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for yoga_sessions
CREATE POLICY "Users can view their own sessions"
  ON public.yoga_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON public.yoga_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.yoga_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.yoga_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Create session_logs table
CREATE TABLE public.session_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.yoga_sessions(id) ON DELETE SET NULL,
  session_title TEXT NOT NULL,
  session_type TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on session_logs
ALTER TABLE public.session_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for session_logs
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

-- Create daily_reflections table
CREATE TABLE public.daily_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reflection_date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood TEXT, -- 'calm', 'focused', 'energized', 'tired', 'stressed'
  day_summary TEXT,
  key_takeaway TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, reflection_date)
);

-- Enable RLS on daily_reflections
ALTER TABLE public.daily_reflections ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_reflections
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

-- Create moon_phases table (public data)
CREATE TABLE public.moon_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phase_date DATE NOT NULL UNIQUE,
  phase_type TEXT NOT NULL, -- 'amavasai' (new moon), 'pournami' (full moon)
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on moon_phases (everyone can read)
ALTER TABLE public.moon_phases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Moon phases are viewable by everyone"
  ON public.moon_phases FOR SELECT
  USING (true);

-- Trigger for updating updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_yoga_sessions_updated_at
  BEFORE UPDATE ON public.yoga_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_reflections_updated_at
  BEFORE UPDATE ON public.daily_reflections
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert some moon phase data for 2025
INSERT INTO public.moon_phases (phase_date, phase_type, description) VALUES
  ('2025-01-13', 'pournami', 'Full Moon - Ideal for meditation and reflection'),
  ('2025-01-29', 'amavasai', 'New Moon - Perfect for new beginnings and inner work'),
  ('2025-02-12', 'pournami', 'Full Moon - Ideal for meditation and reflection'),
  ('2025-02-28', 'amavasai', 'New Moon - Perfect for new beginnings and inner work'),
  ('2025-03-14', 'pournami', 'Full Moon - Ideal for meditation and reflection'),
  ('2025-03-29', 'amavasai', 'New Moon - Perfect for new beginnings and inner work'),
  ('2025-04-13', 'pournami', 'Full Moon - Ideal for meditation and reflection'),
  ('2025-04-27', 'amavasai', 'New Moon - Perfect for new beginnings and inner work'),
  ('2025-05-12', 'pournami', 'Full Moon - Ideal for meditation and reflection'),
  ('2025-05-27', 'amavasai', 'New Moon - Perfect for new beginnings and inner work'),
  ('2025-06-11', 'pournami', 'Full Moon - Ideal for meditation and reflection'),
  ('2025-06-25', 'amavasai', 'New Moon - Perfect for new beginnings and inner work'),
  ('2025-07-10', 'pournami', 'Full Moon - Ideal for meditation and reflection'),
  ('2025-07-24', 'amavasai', 'New Moon - Perfect for new beginnings and inner work'),
  ('2025-08-09', 'pournami', 'Full Moon - Ideal for meditation and reflection'),
  ('2025-08-23', 'amavasai', 'New Moon - Perfect for new beginnings and inner work'),
  ('2025-09-07', 'pournami', 'Full Moon - Ideal for meditation and reflection'),
  ('2025-09-21', 'amavasai', 'New Moon - Perfect for new beginnings and inner work'),
  ('2025-10-07', 'pournami', 'Full Moon - Ideal for meditation and reflection'),
  ('2025-10-21', 'amavasai', 'New Moon - Perfect for new beginnings and inner work'),
  ('2025-11-05', 'pournami', 'Full Moon - Ideal for meditation and reflection'),
  ('2025-11-20', 'amavasai', 'New Moon - Perfect for new beginnings and inner work'),
  ('2025-12-04', 'pournami', 'Full Moon - Ideal for meditation and reflection'),
  ('2025-12-19', 'amavasai', 'New Moon - Perfect for new beginnings and inner work')
ON CONFLICT (phase_date) DO NOTHING;