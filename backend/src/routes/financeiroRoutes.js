import express from 'express';
import {
    getDashboardFinanceiro,
    listarContasReceber,
    criarContaReceber,
    receberConta,
    listarContasPagar,
    criarContaPagar,
    pagarConta,
    obterFluxoCaixa,
    listarCategorias,
    criarCategoria
} from '../controllers/financeiroController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Dashboard
router.get('/dashboard', getDashboardFinanceiro);

// Contas a Receber
router.get('/contas-receber', listarContasReceber);
router.post('/contas-receber', criarContaReceber);
router.post('/contas-receber/:id/receber', receberConta);

// Contas a Pagar
router.get('/contas-pagar', listarContasPagar);
router.post('/contas-pagar', criarContaPagar);
router.post('/contas-pagar/:id/pagar', pagarConta);

// Fluxo de Caixa
router.get('/fluxo-caixa', obterFluxoCaixa);

// Categorias
router.get('/categorias', listarCategorias);
router.post('/categorias', criarCategoria);

export default router;
