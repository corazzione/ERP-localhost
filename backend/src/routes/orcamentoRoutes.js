import express from 'express';
import {
    criarOrcamento,
    listarOrcamentos,
    buscarOrcamento,
    aprovarOrcamento,
    recusarOrcamento,
    editarOrcamento,
    converterEmVenda,
    gerarPDF
} from '../controllers/orcamentoController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// CRUD básico
router.post('/', criarOrcamento);
router.get('/', listarOrcamentos);
router.get('/:id', buscarOrcamento);
router.put('/:id', editarOrcamento);

// Ações de status
router.post('/:id/aprovar', aprovarOrcamento);
router.post('/:id/recusar', recusarOrcamento);
router.post('/:id/converter-venda', converterEmVenda);

// PDF
router.get('/:id/pdf', gerarPDF);

export default router;
