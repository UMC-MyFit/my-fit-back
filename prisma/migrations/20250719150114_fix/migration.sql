/*
  Warnings:

  - You are about to drop the column `high_area_id` on the `UserArea` table. All the data in the column will be lost.
  - You are about to drop the column `low_area_id` on the `UserArea` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `UserArea` DROP FOREIGN KEY `UserArea_high_area_id_fkey`;

-- DropForeignKey
ALTER TABLE `UserArea` DROP FOREIGN KEY `UserArea_low_area_id_fkey`;

-- DropIndex
DROP INDEX `UserArea_high_area_id_fkey` ON `UserArea`;

-- DropIndex
DROP INDEX `UserArea_low_area_id_fkey` ON `UserArea`;

-- AlterTable
ALTER TABLE `RecruitingNotice` ADD COLUMN `area` VARCHAR(255) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `UserArea` DROP COLUMN `high_area_id`,
    DROP COLUMN `low_area_id`,
    ADD COLUMN `high_area` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `low_area` VARCHAR(191) NOT NULL DEFAULT '';
