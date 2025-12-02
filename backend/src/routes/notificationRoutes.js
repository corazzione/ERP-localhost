import express from 'express';
import { listarNotificacoes, marcarComoLida } from '../controllers/notificationController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporariamente opcional para facilitar testes
// router.use(authMiddleware);

router.get('/', listarNotificacoes);
router.patch('/:id/read', marcarComoLida);

export default router;
