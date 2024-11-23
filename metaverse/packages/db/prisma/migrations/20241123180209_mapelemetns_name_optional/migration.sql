-- DropIndex
DROP INDEX "mapElements_mapId_key";

-- AlterTable
ALTER TABLE "mapElements" ALTER COLUMN "name" DROP NOT NULL;
