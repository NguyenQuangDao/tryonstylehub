/*
  Warnings:

  - A unique constraint covering the columns `[ownerId]` on the table `Shop` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ownerId` to the `Shop` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Shop` ADD COLUMN `ownerId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `resetPasswordExpires` DATETIME(3) NULL,
    ADD COLUMN `resetPasswordToken` VARCHAR(255) NULL,
    ADD COLUMN `role` ENUM('SHOPPER', 'SELLER', 'ADMIN') NOT NULL DEFAULT 'SHOPPER',
    ADD COLUMN `tokenBalance` INTEGER NOT NULL DEFAULT 10;

-- CreateTable
CREATE TABLE `SellerApplication` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `businessName` VARCHAR(255) NOT NULL,
    `businessDescription` TEXT NOT NULL,
    `website` VARCHAR(1024) NULL,
    `socialMedia` TEXT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `reviewedBy` INTEGER NULL,
    `reviewedAt` DATETIME(3) NULL,
    `rejectionReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SellerApplication_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TokenPurchase` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `stripePaymentId` VARCHAR(255) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `tokens` INTEGER NOT NULL,
    `status` VARCHAR(50) NOT NULL DEFAULT 'completed',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TokenPurchase_stripePaymentId_key`(`stripePaymentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Shop_ownerId_key` ON `Shop`(`ownerId`);

-- CreateIndex
CREATE INDEX `Shop_ownerId_idx` ON `Shop`(`ownerId`);

-- CreateIndex
CREATE INDEX `User_resetPasswordToken_idx` ON `User`(`resetPasswordToken`);

-- AddForeignKey
ALTER TABLE `Shop` ADD CONSTRAINT `Shop_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SellerApplication` ADD CONSTRAINT `SellerApplication_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
