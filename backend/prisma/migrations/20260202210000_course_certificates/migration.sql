-- CreateTable course_certificates (certificate of completion, admin-approved)
CREATE TABLE `course_certificates` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `course_id` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING_APPROVAL', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING_APPROVAL',
    `certificate_number` VARCHAR(191) NOT NULL,
    `approved_at` DATETIME(3) NULL,
    `approved_by` VARCHAR(191) NULL,
    `rejected_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `course_certificates_certificate_number_key`(`certificate_number`),
    UNIQUE INDEX `course_certificates_user_id_course_id_key`(`user_id`, `course_id`),
    INDEX `course_certificates_user_id_idx`(`user_id`),
    INDEX `course_certificates_course_id_idx`(`course_id`),
    INDEX `course_certificates_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_certificates` ADD CONSTRAINT `course_certificates_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_certificates` ADD CONSTRAINT `course_certificates_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_certificates` ADD CONSTRAINT `course_certificates_approved_by_fkey` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
