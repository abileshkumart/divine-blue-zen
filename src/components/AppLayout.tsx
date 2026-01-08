import { ReactNode } from "react";

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * AppLayout - Responsive layout wrapper
 * - Mobile: Full width
 * - Tablet/Desktop: Centered with max-width, simulating mobile app experience
 */
const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop: Show decorative side panels */}
      <div className="hidden lg:fixed lg:inset-0 lg:flex lg:items-center lg:justify-center lg:pointer-events-none">
        {/* Left decorative gradient */}
        <div className="absolute left-0 top-0 w-1/4 h-full bg-gradient-to-r from-background via-background to-transparent" />
        {/* Right decorative gradient */}
        <div className="absolute right-0 top-0 w-1/4 h-full bg-gradient-to-l from-background via-background to-transparent" />
        
        {/* Floating orbs for desktop decoration */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      {/* Main content container - centered with max-width on larger screens */}
      <div className="relative mx-auto max-w-md lg:max-w-lg xl:max-w-xl min-h-screen bg-background lg:shadow-2xl lg:shadow-black/50 pb-20">
        {/* Subtle border effect on desktop */}
        <div className="hidden lg:block absolute inset-y-0 -left-px w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
        <div className="hidden lg:block absolute inset-y-0 -right-px w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent" />
        
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
