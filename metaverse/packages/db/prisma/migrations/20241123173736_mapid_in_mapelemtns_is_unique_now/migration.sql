/*
  Warnings:

  - A unique constraint covering the columns `[mapId]` on the table `mapElements` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "mapElements_mapId_key" ON "mapElements"("mapId");
