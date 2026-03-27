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

const FORM_OPTIONS = ["Tablet", "Capsule", "Liquid", "Softgel", "Patch", "Cream", "Inhaler", "Gummy", "Other"];

const UNITS = ["mg", "mcg", "ml", "IU"];

const FREQUENCY_OPTIONS = [
  { label: "Once daily", times: 1, emoji: "1×" },
  { label: "Twice daily", times: 2, emoji: "2×" },
  { label: "3× daily", times: 3, emoji: "3×" },
  { label: "As needed", times: 0, emoji: "PRN" },
  { label: "Specific days", times: 1, emoji: "Cal" },
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



// ─── Medication Scanner ───────────────────────────────────────────────────────
//
// Works like Google Lens — but for medications.
//   → Take a photo of ANY bottle, label, box, or prescription
//   → AI (Claude Vision) reads the text and identifies exactly what it is
//   → Name, brand, strength, form — auto-filled instantly
//
// Two modes:
//   1. LIVE CAMERA — point phone at bottle, tap Scan (needs HTTPS in prod)
//   2. PICK PHOTO  — pick any existing photo from device (works ALWAYS)
//
// Architecture: all async state lives in refs to eliminate stale closures.
// No useCallback needed — refs are always current.

interface CameraScannerProps {
  onResult: (result: Partial<{ name: string; strength: string; unit: string; form: string }>) => void;
  onClose: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

// MedScan edge function is deployed on the Nurilo project
const SCAN_URL = "https://vytsmfnzaidhpopbleqr.supabase.co/functions/v1/scan-medication";
const SCAN_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5dHNtZm56YWlkaHBvcGJsZXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQzOTIwNTMsImV4cCI6MjA4OTk2ODA1M30.Ff0mTzjIeXLNqkBmW5Sv16C9_YkANhqs6QqIINS_ARA";

// ── Scan call — hits the full MedScan pipeline (Vision + FDA + RxNorm + DailyMed) ──

async function callScanAI(dataUrl: string): Promise<{
  name?: string; brand?: string; genericName?: string; strength?: string; unit?: string;
  form?: string; confidence?: string; raw_text?: string; error?: string;
  manufacturer?: string; ndc_number?: string; rx_or_otc?: string;
  active_ingredients?: Array<{ name: string; strength?: string }>;
  directions?: string; fda_data?: any; rxnorm_data?: any; dailymed_data?: any;
}> {
  const ctrl = new AbortController();
  // 45 second timeout — enough for cold starts
  const tid = setTimeout(() => ctrl.abort(), 45_000);

  try {
    const res = await fetch(SCAN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SCAN_KEY}`,
        "apikey": SCAN_KEY,
      },
      body: JSON.stringify({ image: dataUrl }),
      signal: ctrl.signal,
    });

    clearTimeout(tid);

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status}: ${body.slice(0, 100)}`);
    }

    return await res.json();
  } catch (err) {
    clearTimeout(tid);
    throw err;
  }
}

// ── Resize image for optimal AI reading (max 1600px, quality 0.92) ─────────────

function resizeDataUrl(dataUrl: string, maxDim = 1600): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { naturalWidth: w, naturalHeight: h } = img;
      if (w > maxDim || h > maxDim) {
        const scale = Math.min(maxDim / w, maxDim / h);
        w = Math.round(w * scale);
        h = Math.round(h * scale);
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(dataUrl); return; }
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", 0.92));
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = dataUrl;
  });
}

// ── Read file as data URL — iOS-safe ─────────────────────────────────────────

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string" && result.startsWith("data:image")) {
        resolve(result);
      } else {
        reject(new Error("Invalid file data"));
      }
    };
    reader.onerror = () => reject(reader.error || new Error("FileReader error"));
    reader.readAsDataURL(file);
  });
}

// ── Manual label text parser ──────────────────────────────────────────────────

function parseTextLabel(text: string): Partial<{ name: string; strength: string; unit: string; form: string }> {
  const r: Partial<{ name: string; strength: string; unit: string; form: string }> = {};
  const s = text.match(/(\d+\.?\d*)\s*(mg|mcg|ml|iu|units|g|%)/i);
  if (s) { r.strength = s[1]; r.unit = s[2].toLowerCase().replace("iu", "IU"); }
  const f = text.match(/\b(tablet|capsule|liquid|solution|softgel|gel cap|chewable|patch|cream|inhaler|spray|drops|injection|gummy|powder)\b/i);
  if (f) r.form = f[1].charAt(0).toUpperCase() + f[1].slice(1).toLowerCase();
  const words = text.split(/\s+/).filter(w =>
    w.length >= 3 && !/^(take|tablet|capsule|oral|daily|dose|each|with|for|the|and|once|twice|times|mg|mcg|ml|iu|NDC|exp|lot|strength|warning|store)/i.test(w)
  );
  if (words[0]) r.name = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
  return r;
}

// ── Scanning Overlay with cycling status messages ─────────────────────────────

const SCAN_STATUS_MESSAGES = ["Reading label…", "Checking details…", "Almost there…"];

