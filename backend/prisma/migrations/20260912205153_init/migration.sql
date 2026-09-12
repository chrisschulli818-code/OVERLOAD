-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "sexo" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "codigoUsadoId" TEXT,
    CONSTRAINT "Usuario_codigoUsadoId_fkey" FOREIGN KEY ("codigoUsadoId") REFERENCES "CodigoAcesso" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CodigoAcesso" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "codigo" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiraEm" DATETIME,
    "limiteUsos" INTEGER NOT NULL DEFAULT 1,
    "usosCount" INTEGER NOT NULL DEFAULT 0,
    "criadoPorId" TEXT NOT NULL,
    CONSTRAINT "CodigoAcesso_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Usuario" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Treino" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuarioId" TEXT NOT NULL,
    "diaSemana" TEXT NOT NULL,
    "nomeTreino" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Treino_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Exercicio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "treinoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "grupoMuscular" TEXT,
    "seriesPlanejadas" INTEGER,
    "repeticoesPlanejadas" INTEGER,
    "pesoPlanejado" REAL,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Exercicio_treinoId_fkey" FOREIGN KEY ("treinoId") REFERENCES "Treino" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RegistroExecucao" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "exercicioId" TEXT NOT NULL,
    "data" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "serieNumero" INTEGER NOT NULL DEFAULT 1,
    "repeticoesFeitas" INTEGER NOT NULL,
    "pesoUsado" REAL NOT NULL,
    CONSTRAINT "RegistroExecucao_exercicioId_fkey" FOREIGN KEY ("exercicioId") REFERENCES "Exercicio" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_codigoUsadoId_key" ON "Usuario"("codigoUsadoId");

-- CreateIndex
CREATE UNIQUE INDEX "CodigoAcesso_codigo_key" ON "CodigoAcesso"("codigo");

-- CreateIndex
CREATE INDEX "Treino_usuarioId_idx" ON "Treino"("usuarioId");

-- CreateIndex
CREATE INDEX "Exercicio_treinoId_idx" ON "Exercicio"("treinoId");

-- CreateIndex
CREATE INDEX "RegistroExecucao_exercicioId_idx" ON "RegistroExecucao"("exercicioId");

-- CreateIndex
CREATE INDEX "RegistroExecucao_data_idx" ON "RegistroExecucao"("data");
