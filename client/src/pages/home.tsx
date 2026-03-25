import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import * as api from "@/lib/api";
import { Flame, Check, X, Activity, Calendar, ChevronRight, Lightbulb } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { UserProfile, Medication, DoseLog, HealthTip } from "@shared/schema";
import { useLocation } from "wouter";

function getGreeting(name?: string): string {
  const hour = new Date().getHours();
  let greeting: string;
  if (hour >= 5 && hour < 12) greeting = "Good morning";
  else if (hour >= 12 && hour < 17) greeting = "Good afternoon";
  else if (hour >= 17 && hour < 21) greeting = "Good evening";
  else greeting = "Hey";
  return name ? `${greeting}, ${name}` : greeting;
}

function getTimeStatus(scheduledTime: string): "upcoming" | "due" | "overdue-amber" | "overdue-red" {
  const now = new Date();
  const [h, m] = scheduledTime.split(":").map(Number);
  const scheduled = new Date();
  scheduled.setHours(h, m, 0, 0);
  const diffMin = (now.getTime() - scheduled.getTime()) / 60000;

  if (diffMin < -5) return "upcoming";
  if (diffMin < 30) return "due";
  if (diffMin < 120) return "overdue-amber";
  return "overdue-red";
}

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

interface DoseRowProps {
  dose: DoseLog;
  medication: Medication | undefined;
  onConfirm: (id: number) => void;
  onSkip: (id: number) => void;
}

