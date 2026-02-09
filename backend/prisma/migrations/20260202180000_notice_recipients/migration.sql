-- CreateTable student_notice_recipients (multi-student and batch targeting)
CREATE TABLE `student_notice_recipients` (
    `id` VARCHAR(191) NOT NULL,
    `notice_id` VARCHAR(191) NOT NULL,
    `student_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `student_notice_recipients_notice_id_student_id_key`(`notice_id`, `student_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `student_notice_recipients` ADD CONSTRAINT `student_notice_recipients_notice_id_fkey` FOREIGN KEY (`notice_id`) REFERENCES `student_notices`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `student_notice_recipients` ADD CONSTRAINT `student_notice_recipients_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
