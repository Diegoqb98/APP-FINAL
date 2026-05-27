DELETE FROM users WHERE email IN ('didac.qb@gmail.com', 'admin@didac.qb.local');
INSERT INTO users (name, email, password_hash, role) 
VALUES 
  ('Usuario Cliente', 'didac.qb@gmail.com', '$2a$10$8sMRK.TOtBxi45UAI6Tuw.Kcs2bSEDJRiHzDp.pk9812NtGQKl1Wy', 'client'),
  ('Usuario Admin', 'admin@didac.qb.local', '$2a$10$8sMRK.TOtBxi45UAI6Tuw.Kcs2bSEDJRiHzDp.pk9812NtGQKl1Wy', 'admin');
SELECT id, name, email, role FROM users WHERE email IN ('didac.qb@gmail.com', 'admin@didac.qb.local');
