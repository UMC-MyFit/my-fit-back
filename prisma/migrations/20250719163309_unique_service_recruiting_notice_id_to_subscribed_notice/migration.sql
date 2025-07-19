/*
  Warnings:

  - A unique constraint covering the columns `[service_id,recruiting_notice_id]` on the table `SubscribedNotice` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `SubscribedNotice_service_id_recruiting_notice_id_key` ON `SubscribedNotice`(`service_id`, `recruiting_notice_id`);
