/*
  Warnings:

  - A unique constraint covering the columns `[service_id,feed_id]` on the table `FeedHeart` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `FeedComment` ADD COLUMN `high_comment_id` BIGINT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `FeedHeart_service_id_feed_id_key` ON `FeedHeart`(`service_id`, `feed_id`);
