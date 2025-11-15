-- Community Features: Groups, Challenges, Friends, Activities
-- Created: November 6, 2025

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. PRACTICE GROUPS
-- =====================================================
CREATE TABLE IF NOT EXISTS practice_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  group_type text CHECK (group_type IN ('meditation', 'yoga', 'breathing', 'general')),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  invite_code text UNIQUE NOT NULL DEFAULT substring(md5(random()::text) from 1 for 8),
  member_limit int DEFAULT 50,
  member_count int DEFAULT 0,
  is_private boolean DEFAULT false,
  cover_image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 2. GROUP MEMBERS
-- =====================================================
CREATE TABLE IF NOT EXISTS group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES practice_groups(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role text DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at timestamp with time zone DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- =====================================================
-- 3. CHALLENGES (linked to groups)
-- =====================================================
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES practice_groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  challenge_type text NOT NULL CHECK (challenge_type IN ('meditation', 'yoga', 'breathing', 'stretching', 'all')),
  duration_days int NOT NULL CHECK (duration_days > 0),
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  is_group_challenge boolean DEFAULT false,
  is_public boolean DEFAULT true,
  participant_count int DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 4. CHALLENGE PARTICIPANTS
-- =====================================================
CREATE TABLE IF NOT EXISTS challenge_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at timestamp with time zone DEFAULT now(),
  completed_days int DEFAULT 0,
  is_completed boolean DEFAULT false,
  last_check_in date,
  completion_percentage int DEFAULT 0,
  UNIQUE(challenge_id, user_id)
);

-- =====================================================
-- 5. FRIENDSHIPS
-- =====================================================
CREATE TABLE IF NOT EXISTS friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text CHECK (status IN ('pending', 'accepted', 'blocked')) DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, friend_id),
  CHECK (user_id != friend_id)
);

-- =====================================================
-- 6. ACTIVITIES (Social Feed)
-- =====================================================
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  group_id uuid REFERENCES practice_groups(id) ON DELETE CASCADE,
  activity_type text NOT NULL CHECK (activity_type IN ('session_complete', 'streak_milestone', 'badge_earned', 'challenge_complete', 'challenge_joined', 'group_joined')),
  session_log_id uuid REFERENCES session_logs(id) ON DELETE CASCADE,
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  visibility text DEFAULT 'friends' CHECK (visibility IN ('public', 'friends', 'private', 'group')),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 7. ACTIVITY REACTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('celebrate', 'namaste', 'encourage', 'love')),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(activity_id, user_id)
);

-- =====================================================
-- 8. ACTIVITY COMMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES activities(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  comment_text text NOT NULL CHECK (length(comment_text) <= 500),
  created_at timestamp with time zone DEFAULT now()
);

-- =====================================================
-- 9. USER BADGES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_type text NOT NULL,
  badge_name text NOT NULL,
  badge_icon text NOT NULL,
  earned_at timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'
);

