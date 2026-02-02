-- AlterTable
ALTER TABLE `live_lecture_modules` ADD COLUMN `last_reminder_1h_sent_at` DATETIME(3) NULL,
    ADD COLUMN `last_reminder_30m_sent_at` DATETIME(3) NULL;
