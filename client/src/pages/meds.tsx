import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import * as api from "@/lib/api";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Medication, DoseLog } from "@shared/schema";
import { searchMedications, getMedByName, searchMedicationsWithFallback } from "@/lib/medicationDatabase";
import type { MedEntry } from "@/lib/medicationDatabase";

// ─── Custom SVG Icons (NO Lucide) ─────────────────────────────────────────────

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
      <rect x="4" y="9" width="16" height="6" rx="3" />
      <line x1="12" y1="9" x2="12" y2="15" strokeWidth={1.4} />
      <path d="M14.5 11.5 C15.5 10.8 16.5 11 16.5 12 C16.5 13 15.5 13.2 14.5 12.5" strokeWidth={1.2} fill="none" />
    </svg>
  );
}

function WarnIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
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

function ChevronRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3L10 8L6 13" />
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

function CameraIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="4.5" />
      <line x1="10.5" y1="10.5" x2="14" y2="14" />
    </svg>
  );
}

function CheckIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9L7.5 13.5L15 5" />
    </svg>
  );
}

function ScanIcon({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" strokeWidth={2.5} />
    </svg>
  );
}

function FlashIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <path d="M9 1L3 9h5l-1 6 7-8H9l1-6z" />
    </svg>
  );
}

function PillTabletIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="20" height="6" rx="3" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function PillCapsuleIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="14" cy="14" rx="10" ry="5" />
      <line x1="14" y1="9" x2="14" y2="19" />
    </svg>
  );
}

function PillLiquidIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 5h8v3l3 4v9a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-9l3-4V5z" />
      <line x1="7" y1="15" x2="21" y2="15" />
    </svg>
  );
}

function PillInhalerIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="4" width="10" height="16" rx="3" />
      <path d="M12 20v3a2 2 0 0 0 4 0v-3" />
      <line x1="12" y1="10" x2="16" y2="10" />
    </svg>
  );
}

function PillPatchIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="5" width="18" height="18" rx="4" />
      <circle cx="14" cy="14" r="4" />
      <line x1="14" y1="10" x2="14" y2="18" strokeWidth={1.2} strokeDasharray="2 2" />
    </svg>
  );
}

function PillDropsIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 5 C14 5 7 14 7 18a7 7 0 0 0 14 0C21 14 14 5 14 5Z" />
    </svg>
  );
}

function PillInjectionIcon({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <line x1="20" y1="4" x2="24" y2="8" />
      <path d="M7 17L17 7l4 4-10 10-6 2 2-6z" />
      <line x1="4" y1="24" x2="8" y2="20" />
    </svg>
  );
}

function ClockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3.5L10.5 10" />
    </svg>
  );
}

function StarIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="currentColor">
      <path d="M7 1l1.76 3.57 3.94.57-2.85 2.78.67 3.92L7 9.9l-3.52 1.84.67-3.92-2.85-2.78 3.94-.57L7 1z" />
    </svg>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FORMS = [
  { label: "Tablet", icon: PillTabletIcon },
  { label: "Capsule", icon: PillCapsuleIcon },
  { label: "Liquid", icon: PillLiquidIcon },
  { label: "Inhaler", icon: PillInhalerIcon },
  { label: "Patch", icon: PillPatchIcon },
  { label: "Drops", icon: PillDropsIcon },
  { label: "Injection", icon: PillInjectionIcon },
];

const UNITS = ["mg", "mcg", "ml", "IU", "units", "%", "g"];

const FREQUENCY_OPTIONS = [
  { label: "Once daily", times: 1, emoji: "1×" },
  { label: "Twice daily", times: 2, emoji: "2×" },
  { label: "3× daily", times: 3, emoji: "3×" },
  { label: "4× daily", times: 4, emoji: "4×" },
  { label: "Every other day", times: 1, emoji: "~" },
  { label: "Weekly", times: 1, emoji: "7d" },
  { label: "As needed", times: 0, emoji: "PRN" },
];

function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function getRefillBadge(pillCount: number | null): { text: string; color: string } | null {
  if (pillCount === null || pillCount === undefined) return null;
  if (pillCount <= 7) return { text: `${pillCount} left`, color: "bg-destructive/10 text-destructive" };
  if (pillCount <= 14) return { text: `${pillCount} left`, color: "bg-[hsl(var(--nurilo-alert-amber))]/10 text-[hsl(var(--nurilo-alert-amber))]" };
  return null;
}

// ─── Visual Time Picker ───────────────────────────────────────────────────────
// Large-target, elderly-friendly custom time picker

interface TimePickerProps {
  value: string; // "HH:MM" 24h
  onChange: (val: string) => void;
  label?: string;
  index?: number;
}

