ALTER TABLE novels ADD COLUMN title_fts tsvector;

UPDATE novels
SET title_fts = to_tsvector('english', coalesce(title, ''));

CREATE INDEX novels_title_fts_idx ON novels USING GIN (title_fts);

CREATE FUNCTION novels_title_fts_trigger() RETURNS trigger AS $$
BEGIN
  NEW.title_fts := to_tsvector('english', coalesce(NEW.title, ''));
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_title_fts BEFORE INSERT OR UPDATE
ON novels FOR EACH ROW EXECUTE FUNCTION novels_title_fts_trigger();
