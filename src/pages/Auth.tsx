import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import onboardingBg from "@/assets/onboarding-bg.jpg";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);

    const { error } = isLogin 
      ? await signIn(email, password)
      : await signUp(email, password, displayName);

    setLoading(false);

    if (error) {
      toast.error(error.message || "Authentication failed");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        backgroundImage: `url(${onboardingBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-md" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-accent rounded-full animate-glow-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <Card className="relative z-10 w-full max-w-md p-8 bg-card/90 backdrop-blur-xl border-accent/40 shadow-float animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 mb-4 animate-float">
            <Sparkles className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-glow">
            {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin ? 'Continue your spiritual practice' : 'Create your account to start'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="displayName" className="text-sm font-medium">Display Name</Label>
              <Input
                id="displayName"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="bg-background/50 border-accent/30 focus:border-accent"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-background/50 border-accent/30 focus:border-accent"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-background/50 border-accent/30 focus:border-accent"
                required
                minLength={6}
              />
            </div>
          </div>

          {isLogin && (
            <div className="text-right">
              <Button
                type="button"
                variant="link"
                className="text-accent hover:text-accent/80 text-sm p-0 h-auto"
              >
                Forgot password?
              </Button>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold h-12 rounded-full shadow-glow hover:shadow-float transition-all duration-300 hover:scale-105"
          >
            {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            {' '}
            <Button
              type="button"
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-accent hover:text-accent/80 p-0 h-auto font-semibold"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </Button>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
