-- DropTable: remove phone OTP feature
DROP TABLE IF EXISTS `phone_otps`;

-- AlterTable: remove phone_verified_at from profiles (OTP verification removed)
ALTER TABLE `profiles` DROP COLUMN `phone_verified_at`;
