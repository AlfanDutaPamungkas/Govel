ALTER TABLE
  user_invitations
ADD
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users (id);