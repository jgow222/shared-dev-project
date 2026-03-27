import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import * as api from "@/lib/api";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Medication, DoseLog } from "@shared/schema";
import { searchMedications, getMedByName, searchMedicationsWithFallback } from "@/lib/medicationDatabase";
import type { MedEntry } from "@/lib/medicationDatabase";
// medicationScanner.ts kept for potential future barcode integration

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

// ─── Time Picker ──────────────────────────────────────────────────────────────
// Native time input styled for mobile — tap once, OS picker opens instantly

interface TimePickerProps {
  value: string; // "HH:MM" 24h
  onChange: (val: string) => void;
  label?: string;
  index?: number;
  onRemove?: () => void;
}

function VisualTimePicker({ value, onChange, label, index, onRemove }: TimePickerProps) {
  const [h, m] = value.split(":").map(Number);
  const isPM = h >= 12;
  const hour12 = h % 12 || 12;
  const formatted = `${hour12}:${m.toString().padStart(2, "0")} ${isPM ? "PM" : "AM"}`;

  return (
    <div className="flex items-center gap-3 bg-secondary/50 rounded-2xl p-3.5" data-testid={`time-picker-${index ?? 0}`}>
      {/* Time display + native input overlay */}
      <div className="flex-1 relative">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
          {label || `Dose ${(index ?? 0) + 1}`}
        </p>
        <div className="relative flex items-center">
          <p className="text-2xl font-bold tabular-nums text-foreground">{formatted}</p>
          {/* Invisible native time input overlaid for tap-to-open */}
          <input
            type="time"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            data-testid={`time-input-${index ?? 0}`}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">Tap to change time</p>
      </div>
      {onRemove && (
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onRemove}
          className="w-9 h-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0"
          data-testid={`remove-time-${index ?? 0}`}
        >
          <XIcon size={14} />
        </motion.button>
      )}
    </div>
  );
}


// ─── Camera Scanner ────────────────────────────────────────────────────────────
// How it works:
//   1. Camera opens → live video feed on screen
//   2. User points phone at any medication bottle/label/box/prescription
//   3. User taps "Scan" → frame captured as JPEG → sent to Claude Vision AI
//   4. AI reads the label: brand name, generic name, strength, form, dosage
//   5. Result auto-fills the medication form
//
// Works on any phone, any medication, any supplement, any prescription.
// No barcode required — reads actual label text with AI vision.

interface CameraScannerProps {
  onResult: (result: Partial<{ name: string; strength: string; unit: string; form: string }>) => void;
  onClose: () => void;
}

// Parse medication text typed manually as fallback
function parseMedicationLabel(text: string): Partial<{ name: string; strength: string; unit: string; form: string }> {
  const result: Partial<{ name: string; strength: string; unit: string; form: string }> = {};
  const strengthMatch = text.match(/(\d+\.?\d*)\s*(mg|mcg|ml|iu|units|g|%)/i);
  if (strengthMatch) {
    result.strength = strengthMatch[1];
    result.unit = strengthMatch[2].toLowerCase().replace("iu", "IU");
  }
  const formMatch = text.match(/\b(tablet|capsule|liquid|solution|gel cap|softgel|chewable|patch|cream|inhaler|spray|drops|injection|gummy|powder)\b/i);
  if (formMatch) result.form = formMatch[1].charAt(0).toUpperCase() + formMatch[1].slice(1).toLowerCase();
  const words = text.split(/\s+/).filter(w =>
    w.length >= 3 &&
    !/^(take|tablet|capsule|oral|daily|dose|each|with|for|the|and|once|twice|times|mg|mcg|ml|iu|NDC|exp|lot|strength|warning|store)/i.test(w)
  );
  if (words.length > 0) result.name = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
  return result;
}

const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || "https://qpmjghocajyvugjxnkdn.supabase.co";
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbWpnaG9jYWp5dnVnanhua2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1ODM4MDQsImV4cCI6MjA5MDE1OTgwNH0.fzHBvHic5W6BZVUfD-dXEj0x6MaBeM6GyGEUsu8vQt0";

type Stage = "starting" | "live" | "scanning" | "done" | "error";

