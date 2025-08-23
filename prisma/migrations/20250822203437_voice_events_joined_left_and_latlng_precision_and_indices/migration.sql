/*
  Warnings:

  - You are about to alter the column `lat` on the `CitizenProfile` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(9,6)`.
  - You are about to alter the column `lng` on the `CitizenProfile` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(9,6)`.
  - You are about to alter the column `lastLat` on the `Unit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(9,6)`.
  - You are about to alter the column `lastLng` on the `Unit` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(9,6)`.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."IncidentEventType" ADD VALUE 'VOICE_JOINED';
ALTER TYPE "public"."IncidentEventType" ADD VALUE 'VOICE_LEFT';

-- AlterTable
ALTER TABLE "public"."CitizenProfile" ALTER COLUMN "lat" SET DATA TYPE DECIMAL(9,6),
ALTER COLUMN "lng" SET DATA TYPE DECIMAL(9,6);

-- AlterTable
ALTER TABLE "public"."Incident" ADD COLUMN     "citizenId" TEXT;

-- AlterTable
ALTER TABLE "public"."Unit" ALTER COLUMN "lastLat" SET DATA TYPE DECIMAL(9,6),
ALTER COLUMN "lastLng" SET DATA TYPE DECIMAL(9,6);

-- CreateIndex
CREATE INDEX "Dispatch_incidentId_unitId_status_idx" ON "public"."Dispatch"("incidentId", "unitId", "status");

-- AddForeignKey
ALTER TABLE "public"."Incident" ADD CONSTRAINT "Incident_citizenId_fkey" FOREIGN KEY ("citizenId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
