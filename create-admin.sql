-- Create admin user
-- Password: admin123
-- Password hash generated with bcrypt

INSERT INTO "User" (id, email, "passwordHash", "firstName", "lastName", role, "createdAt", "updatedAt")
VALUES (
  'admin_' || substr(md5(random()::text), 1, 20),
  'kovac.jr@slza.sk',
  '$2a$10$YQ98P8BDRzDKBsE3F5iiHuE7rVQB3B3PYPqJQ0VlRwzKn5gO5qE2m',
  'Pavel',
  'Kováč',
  'ADMIN',
  NOW(),
  NOW()
);

-- Verify
SELECT id, email, "firstName", "lastName", role, "createdAt" FROM "User";
