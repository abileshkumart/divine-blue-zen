# Weekly Calendar View on Home Screen

## Overview
The home screen now features a beautiful, user-friendly weekly calendar view that allows users to quickly access daily journal entries and session logging without navigating to separate pages.

## Features

### 1. **Weekly Overview Display**
- Shows current week (Sunday through Saturday)
- Displays date and day name for each day
- Highlights today with accent border and glow effect
- Week navigation with previous/next buttons
- Shows date range in header

### 2. **Visual Indicators Per Day**
Each day card shows:
- **Journal Entry**: Book icon + mood emoji if journal exists
- **Scheduled Sessions**: Session type emoji (🧘, 🧘‍♀️, 🤸, 💨)
- **Completion Status**: Green checkmark for completed sessions
- **Full Completion Badge**: "✓ Done" badge when all sessions complete
- **Today Highlight**: Accent colored ring with glow effect

### 3. **Daily Journal Logging**
- Click any day to open day details dialog
- **Add/Edit Journal** button in dialog
- Journal entry form includes:
  - Mood selector with emoji: Happy 😊, Calm 😌, Energized ✨, Peaceful 🕊️, Grateful 🙏, Neutral 😐, Tired 😴, Anxious 😰, Sad 😢
  - Large text area for reflection/thoughts
  - Save button to persist to database
- Stored in `daily_reflections` table with fields:
  - `mood`: Selected mood string
  - `day_summary`: Journal entry text
  - `reflection_date`: Date of entry

### 4. **Session Logging from Home**
Two ways to log sessions:

#### A. **Start Timer** (Full Experience)
- Opens SessionTracker page with timer
- Tracks mood before/after
- Records actual duration
- Adds notes
- Full practice experience

#### B. **Quick Log** (Fast Entry)
- "Log" button next to each session
- Opens compact dialog
- Enter actual duration (defaults to scheduled duration)
- Marks as complete immediately
- Perfect for logging past sessions

### 5. **Session Management**
Each day shows:
- All recurring sessions scheduled for that day of week
- Session name and duration
- Completion status (checkmark if logged)
- **Start** button: Navigate to SessionTracker
- **Log** button: Quick log dialog
- Link to calendar to add more sessions

## User Experience Flow

### Daily Journal Entry
1. User opens home screen
2. Sees weekly calendar with today highlighted
3. Clicks on today (or any day)
4. Day details dialog opens
5. Clicks "Add" button in Journal section
6. Selects mood from dropdown
7. Writes reflection in text area
8. Clicks "Save Journal"
9. Journal saved with mood emoji displayed

### Quick Session Logging
1. User completed a yoga session offline
2. Opens home screen
3. Clicks on today in weekly calendar
4. Sees scheduled yoga session with "Log" button
5. Clicks "Log"
6. Confirms/adjusts duration
7. Clicks "Log as Complete"
8. Session marked complete with checkmark
9. Profile stats auto-updated

### Starting a Session
1. User sees scheduled morning meditation
2. Clicks on today in weekly calendar
3. Sees meditation with "Start" button
4. Clicks "Start"
5. Navigates to SessionTracker page
6. Full timer experience with mood tracking
7. On completion, redirected to calendar
8. Session logged automatically

## Technical Implementation

### Components
- **File**: `/src/components/WeeklyCalendarView.tsx`
- **Used In**: Home page (`/src/pages/Home.tsx`)
- **Dependencies**: 
  - Shadcn/ui components (Dialog, Card, Button, Select, Textarea, Badge)
  - Supabase client
  - React Router (for navigation to SessionTracker)
  - Sonner (toast notifications)

### Data Sources
1. **daily_reflections table**
   - Fetched for the week date range
   - Filtered by user_id
   - Shows journal existence and mood

2. **sessions table**
   - Fetched all active recurring sessions
   - Filtered by days_of_week matching each day
   - Shows what's scheduled

3. **session_logs table**
   - Fetched for the week date range
   - Shows which sessions are completed
   - Used for completion checkmarks

### State Management
```typescript
- weekStart: Date (tracks which week is displayed)
- weekData: DayData[] (7 days with all info)
- selectedDay: DayData | null (currently viewed day)
- isJournalDialogOpen: boolean
- journalEntry: string
- selectedMood: string
- isQuickLogOpen: boolean
- selectedSessionForLog: Session | null
- quickLogDuration: string
```