function ScanningOverlay() {
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIndex(i => (i + 1) % SCAN_STATUS_MESSAGES.length);
    }, 2500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-5 z-10">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 rounded-full border-[3px] border-white/15 border-t-primary"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <ScanIcon size={24} className="text-white" />
        </div>
      </div>
      <div className="bg-black/80 backdrop-blur rounded-2xl px-8 py-4 text-center">
        <AnimatePresence>
          <motion.p
            key={msgIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="text-white font-bold text-base"
          >
            {SCAN_STATUS_MESSAGES[msgIndex]}
          </motion.p>
        </AnimatePresence>
        <p className="text-white/50 text-xs mt-1">This takes just a moment</p>
      </div>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

type ScanStage =
  | "starting"       // camera initialising
  | "live"           // camera feed active
  | "photo_chosen"   // user picked a photo, showing preview
  | "scanning"       // AI call in flight
  | "result"         // AI returned a good result
  | "cam_error";     // camera failed (but photo path still works)

function CameraScanner({ onResult, onClose }: CameraScannerProps) {

  // ── DOM refs ───────────────────────────────────────────────────────────────
  const videoRef    = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef   = useRef<MediaStream | null>(null);

  // ── Mutable refs (no stale-closure risk) ───────────────────────────────────
  const mountedRef   = useRef(true);
  const stageRef     = useRef<ScanStage>("starting");

  // ── Render state ───────────────────────────────────────────────────────────
  const [stage,      setStageState]  = useState<ScanStage>("starting");
  const [errorMsg,   setErrorMsg]    = useState("");
  const [scanResult, setScanResult]  = useState<{
    name: string; brand?: string; genericName?: string; strength?: string; unit?: string; form?: string; confidence?: string;
    manufacturer?: string; ndc_number?: string; rx_or_otc?: string; fda_verified?: boolean;
    active_ingredients?: Array<{ name: string; strength?: string }>;
    directions?: string; dailymed_url?: string;
  } | null>(null);
  const [photoSrc,   setPhotoSrc]    = useState("");   // preview data URL
  const [manualText, setManualText]  = useState("");
  const [showManual, setShowManual]  = useState(false);
  const [facingMode, setFacingMode]  = useState<"environment" | "user">("environment");

  // Keeps stageRef in sync so async callbacks always see current stage
  const setStage = (s: ScanStage) => { stageRef.current = s; setStageState(s); };

  // ── Stop camera stream ─────────────────────────────────────────────────────
  const stopStream = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // ── Open camera ───────────────────────────────────────────────────────────
  const openCamera = async (mode: "environment" | "user" = "environment") => {
    stopStream();
    if (!mountedRef.current) return;
    setStage("starting");
    setErrorMsg("");

    // HTTPS / secure context check
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
      setErrorMsg("Camera needs HTTPS. Use Pick Photo below — it works on any connection.");
      setStage("cam_error");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg("Camera not supported in this browser. Use Pick Photo below.");
      setStage("cam_error");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920, min: 640 },
          height: { ideal: 1080, min: 480 },
        },
        audio: false,
      });

      if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) { stream.getTracks().forEach(t => t.stop()); return; }

      video.srcObject = stream;

      // Wait for first frame
      await new Promise<void>((res, rej) => {
        const tid = setTimeout(() => rej(new Error("Camera timeout")), 15_000);
        const ok = () => { clearTimeout(tid); res(); };
        if (video.readyState >= 2) { ok(); return; }
        video.addEventListener("loadedmetadata", ok, { once: true });
        video.addEventListener("error",          () => { clearTimeout(tid); rej(new Error("Video element error")); }, { once: true });
      });

      try { await video.play(); } catch (e: any) {
        if (e?.name !== "AbortError") throw e;
      }

      if (!mountedRef.current) return;
      setStage("live");

    } catch (err: any) {
      if (!mountedRef.current) return;
      const n = err?.name ?? "";
      if (n === "NotAllowedError" || n === "PermissionDeniedError") {
        setErrorMsg("Camera permission denied. Tap Pick Photo to use your photo library instead.");
      } else if (n === "NotFoundError" || n === "DevicesNotFoundError") {
        setErrorMsg("No camera found. Use Pick Photo to choose an image from your library.");
      } else if (n === "NotReadableError" || n === "TrackStartError") {
        setErrorMsg("Camera is in use by another app. Use Pick Photo instead.");
      } else {
        setErrorMsg(`Camera error: ${err?.message ?? "unknown"}. Use Pick Photo below.`);
      }
      setStage("cam_error");
    }
  };

  // Mount / unmount
  useEffect(() => {
    mountedRef.current = true;

    // Warm up the edge function silently — no error if it fails
    callScanAI("warmup").catch(() => {});

    openCamera("environment");

    return () => {
      mountedRef.current = false;
      stopStream();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handle scan response (uses refs, never stale) ──────────────────────────
  const handleAIResult = (data: Awaited<ReturnType<typeof callScanAI>>, prevStage: ScanStage) => {
    if (!mountedRef.current) return;

    const hasResult = data.name &&
      data.name.toLowerCase() !== "unknown" &&
      data.name.toLowerCase() !== "unknown medication" &&
      !data.error;

    if (hasResult) {
      setScanResult({
        name: data.name!,
        brand:      data.brand      || undefined,
        genericName: data.genericName || undefined,
        strength:   data.strength   || undefined,
        unit:       data.unit       || undefined,
        form:       data.form       || undefined,
        confidence: data.confidence || "medium",
        manufacturer: data.manufacturer || undefined,
        ndc_number: data.ndc_number || undefined,
        rx_or_otc: data.rx_or_otc || undefined,
        fda_verified: !!(data.fda_data || data.rxnorm_data),
        active_ingredients: data.active_ingredients || undefined,
        directions: data.directions || undefined,
        dailymed_url: data.dailymed_data?.dailymed_url || undefined,
      });
      setStage("result");
      setErrorMsg("");
    } else {
      // Restore previous stage so user can try again
      setStage(prevStage === "photo_chosen" ? "photo_chosen" : "live");
      setErrorMsg(
        data.error === "Cannot identify medication from this image"
          ? "Couldn't read the label. Make sure the text is clearly visible, well-lit, and in focus."
          : "Couldn't identify this medication. Try a clearer photo or type the name manually."
      );
    }
  };

  // ── Scan live camera frame ─────────────────────────────────────────────────
  const scanLive = async () => {
    if (stageRef.current !== "live") return;
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) {
      setErrorMsg("Camera not ready yet. Wait a moment and try again.");
      return;
    }

    setStage("scanning");
    setErrorMsg("");

    // Capture frame
    const canvas = document.createElement("canvas");
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setStage("live");
      setErrorMsg("Canvas unavailable — try Pick Photo instead.");
      return;
    }
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    if (dataUrl.length < 8_000) {
      setStage("live");
      setErrorMsg("Frame too small — hold steady and try again.");
      return;
    }

    try {
      const result = await callScanAI(dataUrl);
      handleAIResult(result, "live");
    } catch (err: any) {
      if (!mountedRef.current) return;
      setStage("live");
      setErrorMsg(
        err?.name === "AbortError"
          ? "Timed out — try again"
          : err?.message?.includes("fetch")
          ? "Network error. Check your connection and try again."
          : "Scan failed. Try again or use Pick Photo."
      );
    }
  };

  // ── Scan uploaded photo ────────────────────────────────────────────────────
  const scanPhoto = async (dataUrl: string) => {
    setStage("scanning");
    setErrorMsg("");

    try {
      // Resize for optimal AI performance
      const resized = await resizeDataUrl(dataUrl);
      const result  = await callScanAI(resized);
      handleAIResult(result, "photo_chosen");
    } catch (err: any) {
      if (!mountedRef.current) return;
      setStage("photo_chosen");
      setErrorMsg(
        err?.name === "AbortError"
          ? "Scan timed out. Try again."
          : "Scan failed. Try a clearer photo."
      );
    }
  };

  // ── File picker handler ────────────────────────────────────────────────────
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Capture file ref immediately — React nullifies the event after handler returns
    const file = e.target.files?.[0] ?? null;
    // Reset so same file can be picked again
    e.target.value = "";

    if (!file) return;

    // Accept any image (type check unreliable on mobile — check filename too)
    const isImage = file.type.startsWith("image/") ||
      /\.(jpe?g|png|webp|heic|heif|gif|bmp|tiff?)$/i.test(file.name);

    if (!isImage) {
      setErrorMsg("Please select an image file (JPG, PNG, HEIC, etc.).");
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      setPhotoSrc(dataUrl);
      setStage("photo_chosen");
      setErrorMsg("");
      setScanResult(null);
      // Auto-scan immediately — no extra tap needed
      await scanPhoto(dataUrl);
    } catch (err: any) {
      setErrorMsg(`Couldn't read that file: ${err?.message ?? "unknown error"}`);
    }
  };

  // ── Confirm & fill form ────────────────────────────────────────────────────
  const confirmResult = () => {
    if (!scanResult) return;
    onResult({
      name:     scanResult.name,
      strength: scanResult.strength,
      unit:     scanResult.unit,
      form:     scanResult.form,
    });
  };

  const tryAgain = () => {
    setScanResult(null);
    setErrorMsg("");
    setPhotoSrc("");
    setShowManual(false);
    if (streamRef.current) {
      setStage("live");
    } else {
      openCamera(facingMode);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      data-testid="camera-scanner"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={onFileChange}
        data-testid="photo-file-input"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-12 pb-3">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          className="w-11 h-11 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white border border-white/20"
          data-testid="close-camera"
          aria-label="Close scanner"
        >
          <XIcon size={18} />
        </motion.button>

        <div className="bg-black/60 backdrop-blur rounded-full px-4 py-2 border border-white/20">
          <p className="text-white text-sm font-semibold tracking-wide">Scan Medication</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => {
            const next = facingMode === "environment" ? "user" : "environment";
            setFacingMode(next);
            openCamera(next);
          }}
          className="w-11 h-11 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white border border-white/20"
          data-testid="flip-camera"
          aria-label="Flip camera"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 5l3-3 3 3M5 2v9a4 4 0 008 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 15l-3 3-3-3M15 18V9A4 4 0 007 9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
      </div>

      {/* Camera video — always rendered so ref is always valid */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 w-full h-full object-cover ${stage === "photo_chosen" ? "opacity-0" : "opacity-100"}`}
        data-testid="camera-video"
      />

      {/* Photo preview */}
      {photoSrc && (stage === "photo_chosen" || stage === "scanning" || stage === "result") && (
        <img
          src={photoSrc}
          alt="Selected medication photo"
          className="absolute inset-0 w-full h-full object-contain bg-black"
          data-testid="photo-preview"
        />
      )}

      {/* Camera starting */}
      {stage === "starting" && (
        <div className="absolute inset-0 bg-black flex flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white"
          />
          <p className="text-white/60 text-sm">Starting camera…</p>
        </div>
      )}

      {/* Camera error (full overlay) */}
      {stage === "cam_error" && (
        <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center gap-5 px-8">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
            <CameraIcon size={28} className="text-primary" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-white font-semibold">Camera unavailable</p>
            <p className="text-white/60 text-sm leading-relaxed">{errorMsg}</p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2"
              data-testid="pick-photo-main-btn"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <rect x="1" y="4" width="18" height="13" rx="2"/>
                <circle cx="10" cy="10.5" r="3"/>
                <path d="M6 4l1.5-2.5h5L14 4"/>
              </svg>
              Pick a Photo to Scan
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => openCamera(facingMode)}
              className="w-full h-12 rounded-2xl bg-white/10 text-white font-semibold text-sm border border-white/20"
            >
              Retry Camera
            </motion.button>
          </div>
        </div>
      )}

      {/* Scanning overlay */}
      {stage === "scanning" && (
        <ScanningOverlay />
      )}

      {/* Aim guide when camera is live */}
      {stage === "live" && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative w-[280px] h-[175px]">
            {[
              "top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-2xl",
              "top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-2xl",
              "bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-2xl",
              "bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-2xl",
            ].map((cls, i) => (
              <div key={i} className={`absolute w-10 h-10 border-white/90 ${cls}`} />
            ))}
            <motion.div
              className="absolute left-3 right-3 h-0.5 bg-primary/70"
              animate={{ top: ["8%", "88%", "8%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      )}

      {/* Bottom panel */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-gradient-to-t from-black via-black/90 to-transparent pt-16 pb-10 px-5 space-y-3">

          {/* RESULT CARD */}
          <AnimatePresence>
            {stage === "result" && scanResult && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8 }}
                className="bg-white/12 backdrop-blur border border-white/25 rounded-2xl p-4 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                    scanResult.confidence === "high" ? "bg-green-400" : "bg-amber-400"
                  }`} />
                  <p className="text-white/50 text-[10px] font-black uppercase tracking-widest">
                    {scanResult.confidence === "high" ? "Identified" : "Best match"} · {scanResult.confidence} confidence
                  </p>
                  {scanResult.fda_verified && (
                    <span className="ml-auto bg-green-500/20 text-green-300 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-green-400/30">
                      FDA Verified
                    </span>
                  )}
                </div>
                <p className="text-white text-2xl font-bold leading-tight">{scanResult.name}</p>
                {scanResult.genericName && scanResult.genericName.toLowerCase() !== scanResult.name.toLowerCase() && (
                  <p className="text-white/50 text-xs">{scanResult.genericName}</p>
                )}
                {scanResult.brand && scanResult.brand.toLowerCase() !== scanResult.name.toLowerCase() && scanResult.brand.toLowerCase() !== scanResult.genericName?.toLowerCase() && (
                  <p className="text-white/60 text-sm font-medium">{scanResult.brand}</p>
                )}
                {(scanResult.strength || scanResult.form) && (
                  <p className="text-white/70 text-sm">
                    {[
                      scanResult.strength ? `${scanResult.strength} ${scanResult.unit ?? "mg"}` : null,
                      scanResult.form,
                      scanResult.rx_or_otc,
                    ].filter(Boolean).join("  ·  ")}
                  </p>
                )}
                {scanResult.manufacturer && (
                  <p className="text-white/40 text-xs">by {scanResult.manufacturer}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* INLINE ERROR (camera still live — no full-screen takeover) */}
          {(stage === "live" || stage === "photo_chosen") && errorMsg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-amber-500/20 border border-amber-400/30 rounded-xl px-4 py-2.5"
            >
              <p className="text-amber-200 text-xs text-center leading-relaxed">{errorMsg}</p>
            </motion.div>
          )}

          {/* MANUAL INPUT */}
          <AnimatePresence>
            {showManual && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={manualText}
                    onChange={e => setManualText(e.target.value)}
                    placeholder='e.g. "Advil 200mg" or "Metformin 500mg tablet"'
                    className="flex-1 h-12 px-4 rounded-2xl bg-white/10 text-white text-sm placeholder-white/35 border border-white/20 focus:outline-none focus:border-primary/70"
                    data-testid="manual-label-input"
                    autoFocus
                    onKeyDown={e => {
                      if (e.key === "Enter" && manualText.trim()) {
                        onResult(parseTextLabel(manualText));
                      }
                    }}
                  />
                  <motion.button
                    whileTap={{ scale: 0.88 }}
                    onClick={() => manualText.trim() && onResult(parseTextLabel(manualText))}
                    className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground flex-shrink-0"
                    aria-label="Submit manual entry"
                  >
                    <CheckIcon size={18} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ACTION BUTTONS */}
          <div className="flex gap-2">

            {/* Type label — always available */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowManual(v => !v)}
              className="h-14 px-4 rounded-2xl bg-white/10 text-white text-xs font-semibold border border-white/20 backdrop-blur flex-shrink-0"
              data-testid="manual-entry-btn"
            >
              Type Label
            </motion.button>

            {/* Pick Photo — always available, no HTTPS required */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => fileInputRef.current?.click()}
              className="h-14 px-4 rounded-2xl bg-white/10 text-white text-xs font-semibold border border-white/20 backdrop-blur flex-shrink-0 flex items-center gap-1.5"
              data-testid="pick-photo-btn"
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="1" y="3" width="13" height="10" rx="1.5"/>
                <circle cx="7.5" cy="8" r="2.5"/>
                <path d="M5 3l1.2-2h3.6L11 3"/>
              </svg>
              Pick Photo
            </motion.button>

            {/* Scan live camera */}
            {stage === "live" && (
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={scanLive}
                className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 shadow-xl"
                data-testid="capture-btn"
              >
                <ScanIcon size={18} />
                Scan Label
              </motion.button>
            )}

            {/* Scan result actions — stacked for comfortable tapping */}
            {stage === "result" && (
              <div className="flex flex-col gap-2 w-full">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={confirmResult}
                  className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-bold text-base flex items-center justify-center gap-2.5 shadow-xl"
                  data-testid="confirm-scan-btn"
                >
                  <CheckIcon size={20} />
                  Use This Medication
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={tryAgain}
                  className="w-full h-12 rounded-2xl bg-white/10 text-white text-sm font-semibold border border-white/20"
                  data-testid="scan-again-btn"
                >
                  Scan Again
                </motion.button>
              </div>
            )}
          </div>

          {/* Contextual hint */}
          <p className="text-white/30 text-[11px] text-center select-none">
            {stage === "live"         && "Point label at frame · Scan Label · or Pick Photo from library"}
            {stage === "photo_chosen" && "Photo loading…"}
            {stage === "scanning"     && "Reading label…"}
            {stage === "result"       && scanResult && "Tap Use This to add this medication"}
            {stage === "cam_error"    && "Pick Photo works without camera access"}
          </p>

        </div>
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
  onConfirm?: () => void; // called when user presses Enter to confirm a typed name
}

