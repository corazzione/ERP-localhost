import express from 'express';
import { listarLojas, criarLoja, atualizarLoja, excluirLoja } from '../controllers/storeController.js';

const router = express.Router();

router.get('/', listarLojas);
router.post('/', criarLoja);
router.patch('/:id', atualizarLoja);
router.delete('/:id', excluirLoja);

export default router;