function CameraScanner({ onResult, onClose }: CameraScannerProps) {
  // ── Refs (never trigger re-render) ─────────────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  // ── State ──────────────────────────────────────────────────────────────────
  const [stage, setStage] = useState<Stage>("starting");
  const [errorMsg, setErrorMsg] = useState("");
  const [scanResult, setScanResult] = useState<{
    name: string; brand?: string; strength?: string; unit?: string; form?: string; confidence?: string;
  } | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [manualInput, setManualInput] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [scanCount, setScanCount] = useState(0); // tracks retries for hints

  // ── Camera lifecycle ───────────────────────────────────────────────────────
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const openCamera = async (mode: "environment" | "user") => {
    stopStream();
    if (!isMountedRef.current) return;
    setStage("starting");
    setErrorMsg("");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw Object.assign(new Error("Camera not available"), { name: "NotSupportedError" });
      }

      // Request the highest resolution available for better AI reading
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      if (!isMountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;

      // Wait for video to have actual frame data
      await new Promise<void>((resolve, reject) => {
        const t = setTimeout(() => reject(new Error("Camera ready timeout")), 15000);
        const done = () => { clearTimeout(t); resolve(); };
        if (video.readyState >= 2) { done(); return; }
        video.addEventListener("loadedmetadata", done, { once: true });
        video.addEventListener("error", () => { clearTimeout(t); reject(new Error("Video error")); }, { once: true });
      });

      try { await video.play(); } catch (e: any) {
        if (e?.name !== "AbortError") throw e;
      }

      if (!isMountedRef.current) return;
      setStage("live");

    } catch (err: any) {
      if (!isMountedRef.current) return;
      const name = err?.name || "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setErrorMsg("Camera permission denied. Tap the lock icon in your browser address bar and allow camera access.");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setErrorMsg("No camera found on this device.");
      } else if (name === "NotReadableError" || name === "TrackStartError") {
        setErrorMsg("Camera is in use by another app. Close other apps and try again.");
      } else if (name === "NotSupportedError" || name === "OverconstrainedError") {
        setErrorMsg("Camera not supported on this browser. Please use Chrome or Safari.");
      } else {
        setErrorMsg(`Could not start camera: ${err?.message || "Unknown error"}`);
      }
      setStage("error");
    }
  };

  // Start camera on mount, stop on unmount
  useEffect(() => {
    isMountedRef.current = true;
    openCamera("environment");
    return () => {
      isMountedRef.current = false;
      stopStream();
    };
  }, []); // intentionally empty — runs once on mount only

  // ── AI Scan ────────────────────────────────────────────────────────────────
  const captureAndScan = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || stage !== "live") return;

    // Double-check video has frames
    if (video.readyState < 2 || !video.videoWidth) {
      setErrorMsg("Camera not ready yet — wait a moment and try again.");
      return;
    }

    setStage("scanning");
    setErrorMsg("");
    setScanCount(c => c + 1);

    // Capture full-resolution frame
    const w = video.videoWidth;
    const h = video.videoHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, w, h);

    // High quality JPEG — important for AI to read small text
    const imageDataUrl = canvas.toDataURL("image/jpeg", 0.95);

    if (imageDataUrl.length < 8000) {
      setStage("live");
      setErrorMsg("Frame capture failed — make sure camera is fully started.");
      return;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 40000);

      const response = await fetch(`${SUPABASE_URL}/functions/v1/scan-medication`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ image: imageDataUrl }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!isMountedRef.current) return;

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`Server error ${response.status}: ${errText.slice(0, 100)}`);
      }

      const data = await response.json();

      if (data.error || !data.name) {
        setStage("live");
        setErrorMsg(
          scanCount === 0
            ? "Couldn't read the label. Move closer and make sure the text is in focus."
            : "Still can't read it. Try better lighting or use 'Type Label' below."
        );
        return;
      }

      setScanResult(data);
      setStage("done");

    } catch (err: any) {
      if (!isMountedRef.current) return;
      setStage("live");
      if (err?.name === "AbortError") {
        setErrorMsg("Scan timed out — the AI is warming up. Try again in a few seconds.");
      } else if (err?.message?.includes("Failed to fetch") || err?.message?.includes("NetworkError")) {
        setErrorMsg("No internet connection. Check your connection and try again.");
      } else {
        setErrorMsg(`Scan error: ${err?.message || "Unknown"}. Try again or type the label.`);
      }
    }
  };

  const confirmResult = () => {
    if (!scanResult) return;
    onResult({
      name: scanResult.name,
      strength: scanResult.strength,
      unit: scanResult.unit,
      form: scanResult.form,
    });
  };

  const flipCamera = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    setFacingMode(next);
    setScanResult(null);
    setShowManual(false);
    openCamera(next);
  };

  const rescan = () => {
    setScanResult(null);
    setErrorMsg("");
    setShowManual(false);
    // Don't restart camera — just go back to live
    if (streamRef.current) {
      setStage("live");
    } else {
      openCamera(facingMode);
    }
  };

  const handleManualParse = () => {
    if (!manualInput.trim()) return;
    const parsed = parseMedicationLabel(manualInput);
    onResult(parsed);
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      data-testid="camera-scanner"
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-12 pb-3">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white border border-white/20"
          data-testid="close-camera"
        >
          <XIcon size={18} />
        </motion.button>

        <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
          <p className="text-white text-sm font-semibold">Scan Medication</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={flipCamera}
          className="w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white border border-white/20"
          data-testid="flip-camera"
        >
          {/* Flip camera icon */}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 5l3-3 3 3M5 2v9a4 4 0 008 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 15l-3 3-3-3M15 18V9A4 4 0 007 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
      </div>

      {/* Video feed — full screen */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        data-testid="camera-video"
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Starting spinner */}
      {stage === "starting" && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white mx-auto"
            />
            <p className="text-white/70 text-sm">Starting camera…</p>
          </div>
        </div>
      )}

      {/* Scanning overlay */}
      {stage === "scanning" && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-full border-2 border-white/30 border-t-primary mx-auto"
            />
            <div className="bg-black/70 backdrop-blur-sm rounded-2xl px-6 py-4">
              <p className="text-white font-semibold">Reading label…</p>
              <p className="text-white/60 text-xs mt-1">AI is identifying the medication</p>
            </div>
          </div>
        </div>
      )}

      {/* Aiming guide — only when live */}
      {stage === "live" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-[280px] h-[180px]">
            {/* Corner brackets */}
            {[
              "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-2xl",
              "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-2xl",
              "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-2xl",
              "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-2xl",
            ].map((cls, i) => (
              <div key={i} className={`absolute w-10 h-10 border-white ${cls}`} />
            ))}
          </div>
        </div>
      )}

      {/* Error overlay */}
      {stage === "error" && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-5 px-8">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
            <WarnIcon size={32} className="text-red-400" />
          </div>
          <p className="text-white text-center text-sm leading-relaxed">{errorMsg}</p>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => openCamera(facingMode)}
            className="px-8 py-3.5 bg-primary text-primary-foreground rounded-2xl font-semibold"
          >
            Try Again
          </motion.button>
        </div>
      )}

      {/* Bottom panel */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-16 pb-10 px-5 space-y-3">

        {/* Scan result */}
        <AnimatePresence>
          {stage === "done" && scanResult && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-2 h-2 rounded-full ${scanResult.confidence === "high" ? "bg-green-400" : "bg-amber-400"}`} />
                <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">
                  Identified · {scanResult.confidence || "medium"} confidence
                </p>
              </div>
              <p className="text-white text-lg font-bold leading-snug">{scanResult.name}</p>
              {scanResult.brand && scanResult.brand.toLowerCase() !== scanResult.name.toLowerCase() && (
                <p className="text-white/60 text-sm mt-0.5">{scanResult.brand}</p>
              )}
              {(scanResult.strength || scanResult.form) && (
                <p className="text-white/70 text-sm mt-1">
                  {[scanResult.strength && `${scanResult.strength} ${scanResult.unit || "mg"}`, scanResult.form]
                    .filter(Boolean).join(" · ")}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error message (inline, not full screen — keeps camera live) */}
        {stage === "live" && errorMsg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-amber-500/20 border border-amber-500/30 rounded-xl px-4 py-2.5"
          >
            <p className="text-amber-200 text-xs text-center leading-relaxed">{errorMsg}</p>
          </motion.div>
        )}

        {/* Manual input */}
        <AnimatePresence>
          {showManual && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  placeholder='e.g. "Advil 200mg" or "Metformin 500mg tablet"'
                  className="flex-1 h-12 px-4 rounded-2xl bg-white/10 text-white text-sm placeholder-white/40 border border-white/20 focus:outline-none focus:border-white/50"
                  data-testid="manual-label-input"
                  autoFocus
                  onKeyDown={e => e.key === "Enter" && handleManualParse()}
                />
                <motion.button
                  whileTap={{ scale: 0.88 }}
                  onClick={handleManualParse}
                  className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground flex-shrink-0"
                >
                  <CheckIcon size={18} />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <div className="flex gap-3">
          {/* Type label — always visible */}
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowManual(v => !v)}
            className="h-14 px-5 rounded-2xl bg-white/10 text-white text-sm font-semibold border border-white/20 backdrop-blur-sm flex-shrink-0"
            data-testid="manual-entry-btn"
          >
            Type Label
          </motion.button>

          {/* Main scan button */}
          {(stage === "live") && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={captureAndScan}
              className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2.5 shadow-lg"
              data-testid="capture-btn"
            >
              <ScanIcon size={20} />
              Scan Label
            </motion.button>
          )}

          {/* Scan Again (when done or after error back to live) */}
          {stage === "done" && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={rescan}
              className="h-14 px-5 rounded-2xl bg-white/10 text-white text-sm font-semibold border border-white/20 backdrop-blur-sm flex-shrink-0"
              data-testid="scan-again-btn"
            >
              Rescan
            </motion.button>
          )}

          {/* Confirm */}
          {stage === "done" && scanResult && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={confirmResult}
              className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-bold flex items-center justify-center gap-2"
              data-testid="confirm-scan-btn"
            >
              <CheckIcon size={18} />
              Use This
            </motion.button>
          )}
        </div>

        {/* Contextual hint */}
        <p className="text-white/35 text-xs text-center">
          {stage === "live" && scanCount === 0 && "Point at the label and tap Scan Label"}
          {stage === "live" && scanCount > 0 && "Make sure label text is sharp and well-lit"}
          {stage === "done" && scanResult && "Confirm to use this medication"}
          {stage === "done" && !scanResult && "Use Type Label to enter it manually"}
        </p>
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
              {/* Quick-tap common doses */}
              <div className="mt-2 flex flex-wrap gap-2 mb-2">
                {["5","10","25","50","100","200","250","500","1000"].map(preset => (
                  <motion.button
                    key={preset}
                    whileTap={{ scale: 0.88 }}
                    onClick={() => setDoseStrength(preset)}
                    className={`h-9 px-3.5 rounded-xl text-sm font-bold transition-colors ${
                      doseStrength === preset
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border text-muted-foreground"
                    }`}
                    data-testid={`dose-preset-${preset}`}
                  >
                    {preset}
                  </motion.button>
                ))}
              </div>
              <input
                type="text"
                inputMode="decimal"
                value={doseStrength}
                onChange={e => setDoseStrength(e.target.value)}
                placeholder="Or type any amount (e.g. 325, 2.5, 1000)"
                className={inputClass}
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

        {/* ── STEP 2: Schedule ────────────────────────────────────────────────── */}
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
                    className={`h-14 px-4 rounded-2xl transition-colors border flex items-center gap-3 ${
                      frequency === opt.label
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card border-border text-foreground"
                    }`}
                    data-testid={`freq-${opt.label.replace(/\s+/g, "-")}`}
                  >
                    <span className={`text-sm font-black w-8 text-center flex-shrink-0 ${frequency === opt.label ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      {opt.emoji}
                    </span>
                    <span className="text-sm font-semibold text-left leading-snug">{opt.label}</span>
                  </motion.button>
                ))}
              </div>
              {/* Custom frequency text field */}
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Custom schedule (e.g. Every Monday, Every 8 hours…)"
                  value={FREQUENCY_OPTIONS.some(o => o.label === frequency) ? "" : frequency}
                  onChange={e => setFrequency(e.target.value || frequency)}
                  onFocus={e => { if (FREQUENCY_OPTIONS.some(o => o.label === frequency)) e.target.value = ""; }}
                  className="w-full h-12 px-4 rounded-2xl border border-dashed border-border bg-card text-foreground text-sm placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="custom-frequency-input"
                />
              </div>
            </div>

            {/* Dose times — easy tap-to-set pickers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                  <ClockIcon size={12} /> Dose times
                </label>
                {/* Add time button */}
                {times.length < 8 && (
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => {
                      const defaults = ["08:00", "12:00", "18:00", "21:00", "06:00", "10:00", "14:00", "22:00"];
                      const next = defaults.find(t => !times.includes(t)) || "08:00";
                      setTimes([...times, next]);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full"
                    data-testid="add-time-btn"
                  >
                    <PlusIcon size={12} /> Add time
                  </motion.button>
                )}
              </div>

              {times.length > 0 ? (
                <div className="space-y-2">
                  {times.map((t, i) => (
                    <VisualTimePicker
                      key={i}
                      value={t}
                      onChange={newTime => {
                        const updated = [...times];
                        updated[i] = newTime;
                        setTimes(updated);
                      }}
                      label={`Dose ${i + 1}`}
                      index={i}
                      onRemove={times.length > 1 ? () => setTimes(times.filter((_, idx) => idx !== i)) : undefined}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-secondary/50 rounded-2xl p-4 text-center">
                  <p className="text-sm text-muted-foreground">Take as needed — no scheduled times</p>
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setTimes(["08:00"])}
                    className="mt-2 text-xs text-primary font-bold"
                    data-testid="add-first-time-btn"
                  >
                    + Add a time
                  </motion.button>
                </div>
              )}
            </div>
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
