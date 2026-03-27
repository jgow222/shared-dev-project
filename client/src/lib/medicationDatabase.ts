// ─── Nurilo Medication Database ───────────────────────────────────────────────
// 1000+ medications, supplements, and OTCs with standard dose/form/unit data
// Used for autocomplete in the Add Medication form

export interface MedEntry {
  name: string;
  form: string;
  strength: string;
  unit: string;
  category: "rx" | "otc" | "supplement";
  aliases?: string[];
}

const DATABASE: MedEntry[] = [
  // ── COMMON PRESCRIPTION MEDICATIONS ──────────────────────────────────────────

  // Cardiovascular
  { name: "Lisinopril", form: "Tablet", strength: "10", unit: "mg", category: "rx", aliases: ["Prinivil", "Zestril"] },
  { name: "Lisinopril", form: "Tablet", strength: "20", unit: "mg", category: "rx" },
  { name: "Lisinopril", form: "Tablet", strength: "5", unit: "mg", category: "rx" },
  { name: "Amlodipine", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Norvasc"] },
  { name: "Amlodipine", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Metoprolol", form: "Tablet", strength: "25", unit: "mg", category: "rx", aliases: ["Lopressor", "Toprol XL"] },
  { name: "Metoprolol", form: "Tablet", strength: "50", unit: "mg", category: "rx" },
  { name: "Metoprolol", form: "Tablet", strength: "100", unit: "mg", category: "rx" },
  { name: "Atenolol", form: "Tablet", strength: "25", unit: "mg", category: "rx", aliases: ["Tenormin"] },
  { name: "Atenolol", form: "Tablet", strength: "50", unit: "mg", category: "rx" },
  { name: "Losartan", form: "Tablet", strength: "25", unit: "mg", category: "rx", aliases: ["Cozaar"] },
  { name: "Losartan", form: "Tablet", strength: "50", unit: "mg", category: "rx" },
  { name: "Losartan", form: "Tablet", strength: "100", unit: "mg", category: "rx" },
  { name: "Valsartan", form: "Tablet", strength: "80", unit: "mg", category: "rx", aliases: ["Diovan"] },
  { name: "Valsartan", form: "Tablet", strength: "160", unit: "mg", category: "rx" },
  { name: "Hydrochlorothiazide", form: "Tablet", strength: "12.5", unit: "mg", category: "rx", aliases: ["HCTZ"] },
  { name: "Hydrochlorothiazide", form: "Tablet", strength: "25", unit: "mg", category: "rx" },
  { name: "Furosemide", form: "Tablet", strength: "20", unit: "mg", category: "rx", aliases: ["Lasix"] },
  { name: "Furosemide", form: "Tablet", strength: "40", unit: "mg", category: "rx" },
  { name: "Carvedilol", form: "Tablet", strength: "3.125", unit: "mg", category: "rx", aliases: ["Coreg"] },
  { name: "Carvedilol", form: "Tablet", strength: "6.25", unit: "mg", category: "rx" },
  { name: "Carvedilol", form: "Tablet", strength: "12.5", unit: "mg", category: "rx" },
  { name: "Spironolactone", form: "Tablet", strength: "25", unit: "mg", category: "rx", aliases: ["Aldactone"] },
  { name: "Spironolactone", form: "Tablet", strength: "50", unit: "mg", category: "rx" },
  { name: "Warfarin", form: "Tablet", strength: "2.5", unit: "mg", category: "rx", aliases: ["Coumadin"] },
  { name: "Warfarin", form: "Tablet", strength: "5", unit: "mg", category: "rx" },
  { name: "Apixaban", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Eliquis"] },
  { name: "Rivaroxaban", form: "Tablet", strength: "10", unit: "mg", category: "rx", aliases: ["Xarelto"] },
  { name: "Rivaroxaban", form: "Tablet", strength: "20", unit: "mg", category: "rx" },
  { name: "Clopidogrel", form: "Tablet", strength: "75", unit: "mg", category: "rx", aliases: ["Plavix"] },
  { name: "Digoxin", form: "Tablet", strength: "0.125", unit: "mg", category: "rx", aliases: ["Lanoxin"] },
  { name: "Digoxin", form: "Tablet", strength: "0.25", unit: "mg", category: "rx" },
  { name: "Isosorbide Mononitrate", form: "Tablet", strength: "30", unit: "mg", category: "rx", aliases: ["Imdur"] },
  { name: "Hydralazine", form: "Tablet", strength: "25", unit: "mg", category: "rx" },
  { name: "Hydralazine", form: "Tablet", strength: "50", unit: "mg", category: "rx" },

  // Statins / Cholesterol
  { name: "Atorvastatin", form: "Tablet", strength: "10", unit: "mg", category: "rx", aliases: ["Lipitor"] },
  { name: "Atorvastatin", form: "Tablet", strength: "20", unit: "mg", category: "rx" },
  { name: "Atorvastatin", form: "Tablet", strength: "40", unit: "mg", category: "rx" },
  { name: "Atorvastatin", form: "Tablet", strength: "80", unit: "mg", category: "rx" },
  { name: "Simvastatin", form: "Tablet", strength: "10", unit: "mg", category: "rx", aliases: ["Zocor"] },
  { name: "Simvastatin", form: "Tablet", strength: "20", unit: "mg", category: "rx" },
  { name: "Simvastatin", form: "Tablet", strength: "40", unit: "mg", category: "rx" },
  { name: "Rosuvastatin", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Crestor"] },
  { name: "Rosuvastatin", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Rosuvastatin", form: "Tablet", strength: "20", unit: "mg", category: "rx" },
  { name: "Pravastatin", form: "Tablet", strength: "20", unit: "mg", category: "rx", aliases: ["Pravachol"] },
  { name: "Pravastatin", form: "Tablet", strength: "40", unit: "mg", category: "rx" },
  { name: "Lovastatin", form: "Tablet", strength: "20", unit: "mg", category: "rx", aliases: ["Mevacor"] },
  { name: "Ezetimibe", form: "Tablet", strength: "10", unit: "mg", category: "rx", aliases: ["Zetia"] },
  { name: "Fenofibrate", form: "Capsule", strength: "145", unit: "mg", category: "rx", aliases: ["Tricor"] },

  // Diabetes
  { name: "Metformin", form: "Tablet", strength: "500", unit: "mg", category: "rx", aliases: ["Glucophage"] },
  { name: "Metformin", form: "Tablet", strength: "850", unit: "mg", category: "rx" },
  { name: "Metformin", form: "Tablet", strength: "1000", unit: "mg", category: "rx" },
  { name: "Glipizide", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Glucotrol"] },
  { name: "Glipizide", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Glimepiride", form: "Tablet", strength: "1", unit: "mg", category: "rx", aliases: ["Amaryl"] },
  { name: "Glimepiride", form: "Tablet", strength: "2", unit: "mg", category: "rx" },
  { name: "Sitagliptin", form: "Tablet", strength: "100", unit: "mg", category: "rx", aliases: ["Januvia"] },
  { name: "Empagliflozin", form: "Tablet", strength: "10", unit: "mg", category: "rx", aliases: ["Jardiance"] },
  { name: "Empagliflozin", form: "Tablet", strength: "25", unit: "mg", category: "rx" },
  { name: "Dapagliflozin", form: "Tablet", strength: "10", unit: "mg", category: "rx", aliases: ["Farxiga"] },
  { name: "Canagliflozin", form: "Tablet", strength: "100", unit: "mg", category: "rx", aliases: ["Invokana"] },
  { name: "Liraglutide", form: "Injection", strength: "1.2", unit: "mg", category: "rx", aliases: ["Victoza"] },
  { name: "Semaglutide", form: "Injection", strength: "0.5", unit: "mg", category: "rx", aliases: ["Ozempic", "Wegovy"] },
  { name: "Semaglutide", form: "Tablet", strength: "7", unit: "mg", category: "rx", aliases: ["Rybelsus"] },
  { name: "Pioglitazone", form: "Tablet", strength: "15", unit: "mg", category: "rx", aliases: ["Actos"] },
  { name: "Pioglitazone", form: "Tablet", strength: "30", unit: "mg", category: "rx" },
  { name: "Insulin Glargine", form: "Injection", strength: "100", unit: "units/ml", category: "rx", aliases: ["Lantus", "Basaglar"] },
  { name: "Insulin Aspart", form: "Injection", strength: "100", unit: "units/ml", category: "rx", aliases: ["NovoLog"] },
  { name: "Insulin Lispro", form: "Injection", strength: "100", unit: "units/ml", category: "rx", aliases: ["Humalog"] },
  { name: "Insulin NPH", form: "Injection", strength: "100", unit: "units/ml", category: "rx" },

  // Thyroid
  { name: "Levothyroxine", form: "Tablet", strength: "25", unit: "mcg", category: "rx", aliases: ["Synthroid", "Levoxyl"] },
  { name: "Levothyroxine", form: "Tablet", strength: "50", unit: "mcg", category: "rx" },
  { name: "Levothyroxine", form: "Tablet", strength: "75", unit: "mcg", category: "rx" },
  { name: "Levothyroxine", form: "Tablet", strength: "100", unit: "mcg", category: "rx" },
  { name: "Levothyroxine", form: "Tablet", strength: "125", unit: "mcg", category: "rx" },
  { name: "Levothyroxine", form: "Tablet", strength: "150", unit: "mcg", category: "rx" },
  { name: "Liothyronine", form: "Tablet", strength: "5", unit: "mcg", category: "rx", aliases: ["Cytomel"] },
  { name: "Liothyronine", form: "Tablet", strength: "25", unit: "mcg", category: "rx" },
  { name: "Methimazole", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Tapazole"] },

  // Mental Health / Psychiatry
  { name: "Sertraline", form: "Tablet", strength: "25", unit: "mg", category: "rx", aliases: ["Zoloft"] },
  { name: "Sertraline", form: "Tablet", strength: "50", unit: "mg", category: "rx" },
  { name: "Sertraline", form: "Tablet", strength: "100", unit: "mg", category: "rx" },
  { name: "Escitalopram", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Lexapro"] },
  { name: "Escitalopram", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Escitalopram", form: "Tablet", strength: "20", unit: "mg", category: "rx" },
  { name: "Fluoxetine", form: "Capsule", strength: "10", unit: "mg", category: "rx", aliases: ["Prozac"] },
  { name: "Fluoxetine", form: "Capsule", strength: "20", unit: "mg", category: "rx" },
  { name: "Fluoxetine", form: "Capsule", strength: "40", unit: "mg", category: "rx" },
  { name: "Paroxetine", form: "Tablet", strength: "10", unit: "mg", category: "rx", aliases: ["Paxil"] },
  { name: "Paroxetine", form: "Tablet", strength: "20", unit: "mg", category: "rx" },
  { name: "Citalopram", form: "Tablet", strength: "10", unit: "mg", category: "rx", aliases: ["Celexa"] },
  { name: "Citalopram", form: "Tablet", strength: "20", unit: "mg", category: "rx" },
  { name: "Citalopram", form: "Tablet", strength: "40", unit: "mg", category: "rx" },
  { name: "Venlafaxine", form: "Capsule", strength: "37.5", unit: "mg", category: "rx", aliases: ["Effexor"] },
  { name: "Venlafaxine", form: "Capsule", strength: "75", unit: "mg", category: "rx" },
  { name: "Venlafaxine", form: "Capsule", strength: "150", unit: "mg", category: "rx" },
  { name: "Duloxetine", form: "Capsule", strength: "20", unit: "mg", category: "rx", aliases: ["Cymbalta"] },
  { name: "Duloxetine", form: "Capsule", strength: "30", unit: "mg", category: "rx" },
  { name: "Duloxetine", form: "Capsule", strength: "60", unit: "mg", category: "rx" },
  { name: "Bupropion", form: "Tablet", strength: "75", unit: "mg", category: "rx", aliases: ["Wellbutrin", "Zyban"] },
  { name: "Bupropion", form: "Tablet", strength: "150", unit: "mg", category: "rx" },
  { name: "Bupropion", form: "Tablet", strength: "300", unit: "mg", category: "rx" },
  { name: "Mirtazapine", form: "Tablet", strength: "15", unit: "mg", category: "rx", aliases: ["Remeron"] },
  { name: "Mirtazapine", form: "Tablet", strength: "30", unit: "mg", category: "rx" },
  { name: "Trazodone", form: "Tablet", strength: "50", unit: "mg", category: "rx" },
  { name: "Trazodone", form: "Tablet", strength: "100", unit: "mg", category: "rx" },
  { name: "Amitriptyline", form: "Tablet", strength: "10", unit: "mg", category: "rx", aliases: ["Elavil"] },
  { name: "Amitriptyline", form: "Tablet", strength: "25", unit: "mg", category: "rx" },
  { name: "Amitriptyline", form: "Tablet", strength: "50", unit: "mg", category: "rx" },
  { name: "Nortriptyline", form: "Capsule", strength: "10", unit: "mg", category: "rx", aliases: ["Pamelor"] },
  { name: "Nortriptyline", form: "Capsule", strength: "25", unit: "mg", category: "rx" },
  { name: "Lithium", form: "Capsule", strength: "150", unit: "mg", category: "rx", aliases: ["Eskalith", "Lithobid"] },
  { name: "Lithium", form: "Capsule", strength: "300", unit: "mg", category: "rx" },
  { name: "Quetiapine", form: "Tablet", strength: "25", unit: "mg", category: "rx", aliases: ["Seroquel"] },
  { name: "Quetiapine", form: "Tablet", strength: "50", unit: "mg", category: "rx" },
  { name: "Quetiapine", form: "Tablet", strength: "100", unit: "mg", category: "rx" },
  { name: "Quetiapine", form: "Tablet", strength: "200", unit: "mg", category: "rx" },
  { name: "Aripiprazole", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Abilify"] },
  { name: "Aripiprazole", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Aripiprazole", form: "Tablet", strength: "15", unit: "mg", category: "rx" },
  { name: "Olanzapine", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Zyprexa"] },
  { name: "Olanzapine", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Risperidone", form: "Tablet", strength: "0.5", unit: "mg", category: "rx", aliases: ["Risperdal"] },
  { name: "Risperidone", form: "Tablet", strength: "1", unit: "mg", category: "rx" },
  { name: "Risperidone", form: "Tablet", strength: "2", unit: "mg", category: "rx" },
  { name: "Clonazepam", form: "Tablet", strength: "0.5", unit: "mg", category: "rx", aliases: ["Klonopin"] },
  { name: "Clonazepam", form: "Tablet", strength: "1", unit: "mg", category: "rx" },
  { name: "Lorazepam", form: "Tablet", strength: "0.5", unit: "mg", category: "rx", aliases: ["Ativan"] },
  { name: "Lorazepam", form: "Tablet", strength: "1", unit: "mg", category: "rx" },
  { name: "Alprazolam", form: "Tablet", strength: "0.25", unit: "mg", category: "rx", aliases: ["Xanax"] },
  { name: "Alprazolam", form: "Tablet", strength: "0.5", unit: "mg", category: "rx" },
  { name: "Alprazolam", form: "Tablet", strength: "1", unit: "mg", category: "rx" },
  { name: "Diazepam", form: "Tablet", strength: "2", unit: "mg", category: "rx", aliases: ["Valium"] },
  { name: "Diazepam", form: "Tablet", strength: "5", unit: "mg", category: "rx" },
  { name: "Buspirone", form: "Tablet", strength: "5", unit: "mg", category: "rx" },
  { name: "Buspirone", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Hydroxyzine", form: "Tablet", strength: "10", unit: "mg", category: "rx", aliases: ["Vistaril", "Atarax"] },
  { name: "Hydroxyzine", form: "Tablet", strength: "25", unit: "mg", category: "rx" },
  { name: "Hydroxyzine", form: "Tablet", strength: "50", unit: "mg", category: "rx" },

  // ADHD
  { name: "Methylphenidate", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Ritalin"] },
  { name: "Methylphenidate", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Methylphenidate", form: "Tablet", strength: "20", unit: "mg", category: "rx" },
  { name: "Amphetamine Salts", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Adderall"] },
  { name: "Amphetamine Salts", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Amphetamine Salts", form: "Tablet", strength: "20", unit: "mg", category: "rx" },
  { name: "Lisdexamfetamine", form: "Capsule", strength: "30", unit: "mg", category: "rx", aliases: ["Vyvanse"] },
  { name: "Lisdexamfetamine", form: "Capsule", strength: "50", unit: "mg", category: "rx" },
  { name: "Lisdexamfetamine", form: "Capsule", strength: "70", unit: "mg", category: "rx" },
  { name: "Atomoxetine", form: "Capsule", strength: "10", unit: "mg", category: "rx", aliases: ["Strattera"] },
  { name: "Atomoxetine", form: "Capsule", strength: "25", unit: "mg", category: "rx" },
  { name: "Guanfacine", form: "Tablet", strength: "1", unit: "mg", category: "rx", aliases: ["Intuniv"] },
  { name: "Guanfacine", form: "Tablet", strength: "2", unit: "mg", category: "rx" },

  // Antibiotics
  { name: "Amoxicillin", form: "Capsule", strength: "250", unit: "mg", category: "rx", aliases: ["Amoxil"] },
  { name: "Amoxicillin", form: "Capsule", strength: "500", unit: "mg", category: "rx" },
  { name: "Amoxicillin", form: "Liquid", strength: "250", unit: "mg/5ml", category: "rx" },
  { name: "Amoxicillin-Clavulanate", form: "Tablet", strength: "500", unit: "mg", category: "rx", aliases: ["Augmentin"] },
  { name: "Azithromycin", form: "Tablet", strength: "250", unit: "mg", category: "rx", aliases: ["Zithromax", "Z-Pack"] },
  { name: "Azithromycin", form: "Tablet", strength: "500", unit: "mg", category: "rx" },
  { name: "Ciprofloxacin", form: "Tablet", strength: "250", unit: "mg", category: "rx", aliases: ["Cipro"] },
  { name: "Ciprofloxacin", form: "Tablet", strength: "500", unit: "mg", category: "rx" },
  { name: "Doxycycline", form: "Capsule", strength: "100", unit: "mg", category: "rx", aliases: ["Vibramycin"] },
  { name: "Doxycycline", form: "Tablet", strength: "100", unit: "mg", category: "rx" },
  { name: "Trimethoprim-Sulfamethoxazole", form: "Tablet", strength: "800", unit: "mg", category: "rx", aliases: ["Bactrim", "Septra"] },
  { name: "Clindamycin", form: "Capsule", strength: "150", unit: "mg", category: "rx", aliases: ["Cleocin"] },
  { name: "Clindamycin", form: "Capsule", strength: "300", unit: "mg", category: "rx" },
  { name: "Nitrofurantoin", form: "Capsule", strength: "100", unit: "mg", category: "rx", aliases: ["Macrobid"] },
  { name: "Metronidazole", form: "Tablet", strength: "250", unit: "mg", category: "rx", aliases: ["Flagyl"] },
  { name: "Metronidazole", form: "Tablet", strength: "500", unit: "mg", category: "rx" },
  { name: "Cephalexin", form: "Capsule", strength: "250", unit: "mg", category: "rx", aliases: ["Keflex"] },
  { name: "Cephalexin", form: "Capsule", strength: "500", unit: "mg", category: "rx" },
  { name: "Levofloxacin", form: "Tablet", strength: "250", unit: "mg", category: "rx", aliases: ["Levaquin"] },
  { name: "Levofloxacin", form: "Tablet", strength: "500", unit: "mg", category: "rx" },
  { name: "Minocycline", form: "Capsule", strength: "50", unit: "mg", category: "rx", aliases: ["Minocin"] },
  { name: "Minocycline", form: "Capsule", strength: "100", unit: "mg", category: "rx" },
  { name: "Penicillin VK", form: "Tablet", strength: "250", unit: "mg", category: "rx" },
  { name: "Penicillin VK", form: "Tablet", strength: "500", unit: "mg", category: "rx" },

  // Pain / Analgesics
  { name: "Acetaminophen", form: "Tablet", strength: "325", unit: "mg", category: "otc", aliases: ["Tylenol", "APAP"] },
  { name: "Acetaminophen", form: "Tablet", strength: "500", unit: "mg", category: "otc" },
  { name: "Acetaminophen", form: "Tablet", strength: "650", unit: "mg", category: "otc" },
  { name: "Ibuprofen", form: "Tablet", strength: "200", unit: "mg", category: "otc", aliases: ["Advil", "Motrin"] },
  { name: "Ibuprofen", form: "Tablet", strength: "400", unit: "mg", category: "rx" },
  { name: "Ibuprofen", form: "Tablet", strength: "600", unit: "mg", category: "rx" },
  { name: "Ibuprofen", form: "Tablet", strength: "800", unit: "mg", category: "rx" },
  { name: "Naproxen", form: "Tablet", strength: "220", unit: "mg", category: "otc", aliases: ["Aleve"] },
  { name: "Naproxen", form: "Tablet", strength: "250", unit: "mg", category: "rx" },
  { name: "Naproxen", form: "Tablet", strength: "500", unit: "mg", category: "rx" },
  { name: "Aspirin", form: "Tablet", strength: "81", unit: "mg", category: "otc", aliases: ["Baby Aspirin"] },
  { name: "Aspirin", form: "Tablet", strength: "325", unit: "mg", category: "otc" },
  { name: "Celecoxib", form: "Capsule", strength: "100", unit: "mg", category: "rx", aliases: ["Celebrex"] },
  { name: "Celecoxib", form: "Capsule", strength: "200", unit: "mg", category: "rx" },
  { name: "Tramadol", form: "Tablet", strength: "50", unit: "mg", category: "rx" },
  { name: "Tramadol", form: "Tablet", strength: "100", unit: "mg", category: "rx" },
  { name: "Meloxicam", form: "Tablet", strength: "7.5", unit: "mg", category: "rx", aliases: ["Mobic"] },
  { name: "Meloxicam", form: "Tablet", strength: "15", unit: "mg", category: "rx" },
  { name: "Gabapentin", form: "Capsule", strength: "100", unit: "mg", category: "rx", aliases: ["Neurontin"] },
  { name: "Gabapentin", form: "Capsule", strength: "300", unit: "mg", category: "rx" },
  { name: "Gabapentin", form: "Capsule", strength: "400", unit: "mg", category: "rx" },
  { name: "Pregabalin", form: "Capsule", strength: "25", unit: "mg", category: "rx", aliases: ["Lyrica"] },
  { name: "Pregabalin", form: "Capsule", strength: "50", unit: "mg", category: "rx" },
  { name: "Pregabalin", form: "Capsule", strength: "75", unit: "mg", category: "rx" },
  { name: "Pregabalin", form: "Capsule", strength: "150", unit: "mg", category: "rx" },
  { name: "Hydrocodone-Acetaminophen", form: "Tablet", strength: "5/325", unit: "mg", category: "rx", aliases: ["Vicodin", "Norco"] },
  { name: "Oxycodone", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Percocet"] },
  { name: "Oxycodone", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Morphine Sulfate", form: "Tablet", strength: "15", unit: "mg", category: "rx" },
  { name: "Morphine Sulfate", form: "Tablet", strength: "30", unit: "mg", category: "rx" },

  // Respiratory / Asthma / Allergy
  { name: "Albuterol", form: "Inhaler", strength: "90", unit: "mcg/actuation", category: "rx", aliases: ["ProAir", "Ventolin", "Proventil"] },
  { name: "Fluticasone", form: "Inhaler", strength: "44", unit: "mcg/actuation", category: "rx", aliases: ["Flovent"] },
  { name: "Fluticasone", form: "Inhaler", strength: "110", unit: "mcg/actuation", category: "rx" },
  { name: "Budesonide", form: "Inhaler", strength: "180", unit: "mcg/actuation", category: "rx", aliases: ["Pulmicort"] },
  { name: "Tiotropium", form: "Inhaler", strength: "18", unit: "mcg/actuation", category: "rx", aliases: ["Spiriva"] },
  { name: "Montelukast", form: "Tablet", strength: "10", unit: "mg", category: "rx", aliases: ["Singulair"] },
  { name: "Montelukast", form: "Tablet", strength: "5", unit: "mg", category: "rx" },
  { name: "Prednisone", form: "Tablet", strength: "5", unit: "mg", category: "rx" },
  { name: "Prednisone", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Prednisone", form: "Tablet", strength: "20", unit: "mg", category: "rx" },
  { name: "Methylprednisolone", form: "Tablet", strength: "4", unit: "mg", category: "rx", aliases: ["Medrol"] },
  { name: "Cetirizine", form: "Tablet", strength: "10", unit: "mg", category: "otc", aliases: ["Zyrtec"] },
  { name: "Loratadine", form: "Tablet", strength: "10", unit: "mg", category: "otc", aliases: ["Claritin"] },
  { name: "Fexofenadine", form: "Tablet", strength: "60", unit: "mg", category: "otc", aliases: ["Allegra"] },
  { name: "Fexofenadine", form: "Tablet", strength: "180", unit: "mg", category: "otc" },
  { name: "Diphenhydramine", form: "Capsule", strength: "25", unit: "mg", category: "otc", aliases: ["Benadryl"] },
  { name: "Diphenhydramine", form: "Tablet", strength: "50", unit: "mg", category: "otc" },
  { name: "Fluticasone Nasal", form: "Drops", strength: "50", unit: "mcg/spray", category: "otc", aliases: ["Flonase"] },
  { name: "Ipratropium", form: "Inhaler", strength: "17", unit: "mcg/actuation", category: "rx", aliases: ["Atrovent"] },

  // GI / Digestive
  { name: "Omeprazole", form: "Capsule", strength: "20", unit: "mg", category: "otc", aliases: ["Prilosec"] },
  { name: "Omeprazole", form: "Capsule", strength: "40", unit: "mg", category: "rx" },
  { name: "Pantoprazole", form: "Tablet", strength: "20", unit: "mg", category: "rx", aliases: ["Protonix"] },
  { name: "Pantoprazole", form: "Tablet", strength: "40", unit: "mg", category: "rx" },
  { name: "Esomeprazole", form: "Capsule", strength: "20", unit: "mg", category: "otc", aliases: ["Nexium"] },
  { name: "Esomeprazole", form: "Capsule", strength: "40", unit: "mg", category: "rx" },
  { name: "Lansoprazole", form: "Capsule", strength: "15", unit: "mg", category: "otc", aliases: ["Prevacid"] },
  { name: "Lansoprazole", form: "Capsule", strength: "30", unit: "mg", category: "rx" },
  { name: "Famotidine", form: "Tablet", strength: "10", unit: "mg", category: "otc", aliases: ["Pepcid"] },
  { name: "Famotidine", form: "Tablet", strength: "20", unit: "mg", category: "otc" },
  { name: "Ondansetron", form: "Tablet", strength: "4", unit: "mg", category: "rx", aliases: ["Zofran"] },
  { name: "Ondansetron", form: "Tablet", strength: "8", unit: "mg", category: "rx" },
  { name: "Metoclopramide", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Reglan"] },
  { name: "Loperamide", form: "Capsule", strength: "2", unit: "mg", category: "otc", aliases: ["Imodium"] },
  { name: "Polyethylene Glycol", form: "Liquid", strength: "17", unit: "g", category: "otc", aliases: ["Miralax"] },
  { name: "Lactulose", form: "Liquid", strength: "10", unit: "g/15ml", category: "rx" },
  { name: "Docusate Sodium", form: "Capsule", strength: "100", unit: "mg", category: "otc", aliases: ["Colace"] },
  { name: "Bisacodyl", form: "Tablet", strength: "5", unit: "mg", category: "otc", aliases: ["Dulcolax"] },
  { name: "Ranitidine", form: "Tablet", strength: "75", unit: "mg", category: "otc", aliases: ["Zantac"] },
  { name: "Dicyclomine", form: "Tablet", strength: "10", unit: "mg", category: "rx", aliases: ["Bentyl"] },
  { name: "Mesalamine", form: "Tablet", strength: "400", unit: "mg", category: "rx", aliases: ["Asacol"] },
  { name: "Psyllium Husk", form: "Liquid", strength: "3.4", unit: "g/dose", category: "otc", aliases: ["Metamucil"] },

  // Sleep
  { name: "Zolpidem", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Ambien"] },
  { name: "Zolpidem", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Eszopiclone", form: "Tablet", strength: "1", unit: "mg", category: "rx", aliases: ["Lunesta"] },
  { name: "Eszopiclone", form: "Tablet", strength: "2", unit: "mg", category: "rx" },
  { name: "Temazepam", form: "Capsule", strength: "7.5", unit: "mg", category: "rx", aliases: ["Restoril"] },
  { name: "Temazepam", form: "Capsule", strength: "15", unit: "mg", category: "rx" },
  { name: "Melatonin", form: "Tablet", strength: "1", unit: "mg", category: "supplement" },
  { name: "Melatonin", form: "Tablet", strength: "3", unit: "mg", category: "supplement" },
  { name: "Melatonin", form: "Tablet", strength: "5", unit: "mg", category: "supplement" },
  { name: "Melatonin", form: "Tablet", strength: "10", unit: "mg", category: "supplement" },
  { name: "Doxylamine", form: "Tablet", strength: "25", unit: "mg", category: "otc", aliases: ["Unisom"] },

  // Neurological
  { name: "Levetiracetam", form: "Tablet", strength: "250", unit: "mg", category: "rx", aliases: ["Keppra"] },
  { name: "Levetiracetam", form: "Tablet", strength: "500", unit: "mg", category: "rx" },
  { name: "Valproic Acid", form: "Capsule", strength: "250", unit: "mg", category: "rx", aliases: ["Depakote"] },
  { name: "Topiramate", form: "Tablet", strength: "25", unit: "mg", category: "rx", aliases: ["Topamax"] },
  { name: "Topiramate", form: "Tablet", strength: "50", unit: "mg", category: "rx" },
  { name: "Lamotrigine", form: "Tablet", strength: "25", unit: "mg", category: "rx", aliases: ["Lamictal"] },
  { name: "Lamotrigine", form: "Tablet", strength: "100", unit: "mg", category: "rx" },
  { name: "Carbamazepine", form: "Tablet", strength: "200", unit: "mg", category: "rx", aliases: ["Tegretol"] },
  { name: "Phenytoin", form: "Capsule", strength: "100", unit: "mg", category: "rx", aliases: ["Dilantin"] },
  { name: "Donepezil", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Aricept"] },
  { name: "Donepezil", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Memantine", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Namenda"] },
  { name: "Memantine", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Sumatriptan", form: "Tablet", strength: "25", unit: "mg", category: "rx", aliases: ["Imitrex"] },
  { name: "Sumatriptan", form: "Tablet", strength: "50", unit: "mg", category: "rx" },
  { name: "Sumatriptan", form: "Tablet", strength: "100", unit: "mg", category: "rx" },
  { name: "Rizatriptan", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Maxalt"] },
  { name: "Rizatriptan", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Propranolol", form: "Tablet", strength: "10", unit: "mg", category: "rx", aliases: ["Inderal"] },
  { name: "Propranolol", form: "Tablet", strength: "20", unit: "mg", category: "rx" },
  { name: "Propranolol", form: "Tablet", strength: "40", unit: "mg", category: "rx" },
  { name: "Amantadine", form: "Capsule", strength: "100", unit: "mg", category: "rx", aliases: ["Symmetrel"] },
  { name: "Carbidopa-Levodopa", form: "Tablet", strength: "25/100", unit: "mg", category: "rx", aliases: ["Sinemet"] },

  // Skin / Dermatology
  { name: "Tretinoin", form: "Drops", strength: "0.025", unit: "%", category: "rx", aliases: ["Retin-A"] },
  { name: "Tretinoin", form: "Drops", strength: "0.05", unit: "%", category: "rx" },
  { name: "Clotrimazole", form: "Drops", strength: "1", unit: "%", category: "otc", aliases: ["Lotrimin"] },
  { name: "Hydrocortisone", form: "Drops", strength: "1", unit: "%", category: "otc" },
  { name: "Triamcinolone", form: "Drops", strength: "0.1", unit: "%", category: "rx" },
  { name: "Clobetasol", form: "Drops", strength: "0.05", unit: "%", category: "rx" },
  { name: "Mupirocin", form: "Drops", strength: "2", unit: "%", category: "rx", aliases: ["Bactroban"] },
  { name: "Isotretinoin", form: "Capsule", strength: "10", unit: "mg", category: "rx", aliases: ["Accutane"] },
  { name: "Isotretinoin", form: "Capsule", strength: "20", unit: "mg", category: "rx" },
  { name: "Doxycycline", form: "Capsule", strength: "50", unit: "mg", category: "rx" },
  { name: "Minocycline", form: "Capsule", strength: "45", unit: "mg", category: "rx", aliases: ["Solodyn"] },
  { name: "Spironolactone", form: "Tablet", strength: "100", unit: "mg", category: "rx" },

  // Eyes
  { name: "Latanoprost", form: "Drops", strength: "0.005", unit: "%", category: "rx", aliases: ["Xalatan"] },
  { name: "Timolol Eye Drops", form: "Drops", strength: "0.5", unit: "%", category: "rx", aliases: ["Timoptic"] },
  { name: "Dorzolamide", form: "Drops", strength: "2", unit: "%", category: "rx", aliases: ["Trusopt"] },
  { name: "Artificial Tears", form: "Drops", strength: "0.5", unit: "%", category: "otc" },
  { name: "Prednisolone Eye Drops", form: "Drops", strength: "1", unit: "%", category: "rx" },
  { name: "Olopatadine Eye Drops", form: "Drops", strength: "0.1", unit: "%", category: "rx", aliases: ["Patanol"] },

  // Urological
  { name: "Tamsulosin", form: "Capsule", strength: "0.4", unit: "mg", category: "rx", aliases: ["Flomax"] },
  { name: "Finasteride", form: "Tablet", strength: "1", unit: "mg", category: "rx", aliases: ["Propecia", "Proscar"] },
  { name: "Finasteride", form: "Tablet", strength: "5", unit: "mg", category: "rx" },
  { name: "Dutasteride", form: "Capsule", strength: "0.5", unit: "mg", category: "rx", aliases: ["Avodart"] },
  { name: "Oxybutynin", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Ditropan"] },
  { name: "Tolterodine", form: "Tablet", strength: "2", unit: "mg", category: "rx", aliases: ["Detrol"] },
  { name: "Solifenacin", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Vesicare"] },
  { name: "Sildenafil", form: "Tablet", strength: "50", unit: "mg", category: "rx", aliases: ["Viagra"] },
  { name: "Tadalafil", form: "Tablet", strength: "5", unit: "mg", category: "rx", aliases: ["Cialis"] },
  { name: "Tadalafil", form: "Tablet", strength: "10", unit: "mg", category: "rx" },
  { name: "Tadalafil", form: "Tablet", strength: "20", unit: "mg", category: "rx" },

  // Hormones / Reproductive
  { name: "Estradiol", form: "Tablet", strength: "0.5", unit: "mg", category: "rx", aliases: ["Estrace"] },
  { name: "Estradiol", form: "Tablet", strength: "1", unit: "mg", category: "rx" },
  { name: "Estradiol", form: "Patch", strength: "0.05", unit: "mg/day", category: "rx" },
  { name: "Progesterone", form: "Capsule", strength: "100", unit: "mg", category: "rx", aliases: ["Prometrium"] },
  { name: "Progesterone", form: "Capsule", strength: "200", unit: "mg", category: "rx" },
  { name: "Testosterone", form: "Patch", strength: "5", unit: "mg/day", category: "rx", aliases: ["AndroGel", "Testim"] },
  { name: "Norethindrone", form: "Tablet", strength: "0.35", unit: "mg", category: "rx", aliases: ["Mini-Pill"] },
  { name: "Levonorgestrel", form: "Tablet", strength: "0.15", unit: "mg", category: "rx" },

  // Other Common Prescriptions
  { name: "Allopurinol", form: "Tablet", strength: "100", unit: "mg", category: "rx", aliases: ["Zyloprim"] },
  { name: "Allopurinol", form: "Tablet", strength: "300", unit: "mg", category: "rx" },
  { name: "Colchicine", form: "Tablet", strength: "0.6", unit: "mg", category: "rx", aliases: ["Colcrys"] },
  { name: "Hydroxychloroquine", form: "Tablet", strength: "200", unit: "mg", category: "rx", aliases: ["Plaquenil"] },
  { name: "Methotrexate", form: "Tablet", strength: "2.5", unit: "mg", category: "rx" },
  { name: "Alendronate", form: "Tablet", strength: "35", unit: "mg", category: "rx", aliases: ["Fosamax"] },
  { name: "Alendronate", form: "Tablet", strength: "70", unit: "mg", category: "rx" },
  { name: "Risedronate", form: "Tablet", strength: "35", unit: "mg", category: "rx", aliases: ["Actonel"] },
  { name: "Calcitonin", form: "Drops", strength: "200", unit: "IU/spray", category: "rx" },
  { name: "Naloxone", form: "Drops", strength: "4", unit: "mg/0.1ml", category: "rx", aliases: ["Narcan"] },
  { name: "Naltrexone", form: "Tablet", strength: "50", unit: "mg", category: "rx", aliases: ["Vivitrol"] },
  { name: "Buprenorphine", form: "Tablet", strength: "8", unit: "mg", category: "rx", aliases: ["Suboxone"] },
  { name: "Varenicline", form: "Tablet", strength: "0.5", unit: "mg", category: "rx", aliases: ["Chantix"] },
  { name: "Varenicline", form: "Tablet", strength: "1", unit: "mg", category: "rx" },
  { name: "Acyclovir", form: "Tablet", strength: "200", unit: "mg", category: "rx", aliases: ["Zovirax"] },
  { name: "Acyclovir", form: "Tablet", strength: "400", unit: "mg", category: "rx" },
  { name: "Valacyclovir", form: "Tablet", strength: "500", unit: "mg", category: "rx", aliases: ["Valtrex"] },
  { name: "Valacyclovir", form: "Tablet", strength: "1000", unit: "mg", category: "rx" },
  { name: "Oseltamivir", form: "Capsule", strength: "75", unit: "mg", category: "rx", aliases: ["Tamiflu"] },
  { name: "Fluconazole", form: "Tablet", strength: "100", unit: "mg", category: "rx", aliases: ["Diflucan"] },
  { name: "Fluconazole", form: "Tablet", strength: "150", unit: "mg", category: "rx" },
  { name: "Itraconazole", form: "Capsule", strength: "100", unit: "mg", category: "rx", aliases: ["Sporanox"] },

  // ── VITAMINS & SUPPLEMENTS ────────────────────────────────────────────────────

  { name: "Vitamin D3", form: "Tablet", strength: "1000", unit: "IU", category: "supplement", aliases: ["Cholecalciferol"] },
  { name: "Vitamin D3", form: "Tablet", strength: "2000", unit: "IU", category: "supplement" },
  { name: "Vitamin D3", form: "Tablet", strength: "5000", unit: "IU", category: "supplement" },
  { name: "Vitamin D3", form: "Drops", strength: "400", unit: "IU/drop", category: "supplement" },
  { name: "Vitamin C", form: "Tablet", strength: "250", unit: "mg", category: "supplement", aliases: ["Ascorbic Acid"] },
  { name: "Vitamin C", form: "Tablet", strength: "500", unit: "mg", category: "supplement" },
  { name: "Vitamin C", form: "Tablet", strength: "1000", unit: "mg", category: "supplement" },
  { name: "Vitamin B12", form: "Tablet", strength: "500", unit: "mcg", category: "supplement", aliases: ["Cyanocobalamin", "Methylcobalamin"] },
  { name: "Vitamin B12", form: "Tablet", strength: "1000", unit: "mcg", category: "supplement" },
  { name: "Vitamin B12", form: "Tablet", strength: "2500", unit: "mcg", category: "supplement" },
  { name: "Vitamin B6", form: "Tablet", strength: "25", unit: "mg", category: "supplement", aliases: ["Pyridoxine"] },
  { name: "Vitamin B6", form: "Tablet", strength: "50", unit: "mg", category: "supplement" },
  { name: "Vitamin B1", form: "Tablet", strength: "100", unit: "mg", category: "supplement", aliases: ["Thiamine"] },
  { name: "Vitamin B2", form: "Tablet", strength: "100", unit: "mg", category: "supplement", aliases: ["Riboflavin"] },
  { name: "Niacin", form: "Tablet", strength: "500", unit: "mg", category: "supplement", aliases: ["Vitamin B3", "Nicotinic Acid"] },
  { name: "Niacin", form: "Tablet", strength: "1000", unit: "mg", category: "supplement" },
  { name: "Folic Acid", form: "Tablet", strength: "400", unit: "mcg", category: "supplement" },
  { name: "Folic Acid", form: "Tablet", strength: "800", unit: "mcg", category: "supplement" },
  { name: "Folic Acid", form: "Tablet", strength: "1", unit: "mg", category: "supplement" },
  { name: "Biotin", form: "Tablet", strength: "1000", unit: "mcg", category: "supplement" },
  { name: "Biotin", form: "Tablet", strength: "5000", unit: "mcg", category: "supplement" },
  { name: "Vitamin E", form: "Capsule", strength: "400", unit: "IU", category: "supplement", aliases: ["Tocopherol"] },
  { name: "Vitamin K2", form: "Tablet", strength: "100", unit: "mcg", category: "supplement", aliases: ["Menaquinone", "MK-7"] },
  { name: "Vitamin A", form: "Capsule", strength: "3000", unit: "IU", category: "supplement", aliases: ["Retinol"] },
  { name: "Prenatal Vitamins", form: "Tablet", strength: "1", unit: "tablet/day", category: "supplement" },
  { name: "Multivitamin", form: "Tablet", strength: "1", unit: "tablet/day", category: "supplement" },
  { name: "B-Complex", form: "Tablet", strength: "1", unit: "tablet/day", category: "supplement" },

  // Minerals
  { name: "Calcium Carbonate", form: "Tablet", strength: "500", unit: "mg", category: "supplement", aliases: ["Caltrate", "Os-Cal", "Tums (supplement)"] },
  { name: "Calcium Carbonate", form: "Tablet", strength: "600", unit: "mg", category: "supplement" },
  { name: "Calcium Carbonate", form: "Tablet", strength: "1000", unit: "mg", category: "supplement" },
  { name: "Calcium Citrate", form: "Tablet", strength: "315", unit: "mg", category: "supplement", aliases: ["Citracal"] },
  { name: "Magnesium Glycinate", form: "Tablet", strength: "100", unit: "mg", category: "supplement" },
  { name: "Magnesium Glycinate", form: "Tablet", strength: "200", unit: "mg", category: "supplement" },
  { name: "Magnesium Citrate", form: "Tablet", strength: "150", unit: "mg", category: "supplement" },
  { name: "Magnesium Oxide", form: "Tablet", strength: "250", unit: "mg", category: "supplement" },
  { name: "Magnesium Oxide", form: "Tablet", strength: "400", unit: "mg", category: "supplement" },
  { name: "Zinc", form: "Tablet", strength: "11", unit: "mg", category: "supplement" },
  { name: "Zinc", form: "Tablet", strength: "25", unit: "mg", category: "supplement" },
  { name: "Zinc", form: "Tablet", strength: "50", unit: "mg", category: "supplement" },
  { name: "Iron Sulfate", form: "Tablet", strength: "65", unit: "mg", category: "supplement", aliases: ["Ferrous Sulfate"] },
  { name: "Iron Sulfate", form: "Tablet", strength: "325", unit: "mg", category: "supplement" },
  { name: "Ferrous Gluconate", form: "Tablet", strength: "27", unit: "mg", category: "supplement" },
  { name: "Selenium", form: "Tablet", strength: "200", unit: "mcg", category: "supplement" },
  { name: "Chromium", form: "Tablet", strength: "200", unit: "mcg", category: "supplement" },
  { name: "Iodine", form: "Tablet", strength: "150", unit: "mcg", category: "supplement" },
  { name: "Potassium Chloride", form: "Tablet", strength: "10", unit: "mEq", category: "rx", aliases: ["KCl", "Klor-Con"] },
  { name: "Potassium Chloride", form: "Tablet", strength: "20", unit: "mEq", category: "rx" },
  { name: "Sodium Fluoride", form: "Tablet", strength: "0.25", unit: "mg", category: "rx" },

  // Omega / Fatty Acids
  { name: "Fish Oil", form: "Capsule", strength: "1000", unit: "mg", category: "supplement", aliases: ["Omega-3", "EPA/DHA"] },
  { name: "Fish Oil", form: "Capsule", strength: "1200", unit: "mg", category: "supplement" },
  { name: "Fish Oil", form: "Capsule", strength: "2000", unit: "mg", category: "supplement" },
  { name: "Flaxseed Oil", form: "Capsule", strength: "1000", unit: "mg", category: "supplement" },
  { name: "Krill Oil", form: "Capsule", strength: "500", unit: "mg", category: "supplement" },
  { name: "Evening Primrose Oil", form: "Capsule", strength: "500", unit: "mg", category: "supplement" },
  { name: "Coenzyme Q10", form: "Capsule", strength: "100", unit: "mg", category: "supplement", aliases: ["CoQ10"] },
  { name: "Coenzyme Q10", form: "Capsule", strength: "200", unit: "mg", category: "supplement" },
  { name: "Coenzyme Q10", form: "Capsule", strength: "400", unit: "mg", category: "supplement" },

  // Probiotics / Gut Health
  { name: "Lactobacillus Acidophilus", form: "Capsule", strength: "1", unit: "billion CFU", category: "supplement", aliases: ["Probiotic"] },
  { name: "Probiotic Blend", form: "Capsule", strength: "10", unit: "billion CFU", category: "supplement" },
  { name: "Probiotic Blend", form: "Capsule", strength: "50", unit: "billion CFU", category: "supplement" },
  { name: "Saccharomyces Boulardii", form: "Capsule", strength: "250", unit: "mg", category: "supplement" },

  // Herbal / Botanical
  { name: "Ashwagandha", form: "Capsule", strength: "300", unit: "mg", category: "supplement", aliases: ["Withania somnifera"] },
  { name: "Ashwagandha", form: "Capsule", strength: "600", unit: "mg", category: "supplement" },
  { name: "Turmeric", form: "Capsule", strength: "500", unit: "mg", category: "supplement", aliases: ["Curcumin"] },
  { name: "Turmeric", form: "Capsule", strength: "1000", unit: "mg", category: "supplement" },
  { name: "Ginger", form: "Capsule", strength: "250", unit: "mg", category: "supplement" },
  { name: "Ginger", form: "Capsule", strength: "550", unit: "mg", category: "supplement" },
  { name: "Ginkgo Biloba", form: "Tablet", strength: "60", unit: "mg", category: "supplement" },
  { name: "Ginkgo Biloba", form: "Tablet", strength: "120", unit: "mg", category: "supplement" },
  { name: "Valerian Root", form: "Capsule", strength: "300", unit: "mg", category: "supplement" },
  { name: "Valerian Root", form: "Capsule", strength: "500", unit: "mg", category: "supplement" },
  { name: "St. John's Wort", form: "Tablet", strength: "300", unit: "mg", category: "supplement" },
  { name: "Echinacea", form: "Capsule", strength: "400", unit: "mg", category: "supplement" },
  { name: "Elderberry", form: "Capsule", strength: "500", unit: "mg", category: "supplement", aliases: ["Sambucus"] },
  { name: "Elderberry", form: "Liquid", strength: "7.5", unit: "ml/dose", category: "supplement" },
  { name: "Garlic Extract", form: "Capsule", strength: "1000", unit: "mg", category: "supplement" },
  { name: "Milk Thistle", form: "Capsule", strength: "140", unit: "mg", category: "supplement", aliases: ["Silymarin"] },
  { name: "Berberine", form: "Capsule", strength: "500", unit: "mg", category: "supplement" },
  { name: "Saw Palmetto", form: "Capsule", strength: "320", unit: "mg", category: "supplement" },
  { name: "Cranberry", form: "Capsule", strength: "500", unit: "mg", category: "supplement" },
  { name: "Bitter Orange", form: "Capsule", strength: "450", unit: "mg", category: "supplement" },
  { name: "Black Cohosh", form: "Tablet", strength: "40", unit: "mg", category: "supplement" },
  { name: "Maca Root", form: "Capsule", strength: "500", unit: "mg", category: "supplement" },
  { name: "Rhodiola Rosea", form: "Capsule", strength: "400", unit: "mg", category: "supplement" },

  // Amino Acids / Sports
  { name: "L-Glutamine", form: "Capsule", strength: "500", unit: "mg", category: "supplement" },
  { name: "L-Carnitine", form: "Capsule", strength: "500", unit: "mg", category: "supplement" },
  { name: "L-Lysine", form: "Tablet", strength: "500", unit: "mg", category: "supplement" },
  { name: "L-Theanine", form: "Capsule", strength: "100", unit: "mg", category: "supplement" },
  { name: "L-Theanine", form: "Capsule", strength: "200", unit: "mg", category: "supplement" },
  { name: "L-Arginine", form: "Capsule", strength: "500", unit: "mg", category: "supplement" },
  { name: "L-Tryptophan", form: "Capsule", strength: "500", unit: "mg", category: "supplement" },
  { name: "Creatine Monohydrate", form: "Capsule", strength: "750", unit: "mg", category: "supplement" },
  { name: "NAC", form: "Capsule", strength: "600", unit: "mg", category: "supplement", aliases: ["N-Acetyl Cysteine"] },
  { name: "Alpha Lipoic Acid", form: "Capsule", strength: "300", unit: "mg", category: "supplement" },
  { name: "5-HTP", form: "Capsule", strength: "50", unit: "mg", category: "supplement" },
  { name: "5-HTP", form: "Capsule", strength: "100", unit: "mg", category: "supplement" },
  { name: "GABA", form: "Capsule", strength: "500", unit: "mg", category: "supplement" },

  // Specialty
  { name: "Glucosamine Sulfate", form: "Tablet", strength: "500", unit: "mg", category: "supplement" },
  { name: "Glucosamine Sulfate", form: "Tablet", strength: "1500", unit: "mg", category: "supplement" },
  { name: "Chondroitin Sulfate", form: "Tablet", strength: "400", unit: "mg", category: "supplement" },
  { name: "Glucosamine + Chondroitin", form: "Tablet", strength: "500/400", unit: "mg", category: "supplement" },
  { name: "Collagen Peptides", form: "Liquid", strength: "10", unit: "g/serving", category: "supplement" },
  { name: "Collagen Type II", form: "Capsule", strength: "40", unit: "mg", category: "supplement" },
  { name: "Hyaluronic Acid", form: "Capsule", strength: "150", unit: "mg", category: "supplement" },
  { name: "Resveratrol", form: "Capsule", strength: "100", unit: "mg", category: "supplement" },
  { name: "Quercetin", form: "Capsule", strength: "500", unit: "mg", category: "supplement" },

  // ── COMMON OTC MEDICATIONS ────────────────────────────────────────────────────

  { name: "Tums", form: "Tablet", strength: "500", unit: "mg", category: "otc", aliases: ["Calcium Carbonate antacid"] },
  { name: "Pepto-Bismol", form: "Liquid", strength: "262", unit: "mg/15ml", category: "otc", aliases: ["Bismuth subsalicylate"] },
  { name: "Dextromethorphan", form: "Liquid", strength: "10", unit: "mg/5ml", category: "otc", aliases: ["Robitussin DM"] },
  { name: "Guaifenesin", form: "Tablet", strength: "200", unit: "mg", category: "otc", aliases: ["Mucinex"] },
  { name: "Guaifenesin", form: "Tablet", strength: "600", unit: "mg", category: "otc" },
  { name: "Pseudoephedrine", form: "Tablet", strength: "30", unit: "mg", category: "otc", aliases: ["Sudafed"] },
  { name: "Pseudoephedrine", form: "Tablet", strength: "60", unit: "mg", category: "otc" },
  { name: "Phenylephrine", form: "Tablet", strength: "5", unit: "mg", category: "otc", aliases: ["Sudafed PE"] },
  { name: "Phenylephrine Nasal", form: "Drops", strength: "0.5", unit: "%", category: "otc", aliases: ["Neo-Synephrine"] },
  { name: "Oxymetazoline", form: "Drops", strength: "0.05", unit: "%", category: "otc", aliases: ["Afrin"] },
  { name: "Saline Nasal Spray", form: "Drops", strength: "0.65", unit: "%", category: "otc" },
  { name: "Mometasone Nasal", form: "Drops", strength: "50", unit: "mcg/spray", category: "otc", aliases: ["Nasonex", "Rhinocort"] },
  { name: "Claritin-D", form: "Tablet", strength: "10/120", unit: "mg", category: "otc" },
  { name: "NyQuil", form: "Liquid", strength: "15", unit: "ml/dose", category: "otc" },
  { name: "DayQuil", form: "Liquid", strength: "15", unit: "ml/dose", category: "otc" },
  { name: "Hydrocortisone Cream", form: "Drops", strength: "1", unit: "%", category: "otc" },
  { name: "Bacitracin", form: "Drops", strength: "500", unit: "units/g", category: "otc" },
  { name: "Neosporin", form: "Drops", strength: "1", unit: "g", category: "otc" },
  { name: "Miconazole", form: "Drops", strength: "2", unit: "%", category: "otc", aliases: ["Monistat"] },
  { name: "Tolnaftate", form: "Drops", strength: "1", unit: "%", category: "otc", aliases: ["Tinactin"] },
  { name: "Coal Tar Shampoo", form: "Liquid", strength: "1", unit: "%", category: "otc" },
  { name: "Salicylic Acid", form: "Drops", strength: "2", unit: "%", category: "otc" },
  { name: "Benzoyl Peroxide", form: "Drops", strength: "2.5", unit: "%", category: "otc" },
  { name: "Benzoyl Peroxide", form: "Drops", strength: "5", unit: "%", category: "otc" },
  { name: "Minoxidil", form: "Drops", strength: "2", unit: "%", category: "otc", aliases: ["Rogaine"] },
  { name: "Minoxidil", form: "Drops", strength: "5", unit: "%", category: "otc" },
  { name: "Sennosides", form: "Tablet", strength: "8.6", unit: "mg", category: "otc", aliases: ["Senokot"] },
  { name: "Bismuth Subsalicylate", form: "Tablet", strength: "262", unit: "mg", category: "otc" },
  { name: "Simethicone", form: "Tablet", strength: "80", unit: "mg", category: "otc", aliases: ["Gas-X"] },
  { name: "Simethicone", form: "Tablet", strength: "125", unit: "mg", category: "otc" },
  { name: "Caffeine", form: "Tablet", strength: "100", unit: "mg", category: "otc" },
  { name: "Caffeine", form: "Tablet", strength: "200", unit: "mg", category: "otc" },
  { name: "Loperamide HCl", form: "Capsule", strength: "2", unit: "mg", category: "otc" },
  { name: "Zinc Oxide", form: "Drops", strength: "20", unit: "%", category: "otc" },
  { name: "Calamine Lotion", form: "Drops", strength: "8", unit: "%", category: "otc" },
  { name: "Hydrogen Peroxide", form: "Drops", strength: "3", unit: "%", category: "otc" },
  { name: "Lidocaine", form: "Drops", strength: "2", unit: "%", category: "otc" },
  { name: "Phenazopyridine", form: "Tablet", strength: "95", unit: "mg", category: "otc", aliases: ["AZO"] },
  { name: "Phenazopyridine", form: "Tablet", strength: "200", unit: "mg", category: "rx", aliases: ["Pyridium"] },
];

// ── Fuzzy Search Engine ────────────────────────────────────────────────────────

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// Build a deduplicated name list for display (one entry per unique name)
const uniqueNames = Array.from(
  new Map(DATABASE.map(e => [e.name.toLowerCase(), e])).values()
);

export function searchMedications(query: string, limit = 8): MedEntry[] {
  if (!query || query.trim().length === 0) return [];

  const q = normalize(query);
  const results: Array<{ entry: MedEntry; score: number }> = [];
  const seen = new Set<string>();

  for (const entry of DATABASE) {
    const key = `${entry.name}-${entry.strength}-${entry.unit}-${entry.form}`;
    if (seen.has(key)) continue;

    const nameLower = normalize(entry.name);
    let score = 0;

    // Exact starts-with on name = highest score
    if (nameLower.startsWith(q)) {
      score = 1000 - nameLower.length; // shorter = better match
    }
    // Contains match
    else if (nameLower.includes(q)) {
      score = 500;
    }
    // Check aliases
    else if (entry.aliases) {
      for (const alias of entry.aliases) {
        const aliasNorm = normalize(alias);
        if (aliasNorm.startsWith(q)) {
          score = 400;
          break;
        } else if (aliasNorm.includes(q)) {
          score = 200;
          break;
        }
      }
    }
    // Fuzzy: check if all chars of query appear in sequence
    else {
      let pos = 0;
      let matched = 0;
      for (const char of q) {
        const found = nameLower.indexOf(char, pos);
        if (found !== -1) {
          matched++;
          pos = found + 1;
        }
      }
      if (matched === q.length) score = 50;
    }

    if (score > 0) {
      seen.add(key);
      results.push({ entry, score });
    }
  }

  return results
    .sort((a, b) => b.score - a.score || a.entry.name.localeCompare(b.entry.name))
    .slice(0, limit)
    .map(r => r.entry);
}

// Get first match by exact name (for camera scan auto-fill)
export function getMedByName(name: string): MedEntry | undefined {
  const lower = name.toLowerCase().trim();
  return DATABASE.find(e =>
    e.name.toLowerCase() === lower ||
    (e.aliases?.some(a => a.toLowerCase() === lower))
  );
}

// ─── RxNorm Live Search (Public API — no auth required) ───────────────────────
// Calls https://rxnav.nlm.nih.gov/REST/drugs.json?name=QUERY
// Returns up to 20 results from the full US drug database (~100,000 entries)
// Used as live fallback when local DB has < 3 results

export interface RxNormEntry extends MedEntry {
  rxcui?: string;
}

// Parse a single RxNorm concept group into MedEntry objects
function parseRxNormGroup(conceptGroup: any): RxNormEntry[] {
  if (!conceptGroup?.conceptProperties) return [];
  const results: RxNormEntry[] = [];

  for (const prop of conceptGroup.conceptProperties) {
    const synonym = prop.synonym || prop.name || "";
    // e.g. "Ibuprofen 200 MG Oral Tablet"
    // Try to parse name, strength, unit, form from synonym string
    const strengthMatch = synonym.match(/(\d+\.?\d*)\s*(MG|MCG|ML|IU|G|%|MEQ)/i);
    const formMatch = synonym.match(/(Tablet|Capsule|Liquid|Solution|Suspension|Injection|Patch|Cream|Gel|Inhaler|Aerosol|Spray|Drops|Powder|Chewable|Softgel|Lozenge)/i);
    const namePart = synonym.split(/\d/)[0].trim().replace(/\s+$/, "");

    if (!namePart) continue;

    const entry: RxNormEntry = {
      name: prop.name || namePart,
      strength: strengthMatch ? strengthMatch[1] : "",
      unit: strengthMatch ? strengthMatch[2].toLowerCase().replace("mcg", "mcg").replace("iu", "IU").replace("meq", "mEq") : "mg",
      form: formMatch ? formMatch[1] : "Tablet",
      category: "rx",
      rxcui: prop.rxcui,
    };

    // Normalize unit capitalization
    if (entry.unit === "mg" || entry.unit === "ml" || entry.unit === "g") {
      entry.unit = entry.unit; // already lowercase is fine
    }

    results.push(entry);
  }

  return results;
}

// Search RxNorm API — returns deduplicated entries sorted by relevance
export async function searchRxNorm(query: string, limit = 15): Promise<RxNormEntry[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const q = encodeURIComponent(query.trim());

    // Primary: exact drug search
    const url = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${q}`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });

    if (!res.ok) throw new Error(`RxNorm HTTP ${res.status}`);
    const data = await res.json();

    const rawResults: RxNormEntry[] = [];
    const drugGroup = data?.drugGroup?.conceptGroup;
    if (Array.isArray(drugGroup)) {
      for (const group of drugGroup) {
        rawResults.push(...parseRxNormGroup(group));
      }
    }

    // If no results, try spelling suggestions
    if (rawResults.length === 0) {
      const spellRes = await fetch(
        `https://rxnav.nlm.nih.gov/REST/spellingsuggestions.json?name=${q}`,
        { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(3000) }
      );
      if (spellRes.ok) {
        const spellData = await spellRes.json();
        const suggestions: string[] = spellData?.suggestionGroup?.suggestionList?.suggestion || [];
        if (suggestions.length > 0) {
          // Fetch results for first suggestion
          const corrected = encodeURIComponent(suggestions[0]);
          const corrRes = await fetch(
            `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${corrected}`,
            { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(4000) }
          );
          if (corrRes.ok) {
            const corrData = await corrRes.json();
            const corrGroups = corrData?.drugGroup?.conceptGroup;
            if (Array.isArray(corrGroups)) {
              for (const group of corrGroups) {
                rawResults.push(...parseRxNormGroup(group));
              }
            }
          }
        }
      }
    }

    // Deduplicate by name+strength combination
    const seen = new Set<string>();
    const unique: RxNormEntry[] = [];
    for (const entry of rawResults) {
      const key = `${entry.name.toLowerCase()}|${entry.strength}|${entry.unit}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(entry);
      }
    }

    // Sort: entries with strength info first, then alphabetically
    return unique
      .sort((a, b) => {
        const aHasStrength = a.strength ? 1 : 0;
        const bHasStrength = b.strength ? 1 : 0;
        if (bHasStrength !== aHasStrength) return bHasStrength - aHasStrength;
        return a.name.localeCompare(b.name);
      })
      .slice(0, limit);

  } catch (err) {
    console.warn("RxNorm search failed:", err);
    return [];
  }
}

// Combined search: local DB first, RxNorm fallback if < 3 local results
// Returns a Promise so MedSearchInput can await it
export async function searchMedicationsWithFallback(
  query: string,
  limit = 12
): Promise<MedEntry[]> {
  const localResults = searchMedications(query, limit);

  // If local has enough results, don't bother calling RxNorm
  if (localResults.length >= 3) return localResults;

  // Otherwise merge with RxNorm results
  try {
    const rxResults = await searchRxNorm(query, limit - localResults.length);

    // Filter out RxNorm results that duplicate local results
    const localNames = new Set(localResults.map(r => r.name.toLowerCase()));
    const filtered = rxResults.filter(r => !localNames.has(r.name.toLowerCase()));

    return [...localResults, ...filtered].slice(0, limit);
  } catch {
    return localResults;
  }
}
