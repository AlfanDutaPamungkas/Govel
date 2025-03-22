ALTER TABLE chapters 
ALTER COLUMN chapter_number TYPE INTEGER USING chapter_number::INTEGER;