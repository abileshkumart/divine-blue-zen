import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, User, Bell, Moon, Shield, Trash2, 
  HelpCircle, MessageSquare, Star, Share2, 
  ChevronRight, LogOut, Palette, Volume2, Sun
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserSettings {
  displayName: string;
  notifications: boolean;
  dailyReminder: boolean;
  reminderTime: string;
  soundEnabled: boolean;
  darkMode: boolean;
}

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    displayName: "",
    notifications: true,
    dailyReminder: true,
    reminderTime: "08:00",
    soundEnabled: true,
    darkMode: true,
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    // Load from localStorage for now
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    // Get display name from profile
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user!.id)
      .single();
    
    if (data?.display_name) {
      setSettings(prev => ({ ...prev, displayName: data.display_name }));
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));

      // Update display name in profile
      if (settings.displayName) {
        await supabase
          .from('profiles')
          .update({ display_name: settings.displayName })
          .eq('id', user!.id);
      }

      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const clearLocalData = () => {
    localStorage.removeItem('userGutType');
    localStorage.removeItem('gutCheckins');
    localStorage.removeItem('userSettings');
    toast({
      title: "Local data cleared",
      description: "Your local cache has been cleared.",
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading settings..." />;
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="p-6 flex items-center gap-3 border-b border-border/50 backdrop-blur-sm bg-card/50 sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Settings</h1>
          <p className="text-xs text-muted-foreground">Customize your experience</p>
        </div>
        <Button 
          onClick={saveSettings} 
          disabled={saving}
          size="sm"
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </header>

      <main className="p-6 space-y-6">
        {/* Profile Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Profile
          </h2>
          <Card className="p-4 bg-card/80 border-border/50">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-indigo flex items-center justify-center text-xl font-bold">
                  {(settings.displayName || user?.email || 'U').substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={settings.displayName}
                    onChange={(e) => setSettings({ ...settings, displayName: e.target.value })}
                    placeholder="Your name"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="text-sm mt-1">{user?.email}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Notifications Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Notifications
          </h2>
          <Card className="p-4 bg-card/80 border-border/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-xs text-muted-foreground">Get notified about your practice</p>
                </div>
              </div>
              <Switch
                checked={settings.notifications}
                onCheckedChange={(checked) => setSettings({ ...settings, notifications: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-indigo-400" />
                <div>
                  <p className="font-medium">Daily Reminder</p>
                  <p className="text-xs text-muted-foreground">Remind me to practice</p>
                </div>
              </div>
              <Switch
                checked={settings.dailyReminder}
                onCheckedChange={(checked) => setSettings({ ...settings, dailyReminder: checked })}
              />
            </div>

            {settings.dailyReminder && (
              <div className="pl-8">
                <Label htmlFor="reminderTime">Reminder Time</Label>
                <Input
                  id="reminderTime"
                  type="time"
                  value={settings.reminderTime}
                  onChange={(e) => setSettings({ ...settings, reminderTime: e.target.value })}
                  className="mt-1 w-32"
                />
              </div>
            )}
          </Card>
        </div>

        {/* Preferences Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Preferences
          </h2>
          <Card className="p-4 bg-card/80 border-border/50 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-green-400" />
                <div>
                  <p className="font-medium">Sound Effects</p>
                  <p className="text-xs text-muted-foreground">Play sounds during sessions</p>
                </div>
              </div>
              <Switch
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, soundEnabled: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {resolvedTheme === "dark" ? (
                  <Moon className="w-5 h-5 text-indigo-400" />
                ) : (
                  <Sun className="w-5 h-5 text-orange-400" />
                )}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-xs text-muted-foreground">
                    {resolvedTheme === "dark" ? "Cosmic blue theme" : "Warm orange theme"}
                  </p>
                </div>
              </div>
              <Switch
                checked={resolvedTheme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            </div>
          </Card>
        </div>

        {/* Support Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Support
          </h2>
          <Card className="bg-card/80 border-border/50 divide-y divide-border/50">
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span>Help Center</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-muted-foreground" />
                <span>Send Feedback</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-muted-foreground" />
                <span>Rate the App</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Share2 className="w-5 h-5 text-muted-foreground" />
                <span>Share with Friends</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </Card>
        </div>

        {/* Privacy & Data Section */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Privacy & Data
          </h2>
          <Card className="bg-card/80 border-border/50 divide-y divide-border/50">
            <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span>Privacy Policy</span>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors text-orange-500">
                  <div className="flex items-center gap-3">
                    <Trash2 className="w-5 h-5" />
                    <span>Clear Local Data</span>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Local Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will clear your cached data including gut type and check-ins stored locally. 
                    Your account data in the cloud will remain safe.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clearLocalData}>Clear Data</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </Card>
        </div>

        {/* Account Actions */}
        <div className="space-y-3 pt-4">
          <Button 
            variant="outline" 
            className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* App Info */}
        <div className="text-center pt-6">
          <p className="text-xs text-muted-foreground">Divine Blue Zen</p>
          <p className="text-xs text-muted-foreground">Version 2.0.0</p>
        </div>
      </main>
    </div>
  );
};

export default Settings;
