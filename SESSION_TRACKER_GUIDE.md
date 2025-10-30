# 🏃‍♀️ Session Tracker - Complete Guide

## Overview
The **Session Tracker** is a full-featured practice timer that guides users through their meditation, yoga, stretching, or breathing sessions with real-time tracking, mood monitoring, and automatic logging.

---

## 🎯 Features

### ⏱️ **Smart Timer**
- **Countdown Display**: Large, easy-to-read timer (MM:SS format)
- **Circular Progress**: Visual progress ring that fills as time elapses
- **Pause/Resume**: Full control over your practice
- **Early Stop**: End session before timer completes
- **Auto-Complete**: Timer automatically stops at 0:00

### 😊 **Mood Tracking**
- **Before Practice**: Select mood before starting (required)
- **After Practice**: Record how you feel after completing
- **5 Mood Options**: Calm 🌙, Focused ⚡️, Energized 😊, Tired 😐, Stressed 😟
- **Mood Comparison**: Track how practice changes your emotional state

### 📝 **Session Notes**
- Optional notes field after completion
- Record insights, observations, or reflections
- Helps identify what works best for you

### 🎨 **Session-Specific UI**
- **Color-coded by type**:
  - Yoga: Purple gradient
  - Meditation: Blue gradient
  - Stretching: Green gradient
  - Breathing: Cyan gradient
- **Custom icons** for each session type
- **Breathing instructions** for breathing sessions

### 📊 **Automatic Logging**
- Saves to `session_logs` table in database
- Records:
  - Session ID and name
  - Actual duration (calculated from timer)
  - Mood before and after
  - Notes
  - Completion status
  - Log date

### 📈 **Profile Stats Update**
- Automatically increments `total_sessions`
- Adds minutes to `total_minutes`
- Updates in real-time for dashboard display

---

## 🚀 User Flow

### 1. **Starting a Session**

**From Calendar:**
```
1. Click on date with session icon (🟣🔵🟢🔷)
2. View list of scheduled sessions
3. Click "Start" button on any session
4. → Navigates to Session Tracker
```

**From Sessions Page:**
```
1. Go to Sessions page
2. See list of active sessions
3. Click "Start" on any SessionCard
4. → Navigates to Session Tracker
```

### 2. **During Practice**

```
┌─────────────────────────────────────────┐
│  Session Tracker Screen                 │
├─────────────────────────────────────────┤
│                                         │
│  [< Back]    Practice Session      [ ] │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  🟣  Morning Yoga                 │ │
│  │      yoga • 30 minutes            │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │         ⚫────────⚫               │ │
│  │        ╱            ╲             │ │
│  │       │              │            │ │
│  │       │    29:45     │            │ │
│  │       │  In Progress │            │ │
│  │        ╲            ╱             │ │
│  │         ⚫────────⚫               │ │
│  │                                   │ │
│  │   [Pause]      [Stop]            │ │
│  └───────────────────────────────────┘ │
│                                         │
│  For Breathing Sessions:                │
│  ┌───────────────────────────────────┐ │
│  │  Box Breathing                    │ │
│  │      ⭕ (animated)                │ │
│  │  Inhale (4s) → Hold (4s) →       │ │
│  │  Exhale (4s) → Hold (4s)         │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Timer Controls:**
- ▶️ **Start**: Begin countdown (requires mood selection)
- ⏸️ **Pause**: Pause timer (can resume)
- ⏹️ **Stop**: End session early and proceed to completion

### 3. **Initial Mood Selection**

Before starting, user must select their current mood:
- Prevents starting without baseline mood data
- Shows error toast if attempting to start without mood
- Simple one-tap selection from 5 emoji options

### 4. **Completion Flow**

```
Timer reaches 0:00 OR User clicks Stop
              ↓
