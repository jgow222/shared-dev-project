import {
  type UserProfile, type InsertUserProfile, userProfile,
  type Medication, type InsertMedication, medications,
  type DoseLog, type InsertDoseLog, doseLogs,
  type ChatMessage, type InsertChatMessage, chatMessages,
  type FamilyMember, type InsertFamilyMember, familyMembers,
  type FamilyMedication, type InsertFamilyMedication, familyMedications,
  type Nudge, type InsertNudge, nudges,
  type HealthTip, healthTips,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, desc } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite);

export interface IStorage {
  // User profile
  getProfile(): Promise<UserProfile | undefined>;
  createProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateProfile(id: number, data: Partial<InsertUserProfile>): Promise<UserProfile | undefined>;

  // Medications
  getMedications(userId?: number): Promise<Medication[]>;
  getMedication(id: number): Promise<Medication | undefined>;
  createMedication(med: InsertMedication): Promise<Medication>;
  updateMedication(id: number, data: Partial<InsertMedication>): Promise<Medication | undefined>;
  deleteMedication(id: number): Promise<void>;

  // Dose logs
  getDoseLogs(date: string, userId?: number): Promise<DoseLog[]>;
  getDoseLogsForMed(medicationId: number, limit?: number): Promise<DoseLog[]>;
  createDoseLog(log: InsertDoseLog): Promise<DoseLog>;
  updateDoseLog(id: number, data: Partial<InsertDoseLog>): Promise<DoseLog | undefined>;

  // Chat
  getChatMessages(userId?: number): Promise<ChatMessage[]>;
  createChatMessage(msg: InsertChatMessage): Promise<ChatMessage>;
  updateChatFeedback(id: number, feedback: string): Promise<void>;
  clearChat(userId?: number): Promise<void>;

  // Family
  getFamilyMembers(): Promise<FamilyMember[]>;
  getFamilyMember(id: number): Promise<FamilyMember | undefined>;
  createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember>;
  updateFamilyMember(id: number, data: Partial<InsertFamilyMember>): Promise<FamilyMember | undefined>;
  deleteFamilyMember(id: number): Promise<void>;

  // Family medications
  getFamilyMedications(familyMemberId: number): Promise<FamilyMedication[]>;
  createFamilyMedication(med: InsertFamilyMedication): Promise<FamilyMedication>;

  // Nudges
  getNudges(familyMemberId: number): Promise<Nudge[]>;
  createNudge(nudge: InsertNudge): Promise<Nudge>;

  // Health tips
  getHealthTips(): Promise<HealthTip[]>;

  // Seed
  seed(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(): Promise<UserProfile | undefined> {
    return db.select().from(userProfile).get();
  }

  async createProfile(profile: InsertUserProfile): Promise<UserProfile> {
    return db.insert(userProfile).values(profile).returning().get();
  }

  async updateProfile(id: number, data: Partial<InsertUserProfile>): Promise<UserProfile | undefined> {
    return db.update(userProfile).set(data).where(eq(userProfile.id, id)).returning().get();
  }

  // Medications
  async getMedications(userId: number = 1): Promise<Medication[]> {
    return db.select().from(medications).where(eq(medications.userId, userId)).all();
  }

  async getMedication(id: number): Promise<Medication | undefined> {
    return db.select().from(medications).where(eq(medications.id, id)).get();
  }

  async createMedication(med: InsertMedication): Promise<Medication> {
    return db.insert(medications).values(med).returning().get();
  }

  async updateMedication(id: number, data: Partial<InsertMedication>): Promise<Medication | undefined> {
    return db.update(medications).set(data).where(eq(medications.id, id)).returning().get();
  }

  async deleteMedication(id: number): Promise<void> {
    db.delete(medications).where(eq(medications.id, id)).run();
  }

  // Dose logs
  async getDoseLogs(date: string, userId: number = 1): Promise<DoseLog[]> {
    return db.select().from(doseLogs)
      .where(and(eq(doseLogs.scheduledDate, date), eq(doseLogs.userId, userId)))
      .all();
  }

  async getDoseLogsForMed(medicationId: number, limit: number = 30): Promise<DoseLog[]> {
    return db.select().from(doseLogs)
      .where(eq(doseLogs.medicationId, medicationId))
      .orderBy(desc(doseLogs.scheduledDate))
      .limit(limit)
      .all();
  }

  async createDoseLog(log: InsertDoseLog): Promise<DoseLog> {
    return db.insert(doseLogs).values(log).returning().get();
  }

  async updateDoseLog(id: number, data: Partial<InsertDoseLog>): Promise<DoseLog | undefined> {
    return db.update(doseLogs).set(data).where(eq(doseLogs.id, id)).returning().get();
  }

  // Chat
  async getChatMessages(userId: number = 1): Promise<ChatMessage[]> {
    return db.select().from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt)
      .all();
  }

