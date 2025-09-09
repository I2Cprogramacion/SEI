-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "curp" TEXT,
    "rfc" TEXT,
    "noCvu" TEXT,
    "telefono" TEXT,
    "ultimoGradoEstudios" TEXT,
    "empleoActual" TEXT,
    "lineaInvestigacion" TEXT,
    "nacionalidad" TEXT NOT NULL DEFAULT 'Mexicana',
    "fechaNacimiento" TIMESTAMP(3),
    "institucionId" TEXT,
    "origen" TEXT,
    "archivoProcesado" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."institutions" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT,
    "ubicacion" TEXT,
    "sitioWeb" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."investigadores" (
    "id" SERIAL NOT NULL,
    "nombreCompleto" TEXT NOT NULL,
    "curp" TEXT,
    "rfc" TEXT,
    "noCvu" TEXT,
    "correo" TEXT NOT NULL,
    "telefono" TEXT,
    "ultimoGradoEstudios" TEXT,
    "empleoActual" TEXT,
    "lineaInvestigacion" TEXT,
    "nacionalidad" TEXT NOT NULL DEFAULT 'Mexicana',
    "fechaNacimiento" TIMESTAMP(3),
    "fechaRegistro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "origen" TEXT,
    "archivoProcesado" TEXT,
    "password" TEXT,

    CONSTRAINT "investigadores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "public"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_userId_key" ON "public"."profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_curp_key" ON "public"."profiles"("curp");

-- CreateIndex
CREATE UNIQUE INDEX "investigadores_curp_key" ON "public"."investigadores"("curp");

-- CreateIndex
CREATE UNIQUE INDEX "investigadores_correo_key" ON "public"."investigadores"("correo");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."profiles" ADD CONSTRAINT "profiles_institucionId_fkey" FOREIGN KEY ("institucionId") REFERENCES "public"."institutions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
