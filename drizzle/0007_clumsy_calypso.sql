CREATE TABLE `project` (
	`id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP);

ALTER TABLE `task` ADD `project_id` int NOT NULL;
CREATE INDEX `title_idx` ON `project` (`title`);