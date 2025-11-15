# Challenge Tracking & Daily Logging System 📊

## Your Example: "50-Day Hard Challenge"

### Challenge Setup
```
Challenge: 50-Day Hard Challenge
Duration: 50 days
Rules:
1. ✅ 1 hour workout
2. ✅ 1 hour yoga
3. ✅ 1 hour reading
4. ✅ Learn new habit
Group: Morning Warriors
Start Date: Nov 7, 2025
End Date: Dec 26, 2025
```

---

## 🏗️ Database Structure (Additional Tables Needed)

### 1. Challenge Rules/Requirements
```sql
CREATE TABLE challenge_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  requirement_text text NOT NULL,
  requirement_type text CHECK (requirement_type IN ('daily', 'weekly', 'total')),
  target_value int, -- e.g., 60 for "60 minutes"
  target_unit text, -- e.g., "minutes", "count", "sessions"
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Example for 50-Day Hard:
-- 1. "1 hour workout" - daily, 60, minutes
-- 2. "1 hour yoga" - daily, 60, minutes
-- 3. "1 hour reading" - daily, 60, minutes
-- 4. "New habit practice" - daily, 1, count
```

### 2. Daily Check-Ins
```sql
CREATE TABLE challenge_check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  check_in_date date NOT NULL,
  is_completed boolean DEFAULT false,
  notes text,
  photo_url text, -- Optional: proof photo
  created_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id, check_in_date)
);
```

### 3. Requirement Completions (Track Each Rule)
```sql
CREATE TABLE requirement_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id uuid REFERENCES challenge_check_ins(id) ON DELETE CASCADE,
  requirement_id uuid REFERENCES challenge_requirements(id) ON DELETE CASCADE,
  is_completed boolean DEFAULT false,
  actual_value int, -- e.g., 65 minutes of workout
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(check_in_id, requirement_id)
);
```

### 4. Challenge Comments/Interactions
```sql
CREATE TABLE challenge_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES challenge_comments(id) ON DELETE CASCADE,
  comment_text text NOT NULL CHECK (length(comment_text) <= 1000),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE challenge_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES challenges(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  target_user_id uuid REFERENCES profiles(id), -- Who you're reacting to
  target_date date, -- React to someone's specific day
  reaction_type text CHECK (reaction_type IN ('fire', 'strong', 'namaste', 'clap')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id, target_user_id, target_date, reaction_type)
);
```

---

## 📱 User Flow: Creating "50-Day Hard Challenge"

### Step 1: Create Challenge (Enhanced Form)
```
Community → Challenges → Create Challenge

BASIC INFO:
- Title: "50-Day Hard Challenge" ✏️
- Description: "Transform yourself with daily discipline..." ✏️
- Duration: 50 days 📅
- Start Date: Pick date
- Group: Select "Morning Warriors"

CHALLENGE RULES (NEW!):
[+ Add Rule/Requirement]

Rule 1:
  ✏️ "1 hour workout"
  📊 Type: Daily
  🎯 Target: 60 minutes

Rule 2:
  ✏️ "1 hour yoga"
  📊 Type: Daily
  🎯 Target: 60 minutes

Rule 3:
  ✏️ "1 hour reading"
  📊 Type: Daily
  🎯 Target: 60 minutes

Rule 4:
  ✏️ "Practice new habit"
  📊 Type: Daily
  🎯 Target: 1 session

[Create Challenge]
```

### Step 2: Daily Check-In Flow

#### User Opens App (Day 5 of 50)
```
Community → Challenges → "50-Day Hard Challenge"

┌─────────────────────────────────────┐
│   50-DAY HARD CHALLENGE             │
│   Day 5 of 50 • 45 days remaining   │
│   Progress: 8% complete             │
├─────────────────────────────────────┤
│                                      │
│   TODAY'S REQUIREMENTS (Nov 11)     │
│                                      │
│   ☐ 1 hour workout      (0/60 min)  │
│   ☐ 1 hour yoga         (0/60 min)  │
│   ☐ 1 hour reading      (0/60 min)  │
│   ☐ Practice new habit  (0/1)       │
│                                      │
│   [Check In for Today] 📝            │
│                                      │
├─────────────────────────────────────┤
│   YOUR PROGRESS                      │
│   ▓▓▓▓░░░░░░░░░░░░░░░░░░░░░░        │
│   4 of 50 days completed (8%)       │
│                                      │
│   Current Streak: 4 days 🔥         │
│   Longest Streak: 4 days            │
└─────────────────────────────────────┘
```

