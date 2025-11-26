import express from 'express';
import { listarProdutos, buscarProduto, criarProduto, atualizarProduto, ajustarEstoque } from '../controllers/produtoController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', listarProdutos);
router.get('/:id', buscarProduto);
router.post('/', criarProduto);
router.put('/:id', atualizarProduto);
router.post('/:id/estoque', ajustarEstoque);

export default router;