function MedSearchInput({ value, onChange, onSelect, onOpenCamera, onConfirm }: MedSearchProps) {
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
          onKeyDown={e => {
            if (e.key === "Enter" && value.trim()) {
              setOpen(false);
              onConfirm?.();
            }
          }}
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

      {/* Confirm typed name — appears when user has typed something but not selected from dropdown */}
      {value.trim().length >= 2 && !open && onConfirm && (
        <motion.button
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={onConfirm}
          className="w-full h-12 rounded-2xl bg-secondary border border-border text-foreground text-sm font-semibold flex items-center justify-center gap-2"
          data-testid="confirm-name-btn"
          type="button"
        >
          <CheckIcon size={15} />
          Use "{value.trim()}" as medication name
        </motion.button>
      )}
    </div>
  );
}

// ─── MedForm — redesigned for all ages ────────────────────────────────────────
// Clean, visual, works for 8-year-olds and 80-year-olds.
// Big tap targets. Icons next to text. No hidden steps.

// Form icons with label — maps form name to existing SVG components
function FormIcon({ name, size = 26 }: { name: string; size?: number }) {
  switch (name) {
    case "Tablet":   return <PillTabletIcon size={size} />;
    case "Capsule":  return <PillCapsuleIcon size={size} />;
    case "Liquid":   return <PillLiquidIcon size={size} />;
    case "Inhaler":  return <PillInhalerIcon size={size} />;
    case "Patch":    return <PillPatchIcon size={size} />;
    case "Drops":    return <PillDropsIcon size={size} />;
    case "Injection": return <PillInjectionIcon size={size} />;
    case "Softgel":
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
          <ellipse cx="14" cy="14" rx="7" ry="10" />
        </svg>
      );
    case "Cream":
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
          <path d="M6 20 Q14 10 22 20" />
          <rect x="6" y="20" width="16" height="4" rx="2" />
          <path d="M14 20 v-8" />
        </svg>
      );
    case "Gummy":
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
          <path d="M9 22 C9 22 7 16 7 12 a7 7 0 0 1 14 0 c0 4 -2 10 -2 10 H9z" />
          <line x1="9" y1="18" x2="19" y2="18" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
          <circle cx="14" cy="14" r="8" />
          <line x1="14" y1="10" x2="14" y2="14" />
          <circle cx="14" cy="18" r="1" fill="currentColor" />
        </svg>
      );
  }
}

