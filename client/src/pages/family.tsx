import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import * as api from "@/lib/api";
import {
  Plus, Users, Bell, Send, MoreVertical, Trash2, Edit,
  ChevronRight, X, Check, AlertTriangle, Heart
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FamilyMember, FamilyMedication } from "@shared/schema";

const RELATIONSHIPS = ["Parent", "Grandparent", "Child", "Partner", "Someone I care for"];
const UI_MODES = [
  { value: "standard", label: "Standard", desc: "For most adults" },
  { value: "elder", label: "Elder Mode", desc: "Larger text, simplified navigation" },
  { value: "child", label: "Child Mode", desc: "Friendly UI, parental confirmation" },
];

const NUDGE_PRESETS = [
  "Just thinking of you — don't forget your medication!",
  "Time for your medicine! 💊",
  "You've got this!",
];

function getStatusColor(status: string) {
  switch (status) {
    case "green": return "border-[hsl(var(--nurilo-success))]";
    case "amber": return "border-[hsl(var(--nurilo-alert-amber))]";
    case "red": return "border-destructive";
    default: return "border-muted-foreground/30";
  }
}

function getStatusBg(status: string) {
  switch (status) {
    case "green": return "bg-[hsl(var(--nurilo-success))]";
    case "amber": return "bg-[hsl(var(--nurilo-alert-amber))]";
    case "red": return "bg-destructive";
    default: return "bg-muted-foreground/30";
  }
}

function getInitials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

