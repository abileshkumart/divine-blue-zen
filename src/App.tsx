import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Calendar from "./pages/Calendar";
import Affirmation from "./pages/Affirmation";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Sessions from "./pages/Sessions";
import Reflection from "./pages/Reflection";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/home" element={<Home />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/affirmation" element={<Affirmation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/reflection" element={<Reflection />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
