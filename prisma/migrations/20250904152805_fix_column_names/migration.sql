/*
  Warnings:

  - You are about to drop the column `archivoProcesado` on the `investigadores` table. All the data in the column will be lost.
  - You are about to drop the column `empleoActual` on the `investigadores` table. All the data in the column will be lost.
  - You are about to drop the column `fechaNacimiento` on the `investigadores` table. All the data in the column will be lost.
  - You are about to drop the column `fechaRegistro` on the `investigadores` table. All the data in the column will be lost.
  - You are about to drop the column `lineaInvestigacion` on the `investigadores` table. All the data in the column will be lost.
  - You are about to drop the column `noCvu` on the `investigadores` table. All the data in the column will be lost.
  - You are about to drop the column `nombreCompleto` on the `investigadores` table. All the data in the column will be lost.
  - You are about to drop the column `ultimoGradoEstudios` on the `investigadores` table. All the data in the column will be lost.
  - Added the required column `nombre_completo` to the `investigadores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."investigadores" DROP COLUMN "archivoProcesado",
DROP COLUMN "empleoActual",
DROP COLUMN "fechaNacimiento",
DROP COLUMN "fechaRegistro",
DROP COLUMN "lineaInvestigacion",
DROP COLUMN "noCvu",
DROP COLUMN "nombreCompleto",
DROP COLUMN "ultimoGradoEstudios",
ADD COLUMN     "archivo_procesado" TEXT,
ADD COLUMN     "empleo_actual" TEXT,
ADD COLUMN     "fecha_nacimiento" TIMESTAMP(3),
ADD COLUMN     "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "linea_investigacion" TEXT,
ADD COLUMN     "no_cvu" TEXT,
ADD COLUMN     "nombre_completo" TEXT NOT NULL,
ADD COLUMN     "ultimo_grado_estudios" TEXT;
