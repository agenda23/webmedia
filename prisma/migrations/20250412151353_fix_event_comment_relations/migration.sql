/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Event` table. All the data in the column will be lost.
  - Added the required column `authorId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comment" ADD COLUMN "eventId" TEXT;

-- CreateTable
CREATE TABLE "_EventToCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "featuredImage" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "authorId" TEXT NOT NULL
);
INSERT INTO "new_Event" ("content", "createdAt", "endDate", "excerpt", "featuredImage", "id", "location", "publishedAt", "slug", "startDate", "status", "title", "updatedAt") SELECT "content", "createdAt", "endDate", "excerpt", "featuredImage", "id", "location", "publishedAt", "slug", "startDate", "status", "title", "updatedAt" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "_EventToCategory_AB_unique" ON "_EventToCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_EventToCategory_B_index" ON "_EventToCategory"("B");
