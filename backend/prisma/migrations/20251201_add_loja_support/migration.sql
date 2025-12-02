-- CreateTable
CREATE TABLE "Loja" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "endereco" TEXT,
    "telefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Loja_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Venda" ADD COLUMN "lojaId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Loja_codigo_key" ON "Loja"("codigo");

-- CreateIndex
CREATE INDEX "Loja_codigo_idx" ON "Loja"("codigo");

-- CreateIndex
CREATE INDEX "Loja_ativo_idx" ON "Loja"("ativo");

-- AddForeignKey
ALTER TABLE "Venda" ADD CONSTRAINT "Venda_lojaId_fkey" FOREIGN KEY ("lojaId") REFERENCES "Loja"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Insert default stores
INSERT INTO "Loja" (id, nome, codigo, endereco, ativo) VALUES
('loja-principal-001', 'Loja Principal', 'LP001', 'Endereço da Loja Principal', true),
('filial-001', 'Filial 1', 'F001', 'Endereço da Filial 1', true);

-- Update existing sales to belong to main store
UPDATE "Venda" SET "lojaId" = 'loja-principal-001' WHERE "lojaId" IS NULL;
