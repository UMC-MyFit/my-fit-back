/*
  Warnings:

  - A unique constraint covering the columns `[email,platform]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `User_email_key` ON `User`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `platform` VARCHAR(191) NOT NULL DEFAULT 'local';

-- CreateIndex
CREATE UNIQUE INDEX `User_email_platform_key` ON `User`(`email`, `platform`);