### Key Functions
- `loadWeekData()`: Fetches all data for the week
- `handlePreviousWeek()`: Navigate to previous week
- `handleNextWeek()`: Navigate to next week
- `handleDayClick()`: Opens day details dialog
- `handleSaveJournal()`: Saves/updates journal entry
- `handleQuickLogSession()`: Logs session completion

## Design Features

### Color Coding
- **Today**: Accent color (purple) border with glow
- **Journal**: Indigo book icon
- **Sessions**: Accent color (purple) icons
- **Completed**: Green checkmarks and badges
- **All Complete**: Green gradient background

### Responsive Layout
- 7-column grid on desktop
- Horizontal scroll on mobile (future enhancement)
- Touch-friendly card sizes
- Large clickable areas

### Visual Feedback
- Hover effects on day cards
- Loading states during saves
- Toast notifications on success/error
- Animated fades for dialogs
- Glow effects on today

## Integration with Existing Features

### Calendar Page
- Home screen weekly view complements monthly calendar
- Both show sessions and completions
- Weekly view is faster for daily use
- Calendar better for scheduling new sessions

### Sessions Page
- Quick actions link to Sessions for management
- Sessions page for creating/editing recurring sessions
- Weekly view for quick logging

### SessionTracker Page
- "Start" button navigates to full tracker
- Timer, mood tracking, notes
- Full practice experience
- Auto-logs on completion

### Profile Page
- Stats auto-update on session logging
- `total_minutes_practiced` incremented
- Streak count managed separately

## Database Operations

### Insert Journal Entry
```sql
INSERT INTO daily_reflections (
  user_id, 
  reflection_date, 
  mood, 
  day_summary
) VALUES (?, ?, ?, ?)
```

### Update Journal Entry
```sql
UPDATE daily_reflections 
SET mood = ?, day_summary = ?
WHERE id = ? AND user_id = ?
```

### Quick Log Session
```sql
INSERT INTO session_logs (
  user_id,
  session_id,
  session_name,
  session_type,
  log_date,
  actual_duration_minutes,
  mood_before,
  mood_after,
  notes,
  completed
) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, true)
```

### Update Profile Stats
```sql
UPDATE profiles
SET total_minutes_practiced = total_minutes_practiced + ?
WHERE id = ?
```

## Future Enhancements

### Potential Additions
1. **Swipe Navigation**: Swipe left/right to change weeks on mobile
2. **Week Stats Summary**: Show total minutes/sessions for the week
3. **Habit Streaks**: Visual streak counter in weekly view
4. **Quick Add Session**: Button to quickly schedule a session for a day
5. **Mood Trends**: Mini graph showing mood patterns over the week
6. **Share Week**: Export weekly summary to share progress
7. **Customizable Week Start**: Toggle between Sunday/Monday start
8. **Mini Session Timer**: Start timer directly from weekly view card
9. **Batch Operations**: Mark multiple sessions complete at once
10. **Weekly Reflections**: Separate weekly summary entry

### Performance Optimizations
1. Cache week data to reduce refetches
2. Optimistic UI updates for faster feedback
3. Lazy load previous/next weeks
4. Debounce journal saves for auto-save feature
5. Virtual scrolling for many scheduled sessions

## User Benefits

1. **Faster Access**: No navigation to separate pages for daily tasks
2. **Visual Overview**: See whole week's progress at a glance
3. **Quick Logging**: Log past sessions in seconds
4. **Mood Tracking**: Easy daily mood + reflection entry
5. **Motivation**: Visual completion indicators encourage consistency
6. **Flexibility**: Choice between quick log or full timer experience
7. **Habit Formation**: Weekly view reinforces daily practice routine

## Accessibility

- Keyboard navigation support
- Screen reader friendly labels
- High contrast mode compatible
- Touch targets minimum 44x44px
- Clear visual hierarchy
- Error messages announced

## Testing Checklist

- [ ] Load current week on mount
- [ ] Navigate previous/next weeks
- [ ] Click day opens dialog
- [ ] Add new journal entry
- [ ] Edit existing journal entry
- [ ] Select different moods
- [ ] Start session navigates to tracker
- [ ] Quick log session completes
- [ ] Profile stats update on log
- [ ] Today is highlighted correctly
- [ ] Completed sessions show checkmarks
- [ ] All sessions complete shows badge
- [ ] Week range displays correctly
- [ ] Empty states handled gracefully
- [ ] Error handling for failed saves
- [ ] Multiple journals per week work
- [ ] Multiple sessions per day work

