-- Seed initial standard users
-- Default credentials:
--   Albert Smith: albert.smith@gmail.com / albert12345
--   Jane Jones: jane.jones@gmail.com / jane12345
-- Change in production.

USE `qqdb`;

INSERT INTO `User` (`email`, `passwordHash`, `displayName`, `role`)
VALUES
  (
    'albert.smith@gmail.com',
    'qqalbertseedv1:7e998044803124827a14c1e1f27be0c9aa477e3079ac3c1c4c32d4f71ab5d1564515a47ec9dd29bde0544043bbde47ac84119b97d6c24ed3eaa005b950feec4a',
    'Albert Smith',
    'USER'
  ),
  (
    'jane.jones@gmail.com',
    'qqjaneseedv1:31e28b6effd6bc0da0d2a797ab38723dd22846601613468435bb8fa8171d2332a1f1e36513679afc6c0f131a4c0756c3f0c3b0af7429e5b90addeb9bd523cebf',
    'Jane Jones',
    'USER'
  )
ON DUPLICATE KEY UPDATE
  `displayName` = VALUES(`displayName`),
  `role` = 'USER';
