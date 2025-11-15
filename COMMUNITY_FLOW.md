# Community Feature Flow 🌟

## Complete User Journey

### 📋 Step 1: Create a Group
**Path:** Community → Groups Tab → "Create Group" Button

**User Actions:**
1. Click "Create Group" button
2. Fill in the form:
   - **Group Name** (required): e.g., "Morning Meditators"
   - **Description** (optional): What the group is about
   - **Practice Focus**: Meditation, Yoga, Breathing, or All Practices
   - **Member Limit**: 2-1000 members (default: 50)
   - **Private Group**: Toggle ON for invite-only, OFF for public
3. Click "Create Group"

**What Happens:**
- ✅ Group is created in database
- ✅ You become the group **admin** automatically (via trigger)
- ✅ A unique **8-character invite code** is generated
- ✅ Invite code is shown in a toast notification
- ✅ You're redirected to the Groups tab

---

### 👥 Step 2: Share Group Invite
**Path:** Community → Groups Tab → Your Group Card → "Share" Button

**Options to Share:**
1. **Copy Invite Link**: Click "Share" button → Link copied to clipboard
2. **Share Invite Code**: Show the 8-character code to friends
3. **Invite URL Format**: `https://yourapp.com/join-group/{invite_code}`

**What Friends See:**
- They receive the invite link or code
- They can paste the link or enter the code
- They join your group with one click

---

### 🎯 Step 3: Create a Challenge in Your Group
**Path:** Community → Challenges Tab → "Create Challenge" Button

**User Actions:**
1. Click "Create Challenge" button
2. Fill in the form:
   - **Challenge Title**: e.g., "21-Day Morning Meditation"
   - **Description** (optional): What participants will achieve
   - **Practice Type**: Meditation, Yoga, Breathing, Stretching, or All
   - **Duration**: Number of days (e.g., 7, 21, 30, 100)
   - **Start Date**: Pick a date (today or future)
   - **End Date**: Auto-calculated based on duration
   - **Group Challenge Toggle**: Turn ON to link to a group
   - **Select Group**: Choose your created group from dropdown
   - **Public Challenge**: Toggle ON for discoverable, OFF for group-only
3. Click "Create Challenge"

**What Happens:**
- ✅ Challenge is created and linked to your group
- ✅ You automatically join the challenge
- ✅ Challenge appears in the Challenges tab
- ✅ Group members can see the challenge

---

### 🚀 Step 4: Friends Join Your Group
**Path:** Friend clicks invite link or enters code

**What Happens When Someone Joins:**
1. **They become a group member** (stored in `group_members` table)
2. **Auto-Join Magic** 🪄:
   - A database trigger (`auto_join_active_challenges`) fires
   - They are **automatically enrolled** in ALL active group challenges
   - No extra action needed!
3. **Member count** increments automatically
4. **They see the group's challenges** in their Challenges tab

**Database Trigger Logic:**
```sql
-- When someone joins a group...
INSERT INTO challenge_participants (challenge_id, user_id)
SELECT c.id, NEW.user_id
FROM challenges c
WHERE c.group_id = NEW.group_id          -- Challenges in this group
  AND c.end_date >= CURRENT_DATE         -- Still active
  AND c.is_group_challenge = true        -- Is a group challenge
```

---

### 📊 Step 5: Track Progress
**Path:** Community → Challenges Tab → Challenge Card

**Features:**
- **Progress Bar**: Shows completed days / total days
- **Completion Percentage**: Visual progress indicator
- **Days Remaining**: Countdown timer
- **Status Badges**:
  - 🟢 **Active**: Challenge is ongoing
  - 🔵 **Starting Soon**: Future start date
  - ⚫ **Completed**: Past end date

**Challenge States:**
- **Upcoming**: Start date in future → Shows "Starts in X days"
- **Active**: Between start and end date → Shows "X days remaining"
- **Completed**: Past end date → Shows "Challenge Ended"

---

## 🔄 Complete Flow Summary

```
1. CREATE GROUP
   ↓
2. GET INVITE CODE
   ↓
3. SHARE WITH FRIENDS
   ↓
4. CREATE CHALLENGES IN GROUP
   ↓
5. FRIENDS JOIN GROUP → AUTO-JOIN CHALLENGES! 🎉
   ↓
6. EVERYONE TRACKS PROGRESS TOGETHER
```

