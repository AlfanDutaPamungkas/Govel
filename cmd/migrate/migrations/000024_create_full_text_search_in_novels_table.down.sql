DROP TRIGGER IF EXISTS update_title_fts ON novels;

DROP FUNCTION IF EXISTS novels_title_fts_trigger;

DROP INDEX IF EXISTS novels_title_fts_idx;

ALTER TABLE novels DROP COLUMN IF EXISTS title_fts;
