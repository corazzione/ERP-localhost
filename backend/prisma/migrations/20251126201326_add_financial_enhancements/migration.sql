/*
  Warnings:

  - You are about to drop the column `categoria` on the `ContaPagar` table. All the data in the column will be lost.
  - You are about to drop the column `categoria` on the `ContaReceber` table. All the data in the column will be lost.
  - You are about to drop the column `dataPagamento` on the `ContaReceber` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[vendaId]` on the table `ContaReceber` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[parcelaId]` on the table `ContaReceber` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ContaPagar" DROP COLUMN "categoria",
ADD COLUMN     "categoriaId" TEXT,
ADD COLUMN     "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "usuarioId" TEXT;

-- AlterTable
ALTER TABLE "ContaReceber" DROP COLUMN "categoria",
DROP COLUMN "dataPagamento",
ADD COLUMN     "categoriaId" TEXT,
ADD COLUMN     "dataCriacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dataRecebimento" TIMESTAMP(3),
ADD COLUMN     "parcelaId" TEXT,
ADD COLUMN     "usuarioId" TEXT,
ADD COLUMN     "vendaId" TEXT;

-- CreateTable
CREATE TABLE "Categoria" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "cor" TEXT,
    "icone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Categoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContaReceber_vendaId_key" ON "ContaReceber"("vendaId");

-- CreateIndex
CREATE UNIQUE INDEX "ContaReceber_parcelaId_key" ON "ContaReceber"("parcelaId");

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_vendaId_fkey" FOREIGN KEY ("vendaId") REFERENCES "Venda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaReceber" ADD CONSTRAINT "ContaReceber_parcelaId_fkey" FOREIGN KEY ("parcelaId") REFERENCES "Parcela"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContaPagar" ADD CONSTRAINT "ContaPagar_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categoria"("id") ON DELETE SET NULL ON UPDATE CASCADE;
