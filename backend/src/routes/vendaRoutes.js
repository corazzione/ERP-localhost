import express from 'express';
import { criarVenda, listarVendas, buscarVenda, cancelarVenda } from '../controllers/vendaController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listarVendas);
router.get('/:id', buscarVenda);
router.post('/', criarVenda);
router.post('/:id/cancelar', cancelarVenda);

export default router;
