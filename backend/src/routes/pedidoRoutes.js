import express from 'express';
import {
    listarPedidos,
    buscarPedido,
    atualizarStatus,
    lancarCusto,
    removerCusto,
    finalizarPedido
} from '../controllers/pedidoController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listarPedidos);
router.get('/:id', buscarPedido);
router.put('/:id/status', atualizarStatus);
router.post('/:id/custos', lancarCusto);
router.delete('/custos/:id', removerCusto);
router.post('/:id/finalizar', finalizarPedido);

export default router;
