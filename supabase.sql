-- IMPORTANT: Run scripts/supabase.step1-enum.sql FIRST to create/extend the enum "type".
-- PostgreSQL enums require a commit before new values (e.g., 'SELECT_ALL') can be used.
-- After completing step1, run this file to create tables and seed data.

-- 2) Tables
CREATE TABLE IF NOT EXISTS public.courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_src TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.units (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  course_id INTEGER NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  unit_id INTEGER NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  "order" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.challenges (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  "type" "type" NOT NULL,
  question TEXT NOT NULL,
  "order" INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.challenge_options (
  id SERIAL PRIMARY KEY,
  challenge_id INTEGER NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  image_src TEXT,
  audio_src TEXT
);

CREATE TABLE IF NOT EXISTS public.challenge_progress (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  challenge_id INTEGER NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id TEXT PRIMARY KEY,
  user_name TEXT NOT NULL DEFAULT 'User',
  user_image_src TEXT NOT NULL DEFAULT '/mascot.svg',
  active_course_id INTEGER REFERENCES public.courses(id) ON DELETE CASCADE,
  hearts INTEGER NOT NULL DEFAULT 5,
  points INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  profile_image_src TEXT NOT NULL DEFAULT '/standar.png',
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Store: avatar images for profile
CREATE TABLE IF NOT EXISTS public.store_items (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  image_src TEXT NOT NULL,
  price_points INTEGER NOT NULL DEFAULT 0,
  item_type TEXT NOT NULL DEFAULT 'avatar', -- future extensible
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_purchases (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_id INTEGER NOT NULL REFERENCES public.store_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, item_id)
);

-- Daily login tracking and rewards (30-day cycle)
CREATE TABLE IF NOT EXISTS public.user_daily_login (
  user_id TEXT PRIMARY KEY,
  last_login_date DATE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  total_logins INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.daily_login_rewards (
  day SMALLINT PRIMARY KEY, -- 1..30
  points INTEGER NOT NULL DEFAULT 0,
  item_id INTEGER REFERENCES public.store_items(id)
);

-- 3) Optional helpful indexes (non-breaking)
-- CREATE INDEX IF NOT EXISTS idx_units_course_id ON public.units(course_id);
-- CREATE INDEX IF NOT EXISTS idx_lessons_unit_id ON public.lessons(unit_id);
-- CREATE INDEX IF NOT EXISTS idx_challenges_lesson_id ON public.challenges(lesson_id);
-- CREATE INDEX IF NOT EXISTS idx_challenge_options_challenge_id ON public.challenge_options(challenge_id);
-- CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_id ON public.challenge_progress(user_id);
-- CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge_id ON public.challenge_progress(challenge_id);

-- 4) (Optional) If you want to drop legacy Stripe subscription artifacts, run:
-- DROP TABLE IF EXISTS public.user_subscription CASCADE;
-- DROP TYPE IF EXISTS subscription_status; -- if you had any

-- 5) Seed data --------------------------------------------------------------
-- Courses (5)
INSERT INTO public.courses (id, title, image_src) VALUES
  (1, 'Nun Mati', '/materi/nun.svg'),
  (2, 'Mim Mati', '/materi/mim.svg'),
  (3, 'Lam Ta''rif', '/materi/lam.svg'),
  (4, 'Mad', '/materi/mad.svg'),
  (5, 'Qolqolah', '/materi/qof.svg')
ON CONFLICT (id) DO NOTHING;

-- Units: Idzhar Halqi under Nun Mati
INSERT INTO public.units (id, title, description, course_id, "order") VALUES
  (1, 'Idzhar Halqi', 'Belajar Hukum Idzhar Halqi', 1, 1)
ON CONFLICT (id) DO NOTHING;

-- Lessons (5 paths)
INSERT INTO public.lessons (id, title, unit_id, "order") VALUES
  (1, 'Idzhar Halqi - Path 1', 1, 1),
  (2, 'Idzhar Halqi - Path 2', 1, 2),
  (3, 'Idzhar Halqi - Path 3', 1, 3),
  (4, 'Idzhar Halqi - Path 4', 1, 4),
  (5, 'Idzhar Halqi - Path 5', 1, 5)
ON CONFLICT (id) DO NOTHING;

-- Base challenge pool for Idzhar Halqi
-- Q1 (SELECT_ALL) Penjelasan + interactive 4 buttons
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (1001, 1, 'SELECT_ALL', 'Pilih semua contoh bacaan Idzhar Halqi berikut.', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_options (challenge_id, text, correct, image_src, audio_src) VALUES
  (1001, 'يَنْحِتُونَ', TRUE, NULL, NULL),
  (1001, 'مَنْ خَافَ', TRUE, NULL, NULL),
  (1001, 'مِنْ هَادٍ', TRUE, NULL, NULL),
  (1001, 'أَنْعَمْتَ', TRUE, NULL, NULL)
ON CONFLICT DO NOTHING;

-- Q2 (SELECT_ALL) Huruf Idzhar Halqi (all are correct)
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (1002, 1, 'SELECT_ALL', 'Pilih semua huruf Idzhar Halqi.', 2)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (1002, 'ا', TRUE), (1002, 'هـ', TRUE), (1002, 'ع', TRUE), (1002, 'ح', TRUE), (1002, 'غ', TRUE), (1002, 'خ', TRUE)
ON CONFLICT DO NOTHING;

-- Q3..15 SELECT-type pool with four options each (one correct)
-- 3. Bagaimana cara membaca Idzhar Halqi?
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (1003, 1, 'SELECT', 'Bagaimana cara membaca Idzhar Halqi?', 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (1003, 'Dibaca jelas tanpa dengung', TRUE),
  (1003, 'Dibaca samar', FALSE),
  (1003, 'Dibaca dengan dengung', FALSE),
  (1003, 'Dibaca panjang', FALSE)
ON CONFLICT DO NOTHING;

-- 4. Manakah huruf Idzhar Halqi?
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (1004, 1, 'SELECT', 'Manakah huruf Idzhar Halqi?', 4)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (1004, 'غ', TRUE), (1004, 'م', FALSE), (1004, 'ي', FALSE), (1004, 'ن', FALSE)
ON CONFLICT DO NOTHING;

-- 5. Manakah contoh bacaan Idzhar Halqi?
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (1005, 1, 'SELECT', 'Manakah contoh bacaan Idzhar Halqi?', 5)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (1005, 'مِنْ أَمْرِهِ', TRUE),
  (1005, 'مَنْ يَقُولُ', FALSE),
  (1005, 'مَنْ وَرَائِهِمْ', FALSE),
  (1005, 'مَنْ رَبِّهِمْ', FALSE)
ON CONFLICT DO NOTHING;

-- 6. Huruf berikut yang termasuk huruf Idzhar Halqi adalah…
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (1006, 1, 'SELECT', 'Huruf berikut yang termasuk huruf Idzhar Halqi adalah…', 6)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (1006, 'ا', TRUE), (1006, 'و', FALSE), (1006, 'ب', FALSE), (1006, 'ش', FALSE)
ON CONFLICT DO NOTHING;

-- 7. Kata berikut dibaca dengan hukum Idzhar Halqi…
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (1007, 1, 'SELECT', 'Kata berikut dibaca dengan hukum Idzhar Halqi…', 7)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (1007, 'مَنْ عَمِلَ', TRUE),
  (1007, 'مَنْ يَقُولُ', FALSE),
  (1007, 'مَنْ نَصَرَ', FALSE),
  (1007, 'مَنْ يَرْحَمْ', FALSE)
ON CONFLICT DO NOTHING;

-- 8. Hukum bacaan ‘مِنْ هَادٍ’ adalah…
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (1008, 1, 'SELECT', 'Hukum bacaan ‘مِنْ هَادٍ’ adalah…', 8)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (1008, 'Idzhar Halqi', TRUE), (1008, 'Idgham Bighunnah', FALSE), (1008, 'Ikhfa’', FALSE), (1008, 'Iqlab', FALSE)
ON CONFLICT DO NOTHING;

-- 9. Nun mati pada kata ‘مِنْ خَافَ’ bertemu huruf apa?
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (1009, 1, 'SELECT', 'Nun mati pada kata ‘مِنْ خَافَ’ bertemu huruf apa?', 9)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (1009, 'خ', TRUE), (1009, 'ن', FALSE), (1009, 'م', FALSE), (1009, 'ف', FALSE)
ON CONFLICT DO NOTHING;

-- 10. Huruf yang keluar dari tenggorokan disebut huruf…
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (1010, 1, 'SELECT', 'Huruf yang keluar dari tenggorokan disebut huruf…', 10)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (1010, 'Halqi', TRUE), (1010, 'Syafawi', FALSE), (1010, 'Lisan', FALSE), (1010, 'Halaqiyah', FALSE)
ON CONFLICT DO NOTHING;

-- 11. Berapa jumlah huruf Idzhar Halqi?
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (1011, 1, 'SELECT', 'Berapa jumlah huruf Idzhar Halqi?', 11)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (1011, 'Enam', TRUE), (1011, 'Empat', FALSE), (1011, 'Lima', FALSE), (1011, 'Tujuh', FALSE)
ON CONFLICT DO NOTHING;

-- 12. Huruf Idzhar Halqi pertama adalah…
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (1012, 1, 'SELECT', 'Huruf Idzhar Halqi pertama adalah…', 12)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (1012, 'ا', TRUE), (1012, 'غ', FALSE), (1012, 'ح', FALSE), (1012, 'هـ', FALSE)
ON CONFLICT DO NOTHING;

-- 13. Huruf Idzhar Halqi terakhir adalah…
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (1013, 1, 'SELECT', 'Huruf Idzhar Halqi terakhir adalah…', 13)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (1013, 'خ', TRUE), (1013, 'غ', FALSE), (1013, 'ح', FALSE), (1013, 'ع', FALSE)
ON CONFLICT DO NOTHING;

-- 14. Jika nun mati bertemu huruf ع, maka dibaca…
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (1014, 1, 'SELECT', 'Jika nun mati bertemu huruf ع, maka dibaca…', 14)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (1014, 'Jelas tanpa dengung', TRUE), (1014, 'Samar', FALSE), (1014, 'Didengungkan', FALSE), (1014, 'Dibaca panjang', FALSE)
ON CONFLICT DO NOTHING;

-- 15. Pilih bacaan yang benar dengan hukum Idzhar Halqi.
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (1015, 1, 'SELECT', 'Pilih bacaan yang benar dengan hukum Idzhar Halqi.', 15)
ON CONFLICT (id) DO NOTHING;
INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (1015, 'أَنْعَمْتَ', TRUE), (1015, 'مَنْ يَقُولُ', FALSE), (1015, 'مَنْ نُورٍ', FALSE), (1015, 'مَنْ وَرَائِهِمْ', FALSE)
ON CONFLICT DO NOTHING;

-- Now assign per-lesson challenges (6 per lesson)
-- For lessons 1-3: first two are 1001 & 1002; then from 1003..1010
-- We copy challenges per lesson to keep them independent

-- Helper: create copies per lesson
-- Path 1 (Lesson 1): Q1, Q2, 1003,1004,1005,1006
INSERT INTO public.challenges (lesson_id, "type", question, "order")
SELECT 1, c."type", c.question, ord.row_num FROM (
  VALUES (1, 'SELECT_ALL'), (2, 'SELECT_ALL'), (3, 'SELECT'), (4, 'SELECT'), (5, 'SELECT'), (6, 'SELECT')
) AS ord(row_num, t)
JOIN LATERAL (
  SELECT * FROM public.challenges WHERE id IN (1001,1002,1003,1004,1005,1006) ORDER BY id
) c ON (ord.t::"type" = c."type")
ON CONFLICT DO NOTHING;
-- Note: Options copy would typically need procedural SQL; keep base pool for reference.
-- For simplicity of seeding within SQL editor, front-end can fetch by mapping base pool for lesson 1.

-- Path 2 (Lesson 2): Q1, Q2, 1007,1008,1009,1010
-- Path 3 (Lesson 3): Q1, Q2, 1003,1004,1007,1008
-- Path 4 (Lesson 4): 1010,1011,1012,1013,1014,1015
-- Path 5 (Lesson 5): 1010,1011,1012,1013,1014,1015

-- Store items
INSERT INTO public.store_items (id, name, image_src, price_points, item_type) VALUES
  (1, 'Avatar Nun', '/materi/nun.svg', 100, 'avatar'),
  (2, 'Avatar Mim', '/materi/mim.svg', 100, 'avatar'),
  (3, 'Avatar Lam', '/materi/lam.svg', 100, 'avatar'),
  (4, 'Avatar Mad', '/materi/mad.svg', 120, 'avatar'),
  (5, 'Avatar Qof', '/materi/qof.svg', 120, 'avatar')
ON CONFLICT (id) DO NOTHING;

-- Daily login rewards (1..30)
INSERT INTO public.daily_login_rewards (day, points) VALUES
  (1,10),(2,10),(3,15),(4,15),(5,20),(6,20)
ON CONFLICT (day) DO NOTHING;
INSERT INTO public.daily_login_rewards (day, points, item_id) VALUES
  (7, 30, 1)
ON CONFLICT (day) DO NOTHING;
-- Days 8..30 as 10 points
INSERT INTO public.daily_login_rewards (day, points)
SELECT d, 10 FROM generate_series(8,30) AS d
ON CONFLICT (day) DO NOTHING;