### Step 3: Daily Check-In Dialog

```
┌─────────────────────────────────────┐
│   CHECK IN - Day 5                  │
│   November 11, 2025                 │
├─────────────────────────────────────┤
│                                      │
│   ✅ 1 hour workout                 │
│      ⏱️  [70] minutes               │
│      📝 "Morning run + gym"          │
│                                      │
│   ✅ 1 hour yoga                    │
│      ⏱️  [60] minutes               │
│      📝 "Evening flow session"       │
│                                      │
│   ✅ 1 hour reading                 │
│      ⏱️  [45] minutes               │
│      📝 "Atomic Habits - Ch 3"       │
│      ⚠️  Below target!              │
│                                      │
│   ✅ Practice new habit             │
│      ✅  Completed                  │
│      📝 "Meditation - 20 min"        │
│                                      │
│   📸 Add Photo (Optional)            │
│   [Upload proof photo]              │
│                                      │
│   💬 Daily Note (Optional)           │
│   [Text area: "Great day! Felt..."] │
│                                      │
│   [Cancel]  [Submit Check-In] ✅     │
└─────────────────────────────────────┘
```

---

## 🎨 Challenge Detail Page UI

### Main View
```
┌─────────────────────────────────────────┐
│  ← 50-DAY HARD CHALLENGE        👤 💬   │
├─────────────────────────────────────────┤
│                                          │
│  🏆 Transform yourself with daily        │
│     discipline and consistency           │
│                                          │
│  📊 Day 5 of 50 • 45 days remaining     │
│  👥 24 participants                      │
│  🔥 Average streak: 4.2 days            │
│                                          │
├─────────────────────────────────────────┤
│  📋 DAILY REQUIREMENTS                   │
│                                          │
│  1. 💪 1 hour workout (60 min)          │
│  2. 🧘 1 hour yoga (60 min)             │
│  3. 📚 1 hour reading (60 min)          │
│  4. ✨ Practice new habit               │
│                                          │
├─────────────────────────────────────────┤
│  📅 YOUR PROGRESS                        │
│                                          │
│  [Calendar View - Last 7 Days]          │
│  Nov 5  Nov 6  Nov 7  Nov 8  Nov 9  ... │
│   ✅     ✅     ✅     ✅     ⏳        │
│                                          │
│  [Check In for Today] 📝                 │
│                                          │
├─────────────────────────────────────────┤
│  👥 LEADERBOARD                          │
│                                          │
│  🥇 Sarah - 5 days, 100% completion     │
│  🥈 You - 4 days, 95% completion        │
│  🥉 Mike - 4 days, 90% completion       │
│  4️⃣  Alex - 3 days, 85% completion      │
│                                          │
│  [View Full Leaderboard]                │
│                                          │
├─────────────────────────────────────────┤
│  💬 COMMUNITY FEED                       │
│                                          │
│  📸 Sarah checked in for Day 5!         │
│     ✅ All requirements completed        │
│     💬 3 comments  🔥 12 reactions       │
│                                          │
│  📸 Mike checked in for Day 5!          │
│     ⚠️  Missed reading today            │
│     💬 5 comments  💪 8 reactions        │
│                                          │
│  [Load More]                             │
│                                          │
└─────────────────────────────────────────┘
```

---

## 🔥 Key Features

### 1. **Daily Check-In System**
- ✅ Check in once per day
- ✅ Mark each requirement completed/incomplete
- ✅ Log actual values (e.g., 65 minutes instead of 60)
- ✅ Add notes/reflections
- ✅ Upload proof photos
- ✅ Can't check in for future dates
- ✅ Can check in for past missed days (within 48 hours)

### 2. **Progress Tracking**
- **Completed Days**: Total days you checked in
- **Completion Percentage**: Overall progress (4/50 = 8%)
- **Current Streak**: Consecutive days
- **Longest Streak**: Best streak
- **Requirement Success Rate**: % for each requirement

### 3. **Calendar View**
```
November 2025
Sun Mon Tue Wed Thu Fri Sat
            1   2   3   4
5   6   7   8   9  10  11
✅  ✅  ✅  ✅  ⏳  -   -
12  13  14  15  16  17  18
```

