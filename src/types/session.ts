export type SessionType = 'yoga' | 'meditation' | 'stretching' | 'breathing';

export interface Session {
  id: string;
  user_id: string;
  session_name: string;
  session_type: SessionType;
  scheduled_time: string;
  duration_minutes: number;
  days_of_week: string[];
  reminder_enabled: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionLog {
  id: string;
  user_id: string;
  session_id: string;
  log_date: string;
  actual_duration_minutes: number;
  mood_before?: string;
  mood_after?: string;
  notes?: string;
  completed: boolean;
  created_at: string;
}

export interface WeeklySummary {
  week_start: string;
  total_sessions: number;
  total_minutes: number;
  by_type: {
    yoga: number;
    meditation: number;
    stretching: number;
    breathing: number;
  };
  completion_rate: number;
  streak_days: number;
}
