# 🚀 QUICK_START_GUIDE.md - Referência Rápida

> Este arquivo é um resumo executivo do PROJECT_MASTER_PLAN.md  
> Use isto para referência rápida, mas **leia o master plan completo** antes de mudanças significativas.

---

## ⚡ Comandos Essenciais

```bash
# Backend (Port 5000)
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

# Frontend (Port 3000)
cd frontend
npm install
npm run dev

# Acessar
http://localhost:3000
Email: admin@erp.com
Senha: senha123
```

---

## 📂 Estrutura de Diretórios (Simplificada)

```
backend/src/
├── controllers/     # Lógica das rotas
├── services/        # Regras de negócio complexas
├── routes/          # Definição de endpoints
└── middleware/      # Autenticação JWT

frontend/src/
├── pages/           # Telas da aplicação
├── components/      # Componentes reutilizáveis
├── styles/          # Design System CSS
└── services/        # API client (Axios)
```

---

## ✅ O Que Funciona (Status Real)

| Módulo | Status | Notas |
|--------|--------|-------|
| Login/Auth | ✅ Completo | JWT 24h |
| Produtos | ✅ Completo | CRUD + Estoque |
| Clientes | ✅ Completo | CRUD + Conta Cliente |
| Vendas (PDV) | ✅ Completo | Múltiplas formas pagamento |
| Crediário Básico | ✅ Funcional | Parcelas fixas SEM juros |
| Crediário Avançado | ✅ Implementado | Juros compostos + Quitação CDC |
| Dashboard | ✅ Funcional | KPIs básicos |
| Financeiro | ⚠️ Básico | Precisa expansão |
| Relatórios | ⚠️ Estrutura | Faltam gráficos |
| Fiscal | ❌ Simulado | Não integra SEFAZ |

---

## ⚠️ Gaps Críticos (Prioridade)

1. **Crediário Duplicado**
   - PDV cria carnês SEM juros (vendaController.js)
   - Gestão usa juros compostos (crediarioController.js)
   - **Ação:** Unificar usando crediarioService em ambos

2. **Financeiro Incompleto**
   - Não mostra Parcelas do Crediário
   - **Ação:** Criar visão consolidada (ContasReceber + Parcelas)

3. **Gestão de Usuários**
   - Backend pronto, frontend não existe
   - **Ação:** Criar `Usuarios.jsx`

4. **PDV Duplicado**
   - PDV.jsx e Vendas.jsx são redundantes
   - **Ação:** Consolidar em um só

---

## 🔧 Padrões de Código

### Backend (Node.js/Express)
```javascript
// Controller (magro)
export const criarProduto = async (req, res) => {
  try {
    const produto = await prisma.produto.create({ data: req.body });
    res.status(201).json(produto);
  } catch (error) {
    res.status(500).json({ error: 'Mensagem' });
  }
};

// Service (lógica complexa)
export const calcularJuros = (valor, taxa, parcelas) => {
  // Cálculos complexos aqui
};

// Transações (operações multi-tabela)
await prisma.$transaction(async (tx) => {
  await tx.venda.create({ ... });
  await tx.cliente.update({ ... });
});
```

### Frontend (React)
```jsx
// Componente funcional
function MinhaPage() {
  const [data, setData] = useState([]);
  const { showToast } = useToast();
  
  useEffect(() => {
    api.get('/endpoint').then(res => setData(res.data));
  }, []);
  
  const handleSave = async () => {
    try {
      await api.post('/endpoint', {...});
      showToast('Sucesso!', 'success');
    } catch (error) {
      showToast('Erro!', 'error');
    }
  };
  
  return <div>...</div>;
}
```

---

## 🗺️ Roadmap Imediato

### Fase 1: Consolidação (Agora)
- [ ] Unificar Crediário (integrar crediarioService no PDV)
- [ ] Melhorar Financeiro.jsx (tabs, visão unificada)
- [ ] Consolidar PDV (escolher Vendas.jsx)
- [ ] Criar Usuarios.jsx

### Fase 2: Visualização (Depois)
- [ ] Gráficos no Dashboard (Recharts)
- [ ] Relatórios com filtros
- [ ] Export PDF/Excel
- [ ] DRE Gerencial

### Fase 3: Integrações (Futuro)
- [ ] API Fiscal real (FocusNFe)
- [ ] Conciliação Bancária
- [ ] Marketplaces
- [ ] Pix automático

---

## 🐛 Bugs Conhecidos

1. **BUG-004** (Médio): Dropdown clientes no PDV às vezes vazio
   - **Workaround:** Recarregar a página
   - **Arquivo:** `Vendas.jsx` linha ~170

2. **BUG-005** (Baixo): Crediário no PDV sempre cria com taxaJuros=0
   - **Esperado:** Por design (versão simples)
   - **Solução:** Fase 1 do roadmap

---

## 📚 Arquivos de Referência

| Arquivo | Propósito |
|---------|-----------|
| `PROJECT_MASTER_PLAN.md` | **Documento completo** (leia isto!) |
| `README.md` | Setup inicial |
| `GETTING_STARTED.md` | Guia passo a passo |
| `CHANGELOG.md` | Histórico de mudanças |
| `QA_REPORT.md` | Testes manuais |
| `QUICK_START_GUIDE.md` | Este arquivo |

---

## 🆘 Solução de Problemas Comuns

### Backend não inicia
```bash
# Verificar se PostgreSQL está rodando
psql -U postgres

# Verificar .env
cat backend/.env

# Regerar Prisma Client
cd backend
npx prisma generate
```

### Frontend não conecta ao backend
```bash
# Verificar proxy no vite.config.js
# Deve apontar para http://localhost:5000
```

### Migrations dando erro
```bash
# Reset completo (CUIDADO: apaga dados)
cd backend
npx prisma migrate reset
npx prisma migrate dev
npx prisma db seed
```

---

## 📞 Informações de Schema

### Modelos Principais
- `Usuario` (id, email, senha, role)
- `Cliente` (id, nome, cpfCnpj, **saldoCredito**, **saldoDevedor**)
- `Produto` (id, codigo, nome, **estoqueAtual**, **estoqueMinimo**)
- `Venda` (id, numero, clienteId, usuarioId, total, formaPagamento)
- `Carne` (id, vendaId, clienteId, **taxaJuros**, **valorTotal**)
- `Parcela` (id, carneId, **numeroParcela**, **dataVencimento**, **status**)

### Relações Importantes
```
Cliente
  → vendas[]
  → carnes[]
  → contasReceber[]
  
Venda
  → itens[] (ItemVenda)
  → carne (opcional)
  
Carne
  → parcelas[]
```

---

**Última Atualização:** 26/11/2025 23:10  
**Mantenha este arquivo sincronizado com o PROJECT_MASTER_PLAN.md**
