/*
  Warnings:

  - Made the column `division` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `industry` VARCHAR(100) NULL,
    ADD COLUMN `team_division` VARCHAR(100) NULL,
    MODIFY `division` VARCHAR(100) NOT NULL;
