-- CreateIndex
CREATE INDEX `CoffeeChat_requester_id_scheduled_at_idx` ON `CoffeeChat`(`requester_id`, `scheduled_at`);

-- CreateIndex
CREATE INDEX `CoffeeChat_receiver_id_scheduled_at_idx` ON `CoffeeChat`(`receiver_id`, `scheduled_at`);

-- CreateIndex
CREATE INDEX `Message_chat_id_created_at_idx` ON `Message`(`chat_id`, `created_at`);
