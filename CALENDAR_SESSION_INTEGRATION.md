# 📅 Calendar-Session Integration Guide

## Overview
The Calendar page now has full integration with the Practice Sessions system, allowing users to:
- **View scheduled sessions** on calendar dates
- **Create new sessions** directly from the calendar
- **See session completion status** with checkmarks
- **Track multiple session types** with color-coded icons

---

## 🎨 Visual Features

### Calendar Day Indicators

**Session Type Icons:**
- 🟣 **Yoga** - Activity icon (purple)
- 🔵 **Meditation** - Brain icon (blue)  
- 🟢 **Stretching** - Dumbbell icon (green)
- 🔷 **Breathing** - Wind icon (cyan)

**Day States:**
- **Border with accent color** - Has scheduled sessions
- **Green checkmark** - Session completed on this day
- **Ring highlight** - Moon phase day (🌕 Pournami / 🌑 Amavasai)
- **Bold ring** - Today's date
- **Book icon** - Has daily reflection

---

## 🔄 User Workflows

### 1. **View Scheduled Sessions**
```
1. Navigate to Calendar page
2. Days with scheduled sessions show icons (🟣🔵🟢🔷)
3. Click on any day with sessions
4. View list of all sessions scheduled for that day
5. See session details: name, type, time, duration
6. Click "Start" to begin a session
```

### 2. **Create New Session**
```
METHOD 1: From Calendar Day
1. Click on any future date (no sessions)
2. Create Session dialog opens automatically
3. Fill in session details
4. Session is saved and appears on calendar

METHOD 2: Floating Action Button
1. Click the "+" button (bottom right)
2. Creates session for today
3. Fill in details
4. Session appears on calendar

METHOD 3: From Day with Sessions
1. Click on day with existing sessions
2. In the session list, click "Add Another Session"
3. Fill in details for additional session
```

### 3. **Track Session Completion**
```
1. Complete a session in Sessions page
2. Session log is created in database
3. Calendar automatically shows checkmark (✓) on that day
4. Monthly stats update with session count
```

---

## 💾 Database Integration

### Tables Used

**1. `sessions` Table**
```sql
- id, user_id, session_name, session_type
- scheduled_time, duration_minutes
- days_of_week[] (array of weekdays)
- reminder_enabled, is_active
```

**2. `session_logs` Table**
```sql
- id, user_id, session_id
- log_date, session_type
- actual_duration_minutes
- mood_before, mood_after, notes
- completed
```

**3. `daily_reflections` Table**
```sql
- id, user_id, reflection_date
- mood, day_summary, key_takeaway
```

**4. `moon_phases` Table**
```sql
- id, phase_date, phase_type
- description
```

---

## 🎯 Smart Features

### Auto-Scheduling
- When you create a session with specific days of the week (e.g., Monday, Wednesday, Friday)
- The calendar automatically displays session icons on all matching dates
- Example: "Morning Yoga" on Mon/Wed/Fri shows on every Mon/Wed/Fri in the month

### Multi-Session Days
- Days can have multiple sessions scheduled
- Calendar shows up to 3 icons
- If more than 3 sessions, shows "+N" indicator
- Click day to see full list

### Visual Priority System
1. **Today** - Always highlighted with accent ring
2. **Moon Phases** - Subtle indigo ring
3. **Scheduled Sessions** - Accent border
4. **Completed Sessions** - Green checkmark
5. **Reflections** - Book icon badge

---

## 📊 Monthly Statistics

The calendar displays:
- **Total Reflections** for the month
- **Total Sessions** completed
- **Mood Trends** - Visual breakdown by mood type
  - 🌙 Calm
  - ⚡️ Focused
  - 😊 Energized
  - 😐 Tired
  - 😟 Stressed

---

## 🚀 Quick Actions

### Floating "+" Button
- **Position:** Bottom right (above navigation)
- **Function:** Quick-create session for today
- **Animation:** Hover to scale, glowing effect
- **Z-index:** Above calendar, below modals

### Day Click Behavior
```typescript
IF day has scheduled sessions:
  → Show session list dialog
ELSE IF day is today or future:
  → Open create session dialog
ELSE IF day is past:
  → Open daily reflection drawer
```

---

## 🎨 UI Components Used

### Dialogs
1. **Create Session Dialog** - Uses `CreateSessionForm` component
2. **View Sessions Dialog** - Lists all sessions with start buttons
3. **Moon Phase Dialog** - Shows phase details and description
4. **Reflection Dialog** - Displays daily reflection with edit option
5. **Weekly Report Dialog** - Shows week summary with mood breakdown

### Cards
- **Monthly Stats Card** - Shows reflections and sessions count
- **Mood Trends Card** - Visual mood distribution
- **Session Cards** - In day view, shows session details

---

## 🔧 Technical Implementation

### Key Functions

```typescript
// Fetch scheduled sessions from database
fetchSessions()

// Calculate which calendar days have sessions
calculateDaySchedule(allSessions: Session[])

// Fetch completed session logs
fetchSessionLogs()

// Handle day click with smart routing
handleDayClick(dateStr: string, scheduledSessions: Session[])

// Get color for session type
getSessionTypeColor(type: SessionType)

// Get icon component for session type
getSessionTypeIcon(type: SessionType)
```

### State Management
- `sessions` - All active user sessions
- `daySchedule` - Mapping of dates to scheduled sessions
- `sessionLogs` - Completed session records
- `reflections` - Daily reflection entries
- `selectedDaySessions` - Sessions for currently viewed day

---

## 📱 Mobile Optimizations

- **Touch-friendly** - Large tap targets (75px min height)
- **Responsive grid** - 7-column layout adapts to screen
- **Smooth scrolling** - Overflow scroll for dialogs
- **Fixed navigation** - Always accessible at bottom
- **Z-index layers** - Proper stacking (nav > FAB > content)

---

## 🎯 Next Steps for Users

1. **Run SQL Migration** - Ensure `sessions` and `session_logs` tables exist
2. **Create First Session** - Click "+" button or tap a future date
3. **Schedule Recurring** - Use days_of_week for weekly patterns
4. **Track Progress** - Complete sessions, see checkmarks appear
5. **Review Monthly** - Use stats cards to track consistency

---

## 🐛 Troubleshooting

**Problem:** Sessions not appearing on calendar
- **Solution:** Check that `is_active = true` in database
- **Solution:** Verify `days_of_week` includes correct day names

**Problem:** Can't create sessions
- **Solution:** Ensure SQL migration ran successfully
- **Solution:** Check Supabase Row Level Security policies

**Problem:** Session icons not showing
- **Solution:** Hard refresh browser (Cmd+Shift+R)
- **Solution:** Check console for TypeScript errors

---

## 🎨 Color System

| Session Type | Icon | Color | Hex |
|-------------|------|-------|-----|
| Yoga | Activity | Purple | `text-purple-500` |
| Meditation | Brain | Blue | `text-blue-500` |
| Stretching | Dumbbell | Green | `text-green-500` |
| Breathing | Wind | Cyan | `text-cyan-500` |

---

## ✨ Feature Highlights

✅ **Real-time Updates** - Sessions appear immediately after creation  
✅ **Smart Scheduling** - Automatic weekly recurrence  
✅ **Visual Feedback** - Icons, badges, and checkmarks  
✅ **Multi-modal Access** - Multiple ways to create/view sessions  
✅ **Progress Tracking** - Monthly stats and completion markers  
✅ **Mobile-First** - Touch-optimized interactions  
✅ **Accessibility** - Clear visual hierarchy and large targets  

---

**Your calendar is now a powerful practice planning tool! 🧘‍♀️🌙**