function FamilyCard({ member, onClick }: { member: FamilyMember; onClick: () => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="bg-card rounded-lg border border-border p-4 cursor-pointer hover:bg-accent/50 transition-colors"
      data-testid={`family-card-${member.id}`}
    >
      <div className="flex items-center gap-3">
        {/* Avatar with status ring */}
        <div className={`relative w-12 h-12 rounded-full border-[3px] ${getStatusColor(member.status)} flex items-center justify-center bg-secondary`}>
          <span className="text-sm font-bold text-foreground">{getInitials(member.name)}</span>
          {/* Status dot */}
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full ${getStatusBg(member.status)} border-2 border-card`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm" data-testid={`family-name-${member.id}`}>{member.name}</h3>
          <p className="text-xs text-muted-foreground">{member.relationship}</p>
          {member.ui_mode !== "standard" && (
            <span className="text-[10px] font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded-xl mt-1 inline-block">
              {member.ui_mode === "elder" ? "Elder Mode" : "Child Mode"}
            </span>
          )}
        </div>

        {/* Alert badge */}
        {member.status === "red" && (
          <div className="flex items-center gap-1 bg-destructive/10 text-destructive px-2.5 py-1 rounded-xl">
            <AlertTriangle size={12} />
            <span className="text-[10px] font-semibold">Overdue</span>
          </div>
        )}
        {member.status === "amber" && (
          <div className="flex items-center gap-1 bg-[hsl(var(--nurilo-alert-amber))]/10 text-[hsl(var(--nurilo-alert-amber))] px-2.5 py-1 rounded-xl">
            <Bell size={12} />
            <span className="text-[10px] font-semibold">Due soon</span>
          </div>
        )}

        <ChevronRight size={16} className="text-muted-foreground" />
      </div>
    </motion.div>
  );
}

// Member detail view
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
    onSuccess: () => {
      setShowNudge(false);
      setCustomNudge("");
    },
  });

  const deleteMember = useMutation({
    mutationFn: async () => {
      await api.deleteFamilyMember(member.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family"] });
      onClose();
    },
  });

  const confirmOnBehalf = useMutation({
    mutationFn: async () => {
      await api.updateFamilyMember(member.id, { status: "green" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family"] });
    },
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
        <button onClick={onClose} className="p-1" data-testid="back-to-family">
          <ChevronRight size={20} className="rotate-180" />
        </button>
        <div className={`w-12 h-12 rounded-full border-[3px] ${getStatusColor(member.status)} flex items-center justify-center bg-secondary`}>
          <span className="text-sm font-bold">{getInitials(member.name)}</span>
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-bold" data-testid="member-detail-name">{member.name}</h2>
          <p className="text-xs text-muted-foreground">{member.relationship}</p>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 rounded-full hover:bg-secondary" data-testid="member-menu">
            <MoreVertical size={16} />
          </button>
          <AnimatePresence>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-8 z-50 w-44 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => deleteMember.mutate()}
                    className="w-full px-3 py-2.5 text-left text-sm flex items-center gap-2 text-destructive hover:bg-destructive/10"
                    data-testid="delete-member-btn"
                  >
                    <Trash2 size={14} /> Remove member
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => confirmOnBehalf.mutate()}
          className="flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-md text-sm font-semibold"
          data-testid="confirm-behalf-btn"
        >
          <Check size={16} /> Confirm on behalf
        </button>
        <button
          onClick={() => setShowNudge(true)}
          className="flex items-center justify-center gap-2 py-3 border border-primary text-primary rounded-md text-sm font-semibold"
          data-testid="send-nudge-btn"
        >
          <Send size={16} /> Send nudge
        </button>
      </div>

      {/* Nudge sheet */}
      <AnimatePresence>
        {showNudge && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Send a nudge</p>
                <button onClick={() => setShowNudge(false)} className="p-1"><X size={16} /></button>
              </div>
              <div className="space-y-2">
                {NUDGE_PRESETS.map((msg) => (
                  <button
                    key={msg}
                    onClick={() => sendNudge.mutate(msg)}
                    className="w-full text-left px-3 py-2.5 bg-secondary rounded-lg text-xs hover:bg-accent transition-colors"
                    data-testid={`nudge-preset-${msg.slice(0, 10).replace(/\s/g, "-")}`}
                  >
                    {msg}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customNudge}
                  onChange={(e) => setCustomNudge(e.target.value.slice(0, 80))}
                  placeholder="Custom message (80 chars max)"
                  className="flex-1 h-10 px-3 rounded-sm border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="custom-nudge-input"
                />
                <button
                  onClick={() => customNudge.trim() && sendNudge.mutate(customNudge.trim())}
                  disabled={!customNudge.trim()}
                  className="h-10 px-4 bg-primary text-primary-foreground rounded-md text-xs font-semibold disabled:opacity-30"
                  data-testid="send-custom-nudge"
                >
                  Send
                </button>
              </div>
              {sendNudge.isSuccess && (
                <p className="text-xs text-[hsl(var(--nurilo-success))]">✓ Nudge sent!</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Medications */}
      <section>
        <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Their Medications ({meds.length})
        </h3>
        {meds.length === 0 ? (
          <p className="text-xs text-muted-foreground">No medications added yet.</p>
        ) : (
          <div className="space-y-2">
            {meds.map(med => (
              <div key={med.id} className="bg-card rounded-lg border border-border p-3 flex items-center gap-3" data-testid={`family-med-${med.id}`}>
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Heart size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{med.name}</p>
                  <p className="text-xs text-muted-foreground">{med.dose_strength} {med.dose_unit} {med.form}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Alert settings */}
      <section className="bg-card rounded-lg border border-border p-4">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Alert Settings</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm">Caregiver alerts</p>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-xl ${
            member.alert_enabled ? "bg-[hsl(var(--nurilo-success))]/10 text-[hsl(var(--nurilo-success))]" : "bg-muted text-muted-foreground"
          }`}>
            {member.alert_enabled ? "On" : "Off"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Alert after {member.alert_delay} min of missed dose
        </p>
      </section>
    </motion.div>
  );
}

