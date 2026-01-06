-- Drop cascade foreign key
ALTER TABLE user_invitations
DROP CONSTRAINT IF EXISTS fk_user;

-- Recreate foreign key WITHOUT cascade (default RESTRICT)
ALTER TABLE user_invitations
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id)
REFERENCES users(id);
