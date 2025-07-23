-- Migration: update_words_schema
-- Created at: 2025-07-23T13:25:23.000Z

-- Remove example3 and example3_jp columns from words table
-- as the requirements only need 2 examples
ALTER TABLE words DROP COLUMN IF EXISTS example3;
ALTER TABLE words DROP COLUMN IF EXISTS example3_jp;
