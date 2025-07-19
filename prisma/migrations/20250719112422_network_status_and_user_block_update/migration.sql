/*
  Warnings:

  - You are about to drop the column `is_mutual` on the `Network` table. All the data in the column will be lost.
  - Added the required column `updated_at` to the `Network` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Network` DROP COLUMN `is_mutual`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `UserBlock` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `blocker_id` BIGINT NOT NULL,
    `blocked_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserBlock_blocker_id_idx`(`blocker_id`),
    INDEX `UserBlock_blocked_id_idx`(`blocked_id`),
    UNIQUE INDEX `UserBlock_blocker_id_blocked_id_key`(`blocker_id`, `blocked_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Network_sender_id_idx` ON `Network`(`sender_id`);

-- CreateIndex
CREATE INDEX `Network_sender_id_recipient_id_idx` ON `Network`(`sender_id`, `recipient_id`);

-- CreateIndex
CREATE INDEX `Network_recipient_id_sender_id_idx` ON `Network`(`recipient_id`, `sender_id`);

-- AddForeignKey
ALTER TABLE `UserBlock` ADD CONSTRAINT `UserBlock_blocker_id_fkey` FOREIGN KEY (`blocker_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserBlock` ADD CONSTRAINT `UserBlock_blocked_id_fkey` FOREIGN KEY (`blocked_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
-- ALTER TABLE `Network` RENAME INDEX `Network_recipient_id_fkey` TO `Network_recipient_id_idx`;
