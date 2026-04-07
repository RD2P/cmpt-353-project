-- Seed initial channels and posts
-- Creates 2 channels and 2 posts in each channel.

USE `qqdb`;

-- Channels
INSERT INTO `Channel` (`name`, `description`, `createdBy`)
VALUES (
  'general',
  'General discussion for everyone.',
  (SELECT `id` FROM `User` WHERE `email` = 'admin@quequery.com' LIMIT 1)
)
ON DUPLICATE KEY UPDATE
  `description` = VALUES(`description`);

INSERT INTO `Channel` (`name`, `description`, `createdBy`)
VALUES (
  'homework-help',
  'Ask and answer assignment questions here.',
  (SELECT `id` FROM `User` WHERE `email` = 'albert.smith@gmail.com' LIMIT 1)
)
ON DUPLICATE KEY UPDATE
  `description` = VALUES(`description`);

-- Posts for #general
INSERT INTO `Post` (`channelId`, `authorId`, `title`, `body`)
SELECT c.`id`, u.`id`,
  'Welcome to Que-Query',
  'Introduce yourself and share what topics you are interested in.'
FROM `Channel` c
JOIN `User` u ON u.`email` = 'admin@quequery.com'
WHERE c.`name` = 'general'
  AND NOT EXISTS (
    SELECT 1 FROM `Post` p
    WHERE p.`channelId` = c.`id`
      AND p.`title` = 'Welcome to Que-Query'
  );

INSERT INTO `Post` (`channelId`, `authorId`, `title`, `body`)
SELECT c.`id`, u.`id`,
  'Community Guidelines',
  'Be respectful, stay on topic, and help others when you can.'
FROM `Channel` c
JOIN `User` u ON u.`email` = 'jane.jones@gmail.com'
WHERE c.`name` = 'general'
  AND NOT EXISTS (
    SELECT 1 FROM `Post` p
    WHERE p.`channelId` = c.`id`
      AND p.`title` = 'Community Guidelines'
  );

-- Posts for #homework-help
INSERT INTO `Post` (`channelId`, `authorId`, `title`, `body`)
SELECT c.`id`, u.`id`,
  'Need help with SQL joins',
  'Can someone explain when to use LEFT JOIN vs INNER JOIN with examples?'
FROM `Channel` c
JOIN `User` u ON u.`email` = 'albert.smith@gmail.com'
WHERE c.`name` = 'homework-help'
  AND NOT EXISTS (
    SELECT 1 FROM `Post` p
    WHERE p.`channelId` = c.`id`
      AND p.`title` = 'Need help with SQL joins'
  );

INSERT INTO `Post` (`channelId`, `authorId`, `title`, `body`)
SELECT c.`id`, u.`id`,
  'React state update confusion',
  'My component does not rerender after setState. What should I check first?'
FROM `Channel` c
JOIN `User` u ON u.`email` = 'jane.jones@gmail.com'
WHERE c.`name` = 'homework-help'
  AND NOT EXISTS (
    SELECT 1 FROM `Post` p
    WHERE p.`channelId` = c.`id`
      AND p.`title` = 'React state update confusion'
  );
