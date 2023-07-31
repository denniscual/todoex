ALTER TABLE `project` MODIFY COLUMN `id` char(16) NOT NULL;--> statement-breakpoint
ALTER TABLE `project_user` MODIFY COLUMN `project_id` char(16) NOT NULL;--> statement-breakpoint
ALTER TABLE `task` MODIFY COLUMN `project_id` char(16) NOT NULL;--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `first_name` varchar(50);--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `last_name` varchar(50);--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `email_address` varchar(100) NOT NULL;