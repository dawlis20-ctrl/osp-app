-- AlterTable
ALTER TABLE "Meldunek" ADD COLUMN "emailSentAt" DATETIME;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN "emailSentAt" DATETIME;

-- CreateTable
CREATE TABLE "ReportPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportPhoto_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
