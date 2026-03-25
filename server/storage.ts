import { supabase } from "./supabase";
import type {
  UserProfile, InsertUserProfile,
  Medication, InsertMedication,
  DoseLog, InsertDoseLog,
  ChatMessage, InsertChatMessage,
  FamilyMember, InsertFamilyMember,
  FamilyMedication, InsertFamilyMedication,
  Nudge, InsertNudge,
  HealthTip,
} from "@shared/schema";

export interface IStorage {
  getProfile(): Promise<UserProfile | null>;
  createProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateProfile(id: number, data: Partial<InsertUserProfile>): Promise<UserProfile | null>;

  getMedications(userId?: number): Promise<Medication[]>;
  getMedication(id: number): Promise<Medication | null>;
  createMedication(med: InsertMedication): Promise<Medication>;
  updateMedication(id: number, data: Partial<InsertMedication>): Promise<Medication | null>;
  deleteMedication(id: number): Promise<void>;

  getDoseLogs(date: string, userId?: number): Promise<DoseLog[]>;
  getDoseLogsForMed(medicationId: number, limit?: number): Promise<DoseLog[]>;
  createDoseLog(log: InsertDoseLog): Promise<DoseLog>;
  updateDoseLog(id: number, data: Partial<InsertDoseLog>): Promise<DoseLog | null>;

  getChatMessages(userId?: number): Promise<ChatMessage[]>;
  createChatMessage(msg: InsertChatMessage): Promise<ChatMessage>;
  updateChatFeedback(id: number, feedback: string): Promise<void>;
  clearChat(userId?: number): Promise<void>;

  getFamilyMembers(): Promise<FamilyMember[]>;
  getFamilyMember(id: number): Promise<FamilyMember | null>;
  createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;
  updateFamilyMember(id: number, data: Partial<InsertFamilyMember>): Promise<FamilyMember | null>;
  deleteFamilyMember(id: number): Promise<void>;

  getFamilyMedications(familyMemberId: number): Promise<FamilyMedication[]>;
  createFamilyMedication(med: InsertFamilyMedication): Promise<FamilyMedication>;

  getNudges(familyMemberId: number): Promise<Nudge[]>;
  createNudge(nudge: InsertNudge): Promise<Nudge>;

  getHealthTips(): Promise<HealthTip[]>;
}

export class SupabaseStorage implements IStorage {
  // === Profile ===
  async getProfile(): Promise<UserProfile | null> {
    const { data } = await supabase.from("user_profile").select("*").limit(1).single();
    return data;
  }

  async createProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const { data, error } = await supabase.from("user_profile").insert(profile).select().single();
    if (error) throw error;
    return data!;
  }

  async updateProfile(id: number, updates: Partial<InsertUserProfile>): Promise<UserProfile | null> {
    const { data, error } = await supabase.from("user_profile").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }

  // === Medications ===
  async getMedications(userId: number = 1): Promise<Medication[]> {
    const { data } = await supabase.from("medications").select("*").eq("user_id", userId);
    return data || [];
  }

  async getMedication(id: number): Promise<Medication | null> {
    const { data } = await supabase.from("medications").select("*").eq("id", id).single();
    return data;
  }

  async createMedication(med: InsertMedication): Promise<Medication> {
    const { data, error } = await supabase.from("medications").insert(med).select().single();
    if (error) throw error;
    return data!;
  }

  async updateMedication(id: number, updates: Partial<InsertMedication>): Promise<Medication | null> {
    const { data, error } = await supabase.from("medications").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteMedication(id: number): Promise<void> {
    await supabase.from("medications").delete().eq("id", id);
  }

  // === Dose Logs ===
  async getDoseLogs(date: string, userId: number = 1): Promise<DoseLog[]> {
    const { data } = await supabase
      .from("dose_logs")
      .select("*")
      .eq("scheduled_date", date)
      .eq("user_id", userId);
    return data || [];
  }

  async getDoseLogsForMed(medicationId: number, limit: number = 30): Promise<DoseLog[]> {
    const { data } = await supabase
      .from("dose_logs")
      .select("*")
      .eq("medication_id", medicationId)
      .order("scheduled_date", { ascending: false })
      .limit(limit);
    return data || [];
  }

  async createDoseLog(log: InsertDoseLog): Promise<DoseLog> {
    const { data, error } = await supabase.from("dose_logs").insert(log).select().single();
    if (error) throw error;
    return data!;
  }

  async updateDoseLog(id: number, updates: Partial<InsertDoseLog>): Promise<DoseLog | null> {
    const { data, error } = await supabase.from("dose_logs").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }

  // === Chat ===
  async getChatMessages(userId: number = 1): Promise<ChatMessage[]> {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    return data || [];
  }

  async createChatMessage(msg: InsertChatMessage): Promise<ChatMessage> {
    const { data, error } = await supabase.from("chat_messages").insert(msg).select().single();
    if (error) throw error;
    return data!;
  }

  async updateChatFeedback(id: number, feedback: string): Promise<void> {
    await supabase.from("chat_messages").update({ feedback }).eq("id", id);
  }

  async clearChat(userId: number = 1): Promise<void> {
    await supabase.from("chat_messages").delete().eq("user_id", userId);
  }

  // === Family ===
  async getFamilyMembers(): Promise<FamilyMember[]> {
    const { data } = await supabase.from("family_members").select("*");
    return data || [];
  }

  async getFamilyMember(id: number): Promise<FamilyMember | null> {
    const { data } = await supabase.from("family_members").select("*").eq("id", id).single();
    return data;
  }

  async createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
    const { data, error } = await supabase.from("family_members").insert(member).select().single();
    if (error) throw error;
    return data!;
  }

  async updateFamilyMember(id: number, updates: Partial<InsertFamilyMember>): Promise<FamilyMember | null> {
    const { data, error } = await supabase.from("family_members").update(updates).eq("id", id).select().single();
    if (error) throw error;
    return data;
  }

  async deleteFamilyMember(id: number): Promise<void> {
    await supabase.from("family_members").delete().eq("id", id);
  }

  // === Family Medications ===
  async getFamilyMedications(familyMemberId: number): Promise<FamilyMedication[]> {
    const { data } = await supabase
      .from("family_medications")
      .select("*")
      .eq("family_member_id", familyMemberId);
    return data || [];
  }

  async createFamilyMedication(med: InsertFamilyMedication): Promise<FamilyMedication> {
    const { data, error } = await supabase.from("family_medications").insert(med).select().single();
    if (error) throw error;
    return data!;
  }

  // === Nudges ===
  async getNudges(familyMemberId: number): Promise<Nudge[]> {
    const { data } = await supabase
      .from("nudges")
      .select("*")
      .eq("family_member_id", familyMemberId)
      .order("sent_at", { ascending: false });
    return data || [];
  }

  async createNudge(nudge: InsertNudge): Promise<Nudge> {
    const { data, error } = await supabase.from("nudges").insert(nudge).select().single();
    if (error) throw error;
    return data!;
  }

  // === Health Tips ===
  async getHealthTips(): Promise<HealthTip[]> {
    const { data } = await supabase.from("health_tips").select("*");
    return data || [];
  }
}

export const storage = new SupabaseStorage();
