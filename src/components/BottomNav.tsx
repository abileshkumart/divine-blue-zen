import { Button } from "@/components/ui/button";
import { Sunrise, Sparkles, Heart, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import MeditateIcon from "@/components/icons/MeditateIcon";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/home') {
      return location.pathname === '/home' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/home', icon: Sunrise, label: 'Home' },
    { path: '/meditate', icon: MeditateIcon, label: 'Meditate' },
    { path: '/idea', icon: Sparkles, label: 'Idea' },
    { path: '/gut', icon: Heart, label: 'Gut' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border/50 py-2 px-4 z-50 safe-area-inset-bottom">
      <div className="flex items-center justify-around max-w-md lg:max-w-lg xl:max-w-xl mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <Button
            key={path}
            variant="ghost"
            size="icon"
            onClick={() => navigate(path)}
            className={`flex flex-col gap-1 h-auto py-2 ${isActive(path) ? 'text-accent' : ''}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px]">{label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
