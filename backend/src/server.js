import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Rotas
import authRoutes from './routes/authRoutes.js';
import clienteRoutes from './routes/clienteRoutes.js';
import fornecedorRoutes from './routes/fornecedorRoutes.js';
import produtoRoutes from './routes/produtoRoutes.js';
import vendaRoutes from './routes/vendaRoutes.js';
import crediarioRoutes from './routes/crediarioRoutes.js';
import financeiroRoutes from './routes/financeiroRoutes.js';
import fiscalRoutes from './routes/fiscalRoutes.js';
import relatorioRoutes from './routes/relatorioRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/fornecedores', fornecedorRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/vendas', vendaRoutes);
app.use('/api/crediario', crediarioRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/fiscal', fiscalRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ERP Backend rodando!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
});
