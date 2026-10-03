-- ============================================================
-- MIGRATION: Structured Lesson-Challenge Distribution
-- Implements 7-question-per-path spaced repetition mapping
-- ============================================================

-- Step 1: Create the pivot table
CREATE TABLE IF NOT EXISTS lesson_challenges (
    id          SERIAL PRIMARY KEY,
    lesson_id   INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    challenge_id INTEGER NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
    position    INTEGER NOT NULL, -- display order within this lesson (1-7)
    UNIQUE (lesson_id, challenge_id)
);

-- ============================================================
-- MATERI 1: IDZHAR HALQI (15 soal → 5 path, lesson_id 1-5)
-- Challenges: 1001–1015 (index 1-15)
-- ============================================================
-- Path 1: Soal 1,2,3,4,5,6,7
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(1, 1001, 1), (1, 1002, 2), (1, 1003, 3), (1, 1004, 4), (1, 1005, 5), (1, 1006, 6), (1, 1007, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 2: Soal 1,3,6,7,8,9,10
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(2, 1001, 1), (2, 1003, 2), (2, 1006, 3), (2, 1007, 4), (2, 1008, 5), (2, 1009, 6), (2, 1010, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 3: Soal 3,4,5,11,12,13,14
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(3, 1003, 1), (3, 1004, 2), (3, 1005, 3), (3, 1011, 4), (3, 1012, 5), (3, 1013, 6), (3, 1014, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 4: Soal 7,8,9,12,13,14,15
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(4, 1007, 1), (4, 1008, 2), (4, 1009, 3), (4, 1012, 4), (4, 1013, 5), (4, 1014, 6), (4, 1015, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 5: Soal 8,9,10,11,12,13,15
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(5, 1008, 1), (5, 1009, 2), (5, 1010, 3), (5, 1011, 4), (5, 1012, 5), (5, 1013, 6), (5, 1015, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- ============================================================
-- MATERI 2: IDGHAM BIGHUNNAH (15 soal → 5 path, lesson_id 6-10)
-- Challenges: 1101–1115 (index 1-15)
-- ============================================================
-- Path 1: Soal 1,2,3,4,5,6,7
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(6, 1101, 1), (6, 1102, 2), (6, 1103, 3), (6, 1104, 4), (6, 1105, 5), (6, 1106, 6), (6, 1107, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 2: Soal 1,3,6,7,8,9,10
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(7, 1101, 1), (7, 1103, 2), (7, 1106, 3), (7, 1107, 4), (7, 1108, 5), (7, 1109, 6), (7, 1110, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 3: Soal 3,4,5,11,12,13,14
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(8, 1103, 1), (8, 1104, 2), (8, 1105, 3), (8, 1111, 4), (8, 1112, 5), (8, 1113, 6), (8, 1114, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 4: Soal 7,8,9,12,13,14,15
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(9, 1107, 1), (9, 1108, 2), (9, 1109, 3), (9, 1112, 4), (9, 1113, 5), (9, 1114, 6), (9, 1115, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 5: Soal 8,9,10,11,12,13,15
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(10, 1108, 1), (10, 1109, 2), (10, 1110, 3), (10, 1111, 4), (10, 1112, 5), (10, 1113, 6), (10, 1115, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- ============================================================
-- MATERI 3: IDGHAM BILA GHUNNAH (10 soal → 4 path, lesson_id 11-14)
-- Challenges: 1201–1210 (index 1-10)
-- ============================================================
-- Path 1: Soal 1,2,3,4,5,6,7
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(11, 1201, 1), (11, 1202, 2), (11, 1203, 3), (11, 1204, 4), (11, 1205, 5), (11, 1206, 6), (11, 1207, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 2: Soal 1,2,3,6,7,8,9
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(12, 1201, 1), (12, 1202, 2), (12, 1203, 3), (12, 1206, 4), (12, 1207, 5), (12, 1208, 6), (12, 1209, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 3: Soal 2,3,6,7,8,9,10
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(13, 1202, 1), (13, 1203, 2), (13, 1206, 3), (13, 1207, 4), (13, 1208, 5), (13, 1209, 6), (13, 1210, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 4: Soal 4,5,6,7,8,9,10
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(14, 1204, 1), (14, 1205, 2), (14, 1206, 3), (14, 1207, 4), (14, 1208, 5), (14, 1209, 6), (14, 1210, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- ============================================================
-- MATERI 4: IQLAB (10 soal → 4 path, lesson_id 15-18)
-- Challenges: 1301–1310 (index 1-10)
-- ============================================================
-- Path 1: Soal 1,2,3,4,5,6,7
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(15, 1301, 1), (15, 1302, 2), (15, 1303, 3), (15, 1304, 4), (15, 1305, 5), (15, 1306, 6), (15, 1307, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 2: Soal 1,2,3,6,7,8,9
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(16, 1301, 1), (16, 1302, 2), (16, 1303, 3), (16, 1306, 4), (16, 1307, 5), (16, 1308, 6), (16, 1309, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 3: Soal 2,3,6,7,8,9,10
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(17, 1302, 1), (17, 1303, 2), (17, 1306, 3), (17, 1307, 4), (17, 1308, 5), (17, 1309, 6), (17, 1310, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 4: Soal 4,5,6,7,8,9,10
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(18, 1304, 1), (18, 1305, 2), (18, 1306, 3), (18, 1307, 4), (18, 1308, 5), (18, 1309, 6), (18, 1310, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- ============================================================
-- MATERI 5: IKHFA' (15 soal → 5 path, lesson_id 19-23)
-- Challenges: 1401–1415 (index 1-15)
-- ============================================================
-- Path 1: Soal 1,2,3,4,5,6,7
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(19, 1401, 1), (19, 1402, 2), (19, 1403, 3), (19, 1404, 4), (19, 1405, 5), (19, 1406, 6), (19, 1407, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 2: Soal 1,3,6,7,8,9,10
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(20, 1401, 1), (20, 1403, 2), (20, 1406, 3), (20, 1407, 4), (20, 1408, 5), (20, 1409, 6), (20, 1410, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 3: Soal 3,4,5,11,12,13,14
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(21, 1403, 1), (21, 1404, 2), (21, 1405, 3), (21, 1411, 4), (21, 1412, 5), (21, 1413, 6), (21, 1414, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 4: Soal 7,8,9,12,13,14,15
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(22, 1407, 1), (22, 1408, 2), (22, 1409, 3), (22, 1412, 4), (22, 1413, 5), (22, 1414, 6), (22, 1415, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- Path 5: Soal 8,9,10,11,12,13,15
INSERT INTO lesson_challenges (lesson_id, challenge_id, position) VALUES
(23, 1408, 1), (23, 1409, 2), (23, 1410, 3), (23, 1411, 4), (23, 1412, 5), (23, 1413, 6), (23, 1415, 7)
ON CONFLICT (lesson_id, challenge_id) DO NOTHING;

-- ============================================================
-- VERIFICATION QUERIES (run to check correctness)
-- ============================================================
-- Check each lesson has exactly 7 challenges:
-- SELECT lesson_id, COUNT(*) as total FROM lesson_challenges GROUP BY lesson_id ORDER BY lesson_id;

-- Check all 23 lessons are populated:
-- SELECT l.id, l.title, COUNT(lc.challenge_id) as challenge_count
-- FROM lessons l
-- LEFT JOIN lesson_challenges lc ON l.id = lc.lesson_id
-- GROUP BY l.id, l.title ORDER BY l.id;
