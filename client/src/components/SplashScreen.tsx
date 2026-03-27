import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"drawing" | "done">("drawing");

  useEffect(() => {
    // Auto-dismiss after 2.2s
    const t = setTimeout(onComplete, 2200);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        key="splash"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 1, 1] }}
        className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background"
        data-testid="splash-screen"
      >
        {/* Logo mark — organic teardrop with path-draw */}
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6"
        >
          <svg
            width="72"
            height="72"
            viewBox="0 0 72 72"
            fill="none"
            aria-label="Nurilo logo"
          >
            {/* Outer teardrop path — organic, slightly asymmetric */}
            <motion.path
              d="M36 8 C52 8 62 20 62 34 C62 50 50 64 36 64 C22 64 10 50 10 34 C10 20 20 8 36 8 Z"
              stroke="hsl(145 22% 45%)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="hsl(145 22% 45% / 0.10)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            />
            {/* Heartbeat line — single clean curve */}
            <motion.path
              d="M18 35 L27 35 L30 26 L35 44 L40 30 L43 38 L46 35 L54 35"
              stroke="hsl(145 22% 45%)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.55 }}
            />
          </svg>
        </motion.div>

        {/* Wordmark */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
          className="flex flex-col items-center gap-2"
        >
          <span
            className="text-2xl font-bold tracking-tight text-foreground"
            style={{ letterSpacing: "-0.03em" }}
          >
            Nurilo
          </span>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 1.3 }}
            className="text-sm text-muted-foreground font-medium"
          >
            Your daily care, simplified.
          </motion.p>
        </motion.div>

        {/* Skip button — appears after 800ms */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          onClick={onComplete}
          className="absolute bottom-10 text-xs text-muted-foreground font-medium px-4 py-2 rounded-full hover:bg-secondary transition-colors"
          data-testid="splash-skip"
        >
          Skip
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
