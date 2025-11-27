-- CreateTable
CREATE TABLE "CreditoConfig" (
    "id" TEXT NOT NULL,
    "taxaPadraoMensal" DECIMAL(5,2) NOT NULL DEFAULT 8.0,
    "tipoJurosPadrao" TEXT NOT NULL DEFAULT 'COMPOSTO',
    "multaAtrasoPercentual" DECIMAL(5,2) NOT NULL DEFAULT 2.0,
    "jurosDiarioAtrasoPercentual" DECIMAL(5,3) NOT NULL DEFAULT 0.033,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreditoConfig_pkey" PRIMARY KEY ("id")
);

-- AddColumn to Venda
ALTER TABLE "Venda" ADD COLUMN "modoCrediario" TEXT;
ALTER TABLE "Venda" ADD COLUMN "usaTaxaPadrao" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Venda" ADD COLUMN "taxaPersonalizadaMensal" DECIMAL(5,2);
ALTER TABLE "Venda" ADD COLUMN "tipoJurosPersonalizado" TEXT;

-- AlterTable Parcela - Add columns with defaults first
ALTER TABLE "Parcela" ADD COLUMN "valorPrincipal" DECIMAL(10,2);
ALTER TABLE "Parcela" ADD COLUMN "valorJurosPrevisto" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "Parcela" ADD COLUMN "valorDescontoAntecipacao" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE "Parcela" ADD COLUMN "valorTotalPrevisto" DECIMAL(10,2);

-- Populate existing records with calculated values
-- Para registros existentes, assumir que valorParcela = valorTotalPrevisto
-- e valorPrincipal = valorParcela (sem juros, pois não temos histórico)
UPDATE "Parcela" 
SET 
  "valorPrincipal" = "valorParcela",
  "valorTotalPrevisto" = "valorParcela"
WHERE "valorPrincipal" IS NULL;

-- Now make columns NOT NULL
ALTER TABLE "Parcela" ALTER COLUMN "valorPrincipal" SET NOT NULL;
ALTER TABLE "Parcela" ALTER COLUMN "valorTotalPrevisto" SET NOT NULL;

-- CreateIndex
CREATE INDEX "CreditoConfig_ativo_idx" ON "CreditoConfig"("ativo");
