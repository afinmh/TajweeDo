-- Seed Unit: Idgham Bighunnah (like Idzhar structure)
-- - Create a unit under course_id = 1 (Nun Mati) with order = 2
-- - Create 5 lessons: "Idgham Bighunnah - Path 1..5"
-- - Create a base challenge pool (ids 2001..2015) attached to lesson 6
-- - Duplicate that pool to lessons 7..10 so each path has its own challenges
-- - Audio files use Arabic filenames

BEGIN;

-- 1) Unit row (id=2) under course 1
INSERT INTO public.units (id, title, description, course_id, "order") VALUES
  (2, 'Idgham Bighunnah', 'Belajar Hukum Idgham Bighunnah', 1, 2)
ON CONFLICT (id) DO NOTHING;

-- 2) Lessons for this unit (ids 6..10)
INSERT INTO public.lessons (id, title, unit_id, "order") VALUES
  (6,  'Idgham Bighunnah - Path 1', 2, 1),
  (7,  'Idgham Bighunnah - Path 2', 2, 2),
  (8,  'Idgham Bighunnah - Path 3', 2, 3),
  (9,  'Idgham Bighunnah - Path 4', 2, 4),
  (10, 'Idgham Bighunnah - Path 5', 2, 5)
ON CONFLICT (id) DO NOTHING;

-- 3) Base challenge pool attached to lesson 6 (ids 2001..2015)
-- Clean if exists to keep idempotent
DELETE FROM public.challenge_options WHERE challenge_id BETWEEN 2001 AND 2015;
DELETE FROM public.challenges WHERE id BETWEEN 2001 AND 2015;

-- Q1 (SELECT_ALL) Penjelasan + interactive 4 buttons (all correct)
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (2001, 6, 'SELECT_ALL', 'Idgham Bighunnah terjadi bila nun mati (نْ) atau tanwin bertemu dengan huruf ي، ن، م، و. Dibaca dengan melebur disertai dengung (ghunnah).', 1);
INSERT INTO public.challenge_options (challenge_id, text, correct, image_src, audio_src) VALUES
  (2001, 'مَنْ يَقُولُ', TRUE, NULL, '/audio/materi/idgham-bighunnah/مَنْ يَقُولُ.mp3'),
  (2001, 'مَنْ نُورٍ', TRUE, NULL, '/audio/materi/idgham-bighunnah/مَنْ نُورٍ.mp3'),
  (2001, 'سَمِيعٌ مَجِيدٌ', TRUE, NULL, '/audio/materi/idgham-bighunnah/سَمِيعٌ مَجِيدٌ.mp3'),
  (2001, 'عَلِيمٌ حَكِيمٌ', TRUE, NULL, '/audio/materi/idgham-bighunnah/عَلِيمٌ حَكِيمٌ.mp3');

-- Q2 (SELECT_ALL) Huruf Idgham Bighunnah (all are correct)
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (2002, 6, 'SELECT_ALL', 'Pilih semua huruf Idgham Bighunnah.', 2);
INSERT INTO public.challenge_options (challenge_id, text, correct, image_src, audio_src) VALUES
  (2002, 'ي', TRUE, NULL, '/audio/materi/hijaiyah/ي.mp3'),
  (2002, 'ن', TRUE, NULL, '/audio/materi/hijaiyah/ن.mp3'),
  (2002, 'م', TRUE, NULL, '/audio/materi/hijaiyah/م.mp3'),
  (2002, 'و', TRUE, NULL, '/audio/materi/hijaiyah/و.mp3');

