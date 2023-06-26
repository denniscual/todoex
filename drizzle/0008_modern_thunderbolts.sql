CREATE TABLE `project_user` (
	`user_id` int NOT NULL,
	`project_id` int NOT NULL,
	PRIMARY KEY(`project_id`,`user_id`)
);
