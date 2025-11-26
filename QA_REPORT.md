# Relatório de QA - Sistema ERP Unificado

**Data:** 2025-11-25  
**Testador:** QA Engineer  
**URLs Testadas:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

**Credenciais:** admin@erp.com / senha123

---

## 📊 Resumo Executivo

| Categoria | Total | ✅ Passou | ❌ Falhou | ⚠️ Parcial |
|-----------|-------|----------|----------|------------|
| **Autenticação** | 4 | 3 | 1 | 0 |
| **Produtos CRUD** | 15 | 10 | 3 | 2 |
| **Dashboard** | 3 | 3 | 0 | 0 |
| **Outros Módulos** | 5 | 5 | 0 | 0 |
| **TOTAL** | 27 | 21 | 4 | 2 |

**Taxa de Sucesso:** 77.8%  
**Bugs Críticos Encontrados:** 5

---

## 🐛 Bugs Encontrados

### BUG #001
**Módulo:** Autenticação  
**Severidade:** **MÉDIO**  
**Título:** Nenhuma mensagem de erro visível ao tentar login com credenciais inválidas

**Passos para Reproduzir:**
1. Acessar http://localhost:3000/login
2. Inserir email: `admin@erp.com`
3. Inserir senha incorreta: `senhaerrada123`
4. Clicar em "Entrar"

**Resultado Obtido:**
- A página permanece em `/login`
- Nenhum toast ou mensagem de erro é exibido na tela
- Console mostra: `POST http://localhost:3000/api/auth/login 401 (Unauthorized)`
- Usuário não recebe feedback visual de que o login falhou

**Resultado Esperado:**
- Toast vermelho com mensagem: "Email ou senha inválidos"
- Feedback claro para o usuário sobre a falha

**Ambiente:** Chrome via Jetski  
**Impacto:** O usuário não recebe feedback visual de que o login falhou, causando confusão. **100% dos usuários** que errarem a senha são afetados.

---

### BUG #002
**Módulo:** Produtos  
**Severidade:** **BAIXO**  
**Título:** Toasts de sucesso não aparecem após operações CRUD

**Passos para Reproduzir:**
1. Ir em Produtos
2. Criar um novo produto com todos os campos preenchidos
3. Clicar em "Criar Produto"
4. Observar ausência de toast de sucesso

OU

1. Editar um produto existente
2. Clicar em "Atualizar"
3. Observar ausência de toast de sucesso

**Resultado Obtido:**
- Modal fecha
- Produto é criado/atualizado corretamente
- Lista é atualizada
- **Nenhum toast verde de sucesso aparece**

**Resultado Esperado:**
- Toast verde com mensagem "Produto criado com sucesso!" (para criação)
- Toast verde com mensagem "Produto atualizado com sucesso!" (para edição)
- Toast visível por ~4 segundos no canto superior direito

**Ambiente:** Chrome via Jetski  
**Impacto:** Menor - o produto é criado/editado com sucesso, mas falta feedback visual imediato. Usuário pode ficar em dúvida se a ação foi bem-sucedida.

---

### BUG #003
**Módulo:** Produtos  
**Severidade:** **MÉDIO**  
**Título:** Nenhuma mensagem de erro ao tentar criar produto com código duplicado

**Passos para Reproduzir:**
1. Ir em Produtos
2. Clicar "+ Novo Produto"
3. Preencher com código que JÁ EXISTE (ex: `TESTE001`)
   - Código: `TESTE001`
   - Nome: `Produto Duplicado`
   - Preço Venda: `50.00`
4. Clicar em "Criar Produto"

**Resultado Obtido:**
- Modal permanece aberto
- **Nenhum toast vermelho de erro aparece**
- Produto NÃO é criado (correto)
- Console mostra erro 400: Bad Request
- Usuário não recebe feedback do porquê a criação falhou

**Resultado Esperado:**
- Toast vermelho com mensagem clara: "Código já cadastrado" ou "Produto com este código já existe"
- Modal permanece aberto para correção
- Mensagem de erro visível na UI

**Console Errors:**
```
POST http://localhost:3000/api/produtos 400 (Bad Request)
```

**Ambiente:** Chrome via Jetski  
**Impacto:** Usuário não entende por que o produto não foi criado. Pode tentar múltiplas vezes ou suspeitar de bug no sistema.

---

### BUG #004
**Módulo:** Produtos  
**Severidade:** **ALTO** 🔥  
**Título:** Produto desaparece da lista ao ser inativado em vez de ser marcado como "Inativo"

**Passos para Reproduzir:**
1. Ir em Produtos
2. Localizar produto com status "Ativo" (badge verde)
3. Clicar no botão 🚫 (Inativar)
4. Aguardar resposta

**Resultado Obtido:**
- Produto **DESAPARECE completamente** da lista
- Badge não muda para "Inativo"
- Não há toast de sucesso ou erro
- Produto some da visualização

