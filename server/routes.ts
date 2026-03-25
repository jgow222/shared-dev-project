import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Pre-written Clarity responses keyed by pattern
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
    return "**Common food-medication interactions to know:**\n\n🚫 **Grapefruit** — Interacts with statins (like Atorvastatin), blood pressure meds, and many others. Avoid or ask your pharmacist.\n\n🥬 **Leafy greens + Warfarin** — Vitamin K in spinach, kale, and broccoli affects blood thinners. Keep intake consistent, don't suddenly eat more or less.\n\n🥛 **Dairy + Antibiotics** — Calcium in milk/cheese can block absorption of tetracycline and fluoroquinolone antibiotics. Wait 2 hours.\n\n🍺 **Alcohol + Metformin** — Increases risk of lactic acidosis. Limit to occasional, moderate drinking.\n\n🧀 **Tyramine-rich foods + MAOIs** — Aged cheeses, cured meats, and fermented foods can cause dangerous blood pressure spikes.";
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

  // Generic helpful response
  return `That's a great question. Based on your current medications (${medNames.join(", ")}), here's what I'd recommend:\n\nThis is something worth discussing with your doctor or pharmacist, as they can give you advice tailored to your specific health situation.\n\nIn the meantime, here are some general guidelines:\n• Always take your medications as prescribed\n• Keep track of any new symptoms\n• Don't make changes without consulting your healthcare provider\n\nWould you like to know more about any of your specific medications?`;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Seed database on first run
  await storage.seed();

  // === Profile ===
  app.get("/api/profile", async (_req, res) => {
    const profile = await storage.getProfile();
    res.json(profile || null);
  });

  app.post("/api/profile", async (req, res) => {
    const profile = await storage.createProfile(req.body);
    res.json(profile);
  });

  app.patch("/api/profile/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const profile = await storage.updateProfile(id, req.body);
    res.json(profile);
  });

  // === Medications ===
  app.get("/api/medications", async (_req, res) => {
    const meds = await storage.getMedications();
    res.json(meds);
  });

  app.get("/api/medications/:id", async (req, res) => {
    const med = await storage.getMedication(parseInt(req.params.id));
    if (!med) return res.status(404).json({ error: "Not found" });
    res.json(med);
  });

  app.post("/api/medications", async (req, res) => {
    const med = await storage.createMedication(req.body);
    // Generate today's dose logs for the new medication
    const today = new Date().toISOString().split("T")[0];
    const times: string[] = JSON.parse(med.scheduleTimes);
    for (const time of times) {
      await storage.createDoseLog({
        medicationId: med.id,
        userId: med.userId,
        scheduledTime: time,
        scheduledDate: today,
        status: "pending",
      });
    }
    res.json(med);
  });

  app.patch("/api/medications/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const med = await storage.updateMedication(id, req.body);
    res.json(med);
  });

  app.delete("/api/medications/:id", async (req, res) => {
    await storage.deleteMedication(parseInt(req.params.id));
    res.json({ ok: true });
  });

  // === Dose Logs ===
  app.get("/api/doses/:date", async (req, res) => {
    const logs = await storage.getDoseLogs(req.params.date);
    res.json(logs);
  });

  app.get("/api/doses/medication/:id", async (req, res) => {
    const logs = await storage.getDoseLogsForMed(parseInt(req.params.id));
    res.json(logs);
  });

  app.post("/api/doses", async (req, res) => {
    const log = await storage.createDoseLog(req.body);
    res.json(log);
  });

  app.patch("/api/doses/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const log = await storage.updateDoseLog(id, req.body);
    res.json(log);
  });

  // === Chat / Clarity ===
  app.get("/api/chat", async (_req, res) => {
    const messages = await storage.getChatMessages();
    res.json(messages);
  });

  app.post("/api/chat", async (req, res) => {
    const { content } = req.body;
    const now = new Date().toISOString();

    // Save user message
    const userMsg = await storage.createChatMessage({
      userId: 1,
      role: "user",
      content,
      createdAt: now,
    });

    // Get user's medications for context
    const meds = await storage.getMedications();
    const medNames = meds.filter(m => m.status === "active").map(m => m.name);

    // Generate response
    const responseText = getClarityResponse(content, medNames);
    const disclaimer = "\n\n---\n*This is general health information. Always check with your doctor for decisions specific to your situation.*";

    const assistantMsg = await storage.createChatMessage({
      userId: 1,
      role: "assistant",
      content: responseText + disclaimer,
      createdAt: new Date().toISOString(),
    });

    res.json({ userMsg, assistantMsg });
  });

  app.patch("/api/chat/:id/feedback", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.updateChatFeedback(id, req.body.feedback);
    res.json({ ok: true });
  });

  app.delete("/api/chat", async (_req, res) => {
    await storage.clearChat();
    res.json({ ok: true });
  });

  // === Family ===
  app.get("/api/family", async (_req, res) => {
    const members = await storage.getFamilyMembers();
    res.json(members);
  });

  app.get("/api/family/:id", async (req, res) => {
    const member = await storage.getFamilyMember(parseInt(req.params.id));
    if (!member) return res.status(404).json({ error: "Not found" });
    res.json(member);
  });

  app.post("/api/family", async (req, res) => {
    const member = await storage.createFamilyMember(req.body);
    res.json(member);
  });

  app.patch("/api/family/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const member = await storage.updateFamilyMember(id, req.body);
    res.json(member);
  });

  app.delete("/api/family/:id", async (req, res) => {
    await storage.deleteFamilyMember(parseInt(req.params.id));
    res.json({ ok: true });
  });

  // Family medications
  app.get("/api/family/:id/medications", async (req, res) => {
    const meds = await storage.getFamilyMedications(parseInt(req.params.id));
    res.json(meds);
  });

  app.post("/api/family/:id/medications", async (req, res) => {
    const med = await storage.createFamilyMedication({
      ...req.body,
      familyMemberId: parseInt(req.params.id),
    });
    res.json(med);
  });

  // Nudges
  app.get("/api/family/:id/nudges", async (req, res) => {
    const n = await storage.getNudges(parseInt(req.params.id));
    res.json(n);
  });

  app.post("/api/family/:id/nudges", async (req, res) => {
    const nudge = await storage.createNudge({
      ...req.body,
      familyMemberId: parseInt(req.params.id),
      sentAt: new Date().toISOString(),
    });
    res.json(nudge);
  });

  // === Health Tips ===
  app.get("/api/tips", async (_req, res) => {
    const tips = await storage.getHealthTips();
    res.json(tips);
  });

  // === Drug Interactions (simulated) ===
  app.post("/api/interactions/check", async (req, res) => {
    const { medicationName } = req.body;
    const meds = await storage.getMedications();
    const activeMeds = meds.filter(m => m.status === "active");
    const lower = medicationName.toLowerCase();
    const interactions: Array<{ severity: string; message: string; medication: string }> = [];

    // Check common interactions
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

    res.json({ interactions });
  });

  return httpServer;
}
