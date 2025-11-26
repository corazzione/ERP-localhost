# 🚀 Guia Detalhado - Instalação e Configuração do ERP

## Pré-requisitos Essenciais

Antes de começar, verifique se você tem instalado:

### 1. Node.js (versão 18 ou superior)
```bash
# Verificar se está instalado
node --version

# Deve retornar algo como: v18.x.x ou superior
```

Se não tiver, baixe em: https://nodejs.org/

### 2. PostgreSQL (versão 14 ou superior)
```bash
# Verificar se está instalado
psql --version

# Deve retornar algo como: psql (PostgreSQL) 14.x
```

Se não tiver, baixe em: https://www.postgresql.org/download/

---

## Passo 1: Instalar Dependências

### Backend:

```bash
# Navegue até a pasta do backend
cd "c:\Users\coraz\Área de Trabalho\ERP localhost\backend"

# Instale as dependências (isso pode demorar alguns minutos)
npm install
```

**O que esperar:** Você verá várias linhas instalando pacotes. Aguarde até aparecer a mensagem final sem erros.

### Frontend:

```bash
# Em outro terminal, navegue até a pasta do frontend
cd "c:\Users\coraz\Área de Trabalho\ERP localhost\frontend"

# Instale as dependências
npm install
```

---

## Passo 2: Configurar PostgreSQL

### 2.1. Iniciar o PostgreSQL

**No Windows:**
- Abra o menu Iniciar
- Procure por "Services" (Serviços)
- Encontre "PostgreSQL" na lista
- Clique com botão direito → Iniciar (se não estiver rodando)

**Ou via linha de comando:**
```bash
# Verificar se está rodando
pg_isready
```

### 2.2. Criar o Banco de Dados

**Opção 1 - Usando psql (linha de comando):**

```bash
# Conectar ao PostgreSQL (senha padrão geralmente é 'postgres')
psql -U postgres

# Dentro do psql, criar o banco:
CREATE DATABASE erp_db;

# Listar bancos para confirmar:
\l

# Sair do psql:
\q
```

**Opção 2 - Usando pgAdmin (interface gráfica):**
1. Abra o pgAdmin
2. Conecte ao servidor local
3. Clique com botão direito em "Databases"
4. Selecione "Create" → "Database"
5. Nome: `erp_db`
6. Clique em "Save"

---

## Passo 3: Configurar Variáveis de Ambiente (.env)

### 3.1. Verificar o arquivo .env

O arquivo `.env` já foi criado em `backend/.env`. Vamos verificar se está correto:

```bash
# No diretório backend, abra o arquivo .env
cd "c:\Users\coraz\Área de Trabalho\ERP localhost\backend"
notepad .env
```

O conteúdo deve ser:
```env
DATABASE_URL="postgresql://postgres:senha123@localhost:5432/erp_db?schema=public"
JWT_SECRET="seu-secret-jwt-super-secreto-mudar-em-producao"
PORT=5000
NODE_ENV=development
```

### 3.2. Ajustar a senha do PostgreSQL

**IMPORTANTE:** Se sua senha do PostgreSQL não for `senha123`, altere na linha `DATABASE_URL`:

```env
# Formato:
# postgresql://USUARIO:SENHA@localhost:5432/erp_db?schema=public

# Se sua senha for 'postgres', ficaria:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/erp_db?schema=public"

# Se sua senha for '12345', ficaria:
DATABASE_URL="postgresql://postgres:12345@localhost:5432/erp_db?schema=public"
```

Salve e feche o arquivo.

---

## Passo 4: Executar Migrations do Prisma (DETALHADO)

Agora vamos criar as tabelas no banco de dados.

### 4.1. Gerar o Prisma Client

```bash
# Certifique-se de estar na pasta backend
cd "c:\Users\coraz\Área de Trabalho\ERP localhost\backend"

# Gerar o cliente Prisma
npx prisma generate
```

**O que esperar:**
```
✔ Generated Prisma Client (5.7.0 | library) to ./node_modules/@prisma/client
```

### 4.2. Executar a Migration

```bash
# Criar as tabelas no banco
npx prisma migrate dev --name init
```

**O que esperar:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "erp_db"

Applying migration `20231125_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20231125_init/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (5.7.0 | library) to ./node_modules/@prisma/client
```

**Se der erro:**

**Erro comum 1:** `Can't reach database server`
- **Solução:** PostgreSQL não está rodando. Volte ao Passo 2.1

**Erro comum 2:** `password authentication failed`
- **Solução:** Senha incorreta no .env. Corrija no Passo 3.2

**Erro comum 3:** `database "erp_db" does not exist`
- **Solução:** Banco não foi criado. Volte ao Passo 2.2

