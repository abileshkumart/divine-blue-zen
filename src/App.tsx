import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import AppLayout from "./components/AppLayout";
import InstallPWA from "./components/InstallPWA";
import ScrollToTop from "./components/ScrollToTop";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Meditate from "./pages/Meditate";
import Idea from "./pages/Idea";
import Gut from "./pages/Gut";
import GutQuiz from "./pages/GutQuiz";
import GutCheckin from "./pages/GutCheckin";
import GutRecipes from "./pages/GutRecipes";
import GutLearn from "./pages/GutLearn";
import GutMealPlan from "./pages/GutMealPlan";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Sessions from "./pages/Sessions";
import SessionTracker from "./pages/SessionTracker";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <ScrollToTop />
            <AppLayout>
              <Routes>
                <Route path="/" element={<Onboarding />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/home" element={<Home />} />
                <Route path="/meditate" element={<Meditate />} />
                <Route path="/idea" element={<Idea />} />
                <Route path="/gut" element={<Gut />} />
                <Route path="/gut/quiz" element={<GutQuiz />} />
                <Route path="/gut/checkin" element={<GutCheckin />} />
                <Route path="/gut/recipes" element={<GutRecipes />} />
                <Route path="/gut/learn" element={<GutLearn />} />
                <Route path="/gut/mealplan" element={<GutMealPlan />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/sessions" element={<Sessions />} />
                <Route path="/session-tracker" element={<SessionTracker />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <InstallPWA />
            </AppLayout>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