// Frequency icons
function FreqIcon({ label }: { label: string }) {
  if (label === "Once daily") return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M11 7v4l2.5 2.5" />
    </svg>
  );
  if (label === "Twice daily") return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <circle cx="7" cy="11" r="5" />
      <circle cx="15" cy="11" r="5" />
    </svg>
  );
  if (label === "3× daily") return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <circle cx="4" cy="11" r="3" />
      <circle cx="11" cy="11" r="3" />
      <circle cx="18" cy="11" r="3" />
    </svg>
  );
  // As needed
  if (label === "As needed") return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <path d="M11 4v4M11 14v4M4 11h4M14 11h4" />
      <circle cx="11" cy="11" r="2.5" />
    </svg>
  );
  // Specific days (calendar icon)
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
      <rect x="3" y="4" width="16" height="15" rx="2" />
      <line x1="3" y1="9" x2="19" y2="9" />
      <line x1="7" y1="2" x2="7" y2="6" />
      <line x1="15" y1="2" x2="15" y2="6" />
      <circle cx="7" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="11" cy="14" r="1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function MedForm({ med, onClose }: { med?: Medication; onClose: () => void }) {
  const isEdit = !!med;
  const [showCamera, setShowCamera] = useState(false);
  const [showDetails, setShowDetails] = useState(isEdit);
  // nameConfirmed: true once user picks from dropdown, camera, or presses Enter
  // prevents the full form from opening on every keystroke
  const [nameConfirmed, setNameConfirmed] = useState(isEdit);

  // Fields
  const [name, setName]               = useState(med?.name || "");
  const [doseStrength, setDoseStrength] = useState(med?.dose_strength || "");
  const [doseUnit, setDoseUnit]       = useState(med?.dose_unit || "mg");
  const [form, setForm]               = useState(med?.form || "Tablet");
  const [frequency, setFrequency]     = useState(med?.frequency || "Once daily");
  const [times, setTimes]             = useState<string[]>(
    med ? JSON.parse(med.schedule_times) : ["08:00"]
  );
  // For "Specific days" frequency — which days of the week
  const [scheduleDays, setScheduleDays] = useState<string[]>(
    med?.schedule_days ? JSON.parse(med.schedule_days) : []
  );
  const [purpose, setPurpose]         = useState(med?.purpose || "");
  const [doctor, setDoctor]           = useState(med?.doctor || "");
  const [pharmacy, setPharmacy]       = useState(med?.pharmacy || "");
  const [pillCount, setPillCount]     = useState<string>(med?.pill_count?.toString() || "");
  const [interactionWarning, setInteractionWarning] = useState<{ severity: string; message: string } | null>(null);

  const canSave = name.trim().length > 0;

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
        schedule_days: scheduleDays.length > 0 ? JSON.stringify(scheduleDays) : null,
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
          setInteractionWarning(interactionData.interactions[0]);
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

  const handleFrequencySelect = (opt: typeof FREQUENCY_OPTIONS[0]) => {
    setFrequency(opt.label);
    if (opt.times === 0) {
      setTimes([]);
    } else {
      const defaults = ["08:00", "12:00", "18:00", "21:00", "06:00", "10:00", "14:00", "22:00"];
      const current = times.slice(0, opt.times);
      const needed = opt.times - current.length;
      setTimes([...current, ...defaults.slice(current.length, current.length + needed)]);
    }
  };

  const handleSelectFromDB = (entry: MedEntry) => {
    setName(entry.name);
    setDoseStrength(entry.strength);
    setDoseUnit(entry.unit);
    setForm(entry.form);
    setNameConfirmed(true);
  };

  const handleCameraResult = (result: Partial<{ name: string; strength: string; unit: string; form: string }>) => {
    if (result.name) setName(result.name);
    if (result.strength) setDoseStrength(result.strength);
    if (result.unit) setDoseUnit(result.unit);
    if (result.form) setForm(result.form);
    setShowCamera(false);
    setNameConfirmed(true);
  };

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
      className="space-y-5 pb-10"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onClose}
          className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0"
          data-testid="close-med-form"
        >
          <XIcon size={18} />
        </motion.button>
        <h2 className="text-lg font-bold tracking-tight">
          {isEdit ? "Edit Medication" : "Add Medication"}
        </h2>
      </div>

      {/* ── Scan Label — big, prominent, first thing seen ── */}
      {!isEdit && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowCamera(true)}
          className="w-full h-[72px] bg-primary text-primary-foreground rounded-2xl font-bold text-base flex items-center gap-4 px-5 shadow-md"
          data-testid="scan-label-card"
        >
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <CameraIcon size={22} />
          </div>
          <div className="text-left flex-1">
            <p className="font-bold text-base leading-tight">Scan Label</p>
            <p className="text-xs text-primary-foreground/70 font-normal mt-0.5">Take a photo of any bottle or label</p>
          </div>
          <ChevronRightIcon size={16} />
        </motion.button>
      )}

      {/* Divider */}
      {!isEdit && (
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest">or type name</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      )}

      {/* ── Name field ── */}
      {/* Search input stays visible until a name is confirmed */}
      {!nameConfirmed ? (
        <MedSearchInput
          value={name}
          onChange={v => { setName(v); setNameConfirmed(false); }}
          onSelect={handleSelectFromDB}
          onOpenCamera={() => setShowCamera(true)}
          onConfirm={() => { if (name.trim()) setNameConfirmed(true); }}
        />
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-3 bg-primary/10 border border-primary/20 rounded-2xl px-4 py-3.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0 text-primary">
              <CheckIcon size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{name}</p>
              {doseStrength && (
                <p className="text-xs text-muted-foreground">{doseStrength} {doseUnit} · {form}</p>
              )}
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => { setName(""); setDoseStrength(""); setNameConfirmed(false); }}
            className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground flex-shrink-0"
            data-testid="clear-name-btn"
          >
            <XIcon size={16} />
          </motion.button>
        </div>
      )}

      {/* Interaction warning */}
      <AnimatePresence>
        {interactionWarning && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="rounded-2xl p-4 flex items-start gap-3 bg-[hsl(var(--nurilo-alert-amber))]/10 border border-[hsl(var(--nurilo-alert-amber))]/20"
          >
            <WarnIcon size={18} className="text-[hsl(var(--nurilo-alert-amber))] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-bold">Interaction Notice</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{interactionWarning.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── All fields — visible once name is confirmed ── */}
      <AnimatePresence>
        {nameConfirmed && name.trim() && (
          <motion.div
            key="fields"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* ── DOSE ────────────────────────────────────── */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Dose per tablet / serving
              </label>
              {/* Amount input + unit — full width, units beneath */}
              <input
                type="text"
                inputMode="decimal"
                value={doseStrength}
                onChange={e => setDoseStrength(e.target.value)}
                placeholder="Amount (e.g. 200, 500, 10)"
                className={inputClass}
                data-testid="med-dose-input"
              />
              {/* Unit selector — even grid, large tap targets */}
              <div className="grid grid-cols-4 gap-2">
                {UNITS.map(u => (
                  <motion.button
                    key={u}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setDoseUnit(u)}
                    className={`h-14 rounded-xl text-sm font-bold transition-colors ${
                      doseUnit === u
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-card border border-border text-muted-foreground"
                    }`}
                    data-testid={`unit-${u}`}
                  >
                    {u}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── FORM (type) ──────────────────────────────── */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Type
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {["Tablet", "Capsule", "Liquid", "Softgel", "Patch", "Other"].map(f => (
                  <motion.button
                    key={f}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => setForm(f)}
                    className={`h-16 rounded-2xl transition-colors border flex items-center justify-center gap-2.5 px-3 ${
                      form === f
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border text-muted-foreground"
                    }`}
                    data-testid={`form-${f}`}
                  >
                    <FormIcon name={f} size={24} />
                    <span className="text-sm font-bold">{f}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ── FREQUENCY ──────────────────────────────────── */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Frequency
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {FREQUENCY_OPTIONS.filter(o => o.label !== "Specific days").map(opt => (
                  <motion.button
                    key={opt.label}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleFrequencySelect(opt)}
                    className={`h-20 rounded-2xl transition-colors border flex items-center gap-3 px-4 ${
                      frequency === opt.label
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card border-border text-foreground"
                    }`}
                    data-testid={`freq-${opt.label.replace(/\s+/g, "-")}`}
                  >
                    <div className={`flex-shrink-0 ${frequency === opt.label ? "text-primary-foreground" : "text-primary"}`}>
                      <FreqIcon label={opt.label} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold leading-tight">{opt.label}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
              {/* Specific days — full width outlined button */}
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => handleFrequencySelect({ label: "Specific days", times: 1, emoji: "Cal" })}
                className={`w-full h-12 rounded-2xl transition-colors border flex items-center justify-center gap-2.5 ${
                  frequency === "Specific days"
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border text-foreground"
                }`}
                data-testid="freq-Specific-days"
              >
                <FreqIcon label="Specific days" />
                <span className="text-sm font-bold">Specific days</span>
              </motion.button>
            </div>


            {/* ── SPECIFIC DAYS PICKER ────────────────────────── */}
            {frequency === "Specific days" && (
              <div className="space-y-3">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                  Which days?
                </label>
                <div className="grid grid-cols-7 gap-1.5">
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day => {
                    const selected = scheduleDays.includes(day);
                    return (
                      <motion.button
                        key={day}
                        whileTap={{ scale: 0.92 }}
                        onClick={() => setScheduleDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])}
                        className={`h-12 rounded-xl text-xs font-bold transition-colors flex flex-col items-center justify-center ${selected ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}
                        data-testid={`day-${day}`}
                      >
                        <span>{day.slice(0,1)}</span>
                        <span className="text-[9px] opacity-60">{day.slice(1,3)}</span>
                      </motion.button>
                    );
                  })}
                </div>
                {scheduleDays.length === 0 && (
                  <p className="text-xs text-muted-foreground">Tap the days you take this medication</p>
                )}
              </div>
            )}

            {/* ── TIMES ─────────────────────────────────────── */}
            {times.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <ClockIcon size={12} /> When to take it
                  </label>
                  {times.length < 8 && (
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => {
                        const defaults = ["08:00","12:00","18:00","21:00","06:00","10:00","14:00","22:00"];
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
                      onRemove={times.length > 1 ? () => {
                        setTimes(times.filter((_, idx) => idx !== i));
                      } : undefined}
                    />
                  ))}
                </div>
              </div>
            )}

            {times.length === 0 && (
              <div className="bg-secondary/40 rounded-2xl p-4 text-center">
                <p className="text-sm text-muted-foreground">Take as needed — no set times</p>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => { setTimes(["08:00"]); }}
                  className="mt-2 text-xs text-primary font-bold"
                  data-testid="add-first-time-btn"
                >
                  + Set a time
                </motion.button>
              </div>
            )}

            {/* ── OPTIONAL DETAILS ──────────────────────────── */}
            <div className="border border-border rounded-2xl overflow-hidden">
              <motion.button
                whileTap={{ scale: 0.99 }}
                onClick={() => setShowDetails(v => !v)}
                className="w-full flex items-center justify-between px-4 py-4"
                data-testid="toggle-details-btn"
              >
                <span className="text-sm font-semibold text-foreground">More details</span>
                <span className="text-xs text-muted-foreground">{showDetails ? "Hide −" : "Optional +"}</span>
              </motion.button>
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                      {/* Less common form types */}
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Other form types</label>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {["Cream", "Inhaler", "Gummy", "Injection", "Drops"].map(f => (
                            <motion.button
                              key={f}
                              whileTap={{ scale: 0.92 }}
                              onClick={() => setForm(f)}
                              className={`h-9 px-4 rounded-xl text-sm font-semibold transition-colors ${
                                form === f
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-card border border-border text-muted-foreground"
                              }`}
                              data-testid={`form-${f}`}
                            >
                              {f}
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                          What it's for
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
                          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Doctor</label>
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
                          <label className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Pharmacy</label>
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
                          Pills remaining
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
                            Running low — time to refill
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Save button ─────────────────────────────────── */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => saveMed.mutate()}
        disabled={!canSave || saveMed.isPending}
        className="w-full h-[60px] bg-primary text-primary-foreground rounded-2xl font-bold text-base disabled:opacity-40 transition-opacity shadow-md"
        data-testid="save-medication-btn"
      >
        {saveMed.isPending ? "Saving…" : isEdit ? "Save Changes" : "Save Medication"}
      </motion.button>
    </motion.div>
  );
}

// ─── MedCard ─────────────────────────────────────────────────────────────────

function MedCard({ med, onEdit, onDetail }: { med: Medication; onEdit: () => void; onDetail: () => void }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const refillBadge = getRefillBadge(med.pill_count);

  const deleteMed = useMutation({
    mutationFn: async () => { await api.deleteMedication(med.id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["medications"] }); },
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

      {/* Top row: icon + med info (full width) */}
      <div className="pl-5 pr-4 py-4 cursor-pointer" onClick={onDetail}>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CapsuleIcon size={20} />
          </div>
          <div className="flex-1 min-w-0">
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
        </div>
      </div>

      {/* Bottom row: Edit | Remove */}
      <div className="h-px bg-border" />
      <div className="flex">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={onEdit}
          className="bg-transparent text-foreground border-r border-border h-10 flex-1 text-sm font-semibold flex items-center justify-center gap-1.5"
          data-testid={`edit-med-${med.id}`}
        >
          <EditIcon size={12} /> Edit
        </motion.button>
        <div className="w-px bg-border" />
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setShowDeleteConfirm(true)}
          className="bg-transparent text-destructive h-10 flex-1 text-sm font-semibold flex items-center justify-center gap-1.5"
          data-testid={`delete-med-${med.id}`}
        >
          <TrashIcon size={12} /> Remove
        </motion.button>
      </div>

      {/* Delete confirmation bottom sheet */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl p-6 pb-8 space-y-4"
            >
              <div className="w-10 h-1 bg-border rounded-full mx-auto" />
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <TrashIcon size={20} />
                </div>
                <div>
                  <p className="font-bold text-base">Remove {med.name}?</p>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    This will remove the medication and all its dose history. This cannot be undone.
                  </p>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { deleteMed.mutate(); setShowDeleteConfirm(false); }}
                disabled={deleteMed.isPending}
                className="w-full h-14 rounded-2xl bg-destructive text-white font-bold text-base"
                data-testid={`confirm-delete-${med.id}`}
              >
                {deleteMed.isPending ? "Removing…" : "Yes, Remove"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full h-12 rounded-2xl bg-secondary text-foreground font-semibold text-sm"
              >
                Keep It
              </motion.button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── MedDetail ───────────────────────────────────────────────────────────────

// ── Med info database — curated, human-readable entries ──────────────────────
const MED_INFO: Record<string, { uses: string; sideEffects: string; tips: string; storage: string }> = {
  "ibuprofen": { uses: "Pain relief, fever reduction, and inflammation. Commonly used for headaches, muscle aches, arthritis, menstrual cramps, and minor injuries.", sideEffects: "Stomach upset, nausea, heartburn. Less commonly: dizziness, rash. Rarely: stomach bleeding with long-term use.", tips: "Always take with food or milk to protect your stomach. Don't use for more than 10 days for pain without a doctor's guidance.", storage: "Store at room temperature, away from heat and moisture." },
  "acetaminophen": { uses: "Pain relief and fever reduction. Gentler on the stomach than NSAIDs. Good for headaches, mild to moderate pain.", sideEffects: "Generally well tolerated at recommended doses. High doses can harm the liver — especially with alcohol.", tips: "Do not exceed 4,000mg per day. Check other medications for hidden acetaminophen (Tylenol is in many cold/flu products).", storage: "Store below 77°F, keep away from moisture." },
  "lisinopril": { uses: "Treats high blood pressure and heart failure. Also protects kidneys in people with diabetes.", sideEffects: "Dry cough (very common), dizziness when standing up, mild headache. Rarely: swelling of lips or tongue (seek care immediately).", tips: "Take at the same time each day. Don't skip doses — blood pressure can spike. Avoid potassium supplements unless directed.", storage: "Store at room temperature, protect from moisture." },
  "metformin": { uses: "Controls blood sugar in type 2 diabetes. Often a first-line treatment.", sideEffects: "Nausea, stomach upset, diarrhea (common early on — usually improves). Metallic taste. Very rarely: lactic acidosis.", tips: "Take with meals to reduce stomach upset. Avoid heavy alcohol use. Stay hydrated.", storage: "Store at room temperature, away from heat." },
  "atorvastatin": { uses: "Lowers LDL ('bad') cholesterol and triglycerides to reduce heart disease risk.", sideEffects: "Muscle soreness or weakness (tell your doctor). Headache, digestive upset. Rarely: liver problems.", tips: "Avoid grapefruit juice — it increases drug levels. Can be taken any time of day consistently.", storage: "Store at room temperature, away from moisture." },
  "levothyroxine": { uses: "Replaces or supplements thyroid hormone in people with hypothyroidism.", sideEffects: "At correct dose: minimal. Too much: heart palpitations, weight loss, tremor, anxiety.", tips: "Take on an empty stomach, 30-60 min before breakfast for best absorption. Take calcium, iron, or antacids at least 4 hours apart.", storage: "Store at room temperature, away from heat and light." },
  "warfarin": { uses: "Blood thinner that prevents and treats blood clots, deep vein thrombosis, and reduces stroke risk.", sideEffects: "Bruising, prolonged bleeding from cuts. Signs of serious bleeding: unusual bruising, blood in urine/stool, persistent bleeding.", tips: "Keep vitamin K intake (leafy greens) consistent — don't suddenly eat much more or less. Get regular INR checks.", storage: "Store at room temperature, away from light." },
  "omeprazole": { uses: "Reduces stomach acid. Used for heartburn, GERD, ulcers, and protecting the stomach from NSAID use.", sideEffects: "Headache, stomach pain, diarrhea. Long-term use may lower magnesium and B12 levels.", tips: "Take 30-60 minutes before a meal for best effect. Don't take for more than 14 days without medical advice.", storage: "Store at room temperature, keep dry." },
  "amlodipine": { uses: "Treats high blood pressure and chest pain (angina). Relaxes blood vessels.", sideEffects: "Swollen ankles or feet, flushing, headache, dizziness. Usually mild.", tips: "Take at the same time each day. Don't stop suddenly. Grapefruit may interact — ask your pharmacist.", storage: "Store at room temperature." },
  "vitamin d": { uses: "Supports bone health, immune function, and mood. Many people are deficient, especially in winter or with limited sun exposure.", sideEffects: "Extremely rare at normal doses. High doses can cause nausea, weakness, or high calcium levels.", tips: "Take with a meal containing fat for best absorption. D3 is absorbed better than D2.", storage: "Store at room temperature, away from light." },
  "vitamin d3": { uses: "Supports bone health, immune function, and mood. Many people are deficient, especially in winter or with limited sun exposure.", sideEffects: "Extremely rare at normal doses. High doses can cause nausea, weakness, or high calcium levels.", tips: "Take with a meal containing fat for best absorption. D3 is absorbed better than D2.", storage: "Store at room temperature, away from light." },
  "melatonin": { uses: "Helps with sleep onset, jet lag, and circadian rhythm issues. A natural hormone produced by the body.", sideEffects: "Drowsiness, headache, dizziness (usually mild). Can make you groggy if taken too late.", tips: "Start with the lowest effective dose (0.5-1mg). Take 30-60 min before your target bedtime.", storage: "Store at room temperature, away from light." },
  "aspirin": { uses: "Pain relief, fever, inflammation, and low-dose aspirin reduces heart attack and stroke risk in at-risk patients.", sideEffects: "Stomach irritation, heartburn, nausea. Increases bleeding risk. Avoid in children with viral illness.", tips: "Take with food or a full glass of water. Low-dose (81mg) daily aspirin is different from pain-relief dosing — your doctor should guide this.", storage: "Store at room temperature, away from moisture." },
  "sertraline": { uses: "An antidepressant (SSRI) used for depression, anxiety, OCD, PTSD, and panic disorder.", sideEffects: "Nausea, headache, sleep changes, dry mouth (usually improve in 1-2 weeks). Sexual side effects possible.", tips: "Take consistently — effects build over 4-6 weeks. Don't stop abruptly. Take at the same time daily.", storage: "Store at room temperature, away from moisture." },
  "losartan": { uses: "Treats high blood pressure and protects kidneys. An ARB (similar benefit to ACE inhibitors without the cough).", sideEffects: "Dizziness, back pain, stuffy nose. Rarely: high potassium levels.", tips: "Can be taken with or without food. Stay well hydrated. Avoid potassium supplements without guidance.", storage: "Store at room temperature." },
};

function getMedInfo(name: string) {
  const lower = name.toLowerCase().trim();
  // Try exact match first, then partial
  if (MED_INFO[lower]) return MED_INFO[lower];
  for (const key of Object.keys(MED_INFO)) {
    if (lower.includes(key) || key.includes(lower)) return MED_INFO[key];
  }
  return null;
}

function MedDetail({ med, onClose }: { med: Medication; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "info">("overview");
  const [showInteractions, setShowInteractions] = useState(false);
  const times: string[] = JSON.parse(med.schedule_times);

  const { data: doseHistory = [] } = useQuery<DoseLog[]>({
    queryKey: ["doses", "medication", med.id],
    queryFn: () => api.getDoseLogsForMed(med.id),
  });

  // Load all meds for interaction checking (used in Interactions tab)
  const { data: allMeds = [] } = useQuery<Medication[]>({
    queryKey: ["medications"],
    queryFn: () => api.getMedications(),
  });
  const otherActiveMeds = allMeds.filter(m => m.status === "active" && m.id !== med.id);

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

      {activeTab === "overview" && (() => {
        // Interactions logic (inline in Overview)
        type Severity = "danger" | "caution" | "safe";
        interface InteractionRule {
          drug1: string[];
          drug2: string[];
          severity: Severity;
          reason: string;
        }
        const INTERACTION_RULES: InteractionRule[] = [
          { drug1: ["warfarin"], drug2: ["ibuprofen","aspirin","naproxen"], severity: "danger", reason: "NSAIDs significantly increase bleeding risk with blood thinners like Warfarin." },
          { drug1: ["warfarin"], drug2: ["sertraline","fluoxetine","paroxetine"], severity: "danger", reason: "SSRIs increase the anticoagulant effect of Warfarin, significantly raising bleeding risk." },
          { drug1: ["lisinopril","losartan"], drug2: ["ibuprofen","naproxen"], severity: "caution", reason: "NSAIDs can reduce the blood pressure-lowering effect of this medication and may affect kidney function." },
          { drug1: ["metformin"], drug2: ["alcohol"], severity: "caution", reason: "Heavy alcohol use with Metformin increases the rare but serious risk of lactic acidosis." },
          { drug1: ["atorvastatin","simvastatin","rosuvastatin"], drug2: ["grapefruit"], severity: "caution", reason: "Grapefruit juice increases statin blood levels, which may increase the risk of muscle pain or liver issues." },
          { drug1: ["levothyroxine"], drug2: ["calcium","iron","antacid"], severity: "caution", reason: "Calcium, iron, and antacids interfere with levothyroxine absorption. Take them at least 4 hours apart." },
          { drug1: ["sertraline","fluoxetine"], drug2: ["tramadol"], severity: "danger", reason: "This combination can cause serotonin syndrome — a potentially serious condition." },
          { drug1: ["amlodipine","lisinopril","metoprolol"], drug2: ["lisinopril","amlodipine","metoprolol","losartan"], severity: "safe", reason: "This combination is commonly used together to manage blood pressure and is generally safe when monitored." },
        ];

        const found: { other: Medication; severity: Severity; reason: string }[] = [];
        const seen = new Set<string>();
        for (const other of otherActiveMeds) {
          const thisLower = med.name.toLowerCase();
          const otherLower = other.name.toLowerCase();
          const key = [med.id, other.id].sort().join("-");
          if (seen.has(key)) continue;
          seen.add(key);
          for (const rule of INTERACTION_RULES) {
            const thisMatches = rule.drug1.some(d => thisLower.includes(d) || d.includes(thisLower.split(" ")[0]));
            const otherMatches = rule.drug2.some(d => otherLower.includes(d) || d.includes(otherLower.split(" ")[0]));
            const reversedThis = rule.drug2.some(d => thisLower.includes(d) || d.includes(thisLower.split(" ")[0]));
            const reversedOther = rule.drug1.some(d => otherLower.includes(d) || d.includes(otherLower.split(" ")[0]));
            if ((thisMatches && otherMatches) || (reversedThis && reversedOther)) {
              found.push({ other, severity: rule.severity, reason: rule.reason });
              break;
            }
          }
        }

        const dangerCount = found.filter(f => f.severity === "danger").length;
        const cautionCount = found.filter(f => f.severity === "caution").length;

        return (
          <div className="space-y-3">
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

            {/* Interactions card */}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setShowInteractions(v => !v)}
              className={`w-full rounded-2xl border p-4 flex items-center gap-3 text-left ${
                dangerCount > 0
                  ? "bg-destructive/10 border-destructive/20"
                  : cautionCount > 0
                  ? "bg-[hsl(var(--nurilo-alert-amber))]/10 border-[hsl(var(--nurilo-alert-amber))]/20"
                  : "bg-[hsl(var(--nurilo-success))]/10 border-[hsl(var(--nurilo-success))]/20"
              }`}
              data-testid="interactions-card"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                dangerCount > 0 ? "bg-destructive/20 text-destructive"
                : cautionCount > 0 ? "bg-[hsl(var(--nurilo-alert-amber))]/20 text-[hsl(var(--nurilo-alert-amber))]"
                : "bg-[hsl(var(--nurilo-success))]/20 text-[hsl(var(--nurilo-success))]"
              }`}>
                {found.length === 0 ? <CheckIcon size={16} /> : <WarnIcon size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold">
                  {found.length === 0 ? "No interactions found" : `${found.length} interaction${found.length > 1 ? "s" : ""} flagged`}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {found.length === 0 ? `Checked against ${otherActiveMeds.length} medication${otherActiveMeds.length !== 1 ? "s" : ""}` : "Tap to see details"}
                </p>
              </div>
              <ChevronRightIcon size={14} />
            </motion.button>

            {/* Expanded interactions list */}
            <AnimatePresence>
              {showInteractions && found.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2"
                >
                  {found.map(({ other, severity, reason }) => (
                    <div
                      key={other.id}
                      className={`rounded-2xl border p-4 space-y-1.5 ${
                        severity === "danger"
                          ? "bg-destructive/10 border-destructive/20"
                          : severity === "caution"
                          ? "bg-[hsl(var(--nurilo-alert-amber))]/10 border-[hsl(var(--nurilo-alert-amber))]/20"
                          : "bg-[hsl(var(--nurilo-success))]/10 border-[hsl(var(--nurilo-success))]/20"
                      }`}
                    >
                      <p className="text-sm font-bold">{med.name} + {other.name}</p>
                      <p className="text-xs leading-relaxed text-muted-foreground">{reason}</p>
                    </div>
                  ))}
                  <div className="bg-secondary rounded-2xl px-4 py-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This is not medical advice. Always consult your doctor or pharmacist.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })()}

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

      {activeTab === "info" && (() => {
        const info = getMedInfo(med.name);
        return (
          <div className="space-y-3">
            {info ? (
              <>
                {([
                  { label: "What it's used for", text: info.uses },
                  { label: "Common side effects", text: info.sideEffects },
                  { label: "Tips for taking it", text: info.tips },
                  { label: "Storage", text: info.storage },
                ] as const).map(({ label, text }) => (
                  <div key={label} className="bg-card rounded-2xl border border-border p-4 space-y-1.5">
                    <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                      {label}
                    </p>
                    <p className="text-sm leading-relaxed text-foreground">{text}</p>
                  </div>
                ))}
              </>
            ) : (
              <div className="bg-card rounded-2xl border border-border p-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We don't have detailed information about {med.name} yet. Ask your pharmacist for a full medication guide.
                </p>
              </div>
            )}
            {/* Disclaimer */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl px-4 py-3">
              <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed font-medium">
                This is general information only. It is not medical advice. Always consult your doctor or pharmacist before making any changes to your medications.
              </p>
            </div>
          </div>
        );
      })()}

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