function VisualTimePicker({ value, onChange, label, index }: TimePickerProps) {
  const [h, m] = value.split(":").map(Number);
  const isPM = h >= 12;
  const hour12 = h % 12 || 12;

  const setHour12 = (newHour: number) => {
    const h24 = isPM ? (newHour === 12 ? 12 : newHour + 12) : (newHour === 12 ? 0 : newHour);
    onChange(`${h24.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
  };

  const setMinutes = (newMin: number) => {
    onChange(`${h.toString().padStart(2, "0")}:${newMin.toString().padStart(2, "0")}`);
  };

  const toggleAmPm = () => {
    const newH = isPM ? (h - 12 < 0 ? 0 : h - 12) : (h + 12 > 23 ? 23 : h + 12);
    onChange(`${newH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`);
  };

  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minuteSnaps = [0, 15, 30, 45];

  return (
    <div className="bg-secondary/50 rounded-2xl p-4 space-y-3" data-testid={`visual-time-picker-${index ?? 0}`}>
      {label && (
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      )}

      {/* Large time display */}
      <div className="flex items-center justify-center gap-3">
        <div className="text-4xl font-bold tracking-tight tabular-nums text-foreground">
          {hour12.toString().padStart(2, "0")}:{m.toString().padStart(2, "0")}
        </div>
        {/* AM / PM toggle */}
        <div className="flex flex-col gap-1.5">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => { if (isPM) toggleAmPm(); }}
            className={`w-12 h-9 rounded-xl text-sm font-bold transition-colors ${!isPM ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}
            data-testid={`am-btn-${index ?? 0}`}
          >
            AM
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => { if (!isPM) toggleAmPm(); }}
            className={`w-12 h-9 rounded-xl text-sm font-bold transition-colors ${isPM ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground border border-border"}`}
            data-testid={`pm-btn-${index ?? 0}`}
          >
            PM
          </motion.button>
        </div>
      </div>

      {/* Hour grid */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Hour</p>
        <div className="grid grid-cols-6 gap-1.5">
          {hours.map(hr => (
            <motion.button
              key={hr}
              whileTap={{ scale: 0.88 }}
              onClick={() => setHour12(hr)}
              className={`h-11 rounded-xl text-sm font-semibold transition-colors ${hour12 === hr ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}
              data-testid={`hour-${hr}-${index ?? 0}`}
            >
              {hr}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Minute snaps */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">Minutes</p>
        <div className="grid grid-cols-4 gap-1.5">
          {minuteSnaps.map(min => (
            <motion.button
              key={min}
              whileTap={{ scale: 0.88 }}
              onClick={() => setMinutes(min)}
              className={`h-12 rounded-xl text-sm font-semibold transition-colors ${m === min ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground"}`}
              data-testid={`min-${min}-${index ?? 0}`}
            >
              :{min.toString().padStart(2, "0")}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Camera Scanner ────────────────────────────────────────────────────────────

interface CameraScannerProps {
  onResult: (result: Partial<{ name: string; strength: string; unit: string; form: string }>) => void;
  onClose: () => void;
}

// Smart pattern matching for medication labels
function parseMedicationLabel(text: string): Partial<{ name: string; strength: string; unit: string; form: string }> {
  const result: Partial<{ name: string; strength: string; unit: string; form: string }> = {};

  // Extract strength + unit patterns like "500mg", "10 mg", "2.5 mcg"
  const strengthMatch = text.match(/(\d+\.?\d*)\s*(mg|mcg|ml|iu|units|g|%)/i);
  if (strengthMatch) {
    result.strength = strengthMatch[1];
    result.unit = strengthMatch[2].toLowerCase().replace("iu", "IU");
  }

  // Detect form keywords
  const lower = text.toLowerCase();
  if (lower.includes("tablet") || lower.includes("tab")) result.form = "Tablet";
  else if (lower.includes("capsule") || lower.includes("cap")) result.form = "Capsule";
  else if (lower.includes("liquid") || lower.includes("syrup") || lower.includes("solution") || lower.includes("suspension")) result.form = "Liquid";
  else if (lower.includes("inhaler") || lower.includes("aerosol")) result.form = "Inhaler";
  else if (lower.includes("patch") || lower.includes("transdermal")) result.form = "Patch";
  else if (lower.includes("drops") || lower.includes("eye") || lower.includes("ear") || lower.includes("nasal")) result.form = "Drops";
  else if (lower.includes("injection") || lower.includes("injectable") || lower.includes("syringe")) result.form = "Injection";

  // Try to find medication name — look for known drug names in the database
  const words = text.split(/[\s,\n]+/);
  for (const word of words) {
    const trimmed = word.replace(/[^a-zA-Z]/g, "");
    if (trimmed.length >= 4) {
      const match = getMedByName(trimmed);
      if (match) {
        result.name = match.name;
        if (!result.strength) result.strength = match.strength;
        if (!result.unit) result.unit = match.unit;
        if (!result.form) result.form = match.form;
        break;
      }
    }
  }

  // Fallback: if no database match, use the longest word that looks like a drug name
  if (!result.name) {
    const candidates = words
      .map(w => w.replace(/[^a-zA-Z]/g, ""))
      .filter(w => w.length >= 5 && !/^(take|tablet|capsule|oral|daily|dose|each|with|for|the|and|once|twice|times|refills|count|pills|mg|mcg|ml|iu|NDC|exp|lot|mfg|strength|directions|warning|store|keep|light)/i.test(w));
    if (candidates.length > 0) {
      result.name = candidates[0].charAt(0).toUpperCase() + candidates[0].slice(1);
    }
  }

  return result;
}

// ─── AI-powered medication scanner via Supabase Edge Function ─────────────────
// Sends a base64 JPEG frame to Claude Vision (via Supabase edge function)
// Returns structured medication data: { name, strength, unit, form, brand, confidence }

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://qpmjghocajyvugjxnkdn.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbWpnaG9jYWp5dnVnanhua2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1ODM4MDQsImV4cCI6MjA5MDE1OTgwNH0.fzHBvHic5W6BZVUfD-dXEj0x6MaBeM6GyGEUsu8vQt0";

interface AIScanResult {
  name?: string;
  strength?: string;
  unit?: string;
  form?: string;
  brand?: string;
  confidence?: "high" | "medium" | "low";
  raw_text?: string;
  error?: string;
}

async function scanMedicationWithAI(imageDataUrl: string): Promise<AIScanResult> {
  const response = await fetch(
    `${SUPABASE_URL}/functions/v1/scan-medication`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "apikey": SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ image: imageDataUrl }),
      signal: AbortSignal.timeout(35000), // 35s timeout — Claude vision can be slow on first cold start
    }
  );

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`AI scan failed: ${response.status} ${errText}`);
  }

  return response.json();
}

function CameraScanner({ onResult, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stage, setStage] = useState<"starting" | "live" | "scanning" | "done" | "error">("starting");
  const [errorMsg, setErrorMsg] = useState("");
  const [scanResult, setScanResult] = useState<Partial<{ name: string; strength: string; unit: string; form: string }> | null>(null);
  const [cameraMode, setCameraMode] = useState<"environment" | "user">("environment");
  const [manualInput, setManualInput] = useState("");
  const [showManual, setShowManual] = useState(false);

  const startCamera = useCallback(async (facingMode: "environment" | "user" = "environment") => {
    setStage("starting");
    setErrorMsg("");

    // Stop any existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }

    try {
      // Check if camera API is available at all
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw Object.assign(new Error("Camera API not available"), { name: "NotSupportedError" });
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;

        // Wait for video to be ready before marking as live
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Video ready timeout")), 10000);
          video.onloadedmetadata = () => {
            clearTimeout(timeout);
            resolve();
          };
          video.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Video element error"));
          };
        });

        try {
          await video.play();
        } catch (playErr: any) {
          // Some browsers throw AbortError when play() is interrupted — ignore it
          if (playErr?.name !== "AbortError") throw playErr;
        }

        setStage("live");
      }
    } catch (err: any) {
      console.error("Camera error:", err.name, err.message);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setErrorMsg("Camera permission denied. Allow camera access in your browser settings, then tap Try Again.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setErrorMsg("No camera found on this device.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        setErrorMsg("Camera is in use by another app. Close other camera apps and try again.");
      } else if (err.name === "NotSupportedError" || err.name === "OverconstrainedError") {
        setErrorMsg("Camera not supported on this browser. Try Chrome or Safari.");
      } else {
        setErrorMsg(`Camera error: ${err.message || "Unknown error"}. Try the Type Label button below.`);
      }
      setStage("error");
    }
  }, []);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera("environment");
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [startCamera]);

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;

    // Make sure video actually has frames — readyState 4 = HAVE_ENOUGH_DATA
    if (video.readyState < 2) {
      setErrorMsg("Camera isn't ready yet. Wait a moment and try again.");
      return;
    }

    setStage("scanning");
    setErrorMsg("");

    const canvas = canvasRef.current;
    const w = video.videoWidth || 1280;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setStage("error");
      setErrorMsg("Canvas not available. Try a different browser.");
      return;
    }
    ctx.drawImage(video, 0, 0, w, h);

    // Capture at full quality JPEG for best OCR results
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95);

    // Sanity check — make sure we have actual data
    if (imageDataUrl.length < 5000) {
      setStage("done");
      setScanResult({});
      setErrorMsg("Could not capture image from camera. Try again or use Type Label.");
      setShowManual(true);
      return;
    }

    try {
      const aiResult = await scanMedicationWithAI(imageDataUrl);

      if (aiResult.error || !aiResult.name) {
        // AI couldn't identify — show manual fallback with helpful message
        setStage("done");
        setScanResult({});
        setErrorMsg(
          aiResult.confidence === "low"
            ? "Label wasn't clear enough. Try better lighting, move closer, and scan again."
            : "Medication not identified. Type the label text below."
        );
        setShowManual(true);
        return;
      }

      // AI returned a result — populate scan result
      const result: Partial<{ name: string; strength: string; unit: string; form: string }> = {
        name: aiResult.name,
        strength: aiResult.strength || "",
        unit: aiResult.unit || "mg",
        form: aiResult.form || "Tablet",
      };

      // If AI gave us a brand name but not generic, check local DB for better name
      if (aiResult.brand && !result.name) {
        const dbMatch = getMedByName(aiResult.brand);
        if (dbMatch) {
          result.name = dbMatch.name;
          result.strength = result.strength || dbMatch.strength;
          result.unit = result.unit || dbMatch.unit;
          result.form = result.form || dbMatch.form;
        } else {
          result.name = aiResult.brand;
        }
      }

      // Cross-reference with local DB to fill in any missing fields
      if (result.name) {
        const dbMatch = getMedByName(result.name);
        if (dbMatch) {
          if (!result.strength) result.strength = dbMatch.strength;
          if (!result.unit) result.unit = dbMatch.unit;
          if (!result.form) result.form = dbMatch.form;
        }
      }

      setStage("done");
      setScanResult(result);
      setShowManual(false);

    } catch (err: any) {
      console.error("Camera scan error:", err?.name, err?.message);
      setStage("done");
      setScanResult({});
      // Give a specific error based on what went wrong
      if (err?.name === "TimeoutError" || err?.message?.includes("timeout") || err?.message?.includes("Timeout")) {
        setErrorMsg("Scan timed out — AI is warming up. Try again in a few seconds.");
      } else if (err?.message?.includes("NetworkError") || err?.message?.includes("Failed to fetch")) {
        setErrorMsg("No internet connection. Check your connection and try again.");
      } else {
        setErrorMsg("Scan failed. Make sure the label is well-lit and try again, or type it below.");
      }
      setShowManual(true);
    }
  };

  const handleManualParse = () => {
    if (!manualInput.trim()) return;
    const parsed = parseMedicationLabel(manualInput);
    setScanResult(parsed);
    setShowManual(false);
    setStage("done");
  };

  const handleFlipCamera = () => {
    const newMode = cameraMode === "environment" ? "user" : "environment";
    setCameraMode(newMode);
    startCamera(newMode);
  };

  const confirmResult = () => {
    if (scanResult) onResult(scanResult);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      data-testid="camera-scanner"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-safe pt-4 pb-3">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white"
          data-testid="close-camera"
        >
          <XIcon size={18} />
        </motion.button>
        <div className="text-white text-sm font-semibold">Scan Medication Label</div>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={handleFlipCamera}
          className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white"
          data-testid="flip-camera"
        >
          {/* Flip icon */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
            <path d="M1 4l3-3 3 3" />
            <path d="M4 1v8a5 5 0 0 0 10 0" />
            <path d="M17 14l-3 3-3-3" />
            <path d="M14 17V9A5 5 0 0 0 4 9" />
          </svg>
        </motion.button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          data-testid="camera-video"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Scanner overlay */}
        {stage === "live" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-72 h-44">
              {/* Corner guides */}
              {[
                "top-0 left-0 border-t-4 border-l-4 rounded-tl-lg",
                "top-0 right-0 border-t-4 border-r-4 rounded-tr-lg",
                "bottom-0 left-0 border-b-4 border-l-4 rounded-bl-lg",
                "bottom-0 right-0 border-b-4 border-r-4 rounded-br-lg",
              ].map((cls, i) => (
                <div key={i} className={`absolute w-8 h-8 border-white/90 ${cls}`} />
              ))}
              {/* Scan line animation */}
              <motion.div
                className="absolute left-0 right-0 h-0.5 bg-primary/80"
                animate={{ top: ["10%", "90%", "10%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </div>
        )}

        {/* Starting state */}
        {stage === "starting" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
              />
            </div>
            <p className="text-white/80 text-sm">Starting camera…</p>
          </div>
        )}

        {/* Scanning state */}
        {stage === "scanning" && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4">
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 rounded-full border-2 border-white/20 border-t-white"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <ScanIcon size={22} className="text-white" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="text-white text-sm font-semibold">Identifying medication…</p>
              <p className="text-white/50 text-xs">AI is reading the label</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {stage === "error" && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-4 px-6">
            <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
              <WarnIcon size={28} className="text-destructive" />
            </div>
            <p className="text-white text-sm text-center leading-relaxed">{errorMsg}</p>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => startCamera(cameraMode)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
            >
              Try Again
            </motion.button>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="px-5 pb-safe pb-8 pt-4 space-y-3">
        {/* Manual input (shown after scan or on demand) */}
        <AnimatePresence>
          {showManual && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {errorMsg ? (
                <p className="text-amber-300 text-xs text-center font-medium">{errorMsg}</p>
              ) : (
                <p className="text-white/70 text-xs text-center">
                  Type what you see on the label (medication name + dose):
                </p>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  placeholder='e.g. "Metformin 500mg tablet"'
                  className="flex-1 h-11 px-4 rounded-xl bg-white/10 text-white text-sm placeholder-white/40 border border-white/20 focus:outline-none focus:border-white/60"
                  data-testid="manual-label-input"
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && handleManualParse()}
                />
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={handleManualParse}
                  className="h-11 px-4 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
                >
                  <CheckIcon size={16} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scan result preview */}
        <AnimatePresence>
          {scanResult && !showManual && Object.keys(scanResult).some(k => (scanResult as any)[k]) && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 rounded-2xl p-3.5 space-y-1"
            >
              <p className="text-white/60 text-xs uppercase tracking-widest font-bold">Detected</p>
              {scanResult.name && <p className="text-white font-semibold">{scanResult.name}</p>}
              {(scanResult.strength || scanResult.unit) && (
                <p className="text-white/70 text-sm">{scanResult.strength} {scanResult.unit} · {scanResult.form}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3">
          {/* Manual type button */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowManual(v => !v)}
            className="flex-1 h-14 rounded-2xl bg-white/10 text-white text-sm font-semibold border border-white/20"
            data-testid="manual-entry-btn"
          >
            Type Label
          </motion.button>

          {/* Main capture button */}
          {(stage === "live" || stage === "scanning") && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={captureAndScan}
              disabled={stage === "scanning"}
              className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              data-testid="capture-btn"
            >
              <ScanIcon size={18} />
              {stage === "scanning" ? "Scanning…" : "Scan"}
            </motion.button>
          )}

          {/* Scan Again button — shown when done (whether success or fail) */}
          {stage === "done" && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setScanResult(null);
                setShowManual(false);
                setErrorMsg("");
                startCamera(cameraMode);
              }}
              className="flex-1 h-14 rounded-2xl bg-white/15 text-white text-sm font-semibold border border-white/25"
              data-testid="scan-again-btn"
            >
              Scan Again
            </motion.button>
          )}

          {/* Confirm result button */}
          {stage === "done" && scanResult && Object.values(scanResult).some(Boolean) && !showManual && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={confirmResult}
              className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2"
              data-testid="confirm-scan-btn"
            >
              <CheckIcon size={16} />
              Use This
            </motion.button>
          )}
        </div>

        {/* Hint text */}
        {stage === "live" && (
          <p className="text-white/50 text-xs text-center">
            Point at the medication label and tap Scan
          </p>
        )}
        {stage === "scanning" && (
          <p className="text-white/50 text-xs text-center">
            Hold steady… reading the label
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Autocomplete Search Input ─────────────────────────────────────────────────

interface MedSearchProps {
  value: string;
  onChange: (name: string) => void;
  onSelect: (entry: MedEntry) => void;
  onOpenCamera: () => void;
}

function MedSearchInput({ value, onChange, onSelect, onOpenCamera }: MedSearchProps) {
  const [results, setResults] = useState<MedEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track the current search query to cancel stale results
  const searchVersionRef = useRef(0);

  useEffect(() => {
    if (value.trim().length === 0) {
      setResults([]);
      setOpen(false);
      setSearching(false);
      return;
    }

    // Show local results immediately (instant, no flicker)
    const localHits = searchMedications(value, 20);
    setResults(localHits);
    setOpen(true);
    setSearching(true);

    // Always query external APIs (RxNorm + OpenFDA) regardless of local hit count
    const version = ++searchVersionRef.current;
    searchMedicationsWithFallback(value, 20).then(allHits => {
      if (version === searchVersionRef.current) {
        setResults(allHits);
        setOpen(allHits.length > 0);
        setSearching(false);
      }
    }).catch(() => {
      if (version === searchVersionRef.current) {
        setSearching(false);
      }
    });
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const categoryLabel: Record<string, string> = { rx: "Rx", otc: "OTC", supplement: "Supp." };
  const categoryColors: Record<string, string> = {
    rx: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    otc: "bg-primary/10 text-primary",
    supplement: "bg-[hsl(var(--nurilo-alert-amber))]/10 text-[hsl(var(--nurilo-alert-amber))]",
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Input row */}
      <div className="relative flex items-center">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          <SearchIcon size={16} />
        </div>
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); }}
          placeholder="Search medications, supplements…"
          className="w-full h-14 pl-11 pr-14 rounded-2xl border border-border bg-card text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
          data-testid="med-name-input"
          autoComplete="off"
          autoCapitalize="words"
          onFocus={() => value.trim() && setOpen(true)}
        />
        {/* Camera button inside input */}
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onOpenCamera}
          className="absolute right-3 w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center"
          data-testid="open-camera-btn"
          type="button"
        >
          <CameraIcon size={18} />
        </motion.button>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (results.length > 0 || searching) && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 bg-card border border-border rounded-2xl shadow-lg overflow-hidden max-h-80 overflow-y-auto"
            data-testid="med-autocomplete-dropdown"
          >
            {results.map((entry, i) => (
              <motion.button
                key={`${entry.name}-${entry.strength}-${entry.form}-${i}`}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSelect(entry);
                  setOpen(false);
                }}
                className="w-full px-4 py-3.5 text-left flex items-center gap-3 hover:bg-secondary transition-colors border-b border-border last:border-0"
                data-testid={`autocomplete-item-${i}`}
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                  <CapsuleIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{entry.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {[entry.aliases?.[0], entry.strength ? `${entry.strength} ${entry.unit}` : null, entry.form]
                      .filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${categoryColors[entry.category]}`}>
                  {categoryLabel[entry.category]}
                </span>
              </motion.button>
            ))}
            {/* Loading indicator while external APIs are fetching */}
            {searching && (
              <div className="px-4 py-2.5 flex items-center gap-2 text-xs text-muted-foreground border-t border-border">
                <svg className="animate-spin h-3 w-3 text-primary" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                </svg>
                Searching all medications…
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`rounded-full transition-all duration-300 ${
            i < current
              ? "w-6 h-2 bg-primary"
              : i === current
                ? "w-8 h-2 bg-primary"
                : "w-2 h-2 bg-border"
          }`}
        />
      ))}
    </div>
  );
}

// ─── MedForm — 4-Step Wizard ──────────────────────────────────────────────────

function MedForm({ med, onClose }: { med?: Medication; onClose: () => void }) {
  const isEdit = !!med;
  const totalSteps = 4;
  const [step, setStep] = useState(0);
  const [showCamera, setShowCamera] = useState(false);

  // Step 1: What med
  const [name, setName] = useState(med?.name || "");

  // Step 2: Dose + Form
  const [doseStrength, setDoseStrength] = useState(med?.dose_strength || "");
  const [doseUnit, setDoseUnit] = useState(med?.dose_unit || "mg");
  const [form, setForm] = useState(med?.form || "Tablet");

  // Step 3: Schedule
  const [frequency, setFrequency] = useState(med?.frequency || "Once daily");
  const [times, setTimes] = useState<string[]>(
    med ? JSON.parse(med.schedule_times) : ["08:00"]
  );

  // Step 4: Details
  const [purpose, setPurpose] = useState(med?.purpose || "");
  const [doctor, setDoctor] = useState(med?.doctor || "");
  const [pharmacy, setPharmacy] = useState(med?.pharmacy || "");
  const [pillCount, setPillCount] = useState<string>(med?.pill_count?.toString() || "");
  const [interactionWarning, setInteractionWarning] = useState<{ severity: string; message: string } | null>(null);

  // If editing, go straight to step 1 (all steps accessible)
  const [editMode] = useState(isEdit);

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

  const handleFrequencySelect = (freq: (typeof FREQUENCY_OPTIONS)[0]) => {
    setFrequency(freq.label);
    if (freq.times === 0) {
      setTimes([]);
    } else {
      const defaults = ["08:00", "20:00", "13:00", "06:00"];
      const current = times.slice(0, freq.times);
      const needed = freq.times - current.length;
      setTimes([...current, ...defaults.slice(current.length, current.length + needed)]);
    }
  };

  const handleSelectFromDB = (entry: MedEntry) => {
    setName(entry.name);
    setDoseStrength(entry.strength);
    setDoseUnit(entry.unit);
    setForm(entry.form);
  };

  const handleCameraResult = (result: Partial<{ name: string; strength: string; unit: string; form: string }>) => {
    if (result.name) setName(result.name);
    if (result.strength) setDoseStrength(result.strength);
    if (result.unit) setDoseUnit(result.unit);
    if (result.form) setForm(result.form);
    setShowCamera(false);
    // If we got a name, advance to step 2
    if (result.name) {
      setTimeout(() => setStep(1), 200);
    }
  };

  const canAdvance = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return doseStrength.trim().length > 0;
    if (step === 2) return true;
    return true;
  };

  const stepTitles = ["What medication?", "Dose & form", "Schedule", "Extra details"];
  const stepSubtitles = [
    "Search by name or scan the label",
    "How much per dose?",
    "When do you take it?",
    "Optional — helps with refills & care",
  ];

  const inputClass = "w-full h-14 px-4 rounded-2xl border border-border bg-card text-foreground text-base focus:outline-none focus:ring-2 focus:ring-primary transition-shadow";

  if (showCamera) {
    return (
      <CameraScanner
        onResult={handleCameraResult}
        onClose={() => setShowCamera(false)}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        {step > 0 && !editMode ? (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setStep(s => s - 1)}
            className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0"
            data-testid="back-step-btn"
          >
            <ChevronLeftIcon size={20} />
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onClose}
            className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0"
            data-testid="close-med-form"
          >
            <XIcon size={18} />
          </motion.button>
        )}

        <div className="flex-1">
          <h2 className="text-lg font-bold tracking-tight leading-snug">
            {isEdit ? "Edit Medication" : stepTitles[step]}
          </h2>
          {!isEdit && (
            <p className="text-xs text-muted-foreground mt-0.5">{stepSubtitles[step]}</p>
          )}
        </div>

        {!isEdit && (
          <StepIndicator current={step} total={totalSteps} />
        )}
      </div>

      {/* Interaction warning */}
      <AnimatePresence>
        {interactionWarning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`rounded-2xl p-4 flex items-start gap-3 ${
              interactionWarning.severity === "severe"
                ? "bg-destructive/10 border border-destructive/20"
                : "bg-[hsl(var(--nurilo-alert-amber))]/10 border border-[hsl(var(--nurilo-alert-amber))]/20"
            }`}
            data-testid="interaction-warning"
          >
            <WarnIcon size={18} className={
              interactionWarning.severity === "severe" ? "text-destructive mt-0.5" : "text-[hsl(var(--nurilo-alert-amber))] mt-0.5"
            } />
            <div>
              <p className="text-sm font-bold">
                {interactionWarning.severity === "severe" ? "Severe Interaction" : "Moderate Interaction"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{interactionWarning.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── STEP 0: What medication ─────────────────────────────────────────── */}
      <AnimatePresence>
        {(step === 0 || editMode) && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Camera scan promo card */}
            {!editMode && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCamera(true)}
                className="w-full bg-primary/5 border-2 border-dashed border-primary/30 rounded-2xl p-5 flex items-center gap-4"
                data-testid="scan-label-card"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <CameraIcon size={26} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-primary">Scan Label</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Point camera at any prescription or supplement bottle
                  </p>
                </div>
                <ChevronRightIcon size={16} />
              </motion.button>
            )}

            <div className="relative flex items-center gap-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">or type below</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <MedSearchInput
              value={name}
              onChange={setName}
              onSelect={handleSelectFromDB}
              onOpenCamera={() => setShowCamera(true)}
            />

            {/* If we have a name from camera/DB, show it prominently */}
            {name && (
              <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-2xl px-4 py-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <CheckIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{name}</p>
                  {doseStrength && (
                    <p className="text-xs text-muted-foreground">{doseStrength} {doseUnit} · {form}</p>
                  )}
                </div>
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={() => { setName(""); setDoseStrength(""); }}
                  className="text-muted-foreground"
                >
                  <XIcon size={16} />
                </motion.button>
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP 1: Dose & Form ─────────────────────────────────────────────── */}
        {(step === 1 || editMode) && !showCamera && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {editMode && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Medication Name</label>
                <MedSearchInput
                  value={name}
                  onChange={setName}
                  onSelect={handleSelectFromDB}
                  onOpenCamera={() => setShowCamera(true)}
                />
              </div>
            )}

            {/* Dose strength */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Dose Amount</label>
              <input
                type="text"
                inputMode="decimal"
                value={doseStrength}
                onChange={e => setDoseStrength(e.target.value)}
                placeholder="e.g., 500"
                className={`mt-2 ${inputClass}`}
                data-testid="med-dose-input"
              />
            </div>

            {/* Unit selector */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Unit</label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {UNITS.map(u => (
                  <motion.button
                    key={u}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setDoseUnit(u)}
                    className={`h-12 rounded-xl text-sm font-bold transition-colors ${
                      doseUnit === u ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"
                    }`}
                    data-testid={`unit-${u}`}
                  >
                    {u}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Form selector — large icon cards */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Form</label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {FORMS.map(({ label, icon: Icon }) => (
                  <motion.button
                    key={label}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setForm(label)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-colors border ${
                      form === label
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-muted-foreground"
                    }`}
                    data-testid={`form-${label}`}
                  >
                    <Icon size={24} />
                    <span className="text-[10px] font-semibold leading-none">{label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Schedule ─────────────────────────────────────────────────── */}
        {(step === 2 || editMode) && !showCamera && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            {/* Frequency selector */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">How often?</label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {FREQUENCY_OPTIONS.map(opt => (
                  <motion.button
                    key={opt.label}
                    whileTap={{ scale: 0.94 }}
                    onClick={() => handleFrequencySelect(opt)}
                    className={`h-16 px-4 rounded-2xl transition-colors border flex items-center gap-3 ${
                      frequency === opt.label
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground"
                    }`}
                    data-testid={`freq-${opt.label.replace(/\s+/g, "-")}`}
                  >
                    <span className={`text-sm font-black w-9 text-center flex-shrink-0 ${frequency === opt.label ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {opt.emoji}
                    </span>
                    <span className="text-sm font-semibold text-left leading-snug">{opt.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Visual time pickers */}
            {times.length > 0 && (
              <div className="space-y-3">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <ClockIcon size={12} /> Dose times
                </label>
                {times.map((t, i) => (
                  <VisualTimePicker
                    key={i}
                    value={t}
                    onChange={newTime => {
                      const updated = [...times];
                      updated[i] = newTime;
                      setTimes(updated);
                    }}
                    label={times.length > 1 ? `Dose ${i + 1} — ${formatTime(t)}` : `Time — ${formatTime(t)}`}
                    index={i}
                  />
                ))}
              </div>
            )}

            {times.length === 0 && (
              <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                <p className="text-sm text-muted-foreground">Take as needed — no scheduled times</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP 3: Details ─────────────────────────────────────────────────── */}
        {(step === 3 || editMode) && !showCamera && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                What it's for <span className="normal-case font-normal text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="e.g., Blood pressure, anxiety"
                className={`mt-2 ${inputClass}`}
                data-testid="med-purpose-input"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Doctor <span className="normal-case font-normal">(opt.)</span>
                </label>
                <input
                  type="text"
                  value={doctor}
                  onChange={e => setDoctor(e.target.value)}
                  placeholder="Dr. Smith"
                  className={`mt-2 ${inputClass}`}
                  data-testid="med-doctor-input"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                  Pharmacy <span className="normal-case font-normal">(opt.)</span>
                </label>
                <input
                  type="text"
                  value={pharmacy}
                  onChange={e => setPharmacy(e.target.value)}
                  placeholder="CVS, Walgreens…"
                  className={`mt-2 ${inputClass}`}
                  data-testid="med-pharmacy-input"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Pills remaining <span className="normal-case font-normal">(optional)</span>
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={pillCount}
                onChange={e => setPillCount(e.target.value)}
                placeholder="e.g., 30"
                min="0"
                className={`mt-2 ${inputClass}`}
                data-testid="med-pillcount-input"
              />
              {pillCount && parseInt(pillCount) <= 14 && (
                <p className="text-xs text-[hsl(var(--nurilo-alert-amber))] mt-1.5 font-medium">
                  Low supply — you may need a refill soon
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation buttons ─────────────────────────────────────────────────── */}
      {!showCamera && (
        <div className="pt-2">
          {/* Edit mode: single save button */}
          {editMode ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => saveMed.mutate()}
              disabled={!name.trim() || !doseStrength.trim() || saveMed.isPending}
              className="w-full h-[56px] bg-primary text-primary-foreground rounded-2xl font-bold text-base disabled:opacity-40 transition-opacity"
              data-testid="save-medication-btn"
            >
              {saveMed.isPending ? "Saving…" : "Save Changes"}
            </motion.button>
          ) : step < totalSteps - 1 ? (
            /* Next step */
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => canAdvance() && setStep(s => s + 1)}
              disabled={!canAdvance()}
              className="w-full h-[56px] bg-primary text-primary-foreground rounded-2xl font-bold text-base disabled:opacity-40 transition-opacity flex items-center justify-center gap-2"
              data-testid="next-step-btn"
            >
              Continue
              <ChevronRightIcon size={16} />
            </motion.button>
          ) : (
            /* Final step: save */
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => saveMed.mutate()}
              disabled={!name.trim() || !doseStrength.trim() || saveMed.isPending}
              className="w-full h-[56px] bg-primary text-primary-foreground rounded-2xl font-bold text-base disabled:opacity-40 transition-opacity"
              data-testid="save-medication-btn"
            >
              {saveMed.isPending ? "Saving…" : "Save Medication"}
            </motion.button>
          )}

          {/* Skip details (step 3) */}
          {!editMode && step === 3 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => saveMed.mutate()}
              disabled={!name.trim() || !doseStrength.trim() || saveMed.isPending}
              className="w-full h-11 mt-2 text-muted-foreground text-sm font-medium rounded-2xl hover:bg-secondary transition-colors"
              data-testid="skip-details-btn"
            >
              Skip details & save
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
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
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${
        med.status === "paused"
          ? "bg-[hsl(var(--nurilo-alert-amber))]"
          : med.is_critical
            ? "bg-destructive"
            : "bg-primary"
      }`} />

      <div className="pl-5 pr-4 py-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CapsuleIcon size={20} />
          </div>

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
            {times.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {times.map(formatTime).join("  ·  ")}
              </p>
            )}
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
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
          <CapsuleIcon size={20} />
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
              activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
            data-testid={`tab-${tab}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Schedule</p>
            <p className="text-sm">
              {med.frequency}
              {times.length > 0 && ` · ${times.map(formatTime).join(",  ")}`}
            </p>
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
            General information about {med.name} would appear here — common uses, typical dosing, storage instructions, and common side effects.
          </p>
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            Always consult your doctor or pharmacist for advice specific to your situation.
          </p>
        </div>
      )}
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
    <div className="px-4 py-6 space-y-6">
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

          {meds.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
              data-testid="no-meds"
            >
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="mx-auto mb-5 opacity-25">
                <rect x="12" y="24" width="40" height="16" rx="8" stroke="currentColor" strokeWidth="3" className="text-muted-foreground" />
                <line x1="32" y1="24" x2="32" y2="40" stroke="currentColor" strokeWidth="2.5" className="text-muted-foreground" />
                <path d="M21 31 C25 27 29 28 29 32 C29 36 25 37 21 33" stroke="currentColor" strokeWidth="2" fill="none" className="text-muted-foreground" />
                <circle cx="52" cy="18" r="8" fill="currentColor" className="text-primary opacity-40" />
                <line x1="52" y1="14" x2="52" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="48" y1="18" x2="56" y2="18" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <p className="text-base font-bold text-muted-foreground">No medications yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-6">Add your first medication to get started</p>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => setView("add")}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold text-sm"
                data-testid="empty-add-btn"
              >
                <PlusIcon size={15} /> Add Medication
              </motion.button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
