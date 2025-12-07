import express from 'express';
import { criarVenda, listarVendas, buscarVenda, cancelarVenda, gerarInvoicePDF, obterKPIsVendas } from '../controllers/vendaController.js';
import { getRecibo } from '../controllers/reciboController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listarVendas);
router.get('/kpis', obterKPIsVendas);
router.get('/:id', buscarVenda);
router.post('/', criarVenda);
router.post('/:id/cancelar', cancelarVenda);
router.get('/:id/invoice', gerarInvoicePDF);
router.get('/:id/recibo', getRecibo);

export default router;
