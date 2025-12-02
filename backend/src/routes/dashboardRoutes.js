import express from 'express';
import { obterDadosDashboard, obterVisaoGeralInteligente } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Temporariamente desabilitado para debug
// router.use(authMiddleware);

router.get('/', obterDadosDashboard);
router.get('/overview', obterVisaoGeralInteligente);

export default router;
