import { Switch, Route, Router, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home, Pill, MessageCircle, Users, Sun, Moon } from "lucide-react";
import { useState, useEffect, createContext, useContext } from "react";
import HomePage from "@/pages/home";
import MedsPage from "@/pages/meds";
import ClarityPage from "@/pages/clarity";
import FamilyPage from "@/pages/family";
import NotFound from "@/pages/not-found";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

// Theme context
interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

// Nurilo Logo SVG
function NuriloLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="Nurilo"
      data-testid="nurilo-logo"
    >
      {/* Pill shape */}
      <rect x="4" y="10" width="24" height="12" rx="6" fill="currentColor" opacity="0.15" />
      <rect x="4" y="10" width="24" height="12" rx="6" stroke="currentColor" strokeWidth="2" />
      {/* Center divider */}
      <line x1="16" y1="10" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" />
      {/* Heart in the right half */}
      <path
        d="M22 14.5c0-1.1-.9-2-2-1.5-.5.2-.8.6-1 1-.2-.4-.5-.8-1-1-1.1-.5-2 .4-2 1.5 0 1.8 3 3.5 3 3.5s3-1.7 3-3.5z"
        fill="currentColor"
      />
    </svg>
  );
}

const tabs = [
  { path: "/", label: "Home", icon: Home },
  { path: "/meds", label: "Meds", icon: Pill },
  { path: "/clarity", label: "Clarity", icon: MessageCircle },
  { path: "/family", label: "Family", icon: Users },
];

function BottomNav() {
  const [location] = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md pb-safe"
      data-testid="bottom-nav"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {tabs.map((tab) => {
          const isActive = location === tab.path || (tab.path !== "/" && location.startsWith(tab.path));
          const isHomeActive = tab.path === "/" && location === "/";
          const active = tab.path === "/" ? isHomeActive : isActive;
          const Icon = tab.icon;
          return (
            <a
              key={tab.path}
              href={`#${tab.path}`}
              className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`nav-${tab.label.toLowerCase()}`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[11px] font-medium">{tab.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function AppHeader() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between max-w-lg mx-auto px-4 h-14">
        <div className="flex items-center gap-2">
          <NuriloLogo size={28} />
          <span className="text-lg font-bold tracking-tight" data-testid="app-title">Nurilo</span>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          data-testid="theme-toggle"
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}

function AppRouter() {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-lg mx-auto pb-32">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/meds" component={MedsPage} />
          <Route path="/meds/:id" component={MedsPage} />
          <Route path="/clarity" component={ClarityPage} />
          <Route path="/family" component={FamilyPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <div className="max-w-lg mx-auto px-4 pb-28">
        <PerplexityAttribution />
      </div>
      <BottomNav />
    </div>
  );
}

function App() {
  const [isDark, setIsDark] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeContext.Provider>
  );
}

export default App;
