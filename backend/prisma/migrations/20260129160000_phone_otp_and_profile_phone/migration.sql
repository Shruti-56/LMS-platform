-- AlterTable: add phone fields to profiles
ALTER TABLE `profiles` ADD COLUMN `phone_number` VARCHAR(191) NULL,
    ADD COLUMN `phone_verified_at` DATETIME(3) NULL;

-- CreateTable: phone OTP for verification
CREATE TABLE `phone_otps` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `otp` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `phone_otps` ADD CONSTRAINT `phone_otps_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