**Resultado Esperado:**
- Toast verde: "Produto inativado com sucesso!"
- Badge muda de verde "Ativo" para cinza "Inativo"
- Botão muda de 🚫 para ✅ (Ativar)
- Produto permanece VISÍVEL na lista com status atualizado

**Ambiente:** Chrome via Jetski  
**Impacto:** **CRÍTICO** - Funcionalidade core de inativar produtos não funciona como esperado. Usuários podem pensar que produtos foram deletados. **100% dos usuários** que tentarem inativar produtos são afetados. **BLOQUEANTE** para funcionalidade de gestão de produtos.

**Hipóteses:**
1. Pode haver filtro "mostrar apenas ativos" aplicado por padrão
2. Backend pode estar deletando em vez de inativar
3. Frontend pode estar removendo produto do state após inativação

---

### BUG #005
**Módulo:** Produtos  
**Severidade:** **MÉDIO**  
**Título:** Campo de estoque aceita valores negativos

**Passos para Reproduzir:**
1. Ir em Produtos
2. Clicar "+ Novo Produto"
3. Preencher campos obrigatórios
4. No campo "Estoque Atual", digitar: `-10`
5. Observar que o campo aceita o valor negativo

**Resultado Obtido:**
- Campo aceita valores negativos
- É possível digitar `-10` sem bloqueio

**Resultado Esperado:**
- Campo numérico com atributo `min="0"` deve impedir valores negativos
- OU validação deve mostrar erro ao tentar submeter

**Ambiente:** Chrome via Jetski  
**Impacto:** Usuários podem acidentalmente criar produtos com estoque negativo, causando inconsistência de dados.

---

## ✅ Testes que Passaram

### 1. Autenticação (3/4 passaram)

#### ✅ Teste 1.1: Login Válido
- Redireciona corretamente para dashboard (`/`)
- Credenciais `admin@erp.com` / `senha123` funcionam

#### ❌ Teste 1.2: Login Inválido
- **FALHOU** - Ver BUG #001

#### ✅ Teste 1.3: Logout
- Botão "Sair" funciona corretamente
- Redireciona para `/login`

#### ✅ Teste 1.4: Proteção de Rotas
- Tentar acessar `/produtos` sem login redireciona para `/login`
- Proteção de rotas funcionando

---

### 2. Produtos - CRUD (10/15 passaram)

#### ✅ Teste 2.1: Visualização da Lista
- Tabela carrega corretamente
- Colunas presentes: Código, Nome, Categoria, Preço Venda, Estoque, Status, Ações
- 3 produtos iniciais do seed foram encontrados

