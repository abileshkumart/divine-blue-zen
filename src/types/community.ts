// Community Feature Types
// Created: November 6, 2025

export interface PracticeGroup {
  id: string;
  name: string;
  description: string;
  group_type: 'meditation' | 'yoga' | 'breathing' | 'general';
  created_by: string;
  invite_code: string;
  member_limit: number;
  member_count: number;
  is_private: boolean;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  creator_profile?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  user_membership?: GroupMember;
  is_member?: boolean;
  active_challenges?: Challenge[];
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'member';
  joined_at: string;
  user_profile?: {
    id: string;
    display_name: string;
    avatar_url?: string;
    bio?: string;
    streak_count: number;
    total_sessions: number;
  };
}

export interface Challenge {
  id: string;
  group_id?: string;
  title: string;
  description: string;
  challenge_type: 'meditation' | 'yoga' | 'breathing' | 'stretching' | 'all';
  duration_days: number;
  start_date: string;
  end_date: string;
  created_by: string;
  is_group_challenge: boolean;
  is_public: boolean;
  participant_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  creator_profile?: {
    display_name: string;
    avatar_url?: string;
  };
  group?: {
    id: string;
    name: string;
  };
  user_participation?: ChallengeParticipant;
  is_active?: boolean;
  is_upcoming?: boolean;
  is_completed?: boolean;
  days_remaining?: number;
  days_elapsed?: number;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  joined_at: string;
  completed_days: number;
  is_completed: boolean;
  last_check_in: string;
  completion_percentage: number;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at: string;
  // Joined data
  friend_profile?: {
    id: string;
    display_name: string;
    avatar_url?: string;
    bio?: string;
    streak_count: number;
    total_sessions: number;
    is_profile_public: boolean;
  };
}

export interface Activity {
  id: string;
  user_id: string;
  group_id?: string;
  activity_type: 'session_complete' | 'streak_milestone' | 'badge_earned' | 'challenge_complete' | 'challenge_joined' | 'group_joined';
  session_log_id?: string;
  challenge_id?: string;
  visibility: 'public' | 'friends' | 'private' | 'group';
  metadata: Record<string, any>;
  created_at: string;
  // Joined data
  user_profile?: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
  group?: {
    id: string;
    name: string;
  };
  challenge?: {
    id: string;
    title: string;
  };
  session_log?: {
    session_name: string;
    session_type: string;
    actual_duration_minutes: number;
    mood_before?: string;
    mood_after?: string;
  };
  reactions?: ActivityReaction[];
  comments?: ActivityComment[];
  reaction_count?: number;
  comment_count?: number;
  user_reaction?: string;
}

export interface ActivityReaction {
  id: string;
  activity_id: string;
  user_id: string;
  reaction_type: 'celebrate' | 'namaste' | 'encourage' | 'love';
  created_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface ActivityComment {
  id: string;
  activity_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
  user_profile?: {
    display_name: string;
    avatar_url?: string;
  };
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  badge_icon: string;
  earned_at: string;
  metadata: Record<string, any>;
}

export interface PublicProfile {
  id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  is_profile_public: boolean;
  streak_count: number;
  total_sessions: number;
  total_minutes: number;
  friend_count: number;
  created_at: string;
  badges?: UserBadge[];
  is_friend?: boolean;
  friendship_status?: 'pending' | 'accepted' | 'none';
  can_send_request?: boolean;
}

// Helper types for forms and UI
export interface CreateGroupInput {
  name: string;
  description: string;
  group_type: 'meditation' | 'yoga' | 'breathing' | 'general';
  is_private: boolean;
  cover_image_url?: string;
}

export interface CreateChallengeInput {
  group_id?: string;
  title: string;
  description: string;
  challenge_type: 'meditation' | 'yoga' | 'breathing' | 'stretching' | 'all';
  duration_days: number;
  start_date: string;
  is_group_challenge: boolean;
  is_public: boolean;
}

export interface GroupInviteData {
  group: PracticeGroup;
  activeChallenges: Challenge[];
  memberCount: number;
  recentActivities: Activity[];
}

// Badge definitions
export const BADGE_DEFINITIONS = {
  // Streak badges
  week_warrior: { name: '7-Day Warrior', icon: '🔥', requirement: 7, type: 'streak' },
  month_master: { name: '30-Day Master', icon: '🏆', requirement: 30, type: 'streak' },
  hundred_days: { name: '100-Day Legend', icon: '💯', requirement: 100, type: 'streak' },
  year_yogi: { name: '365-Day Yogi', icon: '👑', requirement: 365, type: 'streak' },
  
  // Session badges
  first_session: { name: 'First Step', icon: '👣', requirement: 1, type: 'session' },
  ten_sessions: { name: 'Getting Started', icon: '⭐', requirement: 10, type: 'session' },
  fifty_sessions: { name: 'Half Century', icon: '🎯', requirement: 50, type: 'session' },
  hundred_sessions: { name: 'Hundred Club', icon: '💯', requirement: 100, type: 'session' },
  
  // Social badges
  first_friend: { name: 'Making Connections', icon: '🤝', requirement: 1, type: 'social' },
  community_builder: { name: 'Community Builder', icon: '👥', requirement: 10, type: 'social' },
  social_butterfly: { name: 'Social Butterfly', icon: '🦋', requirement: 25, type: 'social' },
  
  // Challenge badges
  first_challenge: { name: 'Challenger', icon: '🏃', requirement: 1, type: 'challenge' },
  challenge_champion: { name: 'Challenge Champion', icon: '🥇', requirement: 5, type: 'challenge' },
  
  // Group badges
  group_creator: { name: 'Circle Leader', icon: '⭕', requirement: 1, type: 'group' },
  group_veteran: { name: 'Group Veteran', icon: '🎖️', requirement: 5, type: 'group' },
  
  // Time badges
  early_bird: { name: 'Early Bird', icon: '🌅', requirement: 30, type: 'time' },
  night_owl: { name: 'Night Owl', icon: '🌙', requirement: 30, type: 'time' },
} as const;

export type BadgeType = keyof typeof BADGE_DEFINITIONS;