### 4.3. Verificar Tabelas Criadas (Opcional)

```bash
# Abrir o Prisma Studio para visualizar o banco
npx prisma studio
```

Isso abrirá uma interface web em `http://localhost:5555` onde você pode ver todas as tabelas vazias.

---

## Passo 5: Popular o Banco com Dados Iniciais (SEED)

```bash
# Ainda na pasta backend, execute:
npm run prisma:seed
```

**O que esperar:**
```
🌱 Iniciando seed do banco de dados...
✅ Usuário admin criado: admin@erp.com
✅ Clientes criados
✅ Produtos criados
✅ Fornecedor criado
✅ Configurações criadas

🎉 Seed concluído com sucesso!

📝 Credenciais de acesso:
  Email: admin@erp.com
  Senha: senha123
```

**Se der erro:**
- Verifique se as migrations do Passo 4 foram executadas com sucesso
- Tente novamente: `npm run prisma:seed`

---

## Passo 6: Iniciar o Backend

```bash
# Na pasta backend:
npm run dev
```

**O que esperar:**
```
[nodemon] starting `node src/server.js`
🚀 Servidor rodando na porta 5000
```

**Deixe este terminal aberto!** O backend está rodando.

**Teste:** Abra o navegador em `http://localhost:5000/api/health`
- Deve retornar: `{"status":"ok","message":"ERP Backend rodando!"}`

---

## Passo 7: Iniciar o Frontend

**Abra um NOVO terminal** (não feche o do backend!)

```bash
# Navegue até a pasta frontend
cd "c:\Users\coraz\Área de Trabalho\ERP localhost\frontend"

# Inicie o frontend
npm run dev
```

**O que esperar:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

---

## Passo 8: Acessar o Sistema

1. **Abra o navegador**
2. **Acesse:** http://localhost:3000
3. **Faça login com:**
   - Email: `admin@erp.com`
   - Senha: `senha123`

**Pronto! O sistema está rodando! 🎉**

---

## 🐛 Troubleshooting - Problemas e Soluções

### Problema: "npm: command not found"
**Solução:** Node.js não está instalado ou não está no PATH. Reinstale o Node.js.

### Problema: Backend não inicia - Erro na porta 5000
**Solução:** Outra aplicação está usando a porta. Mude no `.env`:
```env
PORT=5001
```

### Problema: Frontend mostra erro de conexão com API
**Solução:** 
1. Verifique se o backend está rodando (http://localhost:5000/api/health)
2. Limpe o cache do navegador (Ctrl + Shift + Delete)
3. Reinicie o frontend

### Problema: Não consigo fazer login
**Solução:**
1. Verifique se o seed foi executado (`npm run prisma:seed`)
2. Verifique o console do navegador (F12) para ver erros
3. Verifique o terminal do backend para ver se há erros

### Problema: Prisma dá erro "Environment variable not found: DATABASE_URL"
**Solução:** O arquivo `.env` não está na pasta correta ou está mal formatado. Recrie conforme Passo 3.

---

## 📋 Checklist Final

Marque conforme for completando:

- [ ] Node.js instalado e funcionando
- [ ] PostgreSQL instalado e rodando
- [ ] Dependências do backend instaladas (`npm install`)
- [ ] Dependências do frontend instaladas (`npm install`)
- [ ] Banco de dados `erp_db` criado
- [ ] Arquivo `.env` configurado com senha correta
- [ ] Prisma Client gerado (`npx prisma generate`)
- [ ] Migrations executadas (`npx prisma migrate dev`)
- [ ] Seed executado (`npm run prisma:seed`)
- [ ] Backend rodando em localhost:5000
- [ ] Frontend rodando em localhost:3000
- [ ] Login realizado com sucesso no navegador

---

## 🎯 Próximos Passos Após Login

Explore o sistema:

1. **Dashboard** - Veja as métricas (ainda vazias, pois não há vendas)
2. **Clientes** - Veja os 2 clientes criados pelo seed
3. **Produtos** - Veja os 5 produtos criados pelo seed
4. **Crediário** - Explore o módulo de carnês (ainda sem dados)
5. **Financeiro** - Veja contas a pagar e receber

---

## 💡 Dicas

- **Para parar os servidores:** Pressione `Ctrl + C` no terminal
- **Para reiniciar:** Execute `npm run dev` novamente
- **Para ver o banco visualmente:** `npx prisma studio`
- **Para resetar tudo:** `npx prisma migrate reset` (cuidado, apaga todos os dados!)

---

Se ainda tiver dúvidas em algum passo específico, me avise qual e eu detalho ainda mais!
