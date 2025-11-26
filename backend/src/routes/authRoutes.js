import express from 'express';
import { login, criarUsuario, listarUsuarios } from '../controllers/authController.js';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/usuarios', authMiddleware, adminOnly, criarUsuario);
router.get('/usuarios', authMiddleware, adminOnly, listarUsuarios);

export default router;
