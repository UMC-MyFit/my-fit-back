/*
  Warnings:

  - Added the required column `chat_id` to the `CoffeeChat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CoffeeChat` ADD COLUMN `chat_id` BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE `CoffeeChat` ADD CONSTRAINT `CoffeeChat_chat_id_fkey` FOREIGN KEY (`chat_id`) REFERENCES `ChattingRoom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
