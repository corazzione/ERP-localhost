# Changelog do Projeto ERP Unificado

Este documento mantém um registro das alterações, correções e novas funcionalidades implementadas no projeto.

## [2025-11-25] - Ciclo de Desenvolvimento & QA

### ✨ Novas Funcionalidades

#### Módulo de Clientes (CRUD Completo)
- **Edição:** Implementada funcionalidade de editar dados de clientes existentes.
- **Inativação:** Adicionado suporte para inativar/ativar clientes, mantendo histórico.
- **Listagem:** Backend ajustado para listar todos os clientes (ativos e inativos), com badges de status na UI.
- **UI/UX:**
  - Integração com `useToast` para feedback visual.
  - Adicionado `LoadingSpinner` para operações assíncronas.
  - Melhoria no layout da tabela e modal.

### 🐛 Correções de Bugs (QA Report)

#### Autenticação
- **Login:** Adicionado feedback visual (toast vermelho) para erros de credenciais inválidas (BUG #001).

#### Produtos
- **Estoque:** Implementada validação robusta no backend para impedir cadastro de estoque negativo (BUG #005).
- **Inativação:** Verificado comportamento de inativação; produtos permanecem listados com status "Inativo" corretamente (BUG #004 - Não reproduzível/Resolvido).
- **Feedback:** Corrigidos problemas de visibilidade dos Toasts (z-index) que impediam mensagens de sucesso/erro de aparecerem sobre os modais (BUG #002 & #003).

#### UI Geral
- **Toasts:** Ajustado `z-index` do container de notificações para `999999` para garantir visibilidade sobre todos os elementos.

### ✨ Módulo de Vendas (PDV)
- **Interface PDV:** Implementada tela de vendas com busca de produtos e carrinho de compras.
- **Funcionalidades:**
  - Adição/Remoção de itens com validação de estoque.
  - Seleção de clientes.
  - Finalização de venda com múltiplos meios de pagamento.
  - Baixa automática de estoque.

### 🐛 Correções Dashboard
- **Métricas:** Corrigido erro 500 no cálculo de métricas causado por query incorreta no Prisma. Agora exibe faturamento e produtos mais vendidos corretamente.

### 💰 Sistema de Crédito (Conta Cliente)
- **Saldo Pré-pago:** Adicionado campo `saldoCredito` ao cliente.
- **Gestão:** Nova tela de detalhes do cliente para adicionar crédito e visualizar extrato.
- **PDV:** Opção de "Usar Saldo em Conta" na finalização da venda, permitindo pagamentos mistos (Crédito + Outro).

---

## Próximos Passos
- Implementação detalhada do **Crediário** (geração de carnês e parcelas).
- Relatórios avançados.
