-- CreateEnum
CREATE TYPE "public"."LocationSource" AS ENUM ('MOBILE', 'WEB');

-- CreateTable
CREATE TABLE "public"."LocationSample" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unitId" TEXT,
    "incidentId" TEXT,
    "lat" DECIMAL(9,6) NOT NULL,
    "lng" DECIMAL(9,6) NOT NULL,
    "accuracy" DECIMAL(6,2),
    "speed" DECIMAL(6,2),
    "heading" DECIMAL(6,2),
    "source" "public"."LocationSource" NOT NULL DEFAULT 'MOBILE',
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationSample_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LocationSample_userId_recordedAt_idx" ON "public"."LocationSample"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "LocationSample_unitId_recordedAt_idx" ON "public"."LocationSample"("unitId", "recordedAt");

-- CreateIndex
CREATE INDEX "LocationSample_incidentId_recordedAt_idx" ON "public"."LocationSample"("incidentId", "recordedAt");

-- AddForeignKey
ALTER TABLE "public"."LocationSample" ADD CONSTRAINT "LocationSample_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LocationSample" ADD CONSTRAINT "LocationSample_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."LocationSample" ADD CONSTRAINT "LocationSample_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "public"."Incident"("id") ON DELETE SET NULL ON UPDATE CASCADE;
