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
    'qqalbertseedv1:dd5cd7927aa6e3ddfcc316b2c93312750685f5fcd123fdf814f8b5cd156966563fe724d7b6bdf3ae1a69ff133994bf4a43008ab492dcafe721bc879f0581f139',
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
