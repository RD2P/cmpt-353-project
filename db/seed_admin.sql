-- Seed initial admin account
-- Default credentials:
--   email: admin@quequery.com
--   password: admin12345
-- Change in production.

USE `qqdb`;

INSERT INTO `User` (`email`, `passwordHash`, `displayName`, `role`)
VALUES (
  'admin@quequery.com',
  'qqadminseedv1:e87b7cafcdeda59bfc29c782303d54237a00c517b06e43e0550c7f901410bdc1d2c3493c5782507c597e627b0d1f7a92377154b32d43f5e8bcf06f5cea2e79b7',
  'Admin',
  'ADMIN'
)
ON DUPLICATE KEY UPDATE
  `displayName` = VALUES(`displayName`),
  `role` = 'ADMIN';