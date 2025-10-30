-- Create sessions table
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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_active ON public.sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_session_logs_user_date ON public.session_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_session_logs_session ON public.session_logs(session_id);
