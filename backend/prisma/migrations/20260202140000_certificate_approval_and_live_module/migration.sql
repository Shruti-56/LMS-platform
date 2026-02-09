-- AlterTable certificates: add status, approved_at, approved_by
ALTER TABLE `certificates` ADD COLUMN `status` ENUM('PENDING_APPROVAL', 'APPROVED') NOT NULL DEFAULT 'PENDING_APPROVAL';
ALTER TABLE `certificates` ADD COLUMN `approved_at` DATETIME(3) NULL;
ALTER TABLE `certificates` ADD COLUMN `approved_by` VARCHAR(191) NULL;

-- CreateTable live_lecture_module_certificates
CREATE TABLE `live_lecture_module_certificates` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `module_id` VARCHAR(191) NOT NULL,
    `certificate_url` VARCHAR(191) NULL,
    `status` ENUM('PENDING_APPROVAL', 'APPROVED') NOT NULL DEFAULT 'PENDING_APPROVAL',
    `issued_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approved_at` DATETIME(3) NULL,
    `approved_by` VARCHAR(191) NULL,

    UNIQUE INDEX `live_lecture_module_certificates_user_id_module_id_key`(`user_id`, `module_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `live_lecture_module_certificates` ADD CONSTRAINT `live_lecture_module_certificates_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `live_lecture_module_certificates` ADD CONSTRAINT `live_lecture_module_certificates_module_id_fkey` FOREIGN KEY (`module_id`) REFERENCES `live_lecture_modules`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
