/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
*/

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('CITIZEN', 'POLICE', 'ADMIN');

-- DropForeignKey
ALTER TABLE "public"."Dispatch" DROP CONSTRAINT IF EXISTS "Dispatch_incidentId_fkey";
ALTER TABLE "public"."Dispatch" DROP CONSTRAINT IF EXISTS "Dispatch_unitId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "public"."Dispatch_incidentId_unitId_key";
DROP INDEX IF EXISTS "public"."Unit_active_idx";
DROP INDEX IF EXISTS "public"."Unit_plate_key";

-- AlterTable: Unit (precisão geográfica maior)
ALTER TABLE "public"."Unit"
  ALTER COLUMN "lastLat" SET DATA TYPE DECIMAL(65,30),
  ALTER COLUMN "lastLng" SET DATA TYPE DECIMAL(65,30);

-- AlterTable: User
-- 1) remover name
ALTER TABLE "public"."User" DROP COLUMN IF EXISTS "name";

-- 2) adicionar novas colunas, mas sem NOT NULL em updatedAt ainda
ALTER TABLE "public"."User"
  ADD COLUMN IF NOT EXISTS "roles" "public"."Role"[],
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "username" TEXT,
  ALTER COLUMN "email" DROP NOT NULL,
  ALTER COLUMN "passwordHash" DROP NOT NULL;

-- 3) backfill do updatedAt nas linhas existentes
UPDATE "public"."User"
SET "updatedAt" = COALESCE("updatedAt", "createdAt", NOW())
WHERE "updatedAt" IS NULL;

-- 4) agora travar como NOT NULL e (opcional) default para inserts diretos via SQL
ALTER TABLE "public"."User" ALTER COLUMN "updatedAt" SET NOT NULL;
ALTER TABLE "public"."User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable: CitizenProfile (já com default de updatedAt)
CREATE TABLE IF NOT EXISTS "public"."CitizenProfile" (
  "userId"   TEXT NOT NULL,
  "phone"    TEXT NOT NULL,
  "street"   TEXT,
  "number"   TEXT,
  "district" TEXT,
  "city"     TEXT,
  "state"    TEXT,
  "zip"      TEXT,
  "lat"      DECIMAL(65,30),
  "lng"      DECIMAL(65,30),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CitizenProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "public"."User"("username");

-- (Opcional/Seguro) Garanta que todo Unit.id exista em User.id antes de criar FK 1:1
-- Se Unit já tem linhas cujos ids não existem na User, isso criará usuários mínimos para satisfazer a FK.
INSERT INTO "public"."User" (id, "createdAt", "updatedAt")
SELECT u.id, NOW(), NOW()
FROM "public"."Unit" u
WHERE NOT EXISTS (SELECT 1 FROM "public"."User" usr WHERE usr.id = u.id);

-- AddForeignKey
ALTER TABLE "public"."Unit"
  ADD CONSTRAINT "Unit_id_fkey"
  FOREIGN KEY ("id") REFERENCES "public"."User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."CitizenProfile"
  ADD CONSTRAINT "CitizenProfile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "public"."User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."Dispatch"
  ADD CONSTRAINT "Dispatch_incidentId_fkey"
  FOREIGN KEY ("incidentId") REFERENCES "public"."Incident"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."Dispatch"
  ADD CONSTRAINT "Dispatch_unitId_fkey"
  FOREIGN KEY ("unitId") REFERENCES "public"."Unit"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
