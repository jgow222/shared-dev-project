import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import * as api from "@/lib/api";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FamilyMember, FamilyMedication } from "@shared/schema";

// ─── Custom SVG Icons (no Lucide) ─────────────────────────────────────────────

function PlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <line x1="8" y1="3" x2="8" y2="13" />
      <line x1="3" y1="8" x2="13" y2="8" />
    </svg>
  );
}

function CirclesIcon({ size = 40 }: { size?: number }) {
  // Three overlapping circles — the FamilyIcon from App.tsx
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className="text-muted-foreground">
      <circle cx="14" cy="20" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="26" cy="20" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="20" cy="13" r="9" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function BellIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 2C5 2 3.5 3.5 3.5 5.5V9L2 10.5H12L10.5 9V5.5C10.5 3.5 9 2 7 2Z" />
      <path d="M5.5 10.5C5.5 11.3 6.2 12 7 12C7.8 12 8.5 11.3 8.5 10.5" />
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

function ChevronRightIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4L10 8L6 12" />
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

function DotsVertIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
      <circle cx="8" cy="3.5" r="1.25" />
      <circle cx="8" cy="8" r="1.25" />
      <circle cx="8" cy="12.5" r="1.25" />
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

function XIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <line x1="4" y1="4" x2="12" y2="12" />
      <line x1="12" y1="4" x2="4" y2="12" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 8.5L6.5 12L13 5" />
    </svg>
  );
}

function SendArrowIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2L2 7L7 9L9 14L14 2Z" />
      <line x1="7" y1="9" x2="14" y2="2" />
    </svg>
  );
}

function HeartLeafIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {/* Heart */}
      <path d="M7 11.5C7 11.5 2 8.5 2 5C2 3.3 3.3 2 5 2C5.8 2 6.5 2.4 7 3C7.5 2.4 8.2 2 9 2C10.7 2 12 3.3 12 5C12 8.5 7 11.5 7 11.5Z" />
    </svg>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────

