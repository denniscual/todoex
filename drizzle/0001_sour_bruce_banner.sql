CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT PRIMARY KEY NOT NULL,
	`name` varchar(255) NOT NULL);

ALTER TABLE `cities` DROP FOREIGN KEY `cities_country_id_countries_id_fk`;

ALTER TABLE `cities` DROP COLUMN `country_id`;