import express from 'express';
import { login, criarUsuario, listarUsuarios, refresh } from '../controllers/authController.js';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/usuarios', authMiddleware, adminOnly, criarUsuario);
router.get('/usuarios', authMiddleware, adminOnly, listarUsuarios);
router.post('/refresh', refresh);

export default router;
