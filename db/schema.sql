-- Schema for Que-Query
-- MYSQL_DATABASE=qqdb.

CREATE DATABASE IF NOT EXISTS `qqdb`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_0900_ai_ci;

USE `qqdb`;

-- create User
CREATE TABLE IF NOT EXISTS `User` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL,
  `passwordHash` VARCHAR(255) NOT NULL,
  `displayName` VARCHAR(64) NOT NULL,
  `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
  `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_email` (`email`)
) ENGINE=InnoDB;

-- create Channel
CREATE TABLE IF NOT EXISTS `Channel` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(64) NOT NULL,
  `description` TEXT NULL,
  `createdBy` BIGINT UNSIGNED NOT NULL,
  `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_channel_name` (`name`),
  KEY `ix_channel_createdBy` (`createdBy`),
  CONSTRAINT `fk_channel_createdBy`
    FOREIGN KEY (`createdBy`) REFERENCES `User` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;


-- create Post
CREATE TABLE IF NOT EXISTS `Post` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `channelId` BIGINT UNSIGNED NOT NULL,
  `authorId` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `body` MEDIUMTEXT NOT NULL,
  `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_post_channelId` (`channelId`),
  KEY `ix_post_authorId` (`authorId`),
  CONSTRAINT `fk_post_channelId`
    FOREIGN KEY (`channelId`) REFERENCES `Channel` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_post_authorId`
    FOREIGN KEY (`authorId`) REFERENCES `User` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- create Reply
CREATE TABLE IF NOT EXISTS `Reply` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `postId` BIGINT UNSIGNED NOT NULL,
  `parentReplyId` BIGINT UNSIGNED NULL,
  `authorId` BIGINT UNSIGNED NOT NULL,
  `body` MEDIUMTEXT NOT NULL,
  `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ix_reply_postId` (`postId`),
  KEY `ix_reply_parentReplyId` (`parentReplyId`),
  KEY `ix_reply_authorId` (`authorId`),
  CONSTRAINT `fk_reply_postId`
    FOREIGN KEY (`postId`) REFERENCES `Post` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_reply_parentReplyId`
    FOREIGN KEY (`parentReplyId`) REFERENCES `Reply` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  CONSTRAINT `fk_reply_authorId`
    FOREIGN KEY (`authorId`) REFERENCES `User` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE=InnoDB;

-- create Vote
CREATE TABLE IF NOT EXISTS `Vote` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` BIGINT UNSIGNED NOT NULL,
  `targetType` ENUM('POST', 'REPLY') NOT NULL,
  `targetId` BIGINT UNSIGNED NOT NULL,
  `value` TINYINT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_vote_user_target` (`userId`, `targetType`, `targetId`),
  KEY `ix_vote_target` (`targetType`, `targetId`),
  CONSTRAINT `fk_vote_userId`
    FOREIGN KEY (`userId`) REFERENCES `User` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `chk_vote_value`
    CHECK (`value` IN (-1, 1))
) ENGINE=InnoDB;

-- create Attachment
CREATE TABLE IF NOT EXISTS `Attachment` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `targetType` ENUM('POST') NOT NULL,
  `targetId` BIGINT UNSIGNED NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `mimeType` VARCHAR(127) NOT NULL,
  `sizeBytes` BIGINT UNSIGNED NOT NULL,
  `data` LONGBLOB NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ix_attachment_target` (`targetType`, `targetId`)
) ENGINE=InnoDB;