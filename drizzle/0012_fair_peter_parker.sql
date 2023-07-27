ALTER TABLE `task` MODIFY COLUMN `status` enum('pending','completed') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `task` ADD `content` json;