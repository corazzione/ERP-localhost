# Auditoria e Refatoração do Dashboard - Documentação Técnica

Este documento registra o plano técnico, histórico de alterações e referência de endpoints da auditoria completa do Dashboard.

## Visão Geral
O objetivo desta auditoria foi eliminar dados mockados, implementar filtros funcionais (loja, período), adicionar um sistema de notificações e aprimorar a gestão de lojas, garantindo integridade de dados e uma experiência de usuário premium.

## Histórico de Fases

### Fase 1: Auditoria de Dados Mockados
**Objetivo**: Identificar todos os pontos de dados falsos no frontend.
- **Ações**:
    - Mapeamento de `generateMockDailyData` e fallbacks em `Dashboard.jsx`.
    - Identificação de mocks em `IntelligentOverviewCard.jsx` e `PremiumKPICard.jsx`.
- **Status**: Concluído.

### Fase 2: Backend - Suporte a Filtros
**Objetivo**: Permitir filtragem por loja e período no backend.
- **Decisões**:
    - Adicionado suporte a `store='all'` para agregação.
    - Implementado filtro `ativo: true` para lojas na agregação.
- **Status**: Concluído.

### Fase 3: Sistema de Notificações
**Objetivo**: Criar canal de comunicação com o usuário.
- **Implementação**:
    - Tabela `Notification` no Postgres.
    - Endpoints `GET /notifications` e `PATCH /notifications/:id/read`.
    - Dropdown no Header com badge de não lidas.
- **Status**: Concluído.

### Fase 4 & 5: Frontend - Limpeza e Integração
**Objetivo**: Remover mocks e conectar API real.
- **Ações**:
    - Remoção de funções geradoras de dados falsos.
    - Tratamento de estados de loading e erro.
    - Integração do `NotificationDropdown`.
- **Status**: Concluído.

### Fase 6 & 7: Gestão de Lojas (Dinâmico)
**Objetivo**: Tornar o seletor de lojas dinâmico.
- **Implementação**:
    - Endpoints `GET /stores` e `POST /stores`.
    - Modal `CreateStoreModal`.
    - `StoreDropdown` dinâmico no Header.
- **Status**: Concluído.

### Fase 9: Refinamento Visual e Lógico
**Objetivo**: Polimento e correções.
- **Ações**:
    - Melhoria visual no dropdown de lojas (tema dark/light).
    - Correção na lógica de agregação de vendas.
- **Status**: Concluído.

### Fase 10: Gestão Avançada de Lojas
**Objetivo**: Permitir edição e exclusão de lojas.
- **Implementação**:
    - `PATCH /stores/:id` (Update nome/código).
    - `DELETE /stores/:id` (Soft delete: `ativo = false`).
    - Modal `ManageStoresModal` integrado ao dropdown.
    - Lógica de reset de filtro ao excluir loja selecionada.
- **Status**: Concluído.

### Fase 11: Aprimoramento do Panorama de Movimentações (Em Progresso)
**Objetivo**: Filtros avançados por aba na "Visão Geral Inteligente".
- **Planejamento**:
    - Filtros específicos para abas: Todas, Entradas, Saídas, Crediário.
    - Cálculo de "Lucro Simples" (Entradas - Saídas).
    - UI de filtros locais no card.

## Referência de Endpoints

### Dashboard
- `GET /api/dashboard`
    - **Params**: `period` (today, week, month, year, custom), `store` (all, UUID), `startDate`, `endDate`.
    - **Retorno**: KPIs, gráfico de vendas, financeiro, movimentações.

- `GET /api/dashboard/overview`
    - **Params**: `period`, `store`, `tab` (todas, entradas, saidas, crediario), filtros específicos (`type`, `category`, etc.).
    - **Retorno**: Heatmap, destaques (top produto, dia forte), tendência, dados filtrados da aba.

### Lojas
- `GET /api/stores`: Lista lojas ativas.
- `POST /api/stores`: Cria nova loja.
- `PATCH /api/stores/:id`: Atualiza loja.
- `DELETE /api/stores/:id`: Soft delete.

### Notificações
- `GET /api/notifications`: Lista notificações.
- `PATCH /api/notifications/:id/read`: Marca como lida.
