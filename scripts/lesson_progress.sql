-- Create lesson-based progress table and backfill from existing challenge_progress
-- Run this in Supabase SQL editor (or psql) against your database.
-- Safe to re-run: uses IF NOT EXISTS and upsert on unique key.

BEGIN;

-- 1) Table
-- NOTE: Your users.id column is TEXT (not UUID). Use TEXT here to match and allow FK.
-- If your users.id is UUID in another environment, change TEXT to UUID below.
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT lesson_progress_user_lesson_uniq UNIQUE (user_id, lesson_id)
);

-- 2) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON public.lesson_progress(lesson_id);

-- 3) Backfill from challenge_progress so existing users keep their progress
--    Completed only when ALL challenges in that lesson are completed.
WITH lesson_challenge_counts AS (
  SELECT c.lesson_id, COUNT(*) AS total
  FROM public.challenges c
  GROUP BY c.lesson_id
),
user_lesson_counts AS (
  SELECT cp.user_id,
         c.lesson_id,
         COUNT(*) AS seen,
         SUM(CASE WHEN cp.completed THEN 1 ELSE 0 END) AS done
  FROM public.challenge_progress cp
  JOIN public.challenges c ON c.id = cp.challenge_id
  GROUP BY cp.user_id, c.lesson_id
),
user_lesson_completed AS (
  SELECT ulc.user_id,
         ulc.lesson_id,
         (ulc.seen = lcc.total AND ulc.done = lcc.total) AS completed
  FROM user_lesson_counts ulc
  JOIN lesson_challenge_counts lcc ON lcc.lesson_id = ulc.lesson_id
)
INSERT INTO public.lesson_progress (user_id, lesson_id, completed)
SELECT ul.user_id, ul.lesson_id, ul.completed
FROM user_lesson_completed ul
ON CONFLICT (user_id, lesson_id)
DO UPDATE SET completed = EXCLUDED.completed, updated_at = NOW();

COMMIT;

-- To revert a specific user's lesson completion (debug):
-- DELETE FROM public.lesson_progress WHERE user_id = '<uuid>' AND lesson_id = <id>;