const RELATIONSHIPS = ["Parent", "Grandparent", "Child", "Partner", "Someone I care for"];
const UI_MODES = [
  { value: "standard", label: "Standard", desc: "For most adults" },
  { value: "elder", label: "Elder Mode", desc: "Larger text, simplified navigation" },
  { value: "child", label: "Child Mode", desc: "Friendly UI, parental confirmation" },
];
const NUDGE_PRESETS = [
  "Just thinking of you — don't forget your medication!",
  "Time for your medicine — you've got this!",
  "A gentle reminder from someone who cares about you.",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStatusBorderColor(status: string) {
  switch (status) {
    case "green": return "border-[hsl(var(--nurilo-success))]";
    case "amber": return "border-[hsl(var(--nurilo-alert-amber))]";
    case "red":   return "border-destructive";
    default:      return "border-muted-foreground/30";
  }
}

function getStatusDotColor(status: string) {
  switch (status) {
    case "green": return "bg-[hsl(var(--nurilo-success))]";
    case "amber": return "bg-[hsl(var(--nurilo-alert-amber))]";
    case "red":   return "bg-destructive";
    default:      return "bg-muted-foreground/30";
  }
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

// ─── FamilyCard ───────────────────────────────────────────────────────────────

function FamilyCard({ member, onClick }: { member: FamilyMember; onClick: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.985 }}
      onClick={onClick}
      className="bg-card rounded-xl border border-border p-4 cursor-pointer relative overflow-hidden"
      data-testid={`family-card-${member.id}`}
    >
      {/* Left accent bar by status */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${getStatusDotColor(member.status)}`} />

      <div className="pl-2 flex items-center gap-3">
        {/* Avatar with status ring */}
        <div className={`relative w-12 h-12 rounded-full border-[2.5px] ${getStatusBorderColor(member.status)} flex items-center justify-center bg-secondary flex-shrink-0`}>
          <span className="text-sm font-bold text-foreground">{getInitials(member.name)}</span>
          {/* Status dot */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${getStatusDotColor(member.status)} border-2 border-card`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm tracking-tight" data-testid={`family-name-${member.id}`}>{member.name}</h3>
          <p className="text-xs text-muted-foreground">{member.relationship}</p>
          {member.ui_mode !== "standard" && (
            <span className="text-[10px] font-semibold bg-secondary text-muted-foreground px-2 py-0.5 rounded-full mt-1 inline-block">
              {member.ui_mode === "elder" ? "Elder Mode" : "Child Mode"}
            </span>
          )}
        </div>

        {/* Alert badge */}
        {member.status === "red" && (
          <div className="flex items-center gap-1 bg-destructive/10 text-destructive px-2.5 py-1 rounded-full">
            <WarnIcon size={11} />
            <span className="text-[10px] font-bold">Overdue</span>
          </div>
        )}
        {member.status === "amber" && (
          <div className="flex items-center gap-1 bg-[hsl(var(--nurilo-alert-amber))]/10 text-[hsl(var(--nurilo-alert-amber))] px-2.5 py-1 rounded-full">
            <BellIcon size={10} />
            <span className="text-[10px] font-bold">Due soon</span>
          </div>
        )}

        <ChevronRightIcon size={16} />
      </div>
    </motion.div>
  );
}

// ─── MemberDetail ─────────────────────────────────────────────────────────────

function MemberDetail({ member, onClose }: { member: FamilyMember; onClose: () => void }) {
  const [showNudge, setShowNudge] = useState(false);
  const [customNudge, setCustomNudge] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  const { data: meds = [] } = useQuery<FamilyMedication[]>({
    queryKey: ["family", member.id, "medications"],
    queryFn: () => api.getFamilyMedications(member.id),
  });

  const sendNudge = useMutation({
    mutationFn: async (message: string) => {
      await api.createNudge({
        family_member_id: member.id,
        message,
        sent_at: new Date().toISOString(),
        response: null,
      });
    },
    onSuccess: () => { setShowNudge(false); setCustomNudge(""); },
  });

  const deleteMember = useMutation({
    mutationFn: async () => { await api.deleteFamilyMember(member.id); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["family"] }); onClose(); },
  });

  const confirmOnBehalf = useMutation({
    mutationFn: async () => { await api.updateFamilyMember(member.id, { status: "green" }); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["family"] }); },
  });

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
          data-testid="back-to-family"
        >
          <ChevronLeftIcon size={20} />
        </motion.button>

        <div className={`w-12 h-12 rounded-full border-[2.5px] ${getStatusBorderColor(member.status)} flex items-center justify-center bg-secondary`}>
          <span className="text-sm font-bold">{getInitials(member.name)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-bold tracking-tight" data-testid="member-detail-name">{member.name}</h2>
          <p className="text-xs text-muted-foreground">{member.relationship}</p>
        </div>

        {/* 3-dot menu */}
        <div className="relative">
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
            data-testid="member-menu"
          >
            <DotsVertIcon size={16} />
          </motion.button>
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.93 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.93 }}
                  transition={{ duration: 0.14 }}
                  className="absolute right-0 top-10 z-50 w-44 bg-card border border-border rounded-xl shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => deleteMember.mutate()}
                    className="w-full px-3.5 py-3 text-left text-sm flex items-center gap-2.5 text-destructive hover:bg-destructive/10 transition-colors"
                    data-testid="delete-member-btn"
                  >
                    <TrashIcon size={14} /> Remove member
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => confirmOnBehalf.mutate()}
          className="flex items-center justify-center gap-2 py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold"
          data-testid="confirm-behalf-btn"
        >
          <CheckIcon size={15} /> Confirm dose
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={() => setShowNudge(true)}
          className="flex items-center justify-center gap-2 py-3.5 border border-primary text-primary rounded-xl text-sm font-semibold"
          data-testid="send-nudge-btn"
        >
          <SendArrowIcon size={15} /> Send nudge
        </motion.button>
      </div>

      {/* Nudge panel */}
      <AnimatePresence>
        {showNudge && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Send a nudge</p>
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => setShowNudge(false)} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                  <XIcon size={14} />
                </motion.button>
              </div>

              {/* Preset messages */}
              <div className="space-y-2">
                {NUDGE_PRESETS.map((msg) => (
                  <motion.button
                    key={msg}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => sendNudge.mutate(msg)}
                    className="w-full text-left px-3.5 py-3 bg-secondary rounded-xl text-xs text-foreground leading-relaxed hover:bg-accent transition-colors"
                    data-testid={`nudge-preset-${msg.slice(0, 10).replace(/\s/g, "-")}`}
                  >
                    {msg}
                  </motion.button>
                ))}
              </div>

              {/* Custom message */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customNudge}
                  onChange={(e) => setCustomNudge(e.target.value.slice(0, 80))}
                  placeholder="Custom message (80 chars max)"
                  className="flex-1 h-11 px-3.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="custom-nudge-input"
                />
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => customNudge.trim() && sendNudge.mutate(customNudge.trim())}
                  disabled={!customNudge.trim()}
                  className="h-11 px-4 bg-primary text-primary-foreground rounded-xl text-xs font-semibold disabled:opacity-30"
                  data-testid="send-custom-nudge"
                >
                  Send
                </motion.button>
              </div>

              {sendNudge.isSuccess && (
                <p className="text-xs text-[hsl(var(--nurilo-success))] font-medium">Nudge sent</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Their medications */}
      <section>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Their Medications ({meds.length})
        </h3>
        {meds.length === 0 ? (
          <p className="text-xs text-muted-foreground">No medications added yet.</p>
        ) : (
          <div className="space-y-2">
            {meds.map(med => (
              <div
                key={med.id}
                className="bg-card rounded-xl border border-border p-3.5 flex items-center gap-3"
                data-testid={`family-med-${med.id}`}
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HeartLeafIcon size={14} />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-tight">{med.name}</p>
                  <p className="text-xs text-muted-foreground">{med.dose_strength} {med.dose_unit} {med.form}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Alert settings */}
      <section className="bg-card rounded-xl border border-border p-4">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Alert Settings</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm">Caregiver alerts</p>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            member.alert_enabled
              ? "bg-[hsl(var(--nurilo-success))]/10 text-[hsl(var(--nurilo-success))]"
              : "bg-muted text-muted-foreground"
          }`}>
            {member.alert_enabled ? "On" : "Off"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          Alert after {member.alert_delay} min of missed dose
        </p>
      </section>
    </motion.div>
  );
}

// ─── AddMemberWizard ──────────────────────────────────────────────────────────

function AddMemberWizard({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [relationship, setRelationship] = useState("");
  const [name, setName] = useState("");
  const [uiMode, setUiMode] = useState("standard");
  const [alertDelay, setAlertDelay] = useState(60);

  const createMember = useMutation({
    mutationFn: async () => {
      await api.createFamilyMember({
        name,
        relationship,
        ui_mode: uiMode,
        alert_enabled: 1,
        alert_delay: alertDelay,
        status: "gray",
      });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["family"] }); onClose(); },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Add Family Member</h2>
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-secondary transition-colors"
          data-testid="close-add-member"
        >
          <XIcon size={16} />
        </motion.button>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-1 rounded-full transition-colors duration-300 ${
            s <= step ? "bg-primary" : "bg-muted"
          }`} />
        ))}
      </div>

      {/* Step 1: Relationship */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-base font-semibold">Who are you adding?</p>
          <div className="space-y-2">
            {RELATIONSHIPS.map(rel => (
              <motion.button
                key={rel}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setRelationship(rel); setStep(2); }}
                className={`w-full px-4 py-3.5 text-left rounded-xl border text-sm font-medium transition-colors ${
                  relationship === rel
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card hover:bg-secondary text-foreground"
                }`}
                data-testid={`rel-${rel.replace(/\s/g, "-")}`}
              >
                {rel}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Name */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-base font-semibold">What's their name?</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter their name"
            className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            data-testid="member-name-input"
            autoFocus
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => name.trim() && setStep(3)}
            disabled={!name.trim()}
            className="w-full h-[52px] bg-primary text-primary-foreground rounded-xl font-semibold text-sm disabled:opacity-40"
            data-testid="next-step-btn"
          >
            Next
          </motion.button>
        </div>
      )}

      {/* Step 3: UI mode + alert delay */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <p className="text-base font-semibold mb-3">Choose interface mode</p>
            <div className="space-y-2">
              {UI_MODES.map(mode => (
                <motion.button
                  key={mode.value}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setUiMode(mode.value)}
                  className={`w-full px-4 py-3.5 text-left rounded-xl border transition-colors ${
                    uiMode === mode.value
                      ? "border-primary bg-primary/10"
                      : "border-border bg-card"
                  }`}
                  data-testid={`mode-${mode.value}`}
                >
                  <p className="text-sm font-semibold">{mode.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{mode.desc}</p>
                </motion.button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Alert me after a missed dose</p>
            <div className="flex gap-2">
              {[30, 60, 120].map(mins => (
                <motion.button
                  key={mins}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setAlertDelay(mins)}
                  className={`flex-1 py-3 rounded-xl border text-xs font-semibold transition-colors ${
                    alertDelay === mins
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                  data-testid={`alert-delay-${mins}`}
                >
                  {mins < 60 ? `${mins} min` : `${mins / 60} hr`}
                </motion.button>
              ))}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => createMember.mutate()}
            disabled={createMember.isPending}
            className="w-full h-[52px] bg-primary text-primary-foreground rounded-xl font-semibold text-sm disabled:opacity-40"
            data-testid="save-member-btn"
          >
            {createMember.isPending ? "Adding…" : "Add Member"}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

// ─── FamilyPage ───────────────────────────────────────────────────────────────

export default function FamilyPage() {
  const [view, setView] = useState<"list" | "add" | "detail">("list");
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  const { data: members = [], isLoading } = useQuery<FamilyMember[]>({
    queryKey: ["family"],
    queryFn: api.getFamilyMembers,
  });

  if (view === "add") {
    return (
      <div className="px-4 py-6">
        <AddMemberWizard onClose={() => setView("list")} />
      </div>
    );
  }

  if (view === "detail" && selectedMember) {
    return (
      <div className="px-4 py-6">
        <MemberDetail
          member={selectedMember}
          onClose={() => { setView("list"); setSelectedMember(null); }}
        />
      </div>
    );
  }

  const alertMembers = members.filter(m => m.status === "red" || m.status === "amber");

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
          <h1 className="text-2xl font-bold tracking-tight" data-testid="family-title">Family</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{members.length} member{members.length !== 1 ? "s" : ""}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setView("add")}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
          data-testid="add-family-btn"
        >
          <PlusIcon size={15} /> Add
        </motion.button>
      </div>

      {/* Caregiver alerts */}
      <AnimatePresence>
        {alertMembers.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
              <BellIcon size={11} /> Alerts
            </h2>
            <div className="space-y-2">
              {alertMembers.map(member => (
                <motion.div
                  key={member.id}
                  whileTap={{ scale: 0.98 }}
                  className={`rounded-xl p-3.5 flex items-center gap-3 cursor-pointer ${
                    member.status === "red"
                      ? "bg-destructive/10 border border-destructive/20"
                      : "bg-[hsl(var(--nurilo-alert-amber))]/10 border border-[hsl(var(--nurilo-alert-amber))]/20"
                  }`}
                  data-testid={`alert-${member.id}`}
                  onClick={() => { setSelectedMember(member); setView("detail"); }}
                >
                  <WarnIcon size={16} className={
                    member.status === "red" ? "text-destructive" : "text-[hsl(var(--nurilo-alert-amber))]"
                  } />
                  <div className="flex-1">
                    <p className="text-xs font-semibold">
                      {member.name} {member.status === "red" ? "has an overdue dose" : "has a dose due soon"}
                    </p>
                  </div>
                  <button
                    className="text-xs font-bold text-primary"
                    data-testid={`view-alert-${member.id}`}
                  >
                    View
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Member list */}
      <section>
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
          Members ({members.length})
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-card rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
            data-testid="no-family"
          >
            <div className="w-14 h-14 mx-auto mb-4 opacity-25">
              <CirclesIcon size={56} />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">No family members yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add someone you care for</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {members.map(member => (
              <FamilyCard
                key={member.id}
                member={member}
                onClick={() => { setSelectedMember(member); setView("detail"); }}
              />
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}
