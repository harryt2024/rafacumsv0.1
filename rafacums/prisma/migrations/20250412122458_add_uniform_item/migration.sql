-- CreateTable
CREATE TABLE `UniformItem` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('SHIRT', 'JACKET', 'TROUSERS', 'BELT', 'BERET', 'HAT_OTHER', 'BOOTS', 'SHOES', 'JUMPER', 'TIE', 'RANK_SLIDE', 'BRASSARD', 'OTHER') NOT NULL,
    `size` VARCHAR(191) NULL,
    `serialNumber` VARCHAR(191) NULL,
    `condition` ENUM('NEW', 'GOOD', 'FAIR', 'POOR', 'UNSERVICEABLE') NOT NULL DEFAULT 'GOOD',
    `assigneeName` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `addedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `UniformItem_serialNumber_key`(`serialNumber`),
    INDEX `UniformItem_type_idx`(`type`),
    INDEX `UniformItem_condition_idx`(`condition`),
    INDEX `UniformItem_assigneeName_idx`(`assigneeName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
