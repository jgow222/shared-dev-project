import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import * as api from "@/lib/api";
import {
  Plus, MoreVertical, Pill, AlertTriangle, Pause, Archive,
  Trash2, Edit, ChevronRight, Package, X, Check
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Medication, DoseLog } from "@shared/schema";

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
  if (pillCount <= 3) return { text: `${pillCount} pills left`, color: "bg-destructive/10 text-destructive" };
  if (pillCount <= 7) return { text: `${pillCount} pills left`, color: "bg-destructive/10 text-destructive" };
  if (pillCount <= 14) return { text: `${pillCount} pills left`, color: "bg-[hsl(var(--nurilo-alert-amber))]/10 text-[hsl(var(--nurilo-alert-amber))]" };
  return null;
}

// MedCard component
function MedCard({ med, onEdit, onDetail }: { med: Medication; onEdit: () => void; onDetail: () => void }) {
  const [showMenu, setShowMenu] = useState(false);
  const refillBadge = getRefillBadge(med.pill_count);

  const deleteMed = useMutation({
    mutationFn: async () => {
      await api.deleteMedication(med.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      setShowMenu(false);
    },
  });

  const togglePause = useMutation({
    mutationFn: async () => {
      const newStatus = med.status === "paused" ? "active" : "paused";
      await api.updateMedication(med.id, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      setShowMenu(false);
    },
  });

  const archiveMed = useMutation({
    mutationFn: async () => {
      await api.updateMedication(med.id, { status: "archived" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["medications"] });
      setShowMenu(false);
    },
  });

  const times: string[] = JSON.parse(med.schedule_times);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-card rounded-lg border border-border p-4 relative ${med.status === "paused" ? "opacity-60" : ""}`}
      data-testid={`med-card-${med.id}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Pill size={18} className="text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 cursor-pointer" onClick={onDetail}>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate" data-testid={`med-name-${med.id}`}>{med.name}</h3>
            {med.status === "paused" && (
              <span className="text-[10px] font-medium bg-[hsl(var(--nurilo-alert-amber))]/10 text-[hsl(var(--nurilo-alert-amber))] px-2 py-0.5 rounded-xl">
                Paused
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {med.dose_strength} {med.dose_unit} {med.form} · {med.frequency}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {times.map(formatTime).join(", ")}
          </p>
          {med.purpose && (
            <p className="text-[11px] text-[hsl(var(--nurilo-sage))] mt-1">For {med.purpose}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {refillBadge && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-xl ${refillBadge.color}`} data-testid={`refill-badge-${med.id}`}>
                <Package size={10} className="inline mr-1" />
                {refillBadge.text}
              </span>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-full hover:bg-secondary transition-colors"
            data-testid={`med-menu-${med.id}`}
          >
            <MoreVertical size={16} className="text-muted-foreground" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 top-8 z-50 w-44 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                >
                  <button onClick={onEdit} className="w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-secondary transition-colors" data-testid={`edit-med-${med.id}`}>
                    <Edit size={14} /> Edit
                  </button>
                  <button onClick={() => togglePause.mutate()} className="w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-secondary transition-colors" data-testid={`pause-med-${med.id}`}>
                    <Pause size={14} /> {med.status === "paused" ? "Resume" : "Pause"}
                  </button>
                  <button onClick={() => archiveMed.mutate()} className="w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 hover:bg-secondary transition-colors" data-testid={`archive-med-${med.id}`}>
                    <Archive size={14} /> Archive
                  </button>
                  <button onClick={() => deleteMed.mutate()} className="w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 text-destructive hover:bg-destructive/10 transition-colors" data-testid={`delete-med-${med.id}`}>
                    <Trash2 size={14} /> Delete
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// Medication detail view
function MedDetail({ med, onClose }: { med: Medication; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "info">("overview");
  const times: string[] = JSON.parse(med.schedule_times);

  const { data: doseHistory = [] } = useQuery<DoseLog[]>({
    queryKey: ["doses", "medication", med.id],
    queryFn: () => api.getDoseLogsForMed(med.id),
  });

  // 30-day calendar heatmap
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
        <button onClick={onClose} className="p-1" data-testid="back-to-meds">
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <div>
          <h2 className="text-lg font-bold" data-testid="med-detail-name">{med.name}</h2>
          <p className="text-xs text-muted-foreground">{med.dose_strength} {med.dose_unit} {med.form}</p>
        </div>
        <span className={`ml-auto text-[10px] font-medium px-2 py-0.5 rounded-xl ${
          med.status === "active" ? "bg-[hsl(var(--nurilo-success))]/10 text-[hsl(var(--nurilo-success))]" :
          med.status === "paused" ? "bg-[hsl(var(--nurilo-alert-amber))]/10 text-[hsl(var(--nurilo-alert-amber))]" :
          "bg-muted text-muted-foreground"
        }`}>
          {med.status.charAt(0).toUpperCase() + med.status.slice(1)}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary rounded-lg p-1">
        {(["overview", "history", "info"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${
              activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
            data-testid={`tab-${tab}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="bg-card rounded-lg border border-border p-4 space-y-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Schedule</p>
              <p className="text-sm mt-1">{med.frequency} — {times.map(formatTime).join(", ")}</p>
            </div>
            {med.pill_count !== null && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Supply</p>
                <p className="text-sm mt-1">{med.pill_count} pills remaining</p>
              </div>
            )}
            {med.purpose && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Purpose</p>
                <p className="text-sm mt-1">{med.purpose}</p>
              </div>
            )}
            {med.doctor && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Prescriber</p>
                <p className="text-sm mt-1">{med.doctor}</p>
              </div>
            )}
            {med.pharmacy && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pharmacy</p>
                <p className="text-sm mt-1">{med.pharmacy}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "history" && (
        <div className="space-y-4">
          {/* Adherence */}
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">30-Day Adherence</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold text-primary">{adherencePercent}%</p>
              <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${adherencePercent}%` }} />
              </div>
            </div>
          </div>

          {/* Calendar heatmap */}
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Calendar</p>
            <div className="grid grid-cols-7 gap-1.5" data-testid="heatmap">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                <div key={i} className="text-center text-[10px] text-muted-foreground font-medium">{d}</div>
              ))}
              {/* Offset for first day */}
              {Array.from({ length: new Date(last30Days[0]).getDay() }, (_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {last30Days.map(date => (
                <div
                  key={date}
                  className={`aspect-square rounded-sm ${getHeatmapColor(date)}`}
                  title={date}
                />
              ))}
            </div>
            <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[hsl(var(--nurilo-success))]" /> All taken</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[hsl(var(--nurilo-success))]/50" /> Partial</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-destructive/60" /> Missed</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-muted" /> N/A</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === "info" && (
        <div className="bg-card rounded-lg border border-border p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            General information about {med.name} would appear here, including common side effects,
            drug interactions, and storage instructions.
          </p>
          <p className="text-xs text-muted-foreground italic">
            Always consult your doctor or pharmacist for medication-specific guidance.
          </p>
        </div>
      )}
    </motion.div>
  );
}

// Add/Edit medication form
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
        // Check interactions before saving
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{isEdit ? "Edit Medication" : "Add Medication"}</h2>
        <button onClick={onClose} className="p-1" data-testid="close-med-form">
          <X size={20} />
        </button>
      </div>

      {/* Interaction warning */}
      <AnimatePresence>
        {interactionWarning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`rounded-lg p-3 flex items-start gap-2 ${
              interactionWarning.severity === "severe" ? "bg-destructive/10 border border-destructive/20" :
              "bg-[hsl(var(--nurilo-alert-amber))]/10 border border-[hsl(var(--nurilo-alert-amber))]/20"
            }`}
            data-testid="interaction-warning"
          >
            <AlertTriangle size={16} className={
              interactionWarning.severity === "severe" ? "text-destructive" : "text-[hsl(var(--nurilo-alert-amber))]"
            } />
            <div>
              <p className="text-xs font-semibold">{interactionWarning.severity === "severe" ? "Severe Interaction" : "Moderate Interaction"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{interactionWarning.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Name */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Medication Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Metformin"
          className="mt-1 w-full h-11 px-4 rounded-sm border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          data-testid="med-name-input"
          autoFocus
        />
      </div>

      {/* Dose + Unit */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Dose Strength</label>
          <input
            type="text"
            value={doseStrength}
            onChange={(e) => setDoseStrength(e.target.value)}
            placeholder="e.g., 500"
            className="mt-1 w-full h-11 px-4 rounded-sm border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            data-testid="med-dose-input"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Unit</label>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {UNITS.map(u => (
              <button
                key={u}
                onClick={() => setDoseUnit(u)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  doseUnit === u ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
                data-testid={`unit-${u}`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Form selector */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Form</label>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {FORMS.map(f => (
            <button
              key={f}
              onClick={() => setForm(f)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium transition-colors ${
                form === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
              }`}
              data-testid={`form-${f}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Optional fields */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">What it's for <span className="normal-case">(optional)</span></label>
        <input
          type="text"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="e.g., Blood pressure"
          className="mt-1 w-full h-11 px-4 rounded-sm border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          data-testid="med-purpose-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Doctor <span className="normal-case">(opt.)</span></label>
          <input type="text" value={doctor} onChange={(e) => setDoctor(e.target.value)} placeholder="Dr. Smith"
            className="mt-1 w-full h-11 px-4 rounded-sm border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary" data-testid="med-doctor-input" />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pharmacy <span className="normal-case">(opt.)</span></label>
          <input type="text" value={pharmacy} onChange={(e) => setPharmacy(e.target.value)} placeholder="CVS"
            className="mt-1 w-full h-11 px-4 rounded-sm border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary" data-testid="med-pharmacy-input" />
        </div>
      </div>

      {/* Pill Count */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pills remaining <span className="normal-case">(optional)</span></label>
        <input
          type="number"
          value={pillCount}
          onChange={(e) => setPillCount(e.target.value)}
          placeholder="e.g., 30"
          className="mt-1 w-full h-11 px-4 rounded-sm border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          data-testid="med-pillcount-input"
        />
      </div>

      {/* Schedule builder */}
      <div>
        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Frequency</label>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          {FREQUENCIES.map(f => (
            <button
              key={f}
              onClick={() => handleFrequencyChange(f)}
              className={`px-3 py-3 rounded-lg text-xs font-medium border transition-colors ${
                frequency === f ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
              }`}
              data-testid={`freq-${f.replace(/\s+/g, "-")}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Time pickers */}
      {frequency !== "As needed" && (
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Dose Times</label>
          <div className="mt-1.5 space-y-2">
            {times.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-16">Dose {i + 1}</span>
                <input
                  type="time"
                  value={t}
                  onChange={(e) => {
                    const newTimes = [...times];
                    newTimes[i] = e.target.value;
                    setTimes(newTimes);
                  }}
                  className="h-11 px-4 rounded-sm border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid={`time-picker-${i}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={() => saveMed.mutate()}
        disabled={!name.trim() || !doseStrength.trim() || saveMed.isPending}
        className="w-full h-[52px] bg-primary text-primary-foreground rounded-md font-semibold text-sm disabled:opacity-40 transition-opacity"
        data-testid="save-medication-btn"
      >
        {saveMed.isPending ? "Saving..." : isEdit ? "Save Changes" : "Save Medication"}
      </button>
    </motion.div>
  );
}

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
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" data-testid="meds-title">Medications</h1>
        <button
          onClick={() => setView("add")}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-semibold transition-colors hover:opacity-90"
          data-testid="add-medication-btn"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-card rounded-lg border border-border animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* Active medications */}
          {activeMeds.length > 0 && (
            <section>
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Active ({activeMeds.length})</h2>
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
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Paused ({pausedMeds.length})</h2>
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
              <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Archived ({archivedMeds.length})</h2>
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

          {meds.length === 0 && (
            <div className="text-center py-16" data-testid="no-meds">
              <Pill size={40} className="mx-auto mb-3 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No medications yet</p>
              <p className="text-xs text-muted-foreground mt-1">Tap "Add" to get started</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
