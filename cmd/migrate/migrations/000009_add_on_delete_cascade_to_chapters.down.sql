ALTER TABLE chapters DROP CONSTRAINT chapters_novel_id_fkey;

ALTER TABLE chapters
ADD CONSTRAINT chapters_novel_id_fkey
FOREIGN KEY (novel_id)
REFERENCES novels(id);