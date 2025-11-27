import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { globalLimiter, loginLimiter } from './middleware/rateLimitMiddleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';

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
import orcamentoRoutes from './routes/orcamentoRoutes.js';
import pedidoRoutes from './routes/pedidoRoutes.js';
import pedidoCompraRoutes from './routes/pedidoCompraRoutes.js';

dotenv.config();

const app = express();
export const prisma = new PrismaClient();

// Middlewares de segurança
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Rate limiting global
app.use('/api', globalLimiter);

// Rate limiting específico para login
app.use('/api/auth/login', loginLimiter);

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
app.use('/api/orcamentos', orcamentoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/pedidos-compra', pedidoCompraRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'ERP Backend rodando!',
        version: '1.0.0'
    });
});

// 404 handler
app.use(notFoundHandler);

// Error handler global
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 CORS habilitado para: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹️  Encerrando servidor...');
    await prisma.$disconnect();
    console.log('✅ Desconectado do banco de dados');
    process.exit(0);
});
