/*
  Warnings:

  - You are about to drop the column `serviceId` on the `CoffeeChat` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `CoffeeChat` DROP FOREIGN KEY `CoffeeChat_serviceId_fkey`;

-- DropIndex
DROP INDEX `CoffeeChat_serviceId_fkey` ON `CoffeeChat`;

-- AlterTable
ALTER TABLE `CoffeeChat` DROP COLUMN `serviceId`;