-- Q3..15 SELECT-type pool with four options each (one correct)
INSERT INTO public.challenges (id, lesson_id, "type", question, "order") VALUES
  (2003, 6, 'SELECT', 'Bagaimana cara membaca Idgham Bighunnah?', 3),
  (2004, 6, 'SELECT', 'Manakah huruf Idgham Bighunnah?', 4),
  (2005, 6, 'SELECT', 'Contoh bacaan Idgham Bighunnah terdapat pada…', 5),
  (2006, 6, 'SELECT', 'Huruf berikut yang termasuk huruf Idgham Bighunnah adalah…', 6),
  (2007, 6, 'SELECT', 'Kata berikut dibaca dengan hukum Idgham Bighunnah…', 7),
  (2008, 6, 'SELECT', 'Hukum bacaan ‘مِنْ هَادٍ’ adalah…', 8),
  (2009, 6, 'SELECT', 'Nun mati pada kata ‘مِنْ خَافَ’ bertemu huruf apa?', 9),
  (2010, 6, 'SELECT', 'Huruf yang keluar dari tenggorokan disebut huruf…', 10),
  (2011, 6, 'SELECT', 'Berapa jumlah huruf Idgham Bighunnah?', 11),
  (2012, 6, 'SELECT', 'Huruf Idgham Bighunnah pertama adalah…', 12),
  (2013, 6, 'SELECT', 'Ghunnah berarti…', 13),
  (2014, 6, 'SELECT', 'Jika nun mati bertemu huruf mim maka dibaca…', 14),
  (2015, 6, 'SELECT', 'Manakah yang merupakan contoh Idgham Bighunnah?', 15);

-- Options for Q3..Q15
INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (2003, 'Dilebur dengan dengung', TRUE),
  (2003, 'Dibaca jelas tanpa dengung', FALSE),
  (2003, 'Dibaca samar', FALSE),
  (2003, 'Dibaca panjang', FALSE);

INSERT INTO public.challenge_options (challenge_id, text, correct, image_src, audio_src) VALUES
  (2004, 'ن', TRUE, NULL, '/audio/materi/hijaiyah/ن.mp3'),
  (2004, 'ح', FALSE, NULL, '/audio/materi/hijaiyah/ح.mp3'),
  (2004, 'ق', FALSE, NULL, '/audio/materi/hijaiyah/ق.mp3'),
  (2004, 'ر', FALSE, NULL, '/audio/materi/hijaiyah/ر.mp3');

INSERT INTO public.challenge_options (challenge_id, text, correct, audio_src) VALUES
  (2005, 'مَنْ يَقُولُ', TRUE, '/audio/materi/idgham-bighunnah/مَنْ يَقُولُ.mp3'),
  (2005, 'مِنْ أَمْرِهِ', FALSE, '/audio/materi/idzhar/مِنْ أَمْرِهِ.mp3'),
  (2005, 'مِنْ خَافَ', FALSE, '/audio/materi/idzhar/مِنْ خَافَ.mp3'),
  (2005, 'مَنْ لَمْ', FALSE, '/audio/materi/umum/مَنْ لَمْ.mp3');

INSERT INTO public.challenge_options (challenge_id, text, correct, audio_src) VALUES
  (2006, 'ي', TRUE, '/audio/materi/hijaiyah/ي.mp3'),
  (2006, 'و', FALSE, '/audio/materi/hijaiyah/و.mp3'),
  (2006, 'ب', FALSE, '/audio/materi/hijaiyah/ب.mp3'),
  (2006, 'ش', FALSE, '/audio/materi/hijaiyah/ش.mp3');

INSERT INTO public.challenge_options (challenge_id, text, correct, audio_src) VALUES
  (2007, 'مَنْ عَمِلَ', TRUE, '/audio/materi/idgham-bighunnah/مَنْ عَمِلَ.mp3'),
  (2007, 'مَنْ يَقُولُ', FALSE, '/audio/materi/idgham-bighunnah/مَنْ يَقُولُ.mp3'),
  (2007, 'مَنْ نَصَرَ', FALSE, '/audio/materi/idgham-bighunnah/مَنْ نَصَرَ.mp3'),
  (2007, 'مَنْ يَرْحَمْ', FALSE, '/audio/materi/idgham-bighunnah/مَنْ يَرْحَمْ.mp3');

INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (2008, 'Idgham Bighunnah', TRUE),
  (2008, 'Idzhar Halqi', FALSE),
  (2008, 'Ikhfa’', FALSE),
  (2008, 'Iqlab', FALSE);

INSERT INTO public.challenge_options (challenge_id, text, correct, audio_src) VALUES
  (2009, 'خ', TRUE, '/audio/materi/hijaiyah/خ.mp3'),
  (2009, 'ن', FALSE, '/audio/materi/hijaiyah/ن.mp3'),
  (2009, 'م', FALSE, '/audio/materi/hijaiyah/م.mp3'),
  (2009, 'ف', FALSE, '/audio/materi/hijaiyah/ف.mp3');

INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (2010, 'Halqi', TRUE),
  (2010, 'Syafawi', FALSE),
  (2010, 'Lisan', FALSE),
  (2010, 'Halaqiyah', FALSE);

INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (2011, 'Empat', TRUE),
  (2011, 'Lima', FALSE),
  (2011, 'Enam', FALSE),
  (2011, 'Tujuh', FALSE);

INSERT INTO public.challenge_options (challenge_id, text, correct, audio_src) VALUES
  (2012, 'ي', TRUE, '/audio/materi/hijaiyah/ي.mp3'),
  (2012, 'ن', FALSE, '/audio/materi/hijaiyah/ن.mp3'),
  (2012, 'م', FALSE, '/audio/materi/hijaiyah/م.mp3'),
  (2012, 'و', FALSE, '/audio/materi/hijaiyah/و.mp3');

INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (2013, 'Dengung', TRUE),
  (2013, 'Panjang', FALSE),
  (2013, 'Samar', FALSE),
  (2013, 'Jelas', FALSE);

INSERT INTO public.challenge_options (challenge_id, text, correct) VALUES
  (2014, 'Dilebur dengan dengung', TRUE),
  (2014, 'Jelas tanpa dengung', FALSE),
  (2014, 'Didengungkan sedikit', FALSE),
  (2014, 'Dibaca panjang', FALSE);

INSERT INTO public.challenge_options (challenge_id, text, correct, audio_src) VALUES
  (2015, 'مَنْ يَقُولُ', TRUE, '/audio/materi/idgham-bighunnah/مَنْ يَقُولُ.mp3'),
  (2015, 'مِنْ خَافَ', FALSE, '/audio/materi/idzhar/مِنْ خَافَ.mp3'),
  (2015, 'مِنْ رَبِّهِمْ', FALSE, '/audio/materi/umum/مِنْ رَبِّهِمْ.mp3'),
  (2015, 'مَنْ لَمْ', FALSE, '/audio/materi/umum/مَنْ لَمْ.mp3');

-- 4) Duplicate pool to lessons 7..10 so each lesson has its own rows
DO $$
DECLARE
  tgt_lesson integer;
  base_rec RECORD;
  new_ch_id integer;
BEGIN
  FOR tgt_lesson IN 7,8,9,10 LOOP
    -- Clean existing challenges for idempotency
    DELETE FROM public.challenge_options WHERE challenge_id IN (SELECT id FROM public.challenges WHERE lesson_id = tgt_lesson);
    DELETE FROM public.challenges WHERE lesson_id = tgt_lesson;

    FOR base_rec IN 
      SELECT id, "type", question, "order"
      FROM public.challenges
      WHERE id BETWEEN 2001 AND 2015
      ORDER BY id
    LOOP
      INSERT INTO public.challenges (lesson_id, "type", question, "order")
      VALUES (tgt_lesson, base_rec."type", base_rec.question, base_rec."order")
      RETURNING id INTO new_ch_id;

      INSERT INTO public.challenge_options (challenge_id, text, correct, image_src, audio_src)
      SELECT new_ch_id, text, correct, image_src, audio_src
      FROM public.challenge_options WHERE challenge_id = base_rec.id;
    END LOOP;
  END LOOP;
END$$;

COMMIT;