/*
  Warnings:

  - Added the required column `capacity` to the `Space` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Space` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "capacity" INTEGER NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "favourite" BOOLEAN;