// Add member wizard
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["family"] });
      onClose();
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Add Family Member</h2>
        <button onClick={onClose} className="p-1" data-testid="close-add-member">
          <X size={20} />
        </button>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {[1, 2, 3].map(s => (
          <div key={s} className={`flex-1 h-1 rounded-full transition-colors ${
            s <= step ? "bg-primary" : "bg-muted"
          }`} />
        ))}
      </div>

      {/* Step 1: Relationship */}
      {step === 1 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Who are you adding?</p>
          <div className="space-y-2">
            {RELATIONSHIPS.map(rel => (
              <button
                key={rel}
                onClick={() => { setRelationship(rel); setStep(2); }}
                className={`w-full px-4 py-3.5 text-left rounded-lg border text-sm font-medium transition-colors ${
                  relationship === rel ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:bg-secondary"
                }`}
                data-testid={`rel-${rel.replace(/\s/g, "-")}`}
              >
                {rel}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 2: Name */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm font-semibold">What's their name?</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter name"
            className="w-full h-12 px-4 rounded-sm border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            data-testid="member-name-input"
            autoFocus
          />
          <button
            onClick={() => name.trim() && setStep(3)}
            disabled={!name.trim()}
            className="w-full h-[52px] bg-primary text-primary-foreground rounded-md font-semibold text-sm disabled:opacity-40"
            data-testid="next-step-btn"
          >
            Next
          </button>
        </div>
      )}

      {/* Step 3: UI Mode + Alert settings */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold mb-2">Choose interface mode</p>
            <div className="space-y-2">
              {UI_MODES.map(mode => (
                <button
                  key={mode.value}
                  onClick={() => setUiMode(mode.value)}
                  className={`w-full px-4 py-3 text-left rounded-lg border transition-colors ${
                    uiMode === mode.value ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                  data-testid={`mode-${mode.value}`}
                >
                  <p className="text-sm font-medium">{mode.label}</p>
                  <p className="text-[11px] text-muted-foreground">{mode.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Alert me after</p>
            <div className="flex gap-2">
              {[30, 60, 120].map(mins => (
                <button
                  key={mins}
                  onClick={() => setAlertDelay(mins)}
                  className={`flex-1 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                    alertDelay === mins ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground"
                  }`}
                  data-testid={`alert-delay-${mins}`}
                >
                  {mins < 60 ? `${mins} min` : `${mins / 60} hr`}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => createMember.mutate()}
            disabled={createMember.isPending}
            className="w-full h-[52px] bg-primary text-primary-foreground rounded-md font-semibold text-sm disabled:opacity-40"
            data-testid="save-member-btn"
          >
            {createMember.isPending ? "Adding..." : "Add Member"}
          </button>
        </div>
      )}
    </motion.div>
  );
}

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
        <MemberDetail member={selectedMember} onClose={() => { setView("list"); setSelectedMember(null); }} />
      </div>
    );
  }

  // Caregiver alerts - members who are overdue
  const alertMembers = members.filter(m => m.status === "red" || m.status === "amber");

  return (
    <div className="px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold" data-testid="family-title">Family</h1>
        <button
          onClick={() => setView("add")}
          className="flex items-center gap-1.5 bg-primary text-primary-foreground px-4 py-2.5 rounded-md text-sm font-semibold"
          data-testid="add-family-btn"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Caregiver alerts */}
      <AnimatePresence>
        {alertMembers.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              <Bell size={12} className="inline mr-1" /> Alerts
            </h2>
            <div className="space-y-2">
              {alertMembers.map(member => (
                <div
                  key={member.id}
                  className={`rounded-lg p-3 flex items-center gap-3 ${
                    member.status === "red" ? "bg-destructive/10 border border-destructive/20" :
                    "bg-[hsl(var(--nurilo-alert-amber))]/10 border border-[hsl(var(--nurilo-alert-amber))]/20"
                  }`}
                  data-testid={`alert-${member.id}`}
                >
                  <AlertTriangle size={16} className={
                    member.status === "red" ? "text-destructive" : "text-[hsl(var(--nurilo-alert-amber))]"
                  } />
                  <div className="flex-1">
                    <p className="text-xs font-semibold">
                      {member.name} {member.status === "red" ? "has an overdue dose" : "has a dose due soon"}
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelectedMember(member); setView("detail"); }}
                    className="text-xs font-semibold text-primary"
                    data-testid={`view-alert-${member.id}`}
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Member list */}
      <section>
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Members ({members.length})
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-card rounded-lg border border-border animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16" data-testid="no-family">
            <Users size={40} className="mx-auto mb-3 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No family members yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add someone you care for</p>
          </div>
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
    </div>
  );
}
