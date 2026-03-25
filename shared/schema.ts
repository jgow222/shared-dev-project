// Nurilo - Supabase Types (no more Drizzle/SQLite)
import { z } from "zod";

// === Database row types (what comes back from Supabase) ===

export interface UserProfile {
  id: number;
  name: string;
  streak_days: number;
  last_streak_date: string | null;
  dark_mode: number;
}

export interface Medication {
  id: number;
  user_id: number;
  name: string;
  dose_strength: string;
  dose_unit: string;
  form: string;
  purpose: string | null;
  doctor: string | null;
  pharmacy: string | null;
  frequency: string;
  schedule_times: string;
  schedule_days: string | null;
  pill_count: number | null;
  status: string;
  is_critical: number;
  created_at: string;
}

export interface DoseLog {
  id: number;
  medication_id: number;
  user_id: number;
  scheduled_time: string;
  scheduled_date: string;
  status: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
}

export interface ChatMessage {
  id: number;
  user_id: number;
  role: string;
  content: string;
  feedback: string | null;
  created_at: string;
}

export interface FamilyMember {
  id: number;
  name: string;
  relationship: string;
  ui_mode: string;
  alert_enabled: number;
  alert_delay: number;
  status: string;
}

export interface FamilyMedication {
  id: number;
  family_member_id: number;
  name: string;
  dose_strength: string;
  dose_unit: string;
  form: string;
  schedule_times: string;
  status: string;
}

export interface Nudge {
  id: number;
  family_member_id: number;
  message: string;
  sent_at: string;
  response: string | null;
}

export interface HealthTip {
  id: number;
  title: string;
  content: string;
  category: string;
}

// === Insert types (what we send to Supabase, id auto-generated) ===

export type InsertUserProfile = Omit<UserProfile, "id">;
export type InsertMedication = Omit<Medication, "id">;
export type InsertDoseLog = Omit<DoseLog, "id">;
export type InsertChatMessage = Omit<ChatMessage, "id">;
export type InsertFamilyMember = Omit<FamilyMember, "id">;
export type InsertFamilyMedication = Omit<FamilyMedication, "id">;
export type InsertNudge = Omit<Nudge, "id">;

// === Zod schemas for validation ===

export const insertMedicationSchema = z.object({
  user_id: z.number().default(1),
  name: z.string().min(1),
  dose_strength: z.string().min(1),
  dose_unit: z.string().default("mg"),
  form: z.string().default("Tablet"),
  purpose: z.string().nullable().optional(),
  doctor: z.string().nullable().optional(),
  pharmacy: z.string().nullable().optional(),
  frequency: z.string().default("Once daily"),
  schedule_times: z.string().default('["08:00"]'),
  schedule_days: z.string().nullable().optional(),
  pill_count: z.number().nullable().optional(),
  status: z.string().default("active"),
  is_critical: z.number().default(0),
  created_at: z.string(),
});

export const insertDoseLogSchema = z.object({
  medication_id: z.number(),
  user_id: z.number().default(1),
  scheduled_time: z.string(),
  scheduled_date: z.string(),
  status: z.string().default("pending"),
  confirmed_at: z.string().nullable().optional(),
  confirmed_by: z.string().nullable().optional(),
});

export const insertFamilyMemberSchema = z.object({
  name: z.string().min(1),
  relationship: z.string().min(1),
  ui_mode: z.string().default("standard"),
  alert_enabled: z.number().default(1),
  alert_delay: z.number().default(60),
  status: z.string().default("green"),
});
