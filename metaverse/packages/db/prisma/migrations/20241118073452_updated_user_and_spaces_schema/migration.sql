/*
  Warnings:

  - Added the required column `updatedAt` to the `Space` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Space" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "_MemberSpaces" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_MemberSpaces_AB_unique" ON "_MemberSpaces"("A", "B");

-- CreateIndex
CREATE INDEX "_MemberSpaces_B_index" ON "_MemberSpaces"("B");

-- AddForeignKey
ALTER TABLE "_MemberSpaces" ADD CONSTRAINT "_MemberSpaces_A_fkey" FOREIGN KEY ("A") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberSpaces" ADD CONSTRAINT "_MemberSpaces_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
