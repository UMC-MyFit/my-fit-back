/*
  Warnings:

  - A unique constraint covering the columns `[sender_id,recipient_id]` on the table `Interest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[sender_id,recipient_id]` on the table `Network` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Interest_sender_id_recipient_id_key` ON `Interest`(`sender_id`, `recipient_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Network_sender_id_recipient_id_key` ON `Network`(`sender_id`, `recipient_id`);
