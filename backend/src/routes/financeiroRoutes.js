import express from 'express';
import {
    listarContasReceber,
    criarContaReceber,
    receberConta,
    listarContasPagar,
    criarContaPagar,
    pagarConta,
    obterFluxoCaixa
} from '../controllers/financeiroController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/contas-receber', listarContasReceber);
router.post('/contas-receber', criarContaReceber);
router.post('/contas-receber/:id/receber', receberConta);

router.get('/contas-pagar', listarContasPagar);
router.post('/contas-pagar', criarContaPagar);
router.post('/contas-pagar/:id/pagar', pagarConta);

router.get('/fluxo-caixa', obterFluxoCaixa);

export default router;
