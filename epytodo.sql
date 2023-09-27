CREATE DATABASE IF NOT EXISTS `epytodo`;

USE `epytodo`;

CREATE TABLE IF NOT EXISTS `user` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP(),
    `firstname` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    PRIMARY KEY(`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS`todo` (
    `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP(),
    `due_time` DATETIME NOT NULL,
    `user_id` INT(11) UNSIGNED NOT NULL,
    `status` ENUM('not started', 'todo', 'in progress', 'done') DEFAULT 'not started',
    PRIMARY KEY(`id`),
    FOREIGN KEY(`user_id`) REFERENCES `user`(`id`)
) ENGINE=InnoDB;
