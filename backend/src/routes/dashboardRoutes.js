import express from 'express';
import { obterDadosDashboard } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporariamente desabilitado para debug
// router.use(authMiddleware);

router.get('/', obterDadosDashboard);

export default router;
