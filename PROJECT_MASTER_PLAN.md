2. [Arquitetura e Stack](#2--arquitetura-e-stack)
3. [Status dos Módulos](#3--status-dos-módulos)
4. [Gaps de Implementação](#4--gaps-de-implementação-crítico)
5. [Bugs Conhecidos](#5--bugs-conhecidos)
6. [Roadmap](#6--roadmap)
7. [Instruções para Agentes](#7--instruções-para-agentes)
8. [Detalhamento Técnico](#8--detalhamento-técnico-por-módulo)

---

## 1. 📋 Visão Geral

### Objetivo do Projeto
Criar um **ERP Unificado** similar ao Tiny ERP e Bling que integre:
- Vendas multicanal (Loja física, Online, Marketplaces)
- Controle de Estoque completo
- Módulo Financeiro (Contas a Pagar/Receber, Fluxo de Caixa, DRE)
- **Crediário Avançado** com carnês, parcelas, juros compostos e quitação antecipada
- Módulo Fiscal (NFe, NFCe, NFSe)
- Relatórios Gerenciais
- Dashboard executivo

### Stack Tecnológica
| Camada | Tecnologia | Versão | Status |
|--------|-----------|---------|--------|
| **Backend** | Node.js + Express | 18.x | ✅ Funcionando |
| **ORM/DB** | Prisma + PostgreSQL | 5.20.0 | ✅ Funcionando |
| **Autenticação** | JWT + bcrypt | - | ✅ Funcionando |
| **Frontend** | React 18 + Vite | 18.x | ✅ Funcionando |
| **Estilização** | CSS Modules + Design System | - | ✅ Funcionando |
| **HTTP Client** | Axios | - | ✅ Funcionando |

---

## 2. 🏗️ Arquitetura e Stack

### Estrutura de Pastas
```
ERP localhost/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Modelo de dados (13 modelos)
│   │   ├── migrations/             # Histórico de alterações no DB
│   │   └── seed.js                 # Dados iniciais (admin + exemplos)
│   ├── src/
│   │   ├── controllers/            # Lógica de negócio (MVC)
│   │   │   ├── authController.js   ✅ Login/Autenticação
│   │   │   ├── clienteController.js ✅ CRUD Clientes + Crédito
│   │   │   ├── produtoController.js ✅ CRUD Produtos
│   │   │   ├── vendaController.js   ✅ Vendas + PDV simples
│   │   │   ├── crediarioController.js ✅ Carnês avançados
│   │   │   ├── financeiroController.js ✅ Contas Pagar/Receber
│   │   │   ├── dashboardController.js ✅ Métricas
│   │   │   ├── relatorioController.js ⚠️ Estrutura OK, falta gráficos
│   │   │   └── fiscalController.js ⚠️ SIMULADO (não integra SEFAZ)
│   │   ├── services/
│   │   │   └── crediarioService.js ✅ Cálculos de juros/quitação
│   │   ├── routes/                 # Definição de endpoints
│   │   ├── middleware/
│   │   │   └── authMiddleware.js   ✅ Proteção JWT
│   │   └── server.js               # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Modal.jsx           ✅ Modal reutilizável
│   │   │   ├── Toast.jsx           ✅ Notificações
│   │   │   └── LoadingSpinner.jsx  ✅ Loading state
│   │   ├── pages/
│   │   │   ├── Login.jsx           ✅ Tela de login
│   │   │   ├── Dashboard.jsx       ✅ Home com KPIs
│   │   │   ├── Produtos.jsx        ✅ CRUD Produtos
│   │   │   ├── Clientes.jsx        ✅ CRUD Clientes
│   │   │   ├── ClienteDetalhes.jsx ✅ Conta cliente + Parcelas
│   │   │   ├── Vendas.jsx          ✅ PDV completo
│   │   │   ├── PDV.jsx             ⚠️ PDV fullscreen (duplicado?)
│   │   │   ├── Crediario.jsx       ✅ Gestão de carnês
│   │   │   ├── Financeiro.jsx      ⚠️ Básico, precisa expansão
│   │   │   └── Relatorios.jsx      ⚠️ Estrutura básica
│   │   ├── styles/
│   │   │   ├── global.css          ✅ Design System vars
│   │   │   ├── Toast.css
│   │   │   └── Modal.css
│   │   ├── services/
│   │   │   └── api.js              ✅ Axios + interceptors JWT
│   │   └── App.jsx                 ✅ Router + ToastProvider
│   └── package.json
├── PROJECT_MASTER_PLAN.md          📍 VOCÊ ESTÁ AQUI
├── README.md                       # Instruções de setup
├── CHANGELOG.md                    # Histórico de mudanças
├── QA_REPORT.md                    # Relatório de testes
└── GETTING_STARTED.md              # Guia inicial
```

### Modelos do Banco de Dados (schema.prisma)
| Modelo | Relações | Status | Notas |
|--------|----------|--------|-------|
| `Usuario` | vendas[] | ✅ OK | Admin + Vendedores |
| `Cliente` | vendas[], carnes[], contasReceber[] | ✅ OK | Tem saldoCredito + saldoDevedor |
| `Fornecedor` | contasPagar[] | ✅ OK | Básico, pode expandir |
| `Produto` | variacoes[], movimentacoes[], itensVenda[] | ✅ OK | Com controle de estoque |
| `Venda` | cliente, usuario, itens[], carne | ✅ OK | Múltiplas formas de pagamento |
| `ItemVenda` | venda, produto | ✅ OK | - |
| `Carne` | venda, cliente, parcelas[] | ✅ OK | Crediário com juros |
| `Parcela` | carne | ✅ OK | Status individual |
| `ContaReceber` | cliente | ✅ OK | Financeiro separado do Crediário |
| `ContaPagar` | fornecedor | ✅ OK | - |
| `Caixa` | - | ✅ OK | Movimentações financeiras |
| `MovimentacaoEstoque` | produto | ✅ OK | Histórico de entrada/saída |
| `Configuracao` | - | ✅ OK | Chave-valor |

---

## 3. 📦 Status dos Módulos

### ✅ Autenticação e Usuários
**Status:** COMPLETO  
**Funcionalidades:**
- ✅ Login com JWT (expiração 24h)
- ✅ Middleware de proteção de rotas
- ✅ Roles (admin/vendedor) definidos
- ⚠️ **Gap:** Tela de gestão de usuários (criar/editar/inativar) não existe no frontend

**Endpoints:**
- `POST /api/auth/login` ✅
- `POST /api/auth/usuarios` ✅ (backend pronto)
- `GET /api/auth/usuarios` ✅ (backend pronto)

---

### ✅ Gestão de Produtos
**Status:** COMPLETO  
**Funcionalidades:**
- ✅ CRUD completo (Create, Read, Update, Delete/Inativar)
- ✅ Controle de estoque (atual/mínimo)
- ✅ Validação de estoque não-negativo
- ✅ Alertas de estoque baixo
- ✅ Histórico de movimentações
- ✅ UI com feedback (toasts, loading)

**Gaps:**
- ⚠️ **Variações de produto** (tamanho/cor) definidas no schema mas não implementadas
  - **Caso de Uso DTF:** Estampas de tamanhos diferentes (A4, A3, 20x30cm) com preços variáveis
- ⚠️ **Personalização de pedidos** (crucial para DTF/Serigrafia)
  - Adicionar campos customizados por produto (cor da estampa, tamanho, detalhes)
  - Calcular preço dinâmico baseado em atributos selecionados
- ⚠️ Upload de imagens de produtos
- ⚠️ Código de barras/SKU não validado
- ⚠️ Inventário cego (contagem física vs. sistema)

---

### ✅ Gestão de Clientes
**Status:** COMPLETO (Core)  
**Funcionalidades:**
- ✅ CRUD completo
- ✅ **Sistema de Conta do Cliente** (saldoCredito)
  - Adicionar crédito pré-pago
  - Usar crédito na venda
  - Histórico de uso
- ✅ **Página de Detalhes do Cliente**
  - Visualização de saldo
  - Histórico de vendas
  - Carnês e parcelas

**Gaps:**
- ⚠️ Histórico de movimentações do saldoCredito (entradas/saídas)
- ⚠️ Relatório de clientes inadimplentes
- ⚠️ Análise de crédito (score, histórico)

---

### ✅ Módulo de Vendas (PDV)
**Status:** COMPLETO (Versão 1)  
**Funcionalidades:**
- ✅ Interface PDV com busca de produtos
- ✅ Carrinho de compras
- ✅ Seleção de cliente
- ✅ Múltiplas formas de pagamento:
  - Dinheiro
  - Cartão (crédito/débito)
  - PIX
  - **Crédito em Conta** (usa saldoCredito)
  - **Crediário** (gera carnê)
- ✅ Baixa automática de estoque
- ✅ Cálculo de troco
- ✅ Validação de estoque disponível

**⚠️ IMPORTANTE - Separação de Responsabilidades:**
1. **PDV (PDV.jsx):**
   - Tela exclusiva para realizar vendas
   - Foco em agilidade e operação de caixa
   
2. **Histórico de Vendas (Vendas.jsx):**
   - Tela de consulta e análise (Read-only)
   - Filtros avançados, paginação e detalhes
   - Geração de PDF e compartilhamento WhatsApp

**Gaps:**
- ⚠️ Impressão de cupom fiscal
- ⚠️ Leitor de código de barras
- ⚠️ Atalhos de teclado (F2, F5, ESC)
- ⚠️ Desconto manual na venda

---

### ✅ Módulo de Crediário (DESTAQUE)
**Status:** COMPLETO (Com nuances)  
**Fluxo Atual:**
1. Cliente compra no PDV e escolhe "Crediário"
2. Sistema gera Carne + Parcelas (SEM juros inicialmente)
3. Cliente vai em "Crediário" no menu
4. Pode visualizar carnês, simular quitação, pagar parcelas

**Funcionalidades Implementadas:**
- ✅ Geração de carnês com parcelas
- ✅ Cálculo de juros compostos (`crediarioService.js`)
- ✅ Quitação antecipada com redução proporcional de juros
- ✅ Juros de mora (0.033% ao dia = ~1% mês)
- ✅ Multa por atraso (2%)
- ✅ Simulador de quitação
- ✅ Controle de limite de crédito
- ✅ Atualização de saldoDevedor

**⚠️ Gap Crítico:**
- A venda no PDV cria carnê SEM juros (taxaJuros: 0)
- Para aplicar juros, precisa usar o endpoint `POST /api/crediario/carne` manualmente
- **Ação necessária:** Integrar o crediarioService no fluxo de venda

**Endpoints:**
- `POST /api/crediario/carne` ✅ Criar carnê (com juros)
- `GET /api/crediario/carnes` ✅ Listar carnês
- `GET /api/crediario/carnes/:id` ✅ Detalhes
- `POST /api/crediario/parcelas/:id/pagar` ✅ Pagar parcela
- `GET /api/crediario/carnes/:id/simular-quitacao` ✅ Simulação
- `POST /api/crediario/carnes/:id/quitar` ✅ Quitação total

---

### ⚠️ Módulo Financeiro
**Status:** IMPLEMENTADO (Básico)  
**Funcionalidades:**
- ✅ Contas a Receber (CRUD)
- ✅ Contas a Pagar (CRUD)
- ✅ Baixa de contas
- ✅ Fluxo de Caixa (cálculo básico)
- ✅ Filtros por data e status

**Gaps:**
- ⚠️ Frontend Financeiro.jsx é muito básico
- ⚠️ Não integra visualmente com o Crediário (Parcelas são ContasReceber implícitas)
- ⚠️ DRE (Demonstrativo de Resultados) não implementado
- ⚠️ Conciliação bancária
- ⚠️ Categorização de despesas/receitas
- ⚠️ Gráficos de fluxo de caixa
- ⚠️ Centro de custos

**Sugestão de Melhoria:**
Criar uma visão unificada que mostre:
- Contas a Receber "normais" (ContaReceber)
- Parcelas do Crediário (Parcela)
- Saldo de Caixa (Caixa)

---

### ✅ Dashboard
**Status:** FUNCIONAL  
**Métricas Exibidas:**
- ✅ Faturamento do Mês
- ✅ Ticket Médio
- ✅ Contas a Receber Hoje
- ✅ Contas a Pagar Hoje
- ✅ **Total a Receber (Crediário)** - soma de saldoDevedor
- ✅ Alertas: Estoque Baixo, Parcelas Atrasadas
- ✅ Top 5 Produtos Mais Vendidos

**Gaps:**
- ⚠️ Gráficos visuais (há Chart.js no package mas não usado)
- ⚠️ Comparativo com mês anterior (crescimento %)
- ⚠️ Filtro de período
- ⚠️ Export de dados

---

### ⚠️ Módulo Fiscal
**Status:** SIMULADO (Não Funcional)  
**O que existe:**
- ✅ Endpoints para NF-e, NFC-e, NFS-e definidos
- ✅ Retornam JSON mockado com sucesso

**O que NÃO funciona:**
- ❌ Integração com SEFAZ
- ❌ Certificado Digital A1/A3
- ❌ XML de NF-e real
- ❌ DANFE (PDF da nota)
- ❌ Consulta de situação da nota
- ❌ Cancelamento/Inutilização

**Ação Futura:**
Integrar com APIs como FocusNFe, eNotas.io ou NFe.io

---

### ⚠️ Relatórios
**Status:** ESTRUTURA BÁSICA  
**Endpoints Backend:** ✅ Existem
- `/api/relatorios/vendas`
- `/api/relatorios/financeiro`
- `/api/relatorios/estoque`
- `/api/relatorios/crediario`

**Frontend:** ⚠️ Relatorios.jsx é um placeholder

**Gaps:**
- ❌ Gráficos visuais (Chart.js, Recharts)
- ❌ Exportação PDF/Excel
- ❌ Filtros avançados (período, categoria, cliente)
- ❌ Curva ABC de produtos
- ❌ Análise de rentabilidade por produto

---

## 4. ⚠️ Gaps de Implementação (CRÍTICO)

### 🚨 High Priority

1. **Unificação do Crediário**
   - **Problema:** Duas implementações paralelas (simples no PDV vs. avançada no Crediário)
   - **Ação:** Integrar `crediarioService.js` no fluxo de venda do PDV
   - **Arquivo:** `backend/src/controllers/vendaController.js` (linhas ~40-120)

2. **Frontend Financeiro Incompleto**
   - **Problema:** Financeiro.jsx não mostra parcelas de crediário
   - **Ação:** Criar tabs: "Contas a Receber", "Crediário", "Contas a Pagar"
   - **Arquivo:** `frontend/src/pages/Financeiro.jsx`

3. **Gestão de Usuários (Frontend)**
   - **Problema:** Backend pronto, frontend não existe
   - **Ação:** Criar `Usuarios.jsx` com CRUD
   - **Localização:** `frontend/src/pages/Usuarios.jsx` (criar)

4. **Consolidação PDV**
   - **Problema:** PDV.jsx e Vendas.jsx são redundantes
   - **Ação:** Escolher um (sugestão: manter Vendas.jsx) e deletar o outro
   - **Arquivos:** `frontend/src/pages/PDV.jsx` e `Vendas.jsx`

### 🔶 Medium Priority

5. **Relatórios Visuais**
   - Implementar gráficos com bibliotecas (Recharts ou Chart.js)
   - Exportação PDF com jsPDF/html2canvas

6. **Módulo Fiscal Real**
   - Pesquisar e escolher API (FocusNFe, eNotas, NFe.io)
   - Implementar fluxo de emissão real

7. **Histórico de Alterações**
   - Auditoria de quem alterou o quê em clientes/produtos
   - Tabela `AuditoriaLog` no schema

### 🟢 Low Priority

8. **Variações de Produto**
   - Implementar tamanhos/cores (já existe no schema, não usado)

9. **Upload de Imagens**
   - Produtos, Clientes (logo)

10. **App Mobile**
    - React Native ou PWA

---

## 5. 🐞 Bugs Conhecidos

| ID | Severidade | Módulo | Descrição | Status | Arquivo Afetado |
|----|-----------|--------|-----------|--------|----------------|
| **BUG-001** | 🟢 Baixo | Setup | Usuários confusos no passo das migrations | ✅ Resolvido | GETTING_STARTED.md atualizado |
| **BUG-002** | 🟢 Baixo | Dashboard | Layout quebra em mobile (<768px) | 📝 A Fazer | Dashboard.jsx |
| **BUG-003** | 🟡 Médio | Fiscal | URL DANFE fictícia confunde usuários | ℹ️ Documentado | fiscalController.js |
| **BUG-004** | 🟡 Médio | Vendas | Dropdown de clientes às vezes não popula | ⚠️ Workaround | Vendas.jsx (linha ~170) |
| **BUG-005** | 🟢 Baixo | Crediário | Parcelas criadas no PDV têm taxaJuros=0 sempre | ⚠️ Design | vendaController.js vs crediarioController.js |

---

## 6. 🗺️ Roadmap

### Fase 1: Consolidação (2-3 dias)
**Objetivo:** Corrigir inconsistências e unificar módulos

- [ ] **1.1** Integrar crediarioService no PDV (unificar fluxo de crediário)
- [x] **1.2** Consolidar PDV (Vendas.jsx reformulado para consulta, PDV.jsx para vendas)
- [x] **1.3** Melhorar Financeiro.jsx (tabs, visão unificada)
- [ ] **1.4** Criar página de Gestão de Usuários
- [x] **1.5** Atualizar CHANGELOG.md com estado real

### Fase 1.6: Sistema de Orçamentos e Pedidos Personalizados (4-5 dias) ⭐ APROVADO
**Objetivo:** Implementar sistema completo de orçamentos para negócios com personalização

> **📄 Plano Detalhado:** Ver `CUSTOM_ORDERS_PLAN.md` para especificações completas

- [ ] **1.6.1** Backend: Schema e Migrations
  - Criar modelos: Orcamento, ItemOrcamento, Pedido, ItemPedido, CustoPedido
  - Adicionar relações com Cliente, Usuario, Produto
  - Executar migrations
  
- [ ] **1.6.2** Backend: Controllers de Orçamento
  - POST /api/orcamentos (criar orçamento)
  - GET /api/orcamentos (listar com filtros)
  - GET /api/orcamentos/:id (detalhes)
  - POST /api/orcamentos/:id/aprovar (converter em pedido)
  - POST /api/orcamentos/:id/recusar
  
- [ ] **1.6.3** Backend: Controllers de Pedido
  - GET /api/pedidos (listar)
  - GET /api/pedidos/:id (detalhes com custos)
  - POST /api/pedidos/:id/custos (lançar custo produção)
  - DELETE /api/pedidos/custos/:id (remover custo)
  - POST /api/pedidos/:id/finalizar (converter em venda)
  - PUT /api/pedidos/:id/status (atualizar status produção)
  
- [ ] **1.6.4** Frontend: Tela de Novo Orçamento
  - Formulário de criação de orçamento
  - Seleção de cliente
  - Adição dinâmica de itens (descrição livre + preço)
  - Campo de especificações por item
  - Cálculo de total com desconto
  - Válidade do orçamento
  
- [ ] **1.6.5** Frontend: Gestão de Orçamentos
  - Lista de orçamentos (pendentes/aprovados/recusados)
  - Filtros por cliente, data, status
  - Ações: aprovar, recusar, editar, imprimir
  
- [ ] **1.6.6** Frontend: Gestão de Pedidos
  - Lista de pedidos em produção
  - Visualização de itens e especificações
  - Formulário para lançar custos (material, mão de obra, terceiros)
  - Cálculo automático de margem real
  - Ação de finalizar (converter em venda)
  
- [ ] **1.6.7** Relatórios: Análise de Margens
  - Relatório de margens por pedido personalizado
  - Comparativo faturamento vs. custo real
  - Identificação de pedidos mais lucrativos

### Fase 2: Relatórios e Visualização (3-5 dias)
**Objetivo:** Tornar o sistema mais analítico

- [ ] **2.1** Implementar gráficos no Dashboard (Chart.js ou Recharts)
- [ ] **2.2** Expandir Relatorios.jsx com filtros e gráficos
- [ ] **2.3** Adicionar exportação PDF/Excel
- [ ] **2.4** DRE Gerencial (Receitas - Despesas = Lucro)
- [ ] **2.5** Curva ABC de produtos

### Fase 3: Módulo Financeiro Avançado (5-7 dias)
**Objetivo:** Gestão financeira completa

- [ ] **3.1** Categorização de despesas (Plano de Contas)
- [ ] **3.2** Centro de Custos
- [ ] **3.3** Conciliação Bancária (import OFX)
- [ ] **3.4** Fluxo de Caixa projetado (60/90 dias)
- [ ] **3.5** Integração Pix real (webhook de pagamento)

### Fase 4: Módulo Fiscal Real (7-10 dias)
**Objetivo:** Emissão real de NF-e

- [ ] **4.1** Escolher API fiscal (FocusNFe recomendado)
- [ ] **4.2** Configuração de Certificado Digital
- [ ] **4.3** Implementar emissão de NF-e (fluxo completo)
- [ ] **4.4** DANFE (PDF real)
- [ ] **4.5** Cancelamento e inutilização
- [ ] **4.6** Consulta de status e contingência

### Fase 5: Personalização Avançada (DTF Pro) 🎨
**Objetivo:** Recursos avançados para gráficas e estamparias

- [ ] **5.1** Upload de arte do cliente
  - Cliente envia arquivo (PNG/PDF) no pedido
  - Preview automático da arte
  - Armazenamento em cloud (S3, Cloudinary)
- [ ] **5.2** Calculadora de custos DTF
  - Custo por cm² de filme DTF
  - Custo de tinta (CMYK + White)
  - Margem de lucro sugerida
  - Precificação automática por tamanho
- [ ] **5.3** Ordem de Produção
  - Gerar arquivo de produção com especificações
  - Status: Aguardando Arte → Em Produção → Pronto → Entregue
  - Integração com impressora (opcional)
- [ ] **5.4** Catálogo para clientes
  - Portal onde cliente escolhe produto + tamanho
  - Faz upload da arte
  - Vê prévia e preço em tempo real
  - Finaliza pedido online

### Fase 6: Integrações e Automação (Longo Prazo)
- [ ] Integração com Marketplaces (Mercado Livre, Shopee, etc.)
- [ ] API de pagamentos (Stone, PagSeguro, Stripe)
- [ ] Backup automático do banco
- [ ] Logs de auditoria
- [ ] Multi-empresa/multi-loja

---

## 7. 🤖 Instruções para Agentes

### Ao Assumir o Projeto

1. **✅ LEIA ESTE ARQUIVO COMPLETAMENTE** antes de qualquer ação
2. **Verifique o ambiente:**
   ```bash
   # Backend
   cd backend
   npm run dev  # Deve rodar em localhost:5000
   
   # Frontend
   cd frontend
   npm run dev  # Deve rodar em localhost:3000
   ```
3. **Consulte o schema:**
   - Abra `backend/prisma/schema.prisma`
   - Entenda os modelos e relações ANTES de alterar
4. **Credenciais padrão:**
   - Email: `admin@erp.com`
   - Senha: `senha123`

### Ao Finalizar uma Tarefa

1. **Atualize este arquivo:**
   - Mova itens de "Gaps" para "Funcionalidades"
   - Adicione novos bugs encontrados
   - Marque itens do Roadmap como concluídos
2. **Atualize o CHANGELOG.md**
3. **Se alterou o schema:**
   ```bash
   cd backend
   npx prisma migrate dev --name descricao_da_alteracao
   npx prisma generate
   ```
4. **Documente decisões técnicas importantes** neste arquivo (seção 8)

### Padrões de Código

**Backend:**
- Controllers devem ser magros (regras simples)
- Services para lógica complexa (crediarioService.js é o exemplo)
- Sempre usar transações (`prisma.$transaction`) para operações multi-tabela
- Erros retornam JSON: `{ error: 'Mensagem' }`

**Frontend:**
- Componentes funcionais (React Hooks)
- CSS Modules ou variáveis do Design System (`var(--color-primary-600)`)
- useToast para feedback
- LoadingSpinner para operações assíncronas
- Sempre validar inputs antes de enviar ao backend

---

## 8. 📚 Detalhamento Técnico por Módulo

### Módulo de Crediário (Detalhamento Completo)

#### Arquivos Envolvidos
1. **Backend:**
   - `controllers/crediarioController.js` - CRUD avançado de carnês
   - `controllers/vendaController.js` - Geração simples via PDV
   - `controllers/clienteController.js` - Pagamento de parcelas (método `pagarParcela`)
   - `services/crediarioService.js` - Cálculos de juros

2. **Frontend:**
   - `pages/Crediario.jsx` - Gestão de carnês
   - `pages/Vendas.jsx` - PDV com opção de crediário
   - `pages/ClienteDetalhes.jsx` - Visualização de parcelas

#### Fluxo de Dados (vendaController.js - Versão Simples)
```javascript
// Quando formaPagamento = 'crediario':
1. Calcula totalPagar (total - saldoCredito usado)
2. Cria Carne com:
   - valorTotal = totalPagar
   - valorOriginal = totalPagar
   - taxaJuros = 0 (FIXO!)
   - valorJuros = 0
3. Cria Parcelas:
   - valorParcela = totalPagar / numParcelas
   - dataVencimento = hoje + (30 * i) dias
4. Atualiza Cliente.saldoDevedor += totalPagar
```

#### Fluxo de Dados (crediarioController.js - Versão Avançada)
```javascript
// POST /api/crediario/carne
1. Busca Venda já criada
2. Chama crediarioService.calcularParcelas(valor, numParcelas, taxaJuros)
3. Aplica juros compostos:
   fatorJuros = (1 + taxaDecimal)^numParcelas
   valorParcela = (valor * fatorJuros * taxaDecimal) / (fatorJuros - 1)
4. Cria Carne e Parcelas
5. Atualiza saldoDevedor
```

#### Quitação Antecipada (CDC Art. 52, §2º)
```javascript
// Endpoint: GET /api/crediario/carnes/:id/simular-quitacao
Lógica (crediarioService.js):
1. Para cada parcela PENDENTE:
   - Se vencimento > hoje: desconta juros futuros
   - Se vencimento <= hoje: mantém valor + adiciona juros de mora
2. Retorna:
   - valorAQuitarHoje (com desconto)
   - valorSemDesconto (valor cheio)
   - descontoJuros
   - economia (%)
```

#### Como Unificar os Fluxos (Ação Futura)
**Opção 1 (Recomendada):**
- Adicionar campo `aplicarJuros` (boolean) no modal de finalização de venda
- Se `aplicarJuros = true`:
  - Frontend envia `taxaJuros` (input adicional)
  - vendaController.js chama `crediarioService.calcularParcelas()`
- Se `aplicarJuros = false`:
  - Mantém comportamento atual (parcelas fixas sem juros)

**Opção 2:**
- Sempre aplicar juros conforme configuração (`Configuracao.taxa_juros_crediario_padrao`)
- Usuário pode definir taxa personalizada no momento da venda

---

### Módulo Financeiro (Detalhamento)

#### Estrutura Atual
- `ContaReceber` e `ContaPagar` são tabelas independentes
- `Parcela` (do Crediário) é uma "conta a receber implícita"
- `Caixa` registra entradas/saídas brutas

#### Gap de Integração
**Problema:** Frontend Financeiro.jsx não exibe Parcelas do Crediário.

**Solução Proposta:**
```javascript
// financeiroController.js (novo endpoint)
export const obterContasReceberConsolidado = async (req, res) => {
  const contasReceber = await prisma.contaReceber.findMany({ ... });
  const parcelas = await prisma.parcela.findMany({
    where: { status: 'pendente' },
    include: { carne: { include: { cliente: true } } }
  });

  const consolidado = [
    ...contasReceber.map(c => ({
      tipo: 'conta_receber',
      descricao: c.descricao,
      valor: c.valor,
      vencimento: c.dataVencimento,
      cliente: c.cliente?.nome
    })),
    ...parcelas.map(p => ({
      tipo: 'parcela_crediario',
      descricao: `Parcela ${p.numeroParcela}/${p.carne.numParcelas}`,
      valor: p.valorParcela,
      vencimento: p.dataVencimento,
      cliente: p.carne.cliente.nome
    }))
  ];

  return consolidado.sort((a, b) => a.vencimento - b.vencimento);
};
```

---

### Dashboard (Detalhamento)

#### Métricas Calculadas (dashboardController.js)
1. **Faturamento do Mês:**
   ```sql
   SELECT SUM(total) FROM Venda
   WHERE status = 'concluida'
   AND dataVenda BETWEEN startOfMonth AND endOfMonth
   ```

2. **Contas a Receber Hoje:**
   ```sql
   SELECT SUM(valor) FROM ContaReceber
   WHERE status = 'pendente'
   AND dataVencimento = TODAY
   ```

3. **Total Crediário:**
   ```sql
   SELECT SUM(saldoDevedor) FROM Cliente
   ```

4. **Parcelas Atrasadas:**
   ```sql
   SELECT COUNT(*), SUM(valorParcela) FROM Parcela
   WHERE status = 'pendente'
   AND dataVencimento < TODAY
   ```

#### Como Adicionar Gráficos
**Bibliotecas Recomendadas:**
- **Recharts** (mais React-ish)
- **Chart.js** (mais flexível)

**Exemplo com Recharts:**
```jsx
import { AreaChart, Area, XAxis, YAxis } from 'recharts';

// Em Dashboard.jsx:
const [vendasDiarias, setVendasDiarias] = useState([]);

useEffect(() => {
  api.get('/dashboard/vendas-diarias').then(res => {
    setVendasDiarias(res.data); // [{ dia: '01/11', valor: 1500 }, ...]
  });
}, []);

<AreaChart data={vendasDiarias}>
  <XAxis dataKey="dia" />
  <YAxis />
  <Area type="monotone" dataKey="valor" fill="var(--color-primary-600)" />
</AreaChart>
```

---

## 📝 Notas de Decisões Técnicas

### 26/11/2025 - Decisão: Manter Dois Fluxos de Crediário Temporariamente
**Contexto:** Identificada duplicação entre vendaController (simples) e crediarioController (avançado).

**Decisão:** Manter ambos temporariamente para não quebrar fluxo de vendas existente.

**Ação Futura:** Fase 1.1 do roadmap unificará os dois.

---

### 26/11/2025 - Decisão: saldoCredito vs saldoDevedor
**Contexto:** Dois campos separados para crédito (pré-pago) e dívida (crediário).

**Decisão:** Manter separados. Facilita relatórios e entendimento do usuário.

**Atributos:**
- `saldoCredito` (Decimal): Valor que cliente depositou antecipadamente
- `saldoDevedor` (Decimal): Soma de parcelas pendentes do crediário

---

### 26/11/2025 - Decisão: Sistema de Orçamentos vs. Variações de Produto
**Contexto:** Usuário trabalha com DTF (Direct to Film) e precisa precificar pedidos personalizados com custos variáveis.

**Decisão:** Implementar sistema de Orçamentos/Pedidos em vez de apenas ProdutoVariacao.

**Justificativa:**
- Cada pedido DTF tem especificações únicas (tamanho da estampa, arte do cliente)
- Preço não pode ser pré-definido, precisa ser calculado por orçamento
- Necessário rastrear custos reais de produção (filme, tinta, mão de obra)
- Cálculo de margem real por pedido é crítico para o negócio

**Implementação:**
- Modelos: Orcamento → Pedido → Venda
- Lançamento de custos de produção no Pedido
- Conversão automática de Pedido finalizado em Venda
- Relatório de margens por pedido personalizado

**Compatibilidade:** ProdutoVariacao ainda pode ser usado futuramente para produtos com variações fixas (ex: tamanhos de camiseta).

---

## 🔐 Segurança e Boas Práticas

### Autenticação
- ✅ Senhas com bcrypt (salt rounds: 10)
- ✅ JWT com expiração (24h)
- ⚠️ **Gap:** Refresh tokens não implementados
- ⚠️ **Gap:** Rate limiting não configurado

### Validações
- Backend: Validar TODOS os inputs
- Frontend: Validação adicional para UX (não confiar)
- ⚠️ **Gap:** express-validator definido mas pouco usado

### Logs e Auditoria
- ⚠️ **Gap:** Não há logs estruturados (Winston, Pino)
- ⚠️ **Gap:** Auditoria de alterações não implementada

---

## 🧪 Testes

### Status Atual
- ❌ Testes unitários: Não implementados
- ❌ Testes de integração: Não implementados
- ✅ Testes manuais: QA_REPORT.md documenta testes realizados

### Recomendação Futura
- **Backend:** Jest + Supertest
- **Frontend:** React Testing Library
- **E2E:** Playwright ou Cypress

---

## 📞 Suporte e Documentação

### Arquivos de Referência
- `README.md` - Setup inicial
- `GETTING_STARTED.md` - Guia passo a passo
- `CHANGELOG.md` - Histórico de alterações
- `QA_REPORT.md` - Relatório de testes manuais
- **Este arquivo** - Contexto completo do projeto

### Credenciais de Teste
```
Email: admin@erp.com
Senha: senha123

Cliente Teste 1:
Nome: João da Silva
CPF: 12345678900

Cliente Teste 2:
Nome: Maria Santos
CPF: 98765432100
```

---

**FIM DO DOCUMENTO**

> ⚠️ **LEMBRETE PARA AGENTES:** Ao fazer qualquer alteração significativa, SEMPRE atualize este arquivo. Ele é a única fonte de verdade do projeto.
