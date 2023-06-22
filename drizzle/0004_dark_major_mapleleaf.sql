ALTER TABLE `user` MODIFY COLUMN `id` varchar(50) NOT NULL;
ALTER TABLE `user` ADD `first_name` varchar(255);
ALTER TABLE `user` ADD `last_name` varchar(255);
ALTER TABLE `user` ADD `email_address` varchar(255) NOT NULL;
CREATE INDEX `title_idx` ON `task` (`title`);
ALTER TABLE `user` DROP COLUMN `email`;
ALTER TABLE `user` DROP COLUMN `password`;