function DoseRow({ dose, medication, onConfirm, onSkip }: DoseRowProps) {
  const status = dose.status;
  const timeStatus = status === "pending" ? getTimeStatus(dose.scheduled_time) : null;

  const getButtonStyle = () => {
    if (status === "taken") return "bg-[hsl(var(--nurilo-success))] text-white";
    if (status === "skipped") return "bg-muted text-muted-foreground line-through";
    if (timeStatus === "overdue-red") return "border-2 border-destructive text-destructive animate-red-pulse";
    if (timeStatus === "overdue-amber") return "border-2 border-[hsl(var(--nurilo-alert-amber))] text-[hsl(var(--nurilo-alert-amber))] animate-amber-pulse";
    return "border-2 border-primary text-primary";
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border"
      data-testid={`dose-row-${dose.id}`}
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" data-testid={`dose-name-${dose.id}`}>
          {medication?.name || "Unknown"}
        </p>
        <p className="text-xs text-muted-foreground">
          {medication?.dose_strength} {medication?.dose_unit} · {formatTime(dose.scheduled_time)}
        </p>
        {status === "taken" && dose.confirmed_at && (
          <p className="text-[11px] text-[hsl(var(--nurilo-success))] mt-0.5">
            Taken at {new Date(dose.confirmed_at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </p>
        )}
        {status === "skipped" && (
          <p className="text-[11px] text-muted-foreground mt-0.5">Skipped</p>
        )}
      </div>

      {status === "pending" && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSkip(dose.id)}
            className="w-9 h-9 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all"
            data-testid={`skip-dose-${dose.id}`}
            aria-label="Skip dose"
          >
            <X size={16} />
          </button>
          <button
            onClick={() => onConfirm(dose.id)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${getButtonStyle()}`}
            data-testid={`confirm-dose-${dose.id}`}
            aria-label="Confirm dose"
          >
            <Check size={20} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {status === "taken" && (
        <div className="w-12 h-12 rounded-full bg-[hsl(var(--nurilo-success))] flex items-center justify-center">
          <Check size={20} strokeWidth={2.5} className="text-white" />
        </div>
      )}

      {status === "skipped" && (
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          <X size={20} className="text-muted-foreground" />
        </div>
      )}
    </motion.div>
  );
}

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
      <div className="text-center text-white">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto mb-6"
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="36" stroke="white" strokeWidth="3" opacity="0.3" />
            <circle cx="40" cy="40" r="36" stroke="white" strokeWidth="3"
              strokeDasharray="226" strokeDashoffset="0"
              className="animate-draw-check" />
            <path d="M26 40L36 50L54 30" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
              className="animate-draw-check" style={{ animationDelay: "0.3s" }} />
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
          className="text-white/80 text-sm"
        >
          Take care of yourself{name ? `, ${name}` : ""}.
        </motion.p>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const [showCompletion, setShowCompletion] = useState(false);
  const [showNameInput, setShowNameInput] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [, navigate] = useLocation();

  const today = new Date().toISOString().split("T")[0];

  const { data: profile } = useQuery<UserProfile | null>({
    queryKey: ["profile"],
    queryFn: api.getProfile,
  });

  const { data: medications = [] } = useQuery<Medication[]>({
    queryKey: ["medications"],
    queryFn: () => api.getMedications(),
  });

  const { data: doseLogs = [] } = useQuery<DoseLog[]>({
    queryKey: ["doses", today],
    queryFn: () => api.getDoseLogs(today),
  });

  const { data: tips = [] } = useQuery<HealthTip[]>({
    queryKey: ["tips"],
    queryFn: api.getHealthTips,
  });

  const confirmDose = useMutation({
    mutationFn: async (id: number) => {
      await api.updateDoseLog(id, {
        status: "taken",
        confirmed_at: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doses", today] });
      // Check if all doses are now taken
      const remaining = doseLogs.filter(d => d.status === "pending");
      if (remaining.length === 1) {
        setShowCompletion(true);
      }
    },
  });

  const skipDose = useMutation({
    mutationFn: async (id: number) => {
      await api.updateDoseLog(id, { status: "skipped" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["doses", today] });
    },
  });

  const saveName = useMutation({
    mutationFn: async (name: string) => {
      if (profile) {
        await api.updateProfile(profile.id, { name });
      } else {
        await api.createProfile({ name, streak_days: 0, dark_mode: 0 });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setShowNameInput(false);
    },
  });

  const takenCount = doseLogs.filter(d => d.status === "taken").length;
  const totalCount = doseLogs.length;
  const streak = profile?.streak_days || 0;

  // Day of year for tip rotation
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const todayTip = tips.length > 0 ? tips[dayOfYear % tips.length] : null;

  const getMedForDose = (dose: DoseLog) => medications.find(m => m.id === dose.medication_id);

  // Sort doses: pending first (by time), then taken, then skipped
  const sortedDoses = [...doseLogs].sort((a, b) => {
    const order = { pending: 0, taken: 1, skipped: 2, missed: 3 };
    const oa = order[a.status as keyof typeof order] ?? 1;
    const ob = order[b.status as keyof typeof order] ?? 1;
    if (oa !== ob) return oa - ob;
    return a.scheduled_time.localeCompare(b.scheduled_time);
  });

  return (
    <div className="px-4 py-6 space-y-6">
      <AnimatePresence>
        {showCompletion && (
          <CompletionOverlay
            name={profile?.name || ""}
            onDismiss={() => setShowCompletion(false)}
          />
        )}
      </AnimatePresence>

      {/* Greeting + Streak */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold" data-testid="greeting">
            {getGreeting(profile?.name || undefined)}
          </h1>
          {!profile?.name && !showNameInput && (
            <button
              onClick={() => setShowNameInput(true)}
              className="text-xs text-primary font-medium mt-1"
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
            className="flex items-center gap-1.5 bg-[hsl(var(--nurilo-alert-amber))]/10 text-[hsl(var(--nurilo-alert-amber))] px-3 py-1.5 rounded-xl"
            data-testid="streak-badge"
          >
            <Flame size={16} />
            <span className="text-sm font-bold">{streak}</span>
          </motion.div>
        )}
      </div>

      {/* Name input */}
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
                className="flex-1 h-11 px-4 rounded-sm border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                data-testid="name-input"
                autoFocus
              />
              <button
                onClick={() => nameInput.trim() && saveName.mutate(nameInput.trim())}
                disabled={!nameInput.trim()}
                className="h-11 px-5 bg-primary text-primary-foreground rounded-md font-semibold text-sm disabled:opacity-40"
                data-testid="save-name-btn"
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Today's Doses */}
      <section>
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-3" data-testid="doses-section-label">
          Today's Medications
        </h2>
        <div className="space-y-3">
          {sortedDoses.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground" data-testid="no-doses">
              <Pill className="mx-auto mb-2 opacity-40" size={32} />
              <p className="text-sm">No medications scheduled for today</p>
            </div>
          ) : (
            sortedDoses.map((dose) => (
              <DoseRow
                key={dose.id}
                dose={dose}
                medication={getMedForDose(dose)}
                onConfirm={(id) => confirmDose.mutate(id)}
                onSkip={(id) => skipDose.mutate(id)}
              />
            ))
          )}
        </div>
      </section>

      {/* Quick Stats */}
      <section className="grid grid-cols-3 gap-3">
        <div className="bg-card rounded-lg border border-border p-3 text-center" data-testid="stat-taken">
          <p className="text-lg font-bold text-primary">{takenCount}/{totalCount}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Taken today</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 text-center" data-testid="stat-streak">
          <div className="flex items-center justify-center gap-1">
            <Flame size={14} className="text-[hsl(var(--nurilo-alert-amber))]" />
            <p className="text-lg font-bold">{streak}</p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Day streak</p>
        </div>
        <div className="bg-card rounded-lg border border-border p-3 text-center" data-testid="stat-active">
          <div className="flex items-center justify-center gap-1">
            <Calendar size={14} className="text-[hsl(var(--nurilo-sage))]" />
            <p className="text-lg font-bold">{Math.min(dayOfYear, 30)}</p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Active days</p>
        </div>
      </section>

      {/* Daily Health Tip */}
      {todayTip && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate("/clarity")}
          className="bg-secondary rounded-lg border border-border p-4 cursor-pointer hover:bg-accent transition-colors"
          data-testid="health-tip"
        >
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb size={16} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Daily Tip</p>
              <p className="text-sm font-semibold mb-1">{todayTip.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{todayTip.content}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 mt-1" />
          </div>
        </motion.section>
      )}
    </div>
  );
}

// Pill icon fallback used in no-doses state
function Pill({ className, size }: { className?: string; size?: number }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 1.5 3 3L5 13l-3-3a2.12 2.12 0 0 1 3-3l5.5-5.5Z" />
      <path d="m13.5 10.5 3 3" />
      <path d="M15.5 2.5 22 9" />
    </svg>
  );
}
