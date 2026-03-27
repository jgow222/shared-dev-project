import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import * as api from "@/lib/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Medication, DoseLog } from "@shared/schema";

// ─── Custom SVG Icons (no Lucide) ─────────────────────────────────────────────

function PlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <line x1="8" y1="3" x2="8" y2="13" />
      <line x1="3" y1="8" x2="13" y2="8" />
    </svg>
  );
}

function DotsVertIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3.5" r="1.25" />
      <circle cx="8" cy="8" r="1.25" />
      <circle cx="8" cy="12.5" r="1.25" />
    </svg>
  );
}

function CapsuleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {/* Capsule body */}
      <rect x="4" y="9" width="16" height="6" rx="3" />
      {/* Center divider */}
      <line x1="12" y1="9" x2="12" y2="15" strokeWidth={1.4} strokeDasharray="0" />
      {/* Small leaf accent on right half */}
      <path d="M14.5 11.5 C15.5 10.8 16.5 11 16.5 12 C16.5 13 15.5 13.2 14.5 12.5" strokeWidth={1.2} fill="none" />
    </svg>
  );
}

function WarnIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2L14.5 13H1.5L8 2Z" />
      <line x1="8" y1="7" x2="8" y2="10" />
      <circle cx="8" cy="11.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PauseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="currentColor">
      <rect x="2.5" y="2" width="3" height="10" rx="1" />
      <rect x="8.5" y="2" width="3" height="10" rx="1" />
    </svg>
  );
}

function PlayIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="currentColor">
      <path d="M3 2.5L11 7L3 11.5V2.5Z" />
    </svg>
  );
}

function ArchiveBoxIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="4.5" width="11" height="8" rx="1" />
      <path d="M1.5 4.5H12.5V3C12.5 2.4 12 2 11.5 2H2.5C2 2 1.5 2.4 1.5 3V4.5Z" />
      <line x1="5" y1="7.5" x2="9" y2="7.5" />
    </svg>
  );
}

function TrashIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3.5H12" />
      <path d="M5 3.5V2.5C5 2 5.5 1.5 6 1.5H8C8.5 1.5 9 2 9 2.5V3.5" />
      <path d="M3 3.5L3.5 11.5C3.5 12 4 12.5 4.5 12.5H9.5C10 12.5 10.5 12 10.5 11.5L11 3.5" />
      <line x1="5.5" y1="6" x2="5.5" y2="10" />
      <line x1="8.5" y1="6" x2="8.5" y2="10" />
    </svg>
  );
}

function EditIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2.5L11.5 5L5 11.5H2.5V9L9 2.5Z" />
      <line x1="7.5" y1="4" x2="10" y2="6.5" />
    </svg>
  );
}

function ChevronLeftIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 4L7 10L13 16" />
    </svg>
  );
}

function PackageIcon({ size = 10 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="8" height="6.5" rx="0.8" />
      <path d="M1 3.5L5 1.5L9 3.5" />
      <line x1="3.5" y1="5.5" x2="6.5" y2="5.5" />
    </svg>
  );
}

function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <line x1="5" y1="5" x2="15" y2="15" />
      <line x1="15" y1="5" x2="5" y2="15" />
    </svg>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FORMS = ["Tablet", "Capsule", "Liquid", "Injection", "Inhaler", "Patch", "Drops"];
const UNITS = ["mg", "mcg", "ml", "IU", "units"];
const FREQUENCIES = ["Once daily", "Twice daily", "Three times daily", "As needed", "Specific days"];

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function getRefillBadge(pillCount: number | null): { text: string; color: string } | null {
  if (pillCount === null || pillCount === undefined) return null;
  if (pillCount <= 7) return { text: `${pillCount} pills left`, color: "bg-destructive/10 text-destructive" };
  if (pillCount <= 14) return { text: `${pillCount} pills left`, color: "bg-[hsl(var(--nurilo-alert-amber))]/10 text-[hsl(var(--nurilo-alert-amber))]" };
  return null;
}

// ─── MedCard ─────────────────────────────────────────────────────────────────

