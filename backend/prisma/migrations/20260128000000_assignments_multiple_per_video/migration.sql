-- Allow multiple assignments per video: drop unique on video_id.
-- MySQL uses the unique index for the FK, so we must drop the FK first, then the index, then re-add the FK.
ALTER TABLE `assignments` DROP FOREIGN KEY `assignments_video_id_fkey`;
DROP INDEX `assignments_video_id_key` ON `assignments`;
ALTER TABLE `assignments` ADD CONSTRAINT `assignments_video_id_fkey` FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;