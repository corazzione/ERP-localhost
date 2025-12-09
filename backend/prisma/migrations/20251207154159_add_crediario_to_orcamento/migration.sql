-- AlterTable
ALTER TABLE "Orcamento" ADD COLUMN     "incluiCrediario" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "origem" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN     "simulacaoCrediario" JSONB,
ADD COLUMN     "taxaCrediario" DECIMAL(5,4);

-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "lojaId" TEXT;

-- CreateIndex
CREATE INDEX "Produto_lojaId_idx" ON "Produto"("lojaId");

-- AddForeignKey
ALTER TABLE "Produto" ADD CONSTRAINT "Produto_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE SET NULL ON UPDATE CASCADE;