function MedCard({ med, onEdit, onDetail }: { med: Medication; onEdit: () => void; onDetail: () => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const refillBadge = getRefillBadge(med.pill_count);

  const deleteMed = useMutation({
    mutationFn: async () => { await api.deleteMedication(med.id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["medications"] }); setShowMenu(false); },
  });

  const togglePause = useMutation({
    mutationFn: async () => {
      const newStatus = med.status === "paused" ? "active" : "paused";
      await api.updateMedication(med.id, { status: newStatus });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["medications"] }); setShowMenu(false); },
  });

  const archiveMed = useMutation({
    mutationFn: async () => { await api.updateMedication(med.id, { status: "archived" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["medications"] }); setShowMenu(false); },
  });

  const times: string[] = JSON.parse(med.schedule_times);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.985 }}
      className={`bg-card rounded-xl border border-border relative overflow-hidden ${med.status === "paused" ? "opacity-60" : ""}`}
      data-testid={`med-card-${med.id}`}
    >
      {/* Left accent bar — sage for active, amber for paused */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${
        med.status === "paused"
          ? "bg-[hsl(var(--nurilo-alert-amber))]"
          : med.is_critical
            ? "bg-destructive"
            : "bg-primary"
      }`} />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start gap-3">
          {/* Capsule icon */}
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CapsuleIcon size={18} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onDetail}>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-sm leading-snug tracking-tight" data-testid={`med-name-${med.id}`}>
                {med.name}
              </h3>
              {med.status === "paused" && (
                <span className="text-[10px] font-semibold bg-[hsl(var(--nurilo-alert-amber))]/10 text-[hsl(var(--nurilo-alert-amber))] px-2 py-0.5 rounded-full">
                  Paused
                </span>
              )}
              {med.is_critical === 1 && (
                <span className="text-[10px] font-semibold bg-destructive/10 text-destructive px-2 py-0.5 rounded-full">
                  Critical
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {med.dose_strength} {med.dose_unit} {med.form} · {med.frequency}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {times.map(formatTime).join("  ·  ")}
            </p>
            {med.purpose && (
              <p className="text-[11px] text-primary mt-1.5 font-medium">For {med.purpose}</p>
            )}
            {refillBadge && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full mt-2 ${refillBadge.color}`}
                data-testid={`refill-badge-${med.id}`}
              >
                <PackageIcon size={10} />
                {refillBadge.text}
              </span>
            )}
          </div>

          {/* Menu button */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
              data-testid={`med-menu-${med.id}`}
            >
              <DotsVertIcon size={16} />
            </motion.button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.93, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.93, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-9 z-50 w-44 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                  >
                    <button
                      onClick={onEdit}
                      className="w-full px-3.5 py-3 text-left text-sm flex items-center gap-2.5 hover:bg-secondary transition-colors"
                      data-testid={`edit-med-${med.id}`}
                    >
                      <EditIcon size={14} /> Edit
                    </button>
                    <button
                      onClick={() => togglePause.mutate()}
                      className="w-full px-3.5 py-3 text-left text-sm flex items-center gap-2.5 hover:bg-secondary transition-colors"
                      data-testid={`pause-med-${med.id}`}
                    >
                      {med.status === "paused" ? <PlayIcon size={14} /> : <PauseIcon size={14} />}
                      {med.status === "paused" ? "Resume" : "Pause"}
                    </button>
                    <button
                      onClick={() => archiveMed.mutate()}
                      className="w-full px-3.5 py-3 text-left text-sm flex items-center gap-2.5 hover:bg-secondary transition-colors"
                      data-testid={`archive-med-${med.id}`}
                    >
                      <ArchiveBoxIcon size={14} /> Archive
                    </button>
                    <div className="h-px bg-border mx-3" />
                    <button
                      onClick={() => deleteMed.mutate()}
                      className="w-full px-3.5 py-3 text-left text-sm flex items-center gap-2.5 text-destructive hover:bg-destructive/10 transition-colors"
                      data-testid={`delete-med-${med.id}`}
                    >
                      <TrashIcon size={14} /> Delete
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── MedDetail ───────────────────────────────────────────────────────────────

function MedDetail({ med, onClose }: { med: Medication; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "info">("overview");
  const times: string[] = JSON.parse(med.schedule_times);

  const { data: doseHistory = [] } = useQuery<DoseLog[]>({
    queryKey: ["doses", "medication", med.id],
    queryFn: () => api.getDoseLogsForMed(med.id),
  });

  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const getHeatmapColor = (date: string) => {
    const logs = doseHistory.filter(d => d.scheduled_date === date);
    if (logs.length === 0) return "bg-muted";
    const taken = logs.filter(d => d.status === "taken").length;
    if (taken === logs.length) return "bg-[hsl(var(--nurilo-success))]";
    if (taken > 0) return "bg-[hsl(var(--nurilo-success))]/50";
    const missed = logs.some(d => d.status === "missed" || d.status === "skipped");
    if (missed) return "bg-destructive/60";
    return "bg-muted";
  };

  const adherencePercent = doseHistory.length > 0
    ? Math.round((doseHistory.filter(d => d.status === "taken").length / doseHistory.length) * 100)
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
          data-testid="back-to-meds"
        >
          <ChevronLeftIcon size={20} />
        </motion.button>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <CapsuleIcon size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold tracking-tight leading-tight" data-testid="med-detail-name">{med.name}</h2>
          <p className="text-xs text-muted-foreground">{med.dose_strength} {med.dose_unit} {med.form}</p>
        </div>
        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
          med.status === "active" ? "bg-[hsl(var(--nurilo-success))]/10 text-[hsl(var(--nurilo-success))]" :
          med.status === "paused" ? "bg-[hsl(var(--nurilo-alert-amber))]/10 text-[hsl(var(--nurilo-alert-amber))]" :
          "bg-muted text-muted-foreground"
        }`}>
          {med.status.charAt(0).toUpperCase() + med.status.slice(1)}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-xl p-1">
        {(["overview", "history", "info"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
            data-testid={`tab-${tab}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Schedule</p>
            <p className="text-sm">{med.frequency} · {times.map(formatTime).join(",  ")}</p>
          </div>
          {med.pill_count !== null && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Supply</p>
              <p className="text-sm">{med.pill_count} pills remaining</p>
            </div>
          )}
          {med.purpose && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Purpose</p>
              <p className="text-sm">{med.purpose}</p>
            </div>
          )}
          {med.doctor && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Prescriber</p>
              <p className="text-sm">{med.doctor}</p>
            </div>
          )}
          {med.pharmacy && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Pharmacy</p>
              <p className="text-sm">{med.pharmacy}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Adherence bar */}
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">30-Day Adherence</p>
            <div className="flex items-center gap-3">
              <p className="text-3xl font-bold text-primary tracking-tight">{adherencePercent}%</p>
              <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${adherencePercent}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>

          {/* Calendar heatmap */}
          <div className="bg-card rounded-xl border border-border p-5">
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Calendar</p>
            <div className="grid grid-cols-7 gap-1.5" data-testid="heatmap">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="text-center text-[9px] text-muted-foreground font-bold uppercase">{d}</div>
              ))}
              {Array.from({ length: new Date(last30Days[0]).getDay() }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {last30Days.map(date => (
                <div
                  key={date}
                  className={`aspect-square rounded-md ${getHeatmapColor(date)}`}
                  title={date}
                />
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {[
                { cls: "bg-[hsl(var(--nurilo-success))]", label: "All taken" },
                { cls: "bg-[hsl(var(--nurilo-success))]/50", label: "Partial" },
                { cls: "bg-destructive/60", label: "Missed" },
                { cls: "bg-muted", label: "N/A" },
              ].map(({ cls, label }) => (
                <span key={label} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className={`w-2.5 h-2.5 rounded-sm ${cls}`} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "info" && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-3">
          <p className="text-sm text-muted-foreground leading-relaxed">
            General information about {med.name} would appear here, including common side effects,
            drug interactions, and storage instructions.
          </p>
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            Always consult your doctor or pharmacist for medication-specific guidance.
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ─── MedForm ─────────────────────────────────────────────────────────────────

function MedForm({ med, onClose }: { med?: Medication; onClose: () => void }) {
  const isEdit = !!med;
  const [name, setName] = useState(med?.name || "");
  const [doseStrength, setDoseStrength] = useState(med?.dose_strength || "");
  const [doseUnit, setDoseUnit] = useState(med?.dose_unit || "mg");
  const [form, setForm] = useState(med?.form || "Tablet");
  const [purpose, setPurpose] = useState(med?.purpose || "");
  const [doctor, setDoctor] = useState(med?.doctor || "");
  const [pharmacy, setPharmacy] = useState(med?.pharmacy || "");
  const [frequency, setFrequency] = useState(med?.frequency || "Once daily");
  const [times, setTimes] = useState<string[]>(med ? JSON.parse(med.schedule_times) : ["08:00"]);
  const [pillCount, setPillCount] = useState<string>(med?.pill_count?.toString() || "");
  const [interactionWarning, setInteractionWarning] = useState<{ severity: string; message: string } | null>(null);

  const saveMed = useMutation({
    mutationFn: async () => {
      const payload = {
        name,
        dose_strength: doseStrength,
        dose_unit: doseUnit,
        form,
        purpose: purpose || undefined,
        doctor: doctor || undefined,
        pharmacy: pharmacy || undefined,
        frequency,
        schedule_times: JSON.stringify(times),
        pill_count: pillCount ? parseInt(pillCount) : null,
        user_id: 1,
        status: med?.status || "active",
        is_critical: med?.is_critical || 0,
        created_at: med?.created_at || new Date().toISOString().split("T")[0],
      };

      if (isEdit) {
        await api.updateMedication(med!.id, payload);
      } else {
        const interactionData = await api.checkInteractions(name);
        if (interactionData.interactions?.length > 0) {
          const worst = interactionData.interactions[0];
          setInteractionWarning(worst);
        }
        await api.createMedication(payload as any);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      const today = new Date().toISOString().split("T")[0];
      queryClient.invalidateQueries({ queryKey: ["doses", today] });
      onClose();
    },
  });

  const getTimeSlotsForFrequency = (freq: string): string[] => {
    switch (freq) {
      case "Once daily": return times.length >= 1 ? [times[0]] : ["08:00"];
      case "Twice daily": return times.length >= 2 ? times.slice(0, 2) : ["08:00", "20:00"];
      case "Three times daily": return times.length >= 3 ? times.slice(0, 3) : ["08:00", "14:00", "20:00"];
      case "As needed": return [];
      default: return times;
    }
  };

  const handleFrequencyChange = (freq: string) => {
    setFrequency(freq);
    setTimes(getTimeSlotsForFrequency(freq));
  };

  const inputClass = "mt-1.5 w-full h-11 px-4 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-shadow";
  const labelClass = "text-[11px] font-bold uppercase tracking-widest text-muted-foreground";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">{isEdit ? "Edit Medication" : "Add Medication"}</h2>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
          data-testid="close-med-form"
        >
          <XIcon size={20} />
        </motion.button>
      </div>

      {/* Interaction warning */}
      <AnimatePresence>
        {interactionWarning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`rounded-xl p-3.5 flex items-start gap-3 ${
              interactionWarning.severity === "severe"
                ? "bg-destructive/10 border border-destructive/20"
                : "bg-[hsl(var(--nurilo-alert-amber))]/10 border border-[hsl(var(--nurilo-alert-amber))]/20"
            }`}
            data-testid="interaction-warning"
          >
            <WarnIcon size={16} className={
              interactionWarning.severity === "severe" ? "text-destructive" : "text-[hsl(var(--nurilo-alert-amber))]"
            } />
            <div>
              <p className="text-xs font-bold">
                {interactionWarning.severity === "severe" ? "Severe Interaction" : "Moderate Interaction"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{interactionWarning.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name */}
      <div>
        <label className={labelClass}>Medication Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Metformin"
          className={inputClass}
          data-testid="med-name-input"
          autoFocus
        />
      </div>

      {/* Dose + Unit */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Dose Strength</label>
          <input
            type="text"
            value={doseStrength}
            onChange={(e) => setDoseStrength(e.target.value)}
            placeholder="e.g., 500"
            className={inputClass}
            data-testid="med-dose-input"
          />
        </div>
        <div>
          <label className={labelClass}>Unit</label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {UNITS.map(u => (
              <motion.button
                key={u}
                whileTap={{ scale: 0.92 }}
                onClick={() => setDoseUnit(u)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  doseUnit === u ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                }`}
                data-testid={`unit-${u}`}
              >
                {u}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Form type */}
      <div>
        <label className={labelClass}>Form</label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {FORMS.map(f => (
            <motion.button
              key={f}
              whileTap={{ scale: 0.92 }}
              onClick={() => setForm(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                form === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
              data-testid={`form-${f}`}
            >
              {f}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Purpose */}
      <div>
        <label className={labelClass}>What it's for <span className="normal-case font-normal">(optional)</span></label>
        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="e.g., Blood pressure"
          className={inputClass}
          data-testid="med-purpose-input"
        />
      </div>

      {/* Doctor + Pharmacy */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Doctor <span className="normal-case font-normal">(opt.)</span></label>
          <input type="text" value={doctor} onChange={(e) => setDoctor(e.target.value)} placeholder="Dr. Smith"
            className={inputClass} data-testid="med-doctor-input" />
        </div>
        <div>
          <label className={labelClass}>Pharmacy <span className="normal-case font-normal">(opt.)</span></label>
          <input type="text" value={pharmacy} onChange={(e) => setPharmacy(e.target.value)} placeholder="CVS"
            className={inputClass} data-testid="med-pharmacy-input" />
        </div>
      </div>

      {/* Pill Count */}
      <div>
        <label className={labelClass}>Pills remaining <span className="normal-case font-normal">(optional)</span></label>
        <input
          type="number"
          value={pillCount}
          onChange={(e) => setPillCount(e.target.value)}
          placeholder="e.g., 30"
          className={inputClass}
          data-testid="med-pillcount-input"
        />
      </div>

      {/* Frequency */}
      <div>
        <label className={labelClass}>Frequency</label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {FREQUENCIES.map(f => (
            <motion.button
              key={f}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFrequencyChange(f)}
              className={`px-3 py-3 rounded-xl text-xs font-semibold border transition-colors ${
                frequency === f
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground"
              }`}
              data-testid={`freq-${f.replace(/\s+/g, "-")}`}
            >
              {f}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Time pickers */}
      {frequency !== "As needed" && times.length > 0 && (
        <div>
          <label className={labelClass}>Dose Times</label>
          <div className="mt-1.5 space-y-2">
            {times.map((t, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-16 font-medium">Dose {i + 1}</span>
                <input
                  type="time"
                  value={t}
                  onChange={(e) => {
                    const newTimes = [...times];
                    newTimes[i] = e.target.value;
                    setTimes(newTimes);
                  }}
                  className="h-11 px-4 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid={`time-picker-${i}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => saveMed.mutate()}
        disabled={!name.trim() || !doseStrength.trim() || saveMed.isPending}
        className="w-full h-[52px] bg-primary text-primary-foreground rounded-xl font-semibold text-sm disabled:opacity-40 transition-opacity"
        data-testid="save-medication-btn"
      >
        {saveMed.isPending ? "Saving…" : isEdit ? "Save Changes" : "Save Medication"}
      </motion.button>
    </motion.div>
  );
}

// ─── MedsPage ────────────────────────────────────────────────────────────────

export default function MedsPage() {
  const [view, setView] = useState<"list" | "add" | "edit" | "detail">("list");
  const [selectedMed, setSelectedMed] = useState<Medication | null>(null);

  const { data: meds = [], isLoading } = useQuery<Medication[]>({
    queryKey: ["medications"],
    queryFn: () => api.getMedications(),
  });

  const activeMeds = meds.filter(m => m.status === "active");
  const pausedMeds = meds.filter(m => m.status === "paused");
  const archivedMeds = meds.filter(m => m.status === "archived");

  if (view === "add") {
    return (
      <div className="px-4 py-6">
        <MedForm onClose={() => setView("list")} />
      </div>
    );
  }

  if (view === "edit" && selectedMed) {
    return (
      <div className="px-4 py-6">
        <MedForm med={selectedMed} onClose={() => { setView("list"); setSelectedMed(null); }} />
      </div>
    );
  }

  if (view === "detail" && selectedMed) {
    return (
      <div className="px-4 py-6">
        <MedDetail med={selectedMed} onClose={() => { setView("list"); setSelectedMed(null); }} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.22 }}
      className="px-4 py-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="meds-title">Medications</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeMeds.length} active · {pausedMeds.length} paused
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setView("add")}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
          data-testid="add-medication-btn"
        >
          <PlusIcon size={15} /> Add
        </motion.button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[88px] bg-card rounded-xl border border-border animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Active */}
          {activeMeds.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Active ({activeMeds.length})
              </h2>
              <div className="space-y-3">
                {activeMeds.map(med => (
                  <MedCard
                    key={med.id}
                    med={med}
                    onEdit={() => { setSelectedMed(med); setView("edit"); }}
                    onDetail={() => { setSelectedMed(med); setView("detail"); }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Paused */}
          {pausedMeds.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Paused ({pausedMeds.length})
              </h2>
              <div className="space-y-3">
                {pausedMeds.map(med => (
                  <MedCard
                    key={med.id}
                    med={med}
                    onEdit={() => { setSelectedMed(med); setView("edit"); }}
                    onDetail={() => { setSelectedMed(med); setView("detail"); }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Archived */}
          {archivedMeds.length > 0 && (
            <section>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Archived ({archivedMeds.length})
              </h2>
              <div className="space-y-3">
                {archivedMeds.map(med => (
                  <MedCard
                    key={med.id}
                    med={med}
                    onEdit={() => { setSelectedMed(med); setView("edit"); }}
                    onDetail={() => { setSelectedMed(med); setView("detail"); }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {meds.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
              data-testid="no-meds"
            >
              {/* Custom empty-state SVG */}
              <svg width="56" height="56" viewBox="0 0 56 56" fill="none" className="mx-auto mb-4 opacity-30">
                <rect x="12" y="22" width="32" height="14" rx="7" stroke="currentColor" strokeWidth="2.5" className="text-muted-foreground" />
                <line x1="28" y1="22" x2="28" y2="36" stroke="currentColor" strokeWidth="1.8" className="text-muted-foreground" />
                <path d="M21 27 C24 24 27 25 27 28 C27 31 24 32 21 29" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-muted-foreground" />
              </svg>
              <p className="text-sm font-semibold text-muted-foreground">No medications yet</p>
              <p className="text-xs text-muted-foreground mt-1">Tap "Add" to get started</p>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
