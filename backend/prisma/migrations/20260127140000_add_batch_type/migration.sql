-- AlterTable
ALTER TABLE `live_lecture_batches` ADD COLUMN `type` ENUM('REGULAR', 'FAST_FORWARD', 'PAP') NOT NULL DEFAULT 'REGULAR';
