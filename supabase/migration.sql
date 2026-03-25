-- Nurilo Database Schema for Supabase
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New query)

-- User profile
CREATE TABLE IF NOT EXISTS user_profile (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  streak_days INTEGER NOT NULL DEFAULT 0,
  last_streak_date TEXT,
  dark_mode INTEGER NOT NULL DEFAULT 0
);

-- Medications
CREATE TABLE IF NOT EXISTS medications (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL,
  dose_strength TEXT NOT NULL,
  dose_unit TEXT NOT NULL DEFAULT 'mg',
  form TEXT NOT NULL DEFAULT 'Tablet',
  purpose TEXT,
  doctor TEXT,
  pharmacy TEXT,
  frequency TEXT NOT NULL DEFAULT 'Once daily',
  schedule_times TEXT NOT NULL DEFAULT '["08:00"]',
  schedule_days TEXT,
  pill_count INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  is_critical INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Dose logs
CREATE TABLE IF NOT EXISTS dose_logs (
  id BIGSERIAL PRIMARY KEY,
  medication_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL DEFAULT 1,
  scheduled_time TEXT NOT NULL,
  scheduled_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  confirmed_at TEXT,
  confirmed_by TEXT
);

-- Chat messages
CREATE TABLE IF NOT EXISTS chat_messages (
  id BIGSERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL DEFAULT 1,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  feedback TEXT,
  created_at TEXT NOT NULL
);

-- Family members
CREATE TABLE IF NOT EXISTS family_members (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  ui_mode TEXT NOT NULL DEFAULT 'standard',
  alert_enabled INTEGER NOT NULL DEFAULT 1,
  alert_delay INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'green'
);

-- Family medications
CREATE TABLE IF NOT EXISTS family_medications (
  id BIGSERIAL PRIMARY KEY,
  family_member_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  dose_strength TEXT NOT NULL,
  dose_unit TEXT NOT NULL DEFAULT 'mg',
  form TEXT NOT NULL DEFAULT 'Tablet',
  schedule_times TEXT NOT NULL DEFAULT '["08:00"]',
  status TEXT NOT NULL DEFAULT 'active'
);

-- Nudges
CREATE TABLE IF NOT EXISTS nudges (
  id BIGSERIAL PRIMARY KEY,
  family_member_id INTEGER NOT NULL,
  message TEXT NOT NULL,
  sent_at TEXT NOT NULL,
  response TEXT
);

-- Health tips
CREATE TABLE IF NOT EXISTS health_tips (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL
);

-- Enable Row Level Security (RLS) but allow all for now
-- You can add proper auth policies later
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE dose_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_tips ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (allow all operations with anon key for now)
CREATE POLICY "Allow all on user_profile" ON user_profile FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on medications" ON medications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on dose_logs" ON dose_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on chat_messages" ON chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on family_members" ON family_members FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on family_medications" ON family_medications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on nudges" ON nudges FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on health_tips" ON health_tips FOR ALL USING (true) WITH CHECK (true);

-- Seed data
INSERT INTO user_profile (name, streak_days, last_streak_date, dark_mode) 
VALUES ('Jordan', 12, CURRENT_DATE::TEXT, 0);

INSERT INTO medications (user_id, name, dose_strength, dose_unit, form, purpose, doctor, pharmacy, frequency, schedule_times, pill_count, status, is_critical, created_at) VALUES
(1, 'Lisinopril', '10', 'mg', 'Tablet', 'Blood pressure', 'Dr. Chen', 'CVS Pharmacy', 'Once daily', '["08:00"]', 24, 'active', 0, CURRENT_DATE::TEXT),
(1, 'Metformin', '500', 'mg', 'Tablet', 'Blood sugar', 'Dr. Patel', 'Walgreens', 'Twice daily', '["08:00","20:00"]', 45, 'active', 0, CURRENT_DATE::TEXT),
(1, 'Vitamin D3', '2000', 'IU', 'Capsule', 'Bone health', NULL, NULL, 'Once daily', '["08:00"]', 60, 'active', 0, CURRENT_DATE::TEXT),
(1, 'Atorvastatin', '20', 'mg', 'Tablet', 'Cholesterol', 'Dr. Chen', 'CVS Pharmacy', 'Once daily', '["21:00"]', 8, 'active', 0, CURRENT_DATE::TEXT);

-- Seed today's dose logs
INSERT INTO dose_logs (medication_id, user_id, scheduled_time, scheduled_date, status, confirmed_at) VALUES
(1, 1, '08:00', CURRENT_DATE::TEXT, 'taken', CURRENT_DATE::TEXT || 'T08:05:00'),
(2, 1, '08:00', CURRENT_DATE::TEXT, 'taken', CURRENT_DATE::TEXT || 'T08:05:00'),
(3, 1, '08:00', CURRENT_DATE::TEXT, 'taken', CURRENT_DATE::TEXT || 'T08:06:00'),
(2, 1, '20:00', CURRENT_DATE::TEXT, 'pending', NULL),
(4, 1, '21:00', CURRENT_DATE::TEXT, 'pending', NULL);

-- Seed family members
INSERT INTO family_members (name, relationship, ui_mode, alert_enabled, alert_delay, status) VALUES
('Mom', 'Parent', 'elder', 1, 60, 'green'),
('Dad', 'Parent', 'elder', 1, 30, 'amber');

-- Seed family medications
INSERT INTO family_medications (family_member_id, name, dose_strength, dose_unit, form, schedule_times, status) VALUES
(1, 'Amlodipine', '5', 'mg', 'Tablet', '["09:00"]', 'active'),
(2, 'Warfarin', '5', 'mg', 'Tablet', '["18:00"]', 'active');

-- Seed health tips
INSERT INTO health_tips (title, content, category) VALUES
('Stay Hydrated', 'Drink a full glass of water when taking your medications. It helps your body absorb them better and reduces the risk of stomach irritation.', 'general'),
('Consistent Timing', 'Taking your medications at the same time each day helps maintain steady levels in your bloodstream, making them more effective.', 'adherence'),
('Food Matters', 'Some medications work best with food, others on an empty stomach. Check with your pharmacist about the best time relative to meals.', 'nutrition'),
('Don''t Double Up', 'If you miss a dose, don''t take two next time. Usually, take it as soon as you remember — unless it''s almost time for your next dose.', 'safety'),
('Storage Counts', 'Store medications in a cool, dry place — not the bathroom cabinet. Heat and humidity can reduce their effectiveness.', 'storage'),
('Grapefruit Alert', 'Grapefruit interacts with many common medications including statins and blood pressure drugs. Ask your pharmacist if it affects yours.', 'nutrition'),
('Track Side Effects', 'Keep a simple log of how you feel after starting a new medication. This helps your doctor make better decisions at your next visit.', 'safety'),
('Refill Early', 'Don''t wait until you run out. Request refills when you have a 7-day supply left to avoid gaps in your treatment.', 'adherence'),
('Move Your Body', 'Even 15 minutes of walking can improve how well your blood pressure and diabetes medications work.', 'lifestyle'),
('Sleep & Meds', 'Some medications can affect your sleep. If you notice changes, talk to your doctor — the timing of your dose might be the fix.', 'lifestyle'),
('Alcohol Awareness', 'Alcohol can interact with many medications, including pain relievers and blood thinners. Even moderate amounts can cause problems.', 'safety'),
('Vitamin K & Warfarin', 'If you take a blood thinner like warfarin, keep your vitamin K intake consistent. Sudden changes in leafy greens can affect your levels.', 'nutrition');
