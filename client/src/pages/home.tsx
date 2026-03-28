import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import * as api from "@/lib/api";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile, Medication, DoseLog, HealthTip } from "@shared/schema";
import { useLocation } from "wouter";

/* ─── Helpers ─── */
function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  let g: string;
  if (hour >= 5 && hour < 12) g = "Good morning";
  else if (hour >= 12 && hour < 17) g = "Good afternoon";
  else if (hour >= 17 && hour < 21) g = "Good evening";
  else g = "Hey";
  return name ? `${g}, ${name}` : g;
}

function getTimeStatus(scheduledTime: string): "upcoming" | "due" | "overdue-amber" | "overdue-red" {
  const now = new Date();
  const [h, m] = scheduledTime.split(":").map(Number);
  const sched = new Date();
  sched.setHours(h, m, 0, 0);
  const diff = (now.getTime() - sched.getTime()) / 60000;
  if (diff < -5) return "upcoming";
  if (diff < 30) return "due";
  if (diff < 120) return "overdue-amber";
  return "overdue-red";
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

/* ─── Custom SVG Icons ─── */
function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 13 L10 18 L19 7" />
    </svg>
  );
}
function SkipXIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 L6 18 M6 6 L18 18" />
    </svg>
  );
}
function LeafFlameIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 C12 3 18 8 18 14 C18 18.4 15.3 21 12 21 C8.7 21 6 18.4 6 14 C6 10 9 6 12 3 Z" />
      <path d="M12 13 C12 13 14.5 11 15 14 C15.5 17 12 18 12 18" strokeOpacity="0.6" />
    </svg>
  );
}
function CalendarIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
function SeedTipIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21 V12" />
      <path d="M12 12 C12 12 7 11 7 6 C7 6 12 6 12 12 Z" />
      <path d="M12 10 C12 10 17 8 17 4 C17 4 12 5 12 10 Z" />
    </svg>
  );
}
function PillSVG({ className, size }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 5 H16 A5 5 0 0 1 16 19 H8 A5 5 0 0 1 8 5 Z" />
      <line x1="12" y1="5" x2="12" y2="19" />
    </svg>
  );
}
function ArrowRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12 H19 M13 6 L19 12 L13 18" />
    </svg>
  );
}

