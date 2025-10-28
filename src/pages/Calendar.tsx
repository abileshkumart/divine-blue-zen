import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Calendar = () => {
  const navigate = useNavigate();
  const [currentMonth] = useState(new Date());

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Mock data for completed days and moon phases
  const completedDays = [1, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19, 21];
  const moonDays = [1, 15, 30]; // Amavasai and Pournami

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-6 border-b border-border/50 backdrop-blur-sm bg-card/50">
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="rounded-full"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-glow">Yoga Calendar</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
        
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold">{monthName}</h2>
          <Button variant="ghost" size="icon" className="rounded-full">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Calendar Grid */}
      <main className="p-6 space-y-6">
        {/* Legend */}
        <div className="flex items-center justify-around text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Moon className="w-3 h-3 text-indigo" />
            <span className="text-muted-foreground">Moon Day</span>
          </div>
        </div>

        <Card className="p-4 bg-card/80 backdrop-blur-sm border-accent/20">
          {/* Day labels */}
          <div className="grid grid-cols-7 gap-2 mb-3">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-2">
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}
            {days.map((day) => {
              const isCompleted = completedDays.includes(day);
              const isMoonDay = moonDays.includes(day);
              const isToday = day === new Date().getDate();

              return (
                <button
                  key={day}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center relative
                    transition-all duration-200 hover:scale-105
                    ${isCompleted ? 'bg-accent/20 border-2 border-accent shadow-glow' : 'bg-secondary/30 border border-border/30'}
                    ${isToday ? 'ring-2 ring-indigo' : ''}
                  `}
                >
                  <span className={`text-sm font-semibold ${isCompleted ? 'text-accent' : 'text-foreground'}`}>
                    {day}
                  </span>
                  {isMoonDay && (
                    <Moon className="w-3 h-3 text-indigo absolute bottom-1 animate-glow-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        {/* Stats */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">This Month's Progress</h3>
          
          <Card className="p-5 bg-gradient-to-r from-accent/20 to-transparent border-accent/40">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-accent mb-1">{completedDays.length}</div>
                <div className="text-sm text-muted-foreground">Sessions Completed</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo">
                  {Math.round((completedDays.length / daysInMonth) * 100)}%
                </div>
                <div className="text-xs text-muted-foreground">Completion Rate</div>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-r from-indigo/20 to-transparent border-indigo/40">
            <div className="flex items-center gap-4">
              <Moon className="w-10 h-10 text-indigo animate-float" />
              <div>
                <div className="text-sm font-semibold text-indigo mb-1">Next Moon Day</div>
                <div className="text-xs text-muted-foreground">
                  Full Moon (Pournami) in 3 days
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 p-4">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/home')}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <div className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="flex flex-col gap-1 h-auto py-2 text-accent"
          >
            <div className="w-6 h-6" />
            <span className="text-xs">Calendar</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/affirmation')}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <div className="w-6 h-6" />
            <span className="text-xs">Affirmations</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <div className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Calendar;
