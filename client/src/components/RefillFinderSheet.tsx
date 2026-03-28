// RefillFinderSheet — shared component used from Home and Meds pages.
// Finds real pharmacies near the user via our own Supabase Edge Function
// (which queries OpenStreetMap Overpass API — free, no third-party redirects).

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Medication } from "@shared/schema";

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

const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  "https://qpmjghocajyvugjxnkdn.supabase.co";
const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwbWpnaG9jYWp5dnVnanhua2RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1ODM4MDQsImV4cCI6MjA5MDE1OTgwNH0.fzHBvHic5W6BZVUfD-dXEj0x6MaBeM6GyGEUsu8vQt0";

function brandColor(brand: string): string {
  const b = (brand || "").toLowerCase();
  if (b.includes("cvs")) return "bg-[#cc0000]/10 text-[#cc0000]";
  if (b.includes("walgreens") || b.includes("duane")) return "bg-[#E31837]/10 text-[#E31837]";
  if (b.includes("rite aid")) return "bg-[#1a237e]/10 text-[#1a237e]";
  if (b.includes("walmart")) return "bg-[#0071CE]/10 text-[#0071CE]";
  if (b.includes("costco")) return "bg-[#005DAA]/10 text-[#005DAA]";
  return "bg-primary/10 text-primary";
}

export function RefillFinderSheet({
  med,
  onClose,
}: {
  med: Medication;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<
    "locating" | "searching" | "results" | "error" | "no_location"
  >("locating");
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setPhase("no_location");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setPhase("searching");

        try {
          const res = await fetch(
            `${SUPABASE_URL}/functions/v1/find-pharmacies`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                apikey: SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({
                lat,
                lon,
                medication: med.name,
                radiusMiles: 5,
              }),
              signal: AbortSignal.timeout(20_000),
            }
          );

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
          setErrorMsg(
            err?.name === "AbortError"
              ? "Search timed out. Check your connection and try again."
              : "Couldn't load pharmacies. Try again."
          );
          setPhase("error");
        }
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setPhase("no_location");
        } else {
          setErrorMsg(
            "Couldn't get your location. Make sure location is enabled."
          );
          setPhase("error");
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

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
                Looking for{" "}
                <span className="font-semibold text-foreground">{med.name}</span>
                {med.pill_count !== null && ` · ${med.pill_count} left`}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
              >
                <line x1="4" y1="4" x2="12" y2="12" />
                <line x1="12" y1="4" x2="4" y2="12" />
              </svg>
            </motion.button>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(88vh - 110px)" }}
        >
          {/* Locating / Searching */}
          {(phase === "locating" || phase === "searching") && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full border-2 border-border border-t-primary"
              />
              <div className="text-center">
                <p className="font-semibold text-sm">
                  {phase === "locating"
                    ? "Getting your location…"
                    : "Searching nearby pharmacies…"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {phase === "locating"
                    ? "Allow location access when prompted"
                    : "Scanning within 5 miles"}
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="flex flex-col items-center justify-center py-16 px-8 gap-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  className="text-destructive"
                >
                  <path d="M12 2L22 20H2L12 2z" />
                  <line x1="12" y1="10" x2="12" y2="14" />
                  <circle cx="12" cy="18" r="0.5" fill="currentColor" stroke="none" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {errorMsg}
              </p>
              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  setPhase("locating");
                  setPharmacies([]);
                }}
                className="h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-semibold"
              >
                Try Again
              </motion.button>
            </div>
          )}

          {/* No location */}
          {phase === "no_location" && (
            <div className="flex flex-col items-center justify-center py-16 px-8 gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  strokeLinecap="round"
                  className="text-muted-foreground"
                >
                  <circle cx="12" cy="10" r="4" />
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                </svg>
              </div>
              <p className="font-semibold">Location access needed</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Enable location access in your browser settings to find
                pharmacies near you.
              </p>
            </div>
          )}

          {/* Results */}
          {phase === "results" && (
            <div className="px-4 pt-3 pb-4">
              {pharmacies.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">
                    No pharmacies found within 5 miles.
                  </p>
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
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-black ${brandColor(p.brand || p.name)}`}
                          >
                            {(p.brand || p.name).slice(0, 2).toUpperCase()}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-sm leading-snug">
                                {p.name}
                              </p>
                              {p.isOpen === true && (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 flex-shrink-0">
                                  Open
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-primary font-semibold mt-0.5">
                              {p.distanceMiles < 0.1
                                ? "Very close"
                                : `${p.distanceMiles} miles away`}
                            </p>
                            {p.address &&
                              p.address !== "Address unavailable" && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {p.address}
                                  {p.city ? `, ${p.city}` : ""}
                                </p>
                              )}
                            {p.hoursFormatted && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {p.hoursFormatted}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-3">
                          <motion.a
                            href={p.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileTap={{ scale: 0.96 }}
                            className="flex-1 h-9 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5"
                          >
                            <svg
                              width="13"
                              height="13"
                              viewBox="0 0 13 13"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.8}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polygon points="6.5,1 12,10 1,10" />
                            </svg>
                            Directions
                          </motion.a>

                          {p.phone && (
                            <motion.a
                              href={`tel:${p.phone.replace(/\D/g, "")}`}
                              whileTap={{ scale: 0.96 }}
                              className="flex-1 h-9 rounded-xl bg-secondary border border-border text-foreground text-xs font-semibold flex items-center justify-center gap-1.5"
                            >
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 13 13"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={1.8}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
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
