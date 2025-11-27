import express from 'express';
import {
    listarPedidosCompra,
    obterPedidoCompra,
    criarPedidoCompra,
    receberPedidoCompra,
    cancelarPedidoCompra
} from '../controllers/pedidoCompraController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listarPedidosCompra);
router.get('/:id', obterPedidoCompra);
router.post('/', criarPedidoCompra);
router.put('/:id/receber', receberPedidoCompra);
router.delete('/:id/cancelar', cancelarPedidoCompra);

export default router;
