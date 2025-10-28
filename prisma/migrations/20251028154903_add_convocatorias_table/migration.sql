/*
  Warnings:

  - You are about to drop the `investigadores` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."profiles" ADD COLUMN     "areaInvestigacion" TEXT,
ADD COLUMN     "fotografiaUrl" TEXT,
ADD COLUMN     "institucion" TEXT;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "lastActive" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "public"."investigadores";

-- CreateTable
CREATE TABLE "public"."convocatorias" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "organizacion" TEXT,
    "descripcion" TEXT,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaCierre" TIMESTAMP(3) NOT NULL,
    "montoMaximo" TEXT,
    "categoria" TEXT,
    "pdfUrl" TEXT,
    "estado" TEXT NOT NULL DEFAULT 'Abierta',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "convocatorias_pkey" PRIMARY KEY ("id")
);
