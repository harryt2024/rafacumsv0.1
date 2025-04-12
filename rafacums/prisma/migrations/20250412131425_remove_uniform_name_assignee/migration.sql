/*
  Warnings:

  - You are about to drop the column `assigneeName` on the `UniformItem` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `UniformItem` table. All the data in the column will be lost.
  - The values [SHIRT,JACKET,TROUSERS,BELT,HAT_OTHER,BOOTS,SHOES,TIE,RANK_SLIDE,OTHER] on the enum `UniformItem_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropIndex
DROP INDEX `UniformItem_assigneeName_idx` ON `UniformItem`;

-- AlterTable
ALTER TABLE `UniformItem` DROP COLUMN `assigneeName`,
    DROP COLUMN `name`,
    MODIFY `type` ENUM('MENS_WEDGEWOOD_SHIRT', 'MENS_WORKING_BLUES_SHIRT', 'LADIES_WEDGEWOOD_SHIRT', 'LADIES_WORKING_BLUES_SHIRT', 'MENS_TROUSERS', 'LADIES_TROUSERS', 'JUMPER', 'GELTEX', 'BERET', 'BLUE_GREY_BELT', 'BRASSARD', 'COVERALLS', 'SOCKS', 'GLOVES') NOT NULL;
