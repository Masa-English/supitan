-- Migration: add_example3_back
-- Created at: 2025-07-23T13:26:48.000Z

-- Add back example3 and example3_jp columns to words table
-- as the requirements need 3 examples
ALTER TABLE words ADD COLUMN IF NOT EXISTS example3 TEXT;
ALTER TABLE words ADD COLUMN IF NOT EXISTS example3_jp TEXT;
