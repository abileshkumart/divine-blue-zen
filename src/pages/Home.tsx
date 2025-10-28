import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sunrise, Sunset, Moon, Sparkles, Calendar, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import mandalaPattern from "@/assets/mandala-pattern.jpg";

const Home = () => {
  const navigate = useNavigate();
  
  const getMoonPhase = () => {
    const date = new Date();
    const day = date.getDate();
    if (day === 1 || day === 30) return { phase: "New Moon (Amavasai)", icon: "🌑" };
    if (day === 15) return { phase: "Full Moon (Pournami)", icon: "🌕" };
    return { phase: "Waxing Crescent", icon: "🌒" };
  };

  const moonData = getMoonPhase();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-border/50 backdrop-blur-sm bg-card/50">
        <div>
          <h1 className="text-2xl font-bold text-glow">Namaste</h1>
          <p className="text-sm text-muted-foreground">Welcome back to your practice</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/profile')}
          className="rounded-full hover:bg-accent/20"
        >
          <User className="w-6 h-6 text-accent" />
        </Button>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6 pb-24">
        {/* Daily Affirmation */}
        <Card 
          className="p-6 bg-gradient-to-br from-card to-secondary border-accent/30 shadow-glow relative overflow-hidden animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url(${mandalaPattern})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-accent animate-glow-pulse" />
              <h2 className="text-sm font-semibold text-accent uppercase tracking-wider">Today's Affirmation</h2>
            </div>
            <p className="text-xl font-medium leading-relaxed mb-4">
              "I am at peace with myself and the universe flows through me"
            </p>
            <Button
              onClick={() => navigate('/affirmation')}
              variant="ghost"
              className="text-accent hover:text-accent hover:bg-accent/10"
            >
              View More Affirmations →
            </Button>
          </div>
        </Card>

        {/* Moon Phase Card */}
        <Card 
          className="p-6 bg-card/80 backdrop-blur-sm border-indigo/30 shadow-card animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-5xl animate-float">{moonData.icon}</div>
              <div>
                <h3 className="text-lg font-semibold">{moonData.phase}</h3>
                <p className="text-sm text-muted-foreground">Perfect for meditation</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/calendar')}
              className="rounded-full hover:bg-indigo/20"
            >
              <Calendar className="w-5 h-5 text-indigo" />
            </Button>
          </div>
        </Card>

        {/* Yoga Practice Cards */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground/90">Daily Practice</h2>
          
          <Card 
            className="p-5 bg-gradient-to-r from-accent/20 to-transparent border-accent/40 hover:shadow-glow transition-all duration-300 cursor-pointer animate-fade-in-up"
            style={{ animationDelay: '0.3s' }}
            onClick={() => navigate('/affirmation')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-accent/30 flex items-center justify-center">
                <Sunrise className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">Morning Yoga</h3>
                <p className="text-sm text-muted-foreground">15 min • Energizing flow</p>
              </div>
              <div className="text-sm text-accent font-medium">Start →</div>
            </div>
          </Card>

          <Card 
            className="p-5 bg-gradient-to-r from-indigo/20 to-transparent border-indigo/40 hover:shadow-glow transition-all duration-300 cursor-pointer animate-fade-in-up"
            style={{ animationDelay: '0.4s' }}
            onClick={() => navigate('/affirmation')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo/30 flex items-center justify-center">
                <Sunset className="w-6 h-6 text-indigo" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base">Evening Yoga</h3>
                <p className="text-sm text-muted-foreground">20 min • Relaxing flow</p>
              </div>
              <div className="text-sm text-indigo font-medium">Start →</div>
            </div>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-accent/20 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-1">7</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Day Streak</div>
            </div>
          </Card>
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-indigo/20 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo mb-1">142</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Sessions</div>
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
            className="flex flex-col gap-1 h-auto py-2 text-accent"
          >
            <Sunrise className="w-6 h-6" />
            <span className="text-xs">Home</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/calendar')}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <Calendar className="w-6 h-6" />
            <span className="text-xs">Calendar</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/affirmation')}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <Sparkles className="w-6 h-6" />
            <span className="text-xs">Affirmations</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="flex flex-col gap-1 h-auto py-2"
          >
            <User className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Home;
