import express from 'express';
import {
    criarOrcamento,
    listarOrcamentos,
    buscarOrcamento,
    aprovarOrcamento,
    recusarOrcamento,
    editarOrcamento
} from '../controllers/orcamentoController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', criarOrcamento);
router.get('/', listarOrcamentos);
router.get('/:id', buscarOrcamento);
router.put('/:id', editarOrcamento);
router.post('/:id/aprovar', aprovarOrcamento);
router.post('/:id/recusar', recusarOrcamento);

export default router;