/* ─── Dose Card ─── */
interface DoseRowProps {
  dose: DoseLog;
  medication: Medication | undefined;
  onConfirm: (id: number) => void;
  onSkip: (id: number) => void;
}
function DoseRow({ dose, medication, onConfirm, onSkip }: DoseRowProps) {
  const status = dose.status;
  const timeStatus = status === "pending" ? getTimeStatus(dose.scheduled_time) : null;

  const accentClass =
    status === "taken"      ? "dose-card-taken" :
    status === "skipped"    ? "dose-card-skipped" :
    timeStatus === "overdue-red"   ? "dose-card-critical" :
    timeStatus === "overdue-amber" ? "dose-card-overdue" :
    "dose-card-pending";

  const confirmBtnClass =
    status === "taken"   ? "bg-[hsl(var(--nurilo-success))] text-white" :
    timeStatus === "overdue-red"   ? "border-2 border-destructive text-destructive animate-red-pulse" :
    timeStatus === "overdue-amber" ? "border-2 border-[hsl(var(--nurilo-alert-amber))] text-[hsl(var(--nurilo-alert-amber))] animate-amber-pulse" :
    "border-2 border-primary text-primary";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 25 }}
      className={`flex items-center gap-4 p-4 bg-card rounded-xl border border-border ${accentClass}`}
      data-testid={`dose-row-${dose.id}`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate text-foreground" data-testid={`dose-name-${dose.id}`}>
          {medication?.name || "Unknown"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {medication?.dose_strength} {medication?.dose_unit} · {formatTime(dose.scheduled_time)}
        </p>
        {status === "taken" && dose.confirmed_at && (
          <p className="text-[11px] text-[hsl(var(--nurilo-success))] mt-0.5 font-medium">
            Taken at {new Date(dose.confirmed_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </p>
        )}
        {status === "skipped" && (
          <p className="text-[11px] text-muted-foreground mt-0.5">Skipped</p>
        )}
      </div>

      {status === "pending" && (
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onSkip(dose.id)}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all"
            data-testid={`skip-dose-${dose.id}`}
            aria-label="Skip dose"
          >
            <SkipXIcon />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => onConfirm(dose.id)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${confirmBtnClass}`}
            data-testid={`confirm-dose-${dose.id}`}
            aria-label="Confirm dose"
          >
            <CheckIcon />
          </motion.button>
        </div>
      )}

      {status === "taken" && (
        <div className="w-12 h-12 rounded-full bg-[hsl(var(--nurilo-success))] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13 L10 18 L19 7" className="animate-draw-check" />
          </svg>
        </div>
      )}

      {status === "skipped" && (
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <SkipXIcon />
        </div>
      )}
    </motion.div>
  );
}

/* ─── All Done Overlay ─── */
function CompletionOverlay({ name, onDismiss }: { name: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2500);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onDismiss}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/90 backdrop-blur-sm cursor-pointer"
      data-testid="completion-overlay"
    >
      <div className="text-center text-white px-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mx-auto mb-6"
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="36" stroke="white" strokeWidth="2.5" opacity="0.20" />
            <motion.circle
              cx="40" cy="40" r="36"
              stroke="white"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="226"
              initial={{ strokeDashoffset: 226 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
            <motion.path
              d="M26 40 L36 50 L54 30"
              stroke="white"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              strokeDasharray="40"
              initial={{ strokeDashoffset: 40 }}
              animate={{ strokeDashoffset: 0 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            />
          </svg>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl font-bold mb-2"
        >
          All done for today!
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-white/80 text-sm font-medium"
        >
          Take care of yourself{name ? `, ${name}` : ""}.
        </motion.p>
      </div>
    </motion.div>
  );
}

/* ─── Home Page ─── */
export default function HomePage() {
  const [showCompletion, setShowCompletion] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [refillMed, setRefillMed] = useState<Medication | null>(null);
  const [, navigate] = useLocation();

  const today = new Date().toISOString().split("T")[0];

  const { data: profile } = useQuery<UserProfile | null>({ queryKey: ["profile"], queryFn: api.getProfile });
  const { data: medications = [] } = useQuery<Medication[]>({ queryKey: ["medications"], queryFn: () => api.getMedications() });
  const { data: doseLogs = [] } = useQuery<DoseLog[]>({ queryKey: ["doses", today], queryFn: () => api.getDoseLogs(today) });
  const { data: tips = [] } = useQuery<HealthTip[]>({ queryKey: ["tips"], queryFn: api.getHealthTips });

  const confirmDose = useMutation({
    mutationFn: async (id: number) => {
      await api.updateDoseLog(id, { status: "taken", confirmed_at: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doses", today] });
      const remaining = doseLogs.filter(d => d.status === "pending");
      if (remaining.length === 1) setShowCompletion(true);
    },
  });

  const skipDose = useMutation({
    mutationFn: async (id: number) => {
      await api.updateDoseLog(id, { status: "skipped" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["doses", today] }),
  });

  const saveName = useMutation({
    mutationFn: async (name: string) => {
      if (profile) await api.updateProfile(profile.id, { name });
      else await api.createProfile({ name, streak_days: 0, dark_mode: 0 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setShowNameInput(false);
    },
  });

  const takenCount = doseLogs.filter(d => d.status === "taken").length;
  const totalCount = doseLogs.length;
  const streak = profile?.streak_days || 0;
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayTip = tips.length > 0 ? tips[dayOfYear % tips.length] : null;
  const getMedForDose = (dose: DoseLog) => medications.find(m => m.id === dose.medication_id);

  const sortedDoses = [...doseLogs].sort((a, b) => {
    const order = { pending: 0, taken: 1, skipped: 2, missed: 3 };
    const oa = order[a.status as keyof typeof order] ?? 1;
    const ob = order[b.status as keyof typeof order] ?? 1;
    if (oa !== ob) return oa - ob;
    return a.scheduled_time.localeCompare(b.scheduled_time);
  });

  // Low supply: active meds with pill_count set and running low
  const lowSupplyMeds = medications.filter(m =>
    m.status === "active" && m.pill_count !== null && m.pill_count !== undefined && m.pill_count <= 14
  );

  // Progress ring calculation
  const pct = totalCount > 0 ? takenCount / totalCount : 0;
  const radius = 20;
  const circ = 2 * Math.PI * radius;
  const offset = circ * (1 - pct);

  return (
    <div className="px-4 py-6 space-y-6">
      <AnimatePresence>
        {showCompletion && (
          <CompletionOverlay name={profile?.name || ""} onDismiss={() => setShowCompletion(false)} />
        )}
      </AnimatePresence>

      {/* ── Greeting + Streak ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground" style={{ letterSpacing: "-0.02em" }} data-testid="greeting">
            {getGreeting(profile?.name || undefined)}
          </h1>
          {!profile?.name && !showNameInput && (
            <button
              onClick={() => setShowNameInput(true)}
              className="text-xs text-primary font-semibold mt-1 hover:opacity-80 transition-opacity"
              data-testid="set-name-btn"
            >
              Set your name →
            </button>
          )}
        </div>
        {streak > 0 && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="flex items-center gap-1.5 bg-[hsl(var(--nurilo-alert-amber))]/10 text-[hsl(var(--nurilo-alert-amber))] px-3 py-1.5 rounded-xl"
            data-testid="streak-badge"
          >
            <LeafFlameIcon size={15} />
            <span className="text-sm font-bold">{streak}</span>
          </motion.div>
        )}
      </div>

      {/* ── Name Input ── */}
      <AnimatePresence>
        {showNameInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                className="flex-1 h-11 px-4 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                data-testid="name-input"
                autoFocus
              />
              <button
                onClick={() => nameInput.trim() && saveName.mutate(nameInput.trim())}
                disabled={!nameInput.trim()}
                className="h-11 px-5 bg-primary text-primary-foreground rounded-xl font-semibold text-sm disabled:opacity-40 transition-opacity"
                data-testid="save-name-btn"
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Progress ring + quick stats ── */}
      <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border border-border">
        {/* SVG progress ring */}
        <div className="relative flex-shrink-0">
          <svg width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r={radius} stroke="hsl(var(--border))" strokeWidth="4" fill="none" />
            <motion.circle
              cx="28" cy="28" r={radius}
              stroke="hsl(var(--primary))"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circ}
              animate={{ strokeDashoffset: offset }}
              initial={{ strokeDashoffset: circ }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              transform="rotate(-90 28 28)"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-foreground">{takenCount}/{totalCount}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {totalCount === 0 ? "No doses today" :
             takenCount === totalCount ? "All taken today" :
             `${totalCount - takenCount} dose${totalCount - takenCount !== 1 ? "s" : ""} remaining`}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalCount > 0 ? `${Math.round(pct * 100)}% complete` : "Add medications to get started"}
          </p>
        </div>

        {/* Streak + Days */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <div className="flex items-center gap-1 text-[hsl(var(--nurilo-alert-amber))]">
            <LeafFlameIcon size={13} />
            <span className="text-xs font-bold">{streak} day streak</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <CalendarIcon size={12} />
            <span className="text-[11px]">{Math.min(dayOfYear, 30)} active days</span>
          </div>
        </div>
      </div>

      {/* ── Low Supply Warning ── */}
      <AnimatePresence>
        {lowSupplyMeds.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Running Low
            </h2>
            <div className="space-y-2">
              {lowSupplyMeds.map(med => {
                const critical = (med.pill_count ?? 0) <= 7;
                return (
                  <motion.div
                    key={med.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 border ${
                      critical
                        ? "bg-destructive/8 border-destructive/20"
                        : "bg-[hsl(var(--nurilo-alert-amber))]/8 border-[hsl(var(--nurilo-alert-amber))]/20"
                    }`}
                  >
                    {/* Warning icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      critical ? "bg-destructive/15" : "bg-[hsl(var(--nurilo-alert-amber))]/15"
                    }`}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
                        className={critical ? "text-destructive" : "text-[hsl(var(--nurilo-alert-amber))]"}>
                        <path d="M9 2L16 15H2L9 2z" />
                        <line x1="9" y1="8" x2="9" y2="11" />
                        <circle cx="9" cy="13" r="0.5" fill="currentColor" stroke="none" />
                      </svg>
                    </div>

                    {/* Med info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{med.name}</p>
                      <p className={`text-xs font-semibold mt-0.5 ${
                        critical ? "text-destructive" : "text-[hsl(var(--nurilo-alert-amber))]"
                      }`}>
                        {critical
                          ? `Only ${med.pill_count} left — refill soon`
                          : `${med.pill_count} remaining — getting low`}
                      </p>
                    </div>

                    {/* Refill button */}
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setRefillMed(med)}
                      className="flex-shrink-0 h-9 px-3.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
                    >
                      Find Refill
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* ── Today's Doses — only shown when there are medications ── */}
      {sortedDoses.length > 0 && (
        <section>
          <h2
            className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3"
            data-testid="doses-section-label"
          >
            Today’s Medications
          </h2>
          <motion.div
            className="space-y-3"
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            initial="hidden"
            animate="show"
          >
            {sortedDoses.map((dose) => (
              <DoseRow
                key={dose.id}
                dose={dose}
                medication={getMedForDose(dose)}
                onConfirm={(id) => confirmDose.mutate(id)}
                onSkip={(id) => skipDose.mutate(id)}
              />
            ))}
          </motion.div>
        </section>
      )}

      {/* ── Daily Health Tip ── */}
      {todayTip && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 160, damping: 20 }}
          onClick={() => navigate("/clarity")}
          className="bg-accent rounded-2xl border border-border p-4 cursor-pointer hover:bg-accent/80 active:scale-[0.98] transition-all"
          data-testid="health-tip"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5 text-primary">
              <SeedTipIcon size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Daily Tip</p>
              <p className="text-sm font-semibold text-foreground mb-1">{todayTip.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{todayTip.content}</p>
            </div>
            <div className="text-muted-foreground flex-shrink-0 mt-1">
              <ArrowRightIcon size={15} />
            </div>
          </div>
        </motion.section>
      )}

      {/* ── Refill Finder Sheet ── */}
      <AnimatePresence>
        {refillMed && (
          <RefillFinderSheet med={refillMed} onClose={() => setRefillMed(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Refill Finder Sheet ───────────────────────────────────────────────────
 * Slides up from the bottom. Shows options to find this med nearby:
 *  - Google Maps pharmacy search (uses device location if granted)
 *  - GoodRx price comparison
 *  - RxSaver price comparison
 *  - Amazon pharmacy
 * No API key needed — all are simple deep-links that open in browser.
 */

/* ─── Refill Finder Sheet ─────────────────────────────────────────────────────
 * Finds real pharmacies near the user using OpenStreetMap (Overpass API).
 * Runs via our own Supabase Edge Function — no third-party redirects.
 * Shows: distance, name, address, hours, phone, directions button.
 */

interface Pharmacy {
  id: number;
  name: string;
  distanceMiles: number;
  address: string;
  city: string;
  phone: string;
  hoursFormatted: string;
  isOpen: boolean | null;
  lat: number;
  lon: number;
  mapUrl: string;
  brand: string;
}

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://qpmjghocajyvugjxnkdn.supabase.co";
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbWpnaG9jYWp5dnVnanhua2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1ODM4MDQsImV4cCI6MjA5MDE1OTgwNH0.fzHBvHic5W6BZVUfD-dXEj0x6MaBeM6GyGEUsu8vQt0";

function RefillFinderSheet({ med, onClose }: { med: Medication; onClose: () => void }) {
  const [phase, setPhase] = useState<"locating" | "searching" | "results" | "error" | "no_location">("locating");
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);

  // Step 1: get device location, then search
  useEffect(() => {
    if (!navigator.geolocation) {
      setPhase("no_location");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserLat(lat);
        setUserLon(lon);
        setPhase("searching");

        try {
          const res = await fetch(`${SUPABASE_URL}/functions/v1/find-pharmacies`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
              "apikey": SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({ lat, lon, medication: med.name, radiusMiles: 5 }),
            signal: AbortSignal.timeout(20_000),
          });

          if (!res.ok) throw new Error(`Server error ${res.status}`);
          const data = await res.json();

          if (data.error && !data.pharmacies?.length) {
            setErrorMsg(data.error);
            setPhase("error");
          } else {
            setPharmacies(data.pharmacies || []);
            setPhase("results");
          }
        } catch (err: any) {
          setErrorMsg(err?.name === "AbortError" ? "Search timed out. Check your connection and try again." : "Couldn't load pharmacies. Try again.");
          setPhase("error");
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPhase("no_location");
        } else {
          setErrorMsg("Couldn't get your location. Make sure location is enabled.");
          setPhase("error");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const brandColor = (brand: string) => {
    const b = brand.toLowerCase();
    if (b.includes("cvs")) return "bg-[#cc0000]/10 text-[#cc0000]";
    if (b.includes("walgreens") || b.includes("duane")) return "bg-[#E31837]/10 text-[#E31837]";
    if (b.includes("rite aid")) return "bg-[#1a237e]/10 text-[#1a237e]";
    if (b.includes("walmart")) return "bg-[#0071CE]/10 text-[#0071CE]";
    if (b.includes("costco")) return "bg-[#005DAA]/10 text-[#005DAA]";
    return "bg-primary/10 text-primary";
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-black/50"
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 30, stiffness: 320 }}
        className="fixed bottom-0 left-0 right-0 z-[70] bg-card rounded-t-3xl pb-[88px] overflow-hidden"
        style={{ maxHeight: "88vh" }}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 border-b border-border">
          <div className="w-10 h-1 bg-border rounded-full mx-auto mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-base">Pharmacies Near You</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Looking for <span className="font-semibold text-foreground">{med.name}</span>
                {med.pill_count !== null && ` · ${med.pill_count} left`}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <line x1="4" y1="4" x2="12" y2="12" /><line x1="12" y1="4" x2="4" y2="12" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: "calc(88vh - 110px)" }}>

          {/* Locating */}
          {(phase === "locating" || phase === "searching") && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full border-2 border-border border-t-primary"
              />
              <div className="text-center">
                <p className="font-semibold text-sm">
                  {phase === "locating" ? "Getting your location…" : "Searching nearby pharmacies…"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {phase === "locating" ? "Allow location access when prompted" : "Scanning within 5 miles"}
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="flex flex-col items-center justify-center py-16 px-8 gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="text-destructive">
                  <path d="M12 2L22 20H2L12 2z" /><line x1="12" y1="10" x2="12" y2="14" /><circle cx="12" cy="18" r="0.5" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{errorMsg}</p>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => { setPhase("locating"); setPharmacies([]); }}
                className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
              >
                Try Again
              </motion.button>
            </div>
          )}

          {/* No location permission */}
          {phase === "no_location" && (
            <div className="flex flex-col items-center justify-center py-16 px-8 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" className="text-muted-foreground">
                  <circle cx="12" cy="10" r="4" /><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                  <line x1="3" y1="3" x2="21" y2="21" className="text-destructive" />
                </svg>
              </div>
              <p className="font-semibold">Location access needed</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enable location access in your browser settings to find pharmacies near you.
              </p>
            </div>
          )}

          {/* Results */}
          {phase === "results" && (
            <div className="px-4 pt-3 pb-4">
              {pharmacies.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">No pharmacies found within 5 miles.</p>
                  <p className="text-xs text-muted-foreground mt-1">Try expanding your search area.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                    {pharmacies.length} pharmacies found
                  </p>
                  {pharmacies.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-card border border-border rounded-2xl overflow-hidden"
                    >
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Brand badge */}
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black ${brandColor(p.brand || p.name)}`}>
                            {(p.brand || p.name).slice(0, 2).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-sm leading-snug truncate">{p.name}</p>
                              {p.isOpen === true && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 flex-shrink-0">
                                  Open
                                </span>
                              )}
                            </div>
                            {/* Distance */}
                            <p className="text-xs text-primary font-semibold mt-0.5">
                              {p.distanceMiles < 0.1 ? "Very close" : `${p.distanceMiles} miles away`}
                            </p>
                            {/* Address */}
                            {p.address && p.address !== "Address unavailable" && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {p.address}{p.city ? `, ${p.city}` : ""}
                              </p>
                            )}
                            {/* Hours */}
                            {p.hoursFormatted && (
                              <p className="text-xs text-muted-foreground mt-0.5">{p.hoursFormatted}</p>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                          {/* Directions — opens Google Maps directions */}
                          <motion.a
                            href={p.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileTap={{ scale: 0.96 }}
                            className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5"
                          >
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="6.5,1 12,10 1,10" />
                            </svg>
                            Directions
                          </motion.a>

                          {/* Call — only if phone available */}
                          {p.phone && (
                            <motion.a
                              href={`tel:${p.phone.replace(/\D/g, "")}`}
                              whileTap={{ scale: 0.96 }}
                              className="flex-1 h-9 rounded-xl bg-secondary border border-border text-foreground text-xs font-semibold flex items-center justify-center gap-1.5"
                            >
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 8.7c-.5-.5-1.2-.5-1.7 0l-.7.7c-1.3-.7-2.5-1.9-3.2-3.2l.7-.7c.5-.5.5-1.2 0-1.7L4.8 2.5c-.5-.5-1.2-.5-1.7 0L2.4 3.2C1.5 4.1 1.7 6 3.5 8.1c1.6 1.8 3.4 2.9 4.9 2.6l.9-.9c.5-.5.5-1.2 0-1.7L11 8.7z" />
                              </svg>
                              Call
                            </motion.a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  <p className="text-[11px] text-muted-foreground text-center pt-2 leading-relaxed">
                    Call ahead to confirm {med.name} availability. Stock may vary.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
