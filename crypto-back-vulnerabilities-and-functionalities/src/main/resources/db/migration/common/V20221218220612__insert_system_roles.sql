INSERT
INTO
  roles
  (name, display_name, created_at, updated_at)
VALUES
  ('ADMIN', 'Admin', GETDATE(), GETDATE()),
  ('EMPLOYEE', 'Employee', GETDATE(), GETDATE()),
  ('USER', 'User', GETDATE(), GETDATE())
GO