Legend:
- ✅ Completed (all requirements met)
- ⚠️  Partial (some requirements missed)
- ❌ Missed (didn't check in)
- ⏳ Today (pending check-in)
- - Future dates

### 4. **Leaderboard**
Ranked by:
1. Completion percentage (primary)
2. Current streak (secondary)
3. Total requirements met (tie-breaker)

### 5. **Social Features**
- **React to others' check-ins**: 🔥💪🙏👏
- **Comment on daily updates**: Encourage friends
- **View friends' progress**: See who's crushing it
- **Challenge wall**: Group activity feed
- **Accountability partners**: Tag friends

### 6. **Notifications**
- 🔔 Daily reminder: "Time to check in for Day 5!"
- 🔔 Streak alert: "Don't break your 10-day streak!"
- 🔔 Friend completed: "Sarah just checked in!"
- 🔔 Milestone: "You're halfway there! 🎉"
- 🔔 Encouragement: "3 days until next milestone!"

---

## 📊 Database Queries

### Get Today's Check-In Status
```sql
SELECT 
  c.id,
  c.title,
  cp.completed_days,
  ci.is_completed as today_completed,
  COUNT(cr.id) as total_requirements,
  COUNT(CASE WHEN rc.is_completed THEN 1 END) as completed_requirements
FROM challenges c
JOIN challenge_participants cp ON c.id = cp.challenge_id
LEFT JOIN challenge_check_ins ci ON c.id = ci.challenge_id 
  AND ci.user_id = cp.user_id 
  AND ci.check_in_date = CURRENT_DATE
LEFT JOIN challenge_requirements cr ON c.id = cr.challenge_id
LEFT JOIN requirement_completions rc ON ci.id = rc.check_in_id
WHERE cp.user_id = $1
  AND c.end_date >= CURRENT_DATE
GROUP BY c.id, cp.completed_days, ci.is_completed;
```

### Submit Daily Check-In
```sql
-- 1. Insert check-in
INSERT INTO challenge_check_ins (challenge_id, user_id, check_in_date, notes, photo_url)
VALUES ($1, $2, CURRENT_DATE, $3, $4)
RETURNING id;

-- 2. Insert requirement completions
INSERT INTO requirement_completions (check_in_id, requirement_id, is_completed, actual_value, notes)
VALUES 
  ($checkInId, $req1Id, true, 70, 'Morning run'),
  ($checkInId, $req2Id, true, 60, 'Flow yoga'),
  ($checkInId, $req3Id, false, 45, 'Need more time');

-- 3. Update participant stats (trigger)
UPDATE challenge_participants
SET 
  completed_days = completed_days + 1,
  completion_percentage = (completed_days * 100.0 / duration_days),
  last_check_in = CURRENT_DATE
WHERE challenge_id = $1 AND user_id = $2;

-- 4. Check for streak update
-- 5. Create activity post
```

---

## 🎯 Implementation Priority

### Phase 1: Core Check-In (MVP) ⭐⭐⭐
1. Add requirements to challenge creation form
2. Create check-in button and dialog
3. Simple "Did you complete today?" Yes/No
4. Update completed_days counter
5. Show basic progress bar

### Phase 2: Detailed Tracking ⭐⭐
6. Individual requirement checkboxes
7. Calendar view with status icons
8. Streak calculation
9. Leaderboard

### Phase 3: Social Features ⭐
10. Activity feed posts on check-in
11. Reactions and comments
12. Proof photos
13. Notifications

---

## 💡 Your "50-Day Hard" Would Look Like:

```
Day 1: Check in → All 4 requirements ✅ → Streak: 1
Day 2: Check in → All 4 requirements ✅ → Streak: 2
Day 3: Forgot to check in ❌ → Streak: 0
Day 4: Check in → 3 of 4 requirements ⚠️ → Streak: 1
Day 5: Check in → All 4 requirements ✅ → Streak: 2

Progress: 4 days completed out of 50 (8%)
Completion Rate: 95% (missed reading on Day 4)
Current Streak: 2 days
Longest Streak: 2 days
```

---

## 🚀 Quick Start Implementation

Want me to implement:
1. **Phase 1 MVP**: Basic daily check-in (Yes/No button)?
2. **Enhanced Form**: Add requirements to challenge creation?
3. **Progress View**: Show calendar and stats?

Let me know which part to build first! 🙏