┌─────────────────────────────────────────┐
│  Session Complete! 🎉                   │
├─────────────────────────────────────────┤
│                                         │
│  How do you feel now?                   │
│  [🌙] [⚡️] [😊] [😐] [😟]             │
│                                         │
│  Session Notes (Optional)               │
│  ┌─────────────────────────────────┐   │
│  │ Great session! Feeling          │   │
│  │ more relaxed and centered...    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  [✓ Complete & Save Session]           │
└─────────────────────────────────────────┘
```

**Required:**
- Select "after" mood

**Optional:**
- Add session notes

**Action:**
- Click "Complete & Save Session"
- Data saved to database
- Profile stats updated
- Navigate back to Calendar
- Calendar shows ✓ checkmark on today's date

---

## 📦 Technical Details

### File Location
```
/src/pages/SessionTracker.tsx
```

### Route
```typescript
/session-tracker
```

### Navigation State
```typescript
navigate('/session-tracker', { 
  state: { 
    session: Session // Full session object
  } 
});
```

### Required Session Data
```typescript
interface Session {
  id: string;
  session_name: string;
  session_type: 'yoga' | 'meditation' | 'stretching' | 'breathing';
  duration_minutes: number;
  // ... other fields
}
```

### Database Tables Used

**1. session_logs** (INSERT)
```sql
{
  user_id: UUID,
  session_id: UUID,
  session_name: TEXT,
  session_type: TEXT,
  log_date: DATE,
  actual_duration_minutes: INTEGER,
  mood_before: TEXT,
  mood_after: TEXT,
  notes: TEXT,
  completed: BOOLEAN
}
```

**2. profiles** (UPDATE)
```sql
{
  total_sessions: total_sessions + 1,
  total_minutes: total_minutes + actual_duration
}
```

---

## 🎨 UI Components

### Timer Display
- **Size**: 256x256px circular timer
- **Progress Ring**: SVG circle with animated stroke
- **Animation**: Pulsing scale effect during active session
- **Colors**: Matches session type (purple/blue/green/cyan)

### Mood Selector
- **Grid**: 5 columns
- **Size**: Touch-friendly buttons
- **Visual**: Large emoji + label
- **State**: Highlighted when selected

### Control Buttons
- **Start**: Full width, accent color, glow effect
- **Pause/Resume**: Outline style, toggles text
- **Stop**: Destructive red color
- **Complete**: Full width, accent color, checkmark icon

### Special Features
- **Breathing Animation**: Pulsing circle for breathing sessions
- **Progress Percentage**: Calculated and displayed in real-time
- **Time Formatting**: MM:SS with zero-padding
- **Session Icon**: Type-specific icon in header

---

## ⚡ Real-Time Features

### Timer Logic
```typescript
- Countdown from duration_minutes * 60 seconds
- Updates every 1 second (setInterval)
- Pauses when isPaused = true
- Stops and clears on completion
- Calculates elapsed time for actual_duration
```

### State Management
```typescript
const [timeRemaining, setTimeRemaining] = useState(0);
const [isRunning, setIsRunning] = useState(false);
const [isPaused, setIsPaused] = useState(false);
const [moodBefore, setMoodBefore] = useState('');
const [moodAfter, setMoodAfter] = useState('');
const [notes, setNotes] = useState('');
const [isComplete, setIsComplete] = useState(false);
const [actualDuration, setActualDuration] = useState(0);
```

### Auto-Cleanup
- `useEffect` cleanup clears interval on unmount
- Prevents memory leaks
- Ensures timer stops when navigating away

---

## 🎯 Success Indicators

**After logging session:**
1. ✅ Toast: "Session logged successfully! 🎉"
2. ✅ Navigate to Calendar automatically
3. ✅ Calendar shows ✓ checkmark on today
4. ✅ Monthly stats increment by 1 session
5. ✅ Profile total_minutes increases
6. ✅ Home page stats update

---

## 💡 Tips & Best Practices

### For Users
- Select mood honestly before starting
- Use pause if you need a break
- Add notes for memorable sessions
- Check mood improvement trends over time

### For Developers
- Session object must be passed via navigation state
- Timer uses useRef for interval management
- All database fields use `as any` for type casting (until Supabase types regenerated)
- Framer Motion used for smooth animations
- Responsive design works on all screen sizes

---

## 🔄 What Happens After Completion

```
Session Logged
      ↓
Database Updated
      ↓
Profile Stats +1 session, +N minutes
      ↓
Navigate to Calendar
      ↓
Calendar Fetches New Data
      ↓
Today's Date Shows ✓
      ↓
User Can Start Another Session!
```

---

## 🎨 Visual States

### Pre-Start
- Timer shows full duration
- "Ready to Start" message
- Mood selector visible
- Start button enabled (if mood selected)

### Running
- Timer counting down
- "In Progress" message
- Progress ring filling up
- Pause/Stop buttons visible
- (Breathing: animated instructions)

### Paused
- Timer frozen
- "Paused" message
- Resume button shows
- Stop button available

### Complete
- Timer at 00:00
- "Complete!" message
- After mood selector visible
- Notes textarea visible
- Complete button enabled

---

## 🚀 Quick Start

**To test the Session Tracker:**

1. Create a session (any type, any duration)
2. Go to Calendar
3. Click on today's date
4. Click "Start" on your session
5. Select a "before" mood
6. Click "Start" button
7. Watch timer count down
8. (Optional) Test Pause/Resume
9. (Optional) Test Stop early
10. When complete, select "after" mood
11. (Optional) Add notes
12. Click "Complete & Save Session"
13. See checkmark on calendar! ✓

---

Your session tracking is now LIVE and working! 🎉🧘‍♀️

