-- AlterTable
ALTER TABLE `live_lectures` ADD COLUMN `module_id` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `live_lectures` ADD CONSTRAINT `live_lectures_module_id_fkey` FOREIGN KEY (`module_id`) REFERENCES `live_lecture_modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
