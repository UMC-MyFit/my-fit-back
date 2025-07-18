/*
  Warnings:

  - You are about to drop the column `sector` on the `Service` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `RecruitingNotice` ADD COLUMN `high_sector` VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN `low_sector` VARCHAR(100) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `Service` DROP COLUMN `sector`,
    ADD COLUMN `high_sector` VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN `low_sector` VARCHAR(100) NOT NULL DEFAULT '';
