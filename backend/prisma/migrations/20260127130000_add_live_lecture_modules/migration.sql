-- CreateTable
CREATE TABLE `live_lecture_modules` (
    `id` VARCHAR(191) NOT NULL,
    `batch_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `instructor_id` VARCHAR(191) NOT NULL,
    `meeting_link` VARCHAR(191) NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `lecture_time` VARCHAR(191) NOT NULL,
    `last_reminder_sent_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `live_lecture_modules` ADD CONSTRAINT `live_lecture_modules_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `live_lecture_batches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `live_lecture_modules` ADD CONSTRAINT `live_lecture_modules_instructor_id_fkey` FOREIGN KEY (`instructor_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
