-- CreateTable
CREATE TABLE `User` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `one_line_profile` VARCHAR(50) NOT NULL,
    `birth_date` DATETIME(3) NOT NULL,
    `Highest_grade` VARCHAR(100) NULL,
    `link` VARCHAR(100) NULL,
    `email` VARCHAR(100) NOT NULL,
    `is_email_AuthN` BOOLEAN NOT NULL DEFAULT false,
    `inc_AuthN_file` VARCHAR(100) NULL,
    `password` VARCHAR(50) NOT NULL,
    `division` VARCHAR(100) NULL,
    `grade_status` VARCHAR(100) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_profile_completed` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Service` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `sector` VARCHAR(100) NOT NULL,
    `is_inc_AuthN` BOOLEAN NOT NULL DEFAULT false,
    `recruiting_status` VARCHAR(100) NOT NULL,
    `profile_img` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserDB` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `service_id` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserArea` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `service_id` BIGINT NOT NULL,
    `high_area_id` INTEGER NOT NULL,
    `low_area_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HighArea` (
    `id` INTEGER NOT NULL,
    `high_area_name` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LowArea` (
    `id` INTEGER NOT NULL,
    `low_area_name` VARCHAR(100) NOT NULL,
    `high_area_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecruitingArea` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `recruiting_id` BIGINT NOT NULL,
    `high_area_id` INTEGER NOT NULL,
    `low_area_id` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecruitingNotice` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `require` VARCHAR(255) NOT NULL,
    `salary` VARCHAR(255) NOT NULL,
    `work_type` VARCHAR(255) NOT NULL,
    `dead_line` DATETIME(3) NOT NULL,
    `recruiting_img` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `service_id` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubscribedNotice` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `service_id` BIGINT NOT NULL,
    `recruiting_notice_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feed` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `feed_text` TEXT NOT NULL,
    `hashtag` VARCHAR(255) NOT NULL,
    `heart` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `is_visible` BOOLEAN NOT NULL DEFAULT true,
    `service_id` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeedHeart` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `service_id` BIGINT NOT NULL,
    `feed_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeedComment` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `content` TEXT NOT NULL,
    `service_id` BIGINT NOT NULL,
    `feed_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FeedImage` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `image_url` VARCHAR(255) NOT NULL,
    `feed_id` BIGINT NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RecentHashtag` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `service_id` BIGINT NOT NULL,
    `hashtag` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityCard` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `one_line_profile` VARCHAR(255) NOT NULL,
    `detailed_profile` TEXT NOT NULL,
    `link` VARCHAR(100) NOT NULL,
    `card_img` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `service_id` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Keyword` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `keyword_text` VARCHAR(255) NOT NULL,
    `card_id` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Interest` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `is_ban` BOOLEAN NOT NULL DEFAULT false,
    `sender_id` BIGINT NOT NULL,
    `recipient_id` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Network` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `is_mutual` BOOLEAN NOT NULL DEFAULT false,
    `sender_id` BIGINT NOT NULL,
    `recipient_id` BIGINT NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChattingRoom` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_visible` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Chat` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `chat_id` BIGINT NOT NULL,
    `service_id` BIGINT NOT NULL,
    `last_read_time` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `chat_id` BIGINT NOT NULL,
    `sender_id` BIGINT NOT NULL,
    `detail_message` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `type` ENUM('TEXT', 'COFFEECHAT', 'SYSTEM') NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CoffeeChat` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `requester_id` BIGINT NOT NULL,
    `receiver_id` BIGINT NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `scheduled_at` DATETIME(3) NOT NULL,
    `place` TEXT NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'CANCELED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `serviceId` BIGINT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserDB` ADD CONSTRAINT `UserDB_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserDB` ADD CONSTRAINT `UserDB_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserArea` ADD CONSTRAINT `UserArea_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserArea` ADD CONSTRAINT `UserArea_high_area_id_fkey` FOREIGN KEY (`high_area_id`) REFERENCES `HighArea`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserArea` ADD CONSTRAINT `UserArea_low_area_id_fkey` FOREIGN KEY (`low_area_id`) REFERENCES `LowArea`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LowArea` ADD CONSTRAINT `LowArea_high_area_id_fkey` FOREIGN KEY (`high_area_id`) REFERENCES `HighArea`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecruitingArea` ADD CONSTRAINT `RecruitingArea_recruiting_id_fkey` FOREIGN KEY (`recruiting_id`) REFERENCES `RecruitingNotice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecruitingArea` ADD CONSTRAINT `RecruitingArea_high_area_id_fkey` FOREIGN KEY (`high_area_id`) REFERENCES `HighArea`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecruitingArea` ADD CONSTRAINT `RecruitingArea_low_area_id_fkey` FOREIGN KEY (`low_area_id`) REFERENCES `LowArea`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecruitingNotice` ADD CONSTRAINT `RecruitingNotice_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubscribedNotice` ADD CONSTRAINT `SubscribedNotice_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubscribedNotice` ADD CONSTRAINT `SubscribedNotice_recruiting_notice_id_fkey` FOREIGN KEY (`recruiting_notice_id`) REFERENCES `RecruitingNotice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feed` ADD CONSTRAINT `Feed_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedHeart` ADD CONSTRAINT `FeedHeart_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedHeart` ADD CONSTRAINT `FeedHeart_feed_id_fkey` FOREIGN KEY (`feed_id`) REFERENCES `Feed`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedComment` ADD CONSTRAINT `FeedComment_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedComment` ADD CONSTRAINT `FeedComment_feed_id_fkey` FOREIGN KEY (`feed_id`) REFERENCES `Feed`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FeedImage` ADD CONSTRAINT `FeedImage_feed_id_fkey` FOREIGN KEY (`feed_id`) REFERENCES `Feed`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RecentHashtag` ADD CONSTRAINT `RecentHashtag_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityCard` ADD CONSTRAINT `ActivityCard_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Keyword` ADD CONSTRAINT `Keyword_card_id_fkey` FOREIGN KEY (`card_id`) REFERENCES `ActivityCard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interest` ADD CONSTRAINT `Interest_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Interest` ADD CONSTRAINT `Interest_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Network` ADD CONSTRAINT `Network_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Network` ADD CONSTRAINT `Network_recipient_id_fkey` FOREIGN KEY (`recipient_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_chat_id_fkey` FOREIGN KEY (`chat_id`) REFERENCES `ChattingRoom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Chat` ADD CONSTRAINT `Chat_service_id_fkey` FOREIGN KEY (`service_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_chat_id_fkey` FOREIGN KEY (`chat_id`) REFERENCES `ChattingRoom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_sender_id_fkey` FOREIGN KEY (`sender_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CoffeeChat` ADD CONSTRAINT `CoffeeChat_requester_id_fkey` FOREIGN KEY (`requester_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CoffeeChat` ADD CONSTRAINT `CoffeeChat_receiver_id_fkey` FOREIGN KEY (`receiver_id`) REFERENCES `Service`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CoffeeChat` ADD CONSTRAINT `CoffeeChat_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `Service`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
