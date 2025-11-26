import express from 'express';
import { listarClientes, buscarCliente, criarCliente, atualizarCliente, deletarCliente } from '../controllers/clienteController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listarClientes);
router.get('/:id', buscarCliente);
router.post('/', criarCliente);
router.put('/:id', atualizarCliente);
router.delete('/:id', deletarCliente);

export default router;
