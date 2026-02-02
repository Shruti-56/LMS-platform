-- CreateTable
CREATE TABLE `promo_banners` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `subtitle` TEXT NULL,
    `badge` VARCHAR(100) NULL,
    `cta_text` VARCHAR(100) NOT NULL DEFAULT 'Explore',
    `cta_link` VARCHAR(500) NOT NULL DEFAULT '/student/marketplace',
    `gradient` VARCHAR(200) NOT NULL,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
