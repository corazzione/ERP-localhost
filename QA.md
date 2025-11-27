# QA - Test Scenarios - ERP Sistema Unificado

**Última atualização:** 2024-11-26  
**Versão:** 1.1.0  
**Total:** 33 cenários

---

## ✅ Cenários de Teste (26 passaram / 7 a testar)

### 1. Autenticação ✅
- Login válido/inválido
- **NOVO:** JWT expiration (8h) 🔄
- **NOVO:** Refresh token endpoint 🔄
- **NOVO:** Rate limiting login (5/15min) 🔄

### 2. Produtos ✅
- CRUD completo
- Validação código duplicado (BUG-003) ✅ CORRIGIDO
- Inativar/Ativar (BUG-004) ✅ CORRIGIDO
- **NOVO:** Paginação (max 100/página) ✅ CORRIGIDO
- **NOVO:** Busca por nome/código 🔄

### 3. Clientes ✅
- CRUD completo
- Visualizar detalhes + crediário
- **NOVO:** Paginação retrocompatível ✅ CORRIGIDO

### 4. Vendas ✅
- Venda simples (dinheiro)
- Venda com crediário (3x)
- Venda com crédito da loja
- Cancelar venda
- **NOVO:** Paginação + filtros por data ✅ CORRIGIDO

### 5. Crediário ✅
- Listar carnês
- Pagar parcela
- Verificar parcelas atrasadas

### 6. Dashboard ✅
- Métricas do mês (BUG-001) ✅ CORRIGIDO
- Top 5 produtos (BUG-produtoId null) ✅ CORRIGIDO
- Alertas estoque baixo

### 7. Financeiro ✅
- Contas a receber
- Contas a pagar
- Fluxo de caixa

### 8. Fornecedores & Pedidos ✅
- Criar fornecedor
- Criar pedido compra
- Receber pedido (estoque + conta)
- **NOVO:** Paginação ✅ CORRIGIDO

### 9. Relatórios ✅
- Vendas por período
- Ranking vendedores
- Top produtos
- Visão financeira

### 10. Melhorias (NOVOS TESTES) 🔄
- **Error handling:** Mensagens PT-BR
- **Rate limiting:** 100req/15min global
- **CORS:** Restrito a localhost:5173
- **Validators:** CPF/CNPJ frontend
- **Lazy loading:** Imagens sob demanda

---

## 🐛 Bugs Corrigidos
✅ BUG-001: Dashboard sem dados  
✅ BUG-003: Validação código duplicado  
✅ BUG-004: Inativar produto  
✅ **BUG-PAGINAÇÃO:** Clientes/Produtos/Vendas/PDV/Pedidos compatíveis

---

## 📊 Status
**Passaram:** 26 ✅  
**A Testar:** 7 🔄  
**Pronto para auditoria completa!**
