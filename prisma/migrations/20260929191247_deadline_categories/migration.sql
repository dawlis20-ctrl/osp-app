/*
  Warnings:

  - You are about to drop the column `subjectUserId` on the `Deadline` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Deadline` table. All the data in the column will be lost.
  - Added the required column `category` to the `Deadline` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicleId` to the `Deadline` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Deadline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "reminderEmail" TEXT NOT NULL,
    "lastRemindedStage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Deadline_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Deadline" ("createdAt", "dueDate", "id", "kind", "label", "lastRemindedStage", "reminderEmail") SELECT "createdAt", "dueDate", "id", "kind", "label", "lastRemindedStage", "reminderEmail" FROM "Deadline";
DROP TABLE "Deadline";
ALTER TABLE "new_Deadline" RENAME TO "Deadline";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
