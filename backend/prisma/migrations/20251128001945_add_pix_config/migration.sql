-- CreateTable
CREATE TABLE "pix_config" (
    "id" SERIAL NOT NULL,
    "nomeRecebedor" TEXT NOT NULL,
    "chavePix" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "descricaoPadrao" TEXT NOT NULL DEFAULT 'Venda Lótus Core',
    "nomeLoja" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pix_config_pkey" PRIMARY KEY ("id")
);