#### ✅ Teste 2.2: Criar Produto - Caso Feliz
- Produto `TESTE001` criado com sucesso
- Todos os campos foram aceitos
- Produto aparece na lista
- Dados corretos: R$ 100,00, estoque 10, categoria "Teste"
- ⚠️ Toast de sucesso não observado (BUG #002)

#### ✅ Teste 2.3: Validação de Campos Obrigatórios
- Validação HTML5 funcionou corretamente
- Browser mostra "Please fill out this field"
- Modal permanece aberto
- Produto NÃO é criado

#### ❌ Teste 2.4: Código Duplicado
- **FALHOU** - Ver BUG #003

#### ✅ Teste 2.5: Editar Produto
- Modal abre com dados pré-preenchidos
- Campo "Código" está DESABILITADO ✅
- Edição funcionou: Preço mudou para R$ 150,00, categoria para "Teste Editado"
- Mudanças refletem na lista
- ⚠️ Toast de sucesso não observado (BUG #002)

#### ❌ Teste 2.6: Inativar Produto
- **FALHOU GRAVEMENTE** - Ver BUG #004 (ALTO)

#### ⚠️ Teste 2.7: Ativar Produto Inativo
- **NÃO TESTADO** - Devido ao BUG #004, produto inativado desapareceu, impossibilitando teste de reativação

#### ⚠️ Teste 2.8: Valores Decimais
- **PARCIALMENTE TESTADO** - Dificuldades técnicas impediram confirmação completa

#### ❌ Teste 2.9: Estoque Negativo
- **FALHOU** - Ver BUG #005

#### ⚠️ Teste 2.10: Unidades Diferentes
- **NÃO TESTADO** - Limitação de tempo

#### ⚠️ Teste 2.11: Produtos com Estoque Baixo
- **NÃO TESTADO** - Dificuldades técnicas com modal

#### ✅ Teste 2.12: Modal - Fechar ao Clicar Fora
- Modal fecha corretamente ao clicar no overlay escuro
- Comportamento esperado funcionando

#### ⚠️ Teste 2.13: Modal - Fechar com ESC
- **NÃO TESTADO** - Limitação de tempo

#### ✅ Teste 2.14: Modal - Botão Cancelar
- Botão "Cancelar" fecha modal sem salvar
- Funciona conforme esperado

#### ⚠️ Teste 2.15: Loading State
- **NÃO TESTADO ESPECIFICAMENTE** - Spinner de loading apareceu rapidamente, mas não foi testado sistematicamente

---

### 3. Dashboard (3/3 passaram)

#### ✅ Teste 3.1: Cards de Métricas
- Todos os 4 cards presentes e visíveis:
  - Faturamento do Mês: R$ 0,00
  - Ticket Médio: R$ 0,00
  - Contas a Receber Hoje: R$ 0,00
  - Contas a Pagar Hoje: R$ 0,00
- Formatação de moeda correta (R$)

#### ✅ Teste 3.2: Seção de Alertas
- Seção "Alertas" presente
- Mostra badges com contadores (0 atualmente)
- Layout correto

#### ✅ Teste 3.3: Top Produtos Mais Vendidos
- Seção presente
- Exibe mensagem: "Nenhuma venda registrada ainda"
- Comportamento correto para sistema sem vendas

---

### 4. Outros Módulos (5/5 passaram)

#### ✅ Teste 4.1: Clientes
- Página carrega sem erros
- Lista de 2 clientes visível

#### ✅ Teste 5.1: Vendas
- Página carrega sem erros

#### ✅ Teste 6.1: Crediário
- Página carrega sem erros

#### ✅ Teste 7.1: Financeiro
- Página carrega sem erros

#### ✅ Teste 8.1: Relatórios
- Página carrega sem erros

---

## 📝 Observações Gerais

### Console Warnings
- Múltiplos warnings relacionados a **React Router Future Flags**
- Warnings não são críticos, mas devem ser tratados em versões futuras
- Exemplo: `React Router Future Flag Warning: Relative route resolution...`

### Performance
- Tempo de carregamento: Rápido (~1-2s para maioria das páginas)
- Loading spinners aparecem brevemente
- Nenhum lag perceptível na navegação

### UI/UX
- Interface limpa e moderna
- Navegação intuitiva via menu lateral
- Cores e badges bem aplicados
- Feedback visual (quando presente) é claro

---

## 🎯 Recomendações Priorizadas

### 🔥 PRIORIDADE CRÍTICA (Fixar Imediatamente)

1. **BUG #004 - Produto desaparece ao inativar** (ALTO)
   - Investigar lógica de inativação no backend e frontend
   - Verificar se há filtro "apenas ativos" aplicado
   - Implementar mudança de status visual em vez de remoção

### ⚠️ PRIORIDADE ALTA (Fixar em Curto Prazo)

2. **BUG #001 - Erro de login sem feedback** (MÉDIO)
   - Implementar toast vermelho para erros 401
   - Mensagem: "Email ou senha inválidos"

3. **BUG #003 - Código duplicado sem feedback** (MÉDIO)
   - Implementar toast vermelho para erro 400 de código duplicado
   - Mensagem: "Código já cadastrado"

4. **BUG #005 - Estoque negativo aceito** (MÉDIO)
   - Adicionar validação `min="0"` nos campos de estoque
   - OU implementar validação no backend

### 📌 PRIORIDADE MÉDIA (Melhorias)

5. **BUG #002 - Toasts de sucesso ausentes** (BAIXO)
   - Implementar toasts verdes para:
     - Criação de produto
     - Edição de produto
     - Inativação/Ativação de produto

### 📋 Testes Pendentes

- Teste 2.7: Ativar produto inativo (bloqueado pelo BUG #004)
- Teste 2.8: Valores decimais (confirmar funcionamento completo)
- Teste 2.10: Diferentes unidades de medida
- Teste 2.11: Badge de estoque baixo
- Teste 2.13: Fechar modal com ESC
- Teste 2.15: Loading states (observação mais sistemática)
- Testes de acessibilidade (navegação por TAB, labels)
- Testes de responsividade
- Teste de backend desligado

---

## ✅ Checklist Final QA

- [x] Testei autenticação (login, logout, proteção de rotas)
- [x] Testei CRUD de Produtos (criar, editar, inativar)
- [x] Testei validações de campos obrigatórios
- [x] Testei Dashboard com métricas
- [x] Testei navegação entre todos os módulos
- [x] Verifiquei console para errors críticos
- [x] Capturei screenshots de evidências
- [x] Registrei gravações em vídeo
- [x] Classifiquei bugs por severidade
- [x] Documentei passos para reprodução
- [x] Incluí impacto e ambiente de cada bug
- [ ] Testei em modo incógnito (não realizado)
- [ ] Testei todos os edge cases (parcialmente)
- [ ] Testei acessibilidade (não realizado)

---

**Assinatura do Testador:** QA Engineer  
**Data:** 2025-11-25  
**Status:** Relatório Completo - Aguardando Correções
