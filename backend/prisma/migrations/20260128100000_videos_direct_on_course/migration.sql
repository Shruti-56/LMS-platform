-- Add course_id to videos so videos can belong directly to courses (no module).
-- Backfill from module.course_id, then make module_id optional.

-- Step 1: Add course_id nullable
ALTER TABLE `videos` ADD COLUMN `course_id` VARCHAR(191) NULL;

-- Step 2: Backfill from module
UPDATE `videos` v
INNER JOIN `modules` m ON v.module_id = m.id
SET v.course_id = m.course_id;

-- Step 3: Make course_id NOT NULL (all existing rows now have it)
ALTER TABLE `videos` MODIFY COLUMN `course_id` VARCHAR(191) NOT NULL;

-- Step 4: Make module_id nullable
ALTER TABLE `videos` MODIFY COLUMN `module_id` VARCHAR(191) NULL;

-- Step 5: Add foreign key for course_id
ALTER TABLE `videos` ADD CONSTRAINT `videos_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
