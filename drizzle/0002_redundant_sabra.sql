CREATE TABLE `orders` (
	`id` serial AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`orderNumber` int NOT NULL,
	`userId` bigint NOT NULL);

ALTER TABLE `users` ADD `age` tinyint NOT NULL;
CREATE INDEX `userId_idx` ON `orders` (`userId`);
CREATE INDEX `age_idx` ON `users` (`age`);
CREATE INDEX `name_idx` ON `users` (`name`);