-- =====================================================
-- 10. UPDATE PROFILES TABLE
-- =====================================================
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_profile_public boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS avatar_url text,
ADD COLUMN IF NOT EXISTS friend_count int DEFAULT 0;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_practice_groups_invite_code ON practice_groups(invite_code);
CREATE INDEX IF NOT EXISTS idx_practice_groups_created_by ON practice_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_challenges_group_id ON challenges(group_id);
CREATE INDEX IF NOT EXISTS idx_challenges_start_date ON challenges(start_date);
CREATE INDEX IF NOT EXISTS idx_challenges_end_date ON challenges(end_date);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_challenge_id ON challenge_participants(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_participants_user_id ON challenge_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user_id ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend_id ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_friendships_status ON friendships(status);
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_group_id ON activities(group_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_reactions_activity_id ON activity_reactions(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_activity_id ON activity_comments(activity_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function: Update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE practice_groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE practice_groups SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.group_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER group_member_count_trigger
AFTER INSERT OR DELETE ON group_members
FOR EACH ROW EXECUTE FUNCTION update_group_member_count();

-- Function: Update challenge participant count
CREATE OR REPLACE FUNCTION update_challenge_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE challenges SET participant_count = participant_count + 1 WHERE id = NEW.challenge_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE challenges SET participant_count = GREATEST(participant_count - 1, 0) WHERE id = OLD.challenge_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER challenge_participant_count_trigger
AFTER INSERT OR DELETE ON challenge_participants
FOR EACH ROW EXECUTE FUNCTION update_challenge_participant_count();

-- Function: Update friend count
CREATE OR REPLACE FUNCTION update_friend_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'accepted' THEN
    UPDATE profiles SET friend_count = friend_count + 1 WHERE id = NEW.user_id;
    UPDATE profiles SET friend_count = friend_count + 1 WHERE id = NEW.friend_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    UPDATE profiles SET friend_count = friend_count + 1 WHERE id = NEW.user_id;
    UPDATE profiles SET friend_count = friend_count + 1 WHERE id = NEW.friend_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'accepted' THEN
    UPDATE profiles SET friend_count = GREATEST(friend_count - 1, 0) WHERE id = OLD.user_id;
    UPDATE profiles SET friend_count = GREATEST(friend_count - 1, 0) WHERE id = OLD.friend_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'accepted' AND NEW.status != 'accepted' THEN
    UPDATE profiles SET friend_count = GREATEST(friend_count - 1, 0) WHERE id = NEW.user_id;
    UPDATE profiles SET friend_count = GREATEST(friend_count - 1, 0) WHERE id = NEW.friend_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER friendship_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON friendships
FOR EACH ROW EXECUTE FUNCTION update_friend_count();

-- Function: Auto-join active group challenges when joining a group
CREATE OR REPLACE FUNCTION auto_join_active_challenges()
RETURNS TRIGGER AS $$
BEGIN
  -- When someone joins a group, auto-join active challenges
  INSERT INTO challenge_participants (challenge_id, user_id)
  SELECT c.id, NEW.user_id
  FROM challenges c
  WHERE c.group_id = NEW.group_id
    AND c.end_date >= CURRENT_DATE
    AND c.is_group_challenge = true
  ON CONFLICT (challenge_id, user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_join_challenges_on_group_join
AFTER INSERT ON group_members
FOR EACH ROW EXECUTE FUNCTION auto_join_active_challenges();

-- Function: Auto-add group creator as admin member
CREATE OR REPLACE FUNCTION auto_add_creator_to_group()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (NEW.id, NEW.created_by, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER add_creator_to_group_trigger
AFTER INSERT ON practice_groups
FOR EACH ROW EXECUTE FUNCTION auto_add_creator_to_group();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Practice Groups
ALTER TABLE practice_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public groups are viewable by everyone"
  ON practice_groups FOR SELECT
  USING (is_private = false OR created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM group_members WHERE group_id = practice_groups.id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create groups"
  ON practice_groups FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update groups"
  ON practice_groups FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = practice_groups.id AND user_id = auth.uid() AND role = 'admin'
  ));

-- Group Members
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of groups they're in or public groups"
  ON group_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (SELECT 1 FROM practice_groups pg WHERE pg.id = group_members.group_id AND pg.is_private = false)
  );

CREATE POLICY "Users can join public groups"
  ON group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON group_members FOR DELETE
  USING (auth.uid() = user_id);

-- Challenges
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public challenges or group challenges they're in"
  ON challenges FOR SELECT
  USING (
    is_public = true OR
    created_by = auth.uid() OR
    (group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM group_members WHERE group_id = challenges.group_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create challenges"
  ON challenges FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Challenge creators can update their challenges"
  ON challenges FOR UPDATE
  USING (auth.uid() = created_by);

-- Challenge Participants
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view challenge participants"
  ON challenge_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join challenges"
  ON challenge_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
  ON challenge_participants FOR UPDATE
  USING (auth.uid() = user_id);

-- Friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can create friendship requests"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their friendship status"
  ON friendships FOR UPDATE
  USING (auth.uid() = friend_id OR auth.uid() = user_id);

CREATE POLICY "Users can delete their friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- Activities
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view appropriate activities"
  ON activities FOR SELECT
  USING (
    visibility = 'public' OR
    user_id = auth.uid() OR
    (visibility = 'friends' AND EXISTS (
      SELECT 1 FROM friendships 
      WHERE ((user_id = auth.uid() AND friend_id = activities.user_id) OR 
             (friend_id = auth.uid() AND user_id = activities.user_id)) 
        AND status = 'accepted'
    )) OR
    (visibility = 'group' AND group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM group_members WHERE group_id = activities.group_id AND user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can create their own activities"
  ON activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own activities"
  ON activities FOR DELETE
  USING (auth.uid() = user_id);

-- Activity Reactions
ALTER TABLE activity_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view reactions"
  ON activity_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add reactions"
  ON activity_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON activity_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Activity Comments
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments"
  ON activity_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can add comments"
  ON activity_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON activity_comments FOR DELETE
  USING (auth.uid() = user_id);

-- User Badges
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view badges of public profiles"
  ON user_badges FOR SELECT
  USING (
    user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM profiles WHERE profiles.id = user_badges.user_id AND profiles.is_profile_public = true
    )
  );

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Community tables created successfully!';
  RAISE NOTICE '📊 Tables: practice_groups, group_members, challenges, challenge_participants';
  RAISE NOTICE '👥 Tables: friendships, activities, reactions, comments, badges';
  RAISE NOTICE '🔒 RLS policies enabled on all tables';
  RAISE NOTICE '⚡ Auto-update triggers created';
  RAISE NOTICE '🎉 Ready to build community features!';
END $$;
