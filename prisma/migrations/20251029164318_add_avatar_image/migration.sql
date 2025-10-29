-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `imageUrl` VARCHAR(1024) NOT NULL,
    `price` DOUBLE NOT NULL,
    `styleTags` TEXT NOT NULL,
    `shopId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Shop` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `url` VARCHAR(1024) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Outfit` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `style` TEXT NOT NULL,
    `imageUrl` VARCHAR(1024) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `avatar` VARCHAR(1024) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TryOnHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `modelImageUrl` VARCHAR(1024) NOT NULL,
    `garmentImageUrl` VARCHAR(1024) NOT NULL,
    `resultImageUrl` VARCHAR(1024) NOT NULL,
    `modelVersion` VARCHAR(50) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CostTracking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `service` VARCHAR(100) NOT NULL,
    `operation` VARCHAR(100) NOT NULL,
    `cost` DOUBLE NOT NULL,
    `details` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VirtualModel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `avatarName` VARCHAR(255) NOT NULL,
    `isPublic` BOOLEAN NOT NULL DEFAULT false,
    `avatarImage` VARCHAR(1024) NULL,
    `height` DOUBLE NOT NULL,
    `weight` DOUBLE NOT NULL,
    `gender` VARCHAR(50) NOT NULL,
    `bodyShape` VARCHAR(50) NULL,
    `skinTone` VARCHAR(50) NULL,
    `muscleLevel` INTEGER NULL,
    `fatLevel` INTEGER NULL,
    `shoulderWidth` DOUBLE NULL,
    `waistSize` DOUBLE NULL,
    `hipSize` DOUBLE NULL,
    `legLength` DOUBLE NULL,
    `hairColor` VARCHAR(50) NOT NULL,
    `hairStyle` VARCHAR(50) NOT NULL,
    `eyeColor` VARCHAR(50) NULL,
    `faceShape` VARCHAR(50) NULL,
    `beardStyle` VARCHAR(50) NULL,
    `tattoos` TEXT NULL,
    `piercings` TEXT NULL,
    `clothingStyle` VARCHAR(50) NULL,
    `accessories` TEXT NULL,
    `footwearType` VARCHAR(50) NULL,
    `colorPalette` TEXT NULL,
    `ageAppearance` INTEGER NULL,
    `bodyProportionPreset` VARCHAR(50) NULL,
    `sessionId` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `VirtualModel_userId_idx`(`userId`),
    INDEX `VirtualModel_sessionId_idx`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_OutfitProducts` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_OutfitProducts_AB_unique`(`A`, `B`),
    INDEX `_OutfitProducts_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_shopId_fkey` FOREIGN KEY (`shopId`) REFERENCES `Shop`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VirtualModel` ADD CONSTRAINT `VirtualModel_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OutfitProducts` ADD CONSTRAINT `_OutfitProducts_A_fkey` FOREIGN KEY (`A`) REFERENCES `Outfit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_OutfitProducts` ADD CONSTRAINT `_OutfitProducts_B_fkey` FOREIGN KEY (`B`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
