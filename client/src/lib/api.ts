import { supabase } from "./supabase";
import type {
  UserProfile,
  Medication,
  DoseLog,
  ChatMessage,
  FamilyMember,
  FamilyMedication,
  Nudge,
  HealthTip,
  InsertUserProfile,
  InsertMedication,
  InsertDoseLog,
  InsertChatMessage,
  InsertFamilyMember,
  InsertFamilyMedication,
  InsertNudge,
} from "@shared/schema";

// === Profile ===

export async function getProfile(): Promise<UserProfile | null> {
  const { data } = await supabase.from("user_profile").select("*").limit(1).single();
  return data;
}

export async function createProfile(profile: Omit<InsertUserProfile, "last_streak_date">): Promise<UserProfile> {
  const { data, error } = await supabase.from("user_profile").insert(profile).select().single();
  if (error) throw error;
  return data!;
}

export async function updateProfile(id: number, updates: Partial<InsertUserProfile>): Promise<UserProfile | null> {
  const { data, error } = await supabase.from("user_profile").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// === Medications ===

export async function getMedications(userId: number = 1): Promise<Medication[]> {
  const { data } = await supabase.from("medications").select("*").eq("user_id", userId);
  return data || [];
}

export async function getMedication(id: number): Promise<Medication | null> {
  const { data } = await supabase.from("medications").select("*").eq("id", id).single();
  return data;
}

export async function createMedication(med: InsertMedication): Promise<Medication> {
  const { data, error } = await supabase.from("medications").insert(med).select().single();
  if (error) throw error;

  // Generate today's dose logs for the new medication
  const today = new Date().toISOString().split("T")[0];
  const times: string[] = JSON.parse(data!.schedule_times);
  for (const time of times) {
    await createDoseLog({
      medication_id: data!.id,
      user_id: data!.user_id,
      scheduled_time: time,
      scheduled_date: today,
      status: "pending",
      confirmed_at: null,
      confirmed_by: null,
    });
  }

  return data!;
}

export async function updateMedication(id: number, updates: Partial<InsertMedication>): Promise<Medication | null> {
  const { data, error } = await supabase.from("medications").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteMedication(id: number): Promise<void> {
  await supabase.from("medications").delete().eq("id", id);
}

// === Dose Logs ===

export async function getDoseLogs(date: string, userId: number = 1): Promise<DoseLog[]> {
  const { data } = await supabase
    .from("dose_logs")
    .select("*")
    .eq("scheduled_date", date)
    .eq("user_id", userId);
  return data || [];
}

export async function getDoseLogsForMed(medicationId: number, limit: number = 30): Promise<DoseLog[]> {
  const { data } = await supabase
    .from("dose_logs")
    .select("*")
    .eq("medication_id", medicationId)
    .order("scheduled_date", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function createDoseLog(log: InsertDoseLog): Promise<DoseLog> {
  const { data, error } = await supabase.from("dose_logs").insert(log).select().single();
  if (error) throw error;
  return data!;
}

export async function updateDoseLog(id: number, updates: Partial<InsertDoseLog>): Promise<DoseLog | null> {
  const { data, error } = await supabase.from("dose_logs").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

// === Chat / Clarity ===

const clarityResponses: Record<string, (meds: string[]) => string> = {
  "ibuprofen": (meds) => {
    const hasLisinopril = meds.some(m => m.toLowerCase().includes("lisinopril"));
    const hasWarfarin = meds.some(m => m.toLowerCase().includes("warfarin"));
    if (hasLisinopril) {
      return "You're currently taking Lisinopril for blood pressure. Ibuprofen (Advil, Motrin) can reduce how well Lisinopril controls your blood pressure and may affect kidney function over time.\n\n**Safer alternative:** Acetaminophen (Tylenol) is generally the better choice for pain relief when you're on blood pressure medication.\n\nIf you need anti-inflammatory relief specifically, talk to your doctor about the lowest effective dose for the shortest time.";
    }
    if (hasWarfarin) {
      return "⚠️ **Important:** You or a family member takes Warfarin (a blood thinner). Ibuprofen significantly increases bleeding risk when combined with blood thinners.\n\n**Do not take ibuprofen** without talking to your doctor first.\n\n**Safer alternative:** Acetaminophen (Tylenol) for pain relief. Avoid all NSAIDs (aspirin, naproxen, ibuprofen).";
    }
    return "Ibuprofen (Advil, Motrin) is an NSAID used for pain, inflammation, and fever. The standard adult dose is 200-400mg every 4-6 hours.\n\n**Key tips:**\n• Take with food to protect your stomach\n• Don't exceed 1200mg per day without a doctor's guidance\n• Avoid if you have kidney issues or stomach ulcers\n\nBased on your current medications, there are no major interactions detected.";
  },
  "side effects": (meds) => {
    const hasMetformin = meds.some(m => m.toLowerCase().includes("metformin"));
    if (hasMetformin) {
      return "Since you're taking **Metformin**, here are the most common side effects:\n\n**Common (first few weeks):**\n• Nausea or upset stomach\n• Diarrhea\n• Metallic taste\n\n**These usually improve** after 2-3 weeks. Taking it with food helps significantly.\n\n**Call your doctor if you experience:**\n• Severe stomach pain\n• Unusual muscle pain\n• Difficulty breathing\n• Extreme fatigue\n\nMetformin is one of the safest diabetes medications overall — these serious side effects are rare.";
    }
    return "I can help with side effects! Which medication are you curious about? I see you're currently taking: " + meds.join(", ") + ".\n\nTap on any medication name or ask me specifically, like \"What are the side effects of [medication name]?\"";
  },
  "a1c": () => {
    return "**A1C (Hemoglobin A1C)** measures your average blood sugar over the past 2-3 months.\n\n**What the numbers mean:**\n• Below 5.7% — Normal\n• 5.7% to 6.4% — Prediabetes\n• 6.5% or higher — Diabetes\n\n**Your goal** (if you have diabetes): Most doctors aim for below 7%, but your personal target may differ.\n\n**How to improve it:**\n• Take medications consistently (your streak helps!)\n• Reduce refined carbs and sugar\n• Walk 15-30 minutes after meals\n• Stay hydrated\n\nEach 1% drop in A1C reduces the risk of complications by about 25-30%.";
  },
  "skip": () => {
    return "**Is it safe to skip a dose?** It depends on the medication:\n\n**Generally okay to skip occasionally:**\n• Vitamins and supplements\n• Non-critical maintenance medications\n\n**Should not skip:**\n• Blood pressure medications (can cause rebound spikes)\n• Diabetes medications (blood sugar can swing)\n• Blood thinners (increases clot risk)\n• Antibiotics (reduces effectiveness)\n\n**If you missed a dose:**\n• If less than halfway to your next dose → take it now\n• If more than halfway → skip and take the next one on schedule\n• Never double up to make up for a missed dose";
  },
  "vitamins": () => {
    return "**Best time to take common vitamins:**\n\n☀️ **Morning with food:**\n• Vitamin B complex (energy boost)\n• Vitamin C\n• Iron (with vitamin C for absorption)\n\n🌙 **Evening:**\n• Magnesium (helps relaxation and sleep)\n• Vitamin D (with your largest meal for best absorption)\n\n**Important spacing:**\n• Calcium and iron should be taken 2+ hours apart\n• Don't take vitamins with coffee or tea (reduces absorption)\n• Vitamin D is fat-soluble — always take with food containing some fat";
  },
  "food": () => {
    return "**Common food-medication interactions to know:**\n\n🚫 **Grapefruit** — Interacts with statins (like Atorvastatin), blood pressure meds, and many others. Avoid or ask your pharmacist.\n\n🥬 **Leafy greens + Warfarin** — Vitamin K in spinach, kale, and broccoli affects blood thinners. Keep intake consistent, don't suddenly eat more or less.\n\n🥛 **Dairy + Antibiotics** — Calcium in milk/cheese can block absorption of tetracycline and fluoroquinolone antibiotics. Wait 2 hours.\n\n🍺 **Alcohol + Metformin** — Increases risk of lactic acidosis, a rare but serious condition. Limit to occasional, moderate drinking.\n\n🧀 **Tyramine-rich foods + MAOIs** — Aged cheeses, cured meats, and fermented foods can cause dangerous blood pressure spikes.";
  },
};

function getClarityResponse(userMessage: string, medNames: string[]): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes("ibuprofen") || lower.includes("advil") || lower.includes("motrin")) {
    return clarityResponses["ibuprofen"](medNames);
  }
  if (lower.includes("side effect")) {
    return clarityResponses["side effects"](medNames);
  }
  if (lower.includes("a1c") || lower.includes("hemoglobin")) {
    return clarityResponses["a1c"](medNames);
  }
  if (lower.includes("skip") || lower.includes("miss")) {
    return clarityResponses["skip"](medNames);
  }
  if (lower.includes("vitamin") || lower.includes("supplement")) {
    return clarityResponses["vitamins"](medNames);
  }
  if (lower.includes("food") || lower.includes("eat") || lower.includes("interact") || lower.includes("grapefruit")) {
    return clarityResponses["food"](medNames);
  }

  return `That's a great question. Based on your current medications (${medNames.join(", ")}), here's what I'd recommend:\n\nThis is something worth discussing with your doctor or pharmacist, as they can give you advice tailored to your specific health situation.\n\nIn the meantime, here are some general guidelines:\n• Always take your medications as prescribed\n• Keep track of any new symptoms\n• Don't make changes without consulting your healthcare provider\n\nWould you like to know more about any of your specific medications?`;
}

export async function getChatMessages(userId: number = 1): Promise<ChatMessage[]> {
  const { data } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  return data || [];
}

export async function sendChatMessage(content: string): Promise<{ userMsg: ChatMessage; assistantMsg: ChatMessage }> {
  const now = new Date().toISOString();

  const { data: userMsg, error: userErr } = await supabase
    .from("chat_messages")
    .insert({
      user_id: 1,
      role: "user",
      content,
      feedback: null,
      created_at: now,
    } satisfies InsertChatMessage)
    .select()
    .single();
  if (userErr) throw userErr;

  const meds = await getMedications();
  const medNames = meds.filter(m => m.status === "active").map(m => m.name);

  const responseText = getClarityResponse(content, medNames);
  const disclaimer = "\n\n---\n*This is general health information. Always check with your doctor for decisions specific to your situation.*";

  const { data: assistantMsg, error: assistantErr } = await supabase
    .from("chat_messages")
    .insert({
      user_id: 1,
      role: "assistant",
      content: responseText + disclaimer,
      feedback: null,
      created_at: new Date().toISOString(),
    } satisfies InsertChatMessage)
    .select()
    .single();
  if (assistantErr) throw assistantErr;

  return { userMsg: userMsg!, assistantMsg: assistantMsg! };
}

export async function updateChatFeedback(id: number, feedback: string): Promise<void> {
  await supabase.from("chat_messages").update({ feedback }).eq("id", id);
}

export async function clearChat(userId: number = 1): Promise<void> {
  await supabase.from("chat_messages").delete().eq("user_id", userId);
}

// === Family ===

export async function getFamilyMembers(): Promise<FamilyMember[]> {
  const { data } = await supabase.from("family_members").select("*");
  return data || [];
}

export async function getFamilyMember(id: number): Promise<FamilyMember | null> {
  const { data } = await supabase.from("family_members").select("*").eq("id", id).single();
  return data;
}

export async function createFamilyMember(member: InsertFamilyMember): Promise<FamilyMember> {
  const { data, error } = await supabase.from("family_members").insert(member).select().single();
  if (error) throw error;
  return data!;
}

export async function updateFamilyMember(id: number, updates: Partial<InsertFamilyMember>): Promise<FamilyMember | null> {
  const { data, error } = await supabase.from("family_members").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteFamilyMember(id: number): Promise<void> {
  await supabase.from("family_members").delete().eq("id", id);
}

export async function getFamilyMedications(familyMemberId: number): Promise<FamilyMedication[]> {
  const { data } = await supabase
    .from("family_medications")
    .select("*")
    .eq("family_member_id", familyMemberId);
  return data || [];
}

export async function createFamilyMedication(med: InsertFamilyMedication): Promise<FamilyMedication> {
  const { data, error } = await supabase.from("family_medications").insert(med).select().single();
  if (error) throw error;
  return data!;
}

export async function getNudges(familyMemberId: number): Promise<Nudge[]> {
  const { data } = await supabase
    .from("nudges")
    .select("*")
    .eq("family_member_id", familyMemberId)
    .order("sent_at", { ascending: false });
  return data || [];
}

export async function createNudge(nudge: InsertNudge): Promise<Nudge> {
  const { data, error } = await supabase.from("nudges").insert(nudge).select().single();
  if (error) throw error;
  return data!;
}

// === Health Tips ===

export async function getHealthTips(): Promise<HealthTip[]> {
  const { data } = await supabase.from("health_tips").select("*");
  return data || [];
}

// === Drug Interactions (simulated) ===

export async function checkInteractions(medicationName: string): Promise<{ interactions: Array<{ severity: string; message: string; medication: string }> }> {
  const meds = await getMedications();
  const activeMeds = meds.filter(m => m.status === "active");
  const lower = medicationName.toLowerCase();
  const interactions: Array<{ severity: string; message: string; medication: string }> = [];

  const hasWarfarin = activeMeds.some(m => m.name.toLowerCase().includes("warfarin"));
  const hasLisinopril = activeMeds.some(m => m.name.toLowerCase().includes("lisinopril"));
  const hasMetformin = activeMeds.some(m => m.name.toLowerCase().includes("metformin"));
  const hasStatin = activeMeds.some(m =>
    m.name.toLowerCase().includes("atorvastatin") ||
    m.name.toLowerCase().includes("simvastatin") ||
    m.name.toLowerCase().includes("rosuvastatin")
  );

  if ((lower.includes("ibuprofen") || lower.includes("aspirin") || lower.includes("naproxen")) && hasWarfarin) {
    interactions.push({
      severity: "severe",
      message: "NSAIDs significantly increase bleeding risk with Warfarin. This combination should generally be avoided.",
      medication: "Warfarin",
    });
  }

  if ((lower.includes("ibuprofen") || lower.includes("naproxen")) && hasLisinopril) {
    interactions.push({
      severity: "moderate",
      message: "NSAIDs can reduce the blood pressure-lowering effect of Lisinopril and may affect kidney function.",
      medication: "Lisinopril",
    });
  }

  if (lower.includes("alcohol") && hasMetformin) {
    interactions.push({
      severity: "moderate",
      message: "Alcohol with Metformin increases the risk of lactic acidosis, a rare but serious condition.",
      medication: "Metformin",
    });
  }

  if (lower.includes("grapefruit") && hasStatin) {
    interactions.push({
      severity: "moderate",
      message: "Grapefruit can increase statin levels in your blood, raising the risk of side effects like muscle pain.",
      medication: activeMeds.find(m => m.name.toLowerCase().includes("statin"))?.name || "Statin",
    });
  }

  return { interactions };
}
