-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Active', 'Inactive');

-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'Active';
