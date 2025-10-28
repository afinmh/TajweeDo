-- Step 1: Prepare enum for challenges.type
-- Run this file FIRST in the Supabase SQL editor, then run supabase.sql.
-- Reason: PostgreSQL requires a commit after adding a new enum value
-- before that value can be used in INSERTs or DDL in the same session/transaction.

DO $$ BEGIN
  -- Create the enum if it doesn't exist yet (with base values)
  BEGIN
    CREATE TYPE "type" AS ENUM ('SELECT', 'ASSIST');
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;

  -- Ensure the new value exists (safe if already present)
  BEGIN
    ALTER TYPE "type" ADD VALUE IF NOT EXISTS 'SELECT_ALL';
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END;
END $$;

-- After running this, click Run to commit.
-- Next, run the main schema/seed file: supabase.sql
