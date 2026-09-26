-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DRUH',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "alarmTime" TEXT NOT NULL,
    "arrivalTime" TEXT NOT NULL,
    "departureTime" TEXT NOT NULL,
    "returnTime" TEXT NOT NULL,
    "alarmedBy" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "purposeDescription" TEXT,
    "kpp" TEXT,
    "handover" TEXT,
    "notes" TEXT,
    "preparedById" TEXT,
    "checkedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_preparedById_fkey" FOREIGN KEY ("preparedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Report_checkedById_fkey" FOREIGN KEY ("checkedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReportCrewEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "memberId" TEXT,
    "freeText" TEXT,
    CONSTRAINT "ReportCrewEntry_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReportCrewEntry_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReportCrewEntry_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EquipmentUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "workTime" TEXT NOT NULL,
    "notes" TEXT,
    CONSTRAINT "EquipmentUsage_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OtherUnit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reportId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    CONSTRAINT "OtherUnit_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Deadline" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "reminderEmail" TEXT NOT NULL,
    "subjectUserId" TEXT,
    "lastRemindedStage" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Deadline_subjectUserId_fkey" FOREIGN KEY ("subjectUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Report_number_key" ON "Report"("number");
