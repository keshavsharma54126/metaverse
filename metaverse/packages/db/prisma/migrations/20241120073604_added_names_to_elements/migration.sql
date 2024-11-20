/*
  Warnings:

  - Added the required column `name` to the `Element` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `mapElements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `spaceElements` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Element" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleId" TEXT;

-- AlterTable
ALTER TABLE "mapElements" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "spaceElements" ADD COLUMN     "name" TEXT NOT NULL;
