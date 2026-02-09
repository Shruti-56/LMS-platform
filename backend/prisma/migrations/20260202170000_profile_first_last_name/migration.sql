-- AlterTable profiles: add first_name, last_name
ALTER TABLE `profiles` ADD COLUMN `first_name` VARCHAR(191) NULL;
ALTER TABLE `profiles` ADD COLUMN `last_name` VARCHAR(191) NULL;
