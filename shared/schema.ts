import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profile
export const userProfile = sqliteTable("user_profile", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  streakDays: integer("streak_days").notNull().default(0),
  lastStreakDate: text("last_streak_date"),
  darkMode: integer("dark_mode").notNull().default(0),
});

export const insertUserProfileSchema = createInsertSchema(userProfile).omit({ id: true });
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfile.$inferSelect;

// Medications
export const medications = sqliteTable("medications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().default(1),
  name: text("name").notNull(),
  doseStrength: text("dose_strength").notNull(),
  doseUnit: text("dose_unit").notNull().default("mg"),
  form: text("form").notNull().default("Tablet"),
  purpose: text("purpose"),
  doctor: text("doctor"),
  pharmacy: text("pharmacy"),
  frequency: text("frequency").notNull().default("Once daily"),
  // JSON string of times e.g. ["08:00","20:00"]
  scheduleTimes: text("schedule_times").notNull().default('["08:00"]'),
  // JSON string of days e.g. ["Mon","Tue",...] or null for every day
  scheduleDays: text("schedule_days"),
  pillCount: integer("pill_count"),
  status: text("status").notNull().default("active"), // active, paused, archived
  isCritical: integer("is_critical").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const insertMedicationSchema = createInsertSchema(medications).omit({ id: true });
export type InsertMedication = z.infer<typeof insertMedicationSchema>;
export type Medication = typeof medications.$inferSelect;

// Dose logs
export const doseLogs = sqliteTable("dose_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  medicationId: integer("medication_id").notNull(),
  userId: integer("user_id").notNull().default(1),
  scheduledTime: text("scheduled_time").notNull(),
  scheduledDate: text("scheduled_date").notNull(),
  status: text("status").notNull().default("pending"), // pending, taken, skipped, missed
  confirmedAt: text("confirmed_at"),
  confirmedBy: text("confirmed_by"),
});

export const insertDoseLogSchema = createInsertSchema(doseLogs).omit({ id: true });
export type InsertDoseLog = z.infer<typeof insertDoseLogSchema>;
export type DoseLog = typeof doseLogs.$inferSelect;

// Chat messages for Clarity
export const chatMessages = sqliteTable("chat_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull().default(1),
  role: text("role").notNull(), // user, assistant
  content: text("content").notNull(),
  feedback: text("feedback"), // thumbs_up, thumbs_down, null
  createdAt: text("created_at").notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true });
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

// Family members
export const familyMembers = sqliteTable("family_members", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  uiMode: text("ui_mode").notNull().default("standard"),
  alertEnabled: integer("alert_enabled").notNull().default(1),
  alertDelay: integer("alert_delay").notNull().default(60), // minutes
  status: text("status").notNull().default("green"), // green, amber, red, gray
});

export const insertFamilyMemberSchema = createInsertSchema(familyMembers).omit({ id: true });
export type InsertFamilyMember = z.infer<typeof insertFamilyMemberSchema>;
export type FamilyMember = typeof familyMembers.$inferSelect;

// Family member medications
export const familyMedications = sqliteTable("family_medications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  familyMemberId: integer("family_member_id").notNull(),
  name: text("name").notNull(),
  doseStrength: text("dose_strength").notNull(),
  doseUnit: text("dose_unit").notNull().default("mg"),
  form: text("form").notNull().default("Tablet"),
  scheduleTimes: text("schedule_times").notNull().default('["08:00"]'),
  status: text("status").notNull().default("active"),
});

export const insertFamilyMedicationSchema = createInsertSchema(familyMedications).omit({ id: true });
export type InsertFamilyMedication = z.infer<typeof insertFamilyMedicationSchema>;
export type FamilyMedication = typeof familyMedications.$inferSelect;

// Nudges
export const nudges = sqliteTable("nudges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  familyMemberId: integer("family_member_id").notNull(),
  message: text("message").notNull(),
  sentAt: text("sent_at").notNull(),
  response: text("response"),
});

export const insertNudgeSchema = createInsertSchema(nudges).omit({ id: true });
export type InsertNudge = z.infer<typeof insertNudgeSchema>;
export type Nudge = typeof nudges.$inferSelect;

// Health tips
export const healthTips = sqliteTable("health_tips", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
});

export type HealthTip = typeof healthTips.$inferSelect;
