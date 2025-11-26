# ERP Unificado - Sistema de Gestão Empresarial Completo

Sistema ERP completo que integra vendas multicanal, estoque, financeiro, crediário, fiscal e relatórios em uma única plataforma moderna.

## 🚀 Tecnologias

**Backend:**
- Node.js + Express
- Prisma ORM + PostgreSQL
- JWT para autenticação

**Frontend:**
- React 18 + Vite
- Design System moderno com CSS customizado
- Axios para requisições

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL instalado e rodando
- npm ou yarn

## ⚙️ Instalação

### 1. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar .env (já criado)
# Verifique se o PostgreSQL está rodando na porta 5432

# Gerar cliente Prisma
npx prisma generate

# Executar migrations
npx prisma migrate dev --name init

# Iniciar servidor
npm run dev
```

O backend rodará em: `http://localhost:5000`

### 2. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar aplicação
npm run dev
```

O frontend rodará em: `http://localhost:3000`

## 👤 Acesso Inicial

Para criar o primeiro usuário admin, execute no backend:

```bash
cd backend
npx prisma studio
```

Ou use o Prisma Client diretamente criando um script de seed.

**Credenciais padrão (após criar):**
- Email: admin@erp.com
- Senha: senha123

## 📦 Módulos Implementados

### ✅ Core
- ✅ Autenticação JWT
- ✅ Dashboard com métricas em tempo real
- ✅ Design System moderno com paleta estratégica de cores

### ✅ Cadastros
- ✅ Clientes (com limite de crédito e saldo devedor)
- ✅ Produtos (com controle de estoque)
- ✅ Fornecedores

### ✅ Vendas
- ✅ Registro de vendas
- ✅ Baixa automática de estoque
- ✅ Múltiplas formas de pagamento

### ✅ Crediário (Destaque!)
- ✅ Criação de carnês com parcelas
- ✅ Cálculo automático de juros compostos
- ✅ **Quitação antecipada com redução de juros (CDC Art. 52, §2º)**
- ✅ Cálculo de juros de mora e multa por atraso
- ✅ Simulador de quitação antecipada
- ✅ Controle de parcelas por cliente
- ✅ Verificação de limite de crédito

### ✅ Financeiro
- ✅ Contas a pagar e receber
- ✅ Fluxo de caixa
- ✅ DRE simplificado

### ✅ Fiscal (Simulado)
- ✅ Emissão simulada de NF-e
- ✅ Emissão simulada de NFC-e
- ✅ Emissão simulada de NFS-e
- ✅ Cancelamento de notas

### ✅ Relatórios
- ✅ Relatório de vendas
- ✅ Relatório financeiro
- ✅ Relatório de estoque
- ✅ Relatório de crediário

## 🎨 Design

O sistema utiliza um design system moderno inspirado nas melhores práticas de UX/UI:

- **Cores estratégicas:** Verde para valores positivos, vermelho para negativos
- **Layout limpo:** Sidebar de navegação + conteúdo principal
- **Componentes reutilizáveis:** Cards, tabelas, badges, formulários
- **Responsivo:** Funciona em diferentes resoluções

## 📊 Funcionalidades do Crediário

O módulo de crediário é um dos destaques do sistema:

1. **Criação de Carnê:**
   - Define número de parcelas e taxa de juros
   - Calcula automaticamente valor com juros compostos
   - Verifica limite de crédito do cliente

2. **Quitação Antecipada:**
   - Simula o valor a quitar hoje
   - Calcula desconto proporcional dos juros (conforme CDC)
   - Mostra economia obtida
   - Permite quitação com um clique

3. **Controle de Pagamentos:**
   - Registro individual de parcelas
   - Cálculo automático de juros de mora (0.033% ao dia)
   - Aplicação de multa por atraso (2%)
   - Atualização automática do saldo devedor

## 🔐 Segurança

- Autenticação via JWT
- Rotas protegidas no backend
- Middleware de autenticação
- Controle de permissões por role (admin, gerente, vendedor)

## 📝 Estrutura do Projeto

```
ERP localhost/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Modelo do banco
│   ├── src/
│   │   ├── controllers/           # Lógica das rotas
│   │   ├── routes/                # Definição de rotas
│   │   ├── services/              # Lógica de negócio
│   │   ├── middleware/            # Auth middleware
│   │   └── server.js              # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # Componentes React
│   │   ├── pages/                 # Páginas da aplicação
│   │   ├── styles/                # Design system CSS
│   │   ├── services/              # API client
│   │   └── App.jsx                # Componente raiz
│   ├── index.html
│   └── package.json
├── docker-compose.yml             # Orquestração (opcional)
└── README.md
```

## 🚧 Próximos Passos (Futuras Implementações)

- [ ] PDV (Ponto de Venda) para loja física
- [ ] Integração real com marketplaces
- [ ] Integração real com APIs fiscais
- [ ] Emissão real de boletos e Pix
- [ ] Módulo de CRM completo
- [ ] Gráficos interativos com Chart.js
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Módulo de RH básico
- [ ] Módulo MRP (manufatura)
- [ ] Multiempresa/Multiunidade

## 📄 Licença

Este projeto é de uso livre para estudos e desenvolvimento.

## 👨‍💻 Desenvolvedor

Sistema desenvolvido seguindo as especificações do Tiny ERP e Bling, com funcionalidades avançadas de crediário conforme legislação brasileira (CDC).