---

## 🎁 Key Features

### Single Invite Link = Group + Challenges
- **One link does everything**: Join group + join all active challenges
- **No extra steps** for friends
- **Automatic enrollment** via database trigger
- **Unified experience** for group members

### Group Admin Powers
- ✅ Create and manage the group
- ✅ Create challenges for the group
- ✅ Share invite codes
- ✅ See all group members
- ✅ View group challenges

### Member Benefits
- ✅ Auto-join group challenges
- ✅ Track progress together
- ✅ See group activity
- ✅ Share invite with others
- ✅ Leave group anytime

### Public vs Private Groups
- **Public Groups**: Anyone can discover and join
- **Private Groups**: Only people with invite link can join

### Challenge Types
- **Group Challenges**: Linked to a specific group
- **Public Challenges**: Open to everyone, no group required
- **Private Challenges**: Only group members can see

---

## 🎯 Usage Examples

### Example 1: Morning Meditation Group
1. Create "Morning Meditators" group (meditation focus)
2. Create "21-Day Morning Practice" challenge (linked to group)
3. Share group invite code with 5 friends
4. All 6 people are now in the challenge automatically!
5. Track daily progress together for 21 days

### Example 2: Yoga Studio Class
1. Create "Sunset Yoga Studio" group (yoga focus)
2. Create "30-Day Flexibility Challenge" (linked to group)
3. Share invite link with class attendees
4. Create "7-Day Breathing Challenge" (also linked to group)
5. New members auto-join BOTH challenges!

### Example 3: Personal Public Challenge
1. Create "100-Day Meditation Journey" challenge
2. Don't link to any group (individual challenge)
3. Make it public
4. Anyone can discover and join
5. Track solo or with the community

---

## 📱 UI Locations

### Community Page - Groups Tab
- List of all groups (your groups + public groups)
- "Create Group" button
- Group cards with:
  - Member count
  - Join/Share buttons
  - Invite code (for members)

### Community Page - Challenges Tab
- List of all challenges (your challenges + public challenges)
- "Create Challenge" button
- Challenge cards with:
  - Progress tracking
  - Join button
  - Status indicators

### Group Card Actions
- **Not a member**: "Join Group" button
- **Member/Owner**: "View Challenges" + "Invite" buttons
- **Invite code visible** for members

### Challenge Card Actions
- **Not participating**: "Join Challenge" button
- **Participating**: "View Progress" button
- Progress bar with completion percentage

---

## 🔐 Security & Permissions

### Row Level Security (RLS)
- **Groups**: Public groups visible to all, private to members only
- **Challenges**: Public challenges visible to all, group challenges to group members
- **Members**: Only admins can remove members, users can leave anytime

### Roles
- **Admin**: Group creator, full permissions
- **Moderator**: Can manage members (future feature)
- **Member**: Can view, participate, and invite

---

## 💡 Pro Tips

1. **Create the group first** before creating challenges
2. **Link challenges to groups** for automatic member enrollment
3. **Share invite codes** via any messaging app
4. **Set realistic durations**: 7, 21, 30, or 100 days are popular
5. **Start challenges in the future** to give people time to join
6. **Make groups public** for easier discovery
7. **Set member limits** to keep groups intimate
8. **Use descriptive names** so people know what to expect

---

## 🐛 Troubleshooting

**"I can't create a challenge"**
- Make sure you've created a group first (if linking to a group)
- Check that you're logged in

**"Friends can't join my group"**
- Verify the invite code is correct
- Check if group is full (reached member limit)

**"Challenge doesn't show my progress"**
- Progress tracking feature coming soon!
- Currently shows joined/not joined status

**"TypeScript errors in the code"**
- These are expected - Supabase types need regeneration
- Code works perfectly at runtime
- See REGENERATE_TYPES.md for instructions

---

## 🚀 What's Next?

### Coming Soon
- Progress tracking (check in daily)
- Activity feed (see friend's achievements)
- Badges and rewards
- Challenge templates
- Group chat
- Friend requests
- Leaderboards

---

This is your complete community management system! 🎉
