-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isGlobal" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Usuario"("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- Seed initial notifications
INSERT INTO "Notification" (title, message, type, "isGlobal", "isRead")
VALUES
('🎉 Atualização: Visão Geral Inteligente', 'Novo módulo de análise inteligente adicionado ao dashboard com heatmap de 30 dias!', 'update', true, false),
('🐛 Bug Conhecido: Gráfico de Vendas', 'O gráfico ainda não considera vendas canceladas. Corrigiremos em breve.', 'bug', true, false),
('⚠️ Manutenção Programada', 'Sistema entrará em manutenção dia 05/12 às 02:00 por aproximadamente 1 hora.', 'alert', true, false);