  async createChatMessage(msg: InsertChatMessage): Promise<ChatMessage> {
    return db.insert(chatMessages).values(msg).returning().get();
  }

  async updateChatFeedback(id: number, feedback: string): Promise<void> {
    db.update(chatMessages).set({ feedback }).where(eq(chatMessages.id, id)).run();
  }

  async clearChat(userId: number = 1): Promise<void> {
    db.delete(chatMessages).where(eq(chatMessages.userId, userId)).run();
  }

  // Family
  async getFamilyMembers(): Promise<FamilyMember[]> {
    return db.select().from(familyMembers).all();
  }

  async getFamilyMember(id: number): Promise<FamilyMember | undefined> {
    return db.select().from(familyMembers).where(eq(familyMembers.id, id)).get();
  }

  async createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
    return db.insert(familyMembers).values(member).returning().get();
  }

  async updateFamilyMember(id: number, data: Partial<InsertFamilyMember>): Promise<FamilyMember | undefined> {
    return db.update(familyMembers).set(data).where(eq(familyMembers.id, id)).returning().get();
  }

  async deleteFamilyMember(id: number): Promise<void> {
    db.delete(familyMembers).where(eq(familyMembers.id, id)).run();
  }

  // Family medications
  async getFamilyMedications(familyMemberId: number): Promise<FamilyMedication[]> {
    return db.select().from(familyMedications)
      .where(eq(familyMedications.familyMemberId, familyMemberId))
      .all();
  }

  async createFamilyMedication(med: InsertFamilyMedication): Promise<FamilyMedication> {
    return db.insert(familyMedications).values(med).returning().get();
  }

  // Nudges
  async getNudges(familyMemberId: number): Promise<Nudge[]> {
    return db.select().from(nudges)
      .where(eq(nudges.familyMemberId, familyMemberId))
      .orderBy(desc(nudges.sentAt))
      .all();
  }

  async createNudge(nudge: InsertNudge): Promise<Nudge> {
    return db.insert(nudges).values(nudge).returning().get();
  }

  // Health tips
  async getHealthTips(): Promise<HealthTip[]> {
    return db.select().from(healthTips).all();
  }

  // Seed the database with sample data
  async seed(): Promise<void> {
    // Check if already seeded
    const existing = db.select().from(userProfile).get();
    if (existing) return;

    // Create user profile
    db.insert(userProfile).values({
      name: "Jordan",
      streakDays: 12,
      lastStreakDate: new Date().toISOString().split("T")[0],
      darkMode: 0,
    }).run();

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Seed medications
    const meds = [
      {
        userId: 1,
        name: "Lisinopril",
        doseStrength: "10",
        doseUnit: "mg",
        form: "Tablet",
        purpose: "Blood pressure",
        doctor: "Dr. Chen",
        pharmacy: "CVS Pharmacy",
        frequency: "Once daily",
        scheduleTimes: '["08:00"]',
        pillCount: 24,
        status: "active",
        isCritical: 0,
        createdAt: today,
      },
      {
        userId: 1,
        name: "Metformin",
        doseStrength: "500",
        doseUnit: "mg",
        form: "Tablet",
        purpose: "Blood sugar",
        doctor: "Dr. Patel",
        pharmacy: "Walgreens",
        frequency: "Twice daily",
        scheduleTimes: '["08:00","20:00"]',
        pillCount: 45,
        status: "active",
        isCritical: 0,
        createdAt: today,
      },
      {
        userId: 1,
        name: "Vitamin D3",
        doseStrength: "2000",
        doseUnit: "IU",
        form: "Capsule",
        purpose: "Bone health",
        frequency: "Once daily",
        scheduleTimes: '["08:00"]',
        pillCount: 60,
        status: "active",
        isCritical: 0,
        createdAt: today,
      },
      {
        userId: 1,
        name: "Atorvastatin",
        doseStrength: "20",
        doseUnit: "mg",
        form: "Tablet",
        purpose: "Cholesterol",
        doctor: "Dr. Chen",
        pharmacy: "CVS Pharmacy",
        frequency: "Once daily",
        scheduleTimes: '["21:00"]',
        pillCount: 8,
        status: "active",
        isCritical: 0,
        createdAt: today,
      },
    ];

    for (const med of meds) {
      db.insert(medications).values(med).run();
    }

    // Seed dose logs for today
    const doseLogEntries = [
      { medicationId: 1, userId: 1, scheduledTime: "08:00", scheduledDate: today, status: "taken", confirmedAt: `${today}T08:05:00` },
      { medicationId: 2, userId: 1, scheduledTime: "08:00", scheduledDate: today, status: "taken", confirmedAt: `${today}T08:05:00` },
      { medicationId: 3, userId: 1, scheduledTime: "08:00", scheduledDate: today, status: "taken", confirmedAt: `${today}T08:06:00` },
      { medicationId: 2, userId: 1, scheduledTime: "20:00", scheduledDate: today, status: "pending" },
      { medicationId: 4, userId: 1, scheduledTime: "21:00", scheduledDate: today, status: "pending" },
    ];

    for (const log of doseLogEntries) {
      db.insert(doseLogs).values(log).run();
    }

    // Seed some historical dose logs (past 14 days)
    for (let i = 1; i <= 14; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      // All meds taken on past days
      db.insert(doseLogs).values({ medicationId: 1, userId: 1, scheduledTime: "08:00", scheduledDate: dateStr, status: "taken", confirmedAt: `${dateStr}T08:10:00` }).run();
      db.insert(doseLogs).values({ medicationId: 2, userId: 1, scheduledTime: "08:00", scheduledDate: dateStr, status: "taken", confirmedAt: `${dateStr}T08:10:00` }).run();
      db.insert(doseLogs).values({ medicationId: 3, userId: 1, scheduledTime: "08:00", scheduledDate: dateStr, status: "taken", confirmedAt: `${dateStr}T08:11:00` }).run();
      db.insert(doseLogs).values({ medicationId: 2, userId: 1, scheduledTime: "20:00", scheduledDate: dateStr, status: "taken", confirmedAt: `${dateStr}T20:05:00` }).run();
      db.insert(doseLogs).values({ medicationId: 4, userId: 1, scheduledTime: "21:00", scheduledDate: dateStr, status: "taken", confirmedAt: `${dateStr}T21:03:00` }).run();
    }

    // Seed family members
    db.insert(familyMembers).values({
      name: "Mom",
      relationship: "Parent",
      uiMode: "elder",
      alertEnabled: 1,
      alertDelay: 60,
      status: "green",
    }).run();

    db.insert(familyMembers).values({
      name: "Dad",
      relationship: "Parent",
      uiMode: "elder",
      alertEnabled: 1,
      alertDelay: 30,
      status: "amber",
    }).run();

    // Seed family medications
    db.insert(familyMedications).values({
      familyMemberId: 1,
      name: "Amlodipine",
      doseStrength: "5",
      doseUnit: "mg",
      form: "Tablet",
      scheduleTimes: '["09:00"]',
      status: "active",
    }).run();

    db.insert(familyMedications).values({
      familyMemberId: 2,
      name: "Warfarin",
      doseStrength: "5",
      doseUnit: "mg",
      form: "Tablet",
      scheduleTimes: '["18:00"]',
      status: "active",
    }).run();

    // Seed health tips
    const tips = [
      { title: "Stay Hydrated", content: "Drink a full glass of water when taking your medications. It helps your body absorb them better and reduces the risk of stomach irritation.", category: "general" },
      { title: "Consistent Timing", content: "Taking your medications at the same time each day helps maintain steady levels in your bloodstream, making them more effective.", category: "adherence" },
      { title: "Food Matters", content: "Some medications work best with food, others on an empty stomach. Check with your pharmacist about the best time relative to meals.", category: "nutrition" },
      { title: "Don't Double Up", content: "If you miss a dose, don't take two next time. Usually, take it as soon as you remember — unless it's almost time for your next dose.", category: "safety" },
      { title: "Storage Counts", content: "Store medications in a cool, dry place — not the bathroom cabinet. Heat and humidity can reduce their effectiveness.", category: "storage" },
      { title: "Grapefruit Alert", content: "Grapefruit interacts with many common medications including statins and blood pressure drugs. Ask your pharmacist if it affects yours.", category: "nutrition" },
      { title: "Track Side Effects", content: "Keep a simple log of how you feel after starting a new medication. This helps your doctor make better decisions at your next visit.", category: "safety" },
      { title: "Refill Early", content: "Don't wait until you run out. Request refills when you have a 7-day supply left to avoid gaps in your treatment.", category: "adherence" },
      { title: "Move Your Body", content: "Even 15 minutes of walking can improve how well your blood pressure and diabetes medications work.", category: "lifestyle" },
      { title: "Sleep & Meds", content: "Some medications can affect your sleep. If you notice changes, talk to your doctor — the timing of your dose might be the fix.", category: "lifestyle" },
      { title: "Alcohol Awareness", content: "Alcohol can interact with many medications, including pain relievers and blood thinners. Even moderate amounts can cause problems.", category: "safety" },
      { title: "Vitamin K & Warfarin", content: "If you take a blood thinner like warfarin, keep your vitamin K intake consistent. Sudden changes in leafy greens can affect your levels.", category: "nutrition" },
    ];

    for (const tip of tips) {
      db.insert(healthTips).values(tip).run();
    }
  }
}

export const storage = new DatabaseStorage();
