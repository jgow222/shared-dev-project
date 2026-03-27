import { Switch, Route, Router, useLocation } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import HomePage from "@/pages/home";
import MedsPage from "@/pages/meds";
import ClarityPage from "@/pages/clarity";
import FamilyPage from "@/pages/family";
import NotFound from "@/pages/not-found";
import { SplashScreen } from "@/components/SplashScreen";

/* ─── Theme Context ─── */
interface ThemeContextType { isDark: boolean; toggleTheme: () => void; }
export const ThemeContext = createContext<ThemeContextType>({ isDark: false, toggleTheme: () => {} });
export function useTheme() { return useContext(ThemeContext); }

/* ─── Nurilo Logo SVG — Organic teardrop + heartbeat ─── */
function NuriloMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="Nurilo"
      data-testid="nurilo-logo"
    >
      {/* Organic teardrop shape — slightly asymmetric, alive */}
      <path
        d="M16 3 C23.5 3 28 9 28 15.5 C28 22.5 22.5 29 16 29 C9.5 29 4 22.5 4 15.5 C4 9 8.5 3 16 3 Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Heartbeat line — compact version */}
      <path
        d="M7 16 L11 16 L12.5 12 L16 20 L19 13 L20.5 17 L21.5 16 L25 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/* ─── Custom Nav Icons (no Lucide) ─── */

// Home: rounded house with a small leaf at peak
function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M3 10.5 L12 3 L21 10.5 V20 C21 20.55 20.55 21 20 21 H15 V15 H9 V21 H4 C3.45 21 3 20.55 3 20 Z"
        stroke="currentColor"
        strokeWidth={active ? "2.2" : "1.8"}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? "0.12" : "0"}
      />
      {/* Tiny leaf at roof peak */}
      <path
        d="M12 3 C12 3 14 1.5 15 3 C14 3.5 12.5 3.2 12 3 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="currentColor"
        fillOpacity="0.7"
      />
    </svg>
  );
}

// Meds: capsule with organic leaf texture
function MedsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Capsule shell */}
      <path
        d="M8 5 H16 A5 5 0 0 1 16 19 H8 A5 5 0 0 1 8 5 Z"
        stroke="currentColor"
        strokeWidth={active ? "2.2" : "1.8"}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? "0.10" : "0"}
      />
      {/* Divider line */}
      <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="1.4" />
      {/* Small leaf stroke on right half */}
      <path
        d="M15 9 C17 10 17 14 15 15"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Clarity: speech bubble with a small heart cutout
function ClarityIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path
        d="M4 5 H20 C20.55 5 21 5.45 21 6 V15 C21 15.55 20.55 16 20 16 H8 L4 20 V6 C4 5.45 4.45 5 5 5 H4 Z"
        stroke="currentColor"
        strokeWidth={active ? "2.2" : "1.8"}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? "0.10" : "0"}
      />
      {/* Heart outline inside bubble */}
      <path
        d="M12 13 C12 13 9 11 9 9.5 C9 8.5 9.8 8 10.5 8 C11 8 11.6 8.3 12 8.8 C12.4 8.3 13 8 13.5 8 C14.2 8 15 8.5 15 9.5 C15 11 12 13 12 13 Z"
        stroke="currentColor"
        strokeWidth="1.3"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? "0.5" : "0"}
      />
    </svg>
  );
}

// Family: three soft overlapping circles — connection
function FamilyIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {/* Center circle */}
      <circle cx="12" cy="12" r="4.5"
        stroke="currentColor"
        strokeWidth={active ? "2.2" : "1.8"}
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? "0.12" : "0"}
      />
      {/* Left circle */}
      <circle cx="6.5" cy="14" r="3"
        stroke="currentColor"
        strokeWidth="1.5"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? "0.07" : "0"}
      />
      {/* Right circle */}
      <circle cx="17.5" cy="14" r="3"
        stroke="currentColor"
        strokeWidth="1.5"
        fill={active ? "currentColor" : "none"}
        fillOpacity={active ? "0.07" : "0"}
      />
    </svg>
  );
}

const tabs = [
  { path: "/",        label: "Home",    Icon: HomeIcon },
  { path: "/meds",    label: "Meds",    Icon: MedsIcon },
  { path: "/clarity", label: "Clarity", Icon: ClarityIcon },
  { path: "/family",  label: "Family",  Icon: FamilyIcon },
];

/* ─── Bottom Navigation ─── */
function BottomNav() {
  const [location] = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-md pb-safe"
      data-testid="bottom-nav"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto h-16">
        {tabs.map((tab) => {
          const isActive = tab.path === "/" ? location === "/" : location.startsWith(tab.path);
          const { Icon } = tab;
          return (
            <a
              key={tab.path}
              href={`#${tab.path}`}
              className={`flex flex-col items-center gap-0.5 px-4 py-2 transition-colors duration-200 ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`nav-${tab.label.toLowerCase()}`}
            >
              <motion.div
                animate={{ scale: isActive ? 1.08 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Icon active={isActive} />
              </motion.div>
              <span className="text-[10px] font-semibold tracking-wide">{tab.label}</span>
              <div className={`nav-dot ${isActive ? "active" : ""}`} />
            </a>
          );
        })}
      </div>
    </nav>
  );
}

/* ─── App Header ─── */
function AppHeader() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-background/96 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between max-w-lg mx-auto px-4 h-14">
        {/* Logo + Wordmark */}
        <div className="flex items-center gap-2.5 text-primary">
          <NuriloMark size={26} />
          <span
            className="text-[17px] font-bold text-foreground"
            style={{ letterSpacing: "-0.03em" }}
            data-testid="app-title"
          >
            Nurilo
          </span>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full hover:bg-secondary transition-colors flex items-center justify-center"
          data-testid="theme-toggle"
          aria-label="Toggle dark mode"
        >
          {isDark ? (
            /* Sun icon */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            /* Moon icon */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}

/* ─── Page transition wrapper ─── */
function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18 }}
    >
      {children}
    </motion.div>
  );
}

/* ─── App Router ─── */
function AppRouter() {
  const [location] = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-lg mx-auto pb-32">
          <Switch key={location}>
            <Route path="/">
              <PageWrapper><HomePage /></PageWrapper>
            </Route>
            <Route path="/meds">
              <PageWrapper><MedsPage /></PageWrapper>
            </Route>
            <Route path="/meds/:id">
              <PageWrapper><MedsPage /></PageWrapper>
            </Route>
            <Route path="/clarity">
              <PageWrapper><ClarityPage /></PageWrapper>
            </Route>
            <Route path="/family">
              <PageWrapper><FamilyPage /></PageWrapper>
            </Route>
            <Route>
              <PageWrapper><NotFound /></PageWrapper>
            </Route>
          </Switch>
      </main>
      <BottomNav />
    </div>
  );
}

/* ─── Root App ─── */
function App() {
  const [isDark, setIsDark] = useState(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <AnimatePresence>
            {showSplash && (
              <SplashScreen onComplete={() => setShowSplash(false)} />
            )}
          </AnimatePresence>
          {!showSplash && (
            <Router hook={useHashLocation}>
              <AppRouter />
            </Router>
          )}
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeContext.Provider>
  );
}

export default App;
