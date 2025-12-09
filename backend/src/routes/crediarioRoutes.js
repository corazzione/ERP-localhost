import express from 'express';
import { criarCarne, listarCarnes, buscarCarne, pagarParcela, simularAntecipacaoParcela, simularQuitacao, quitarCarne, getResumo, listarParcelas } from '../controllers/crediarioController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

// Visão geral
router.get('/resumo', getResumo);
router.get('/parcelas', listarParcelas);

// Carnês
router.get('/carnes', listarCarnes);
router.get('/carnes/:id', buscarCarne);
router.post('/carnes', criarCarne);
router.post('/parcelas/:id/pagar', pagarParcela);
router.get('/parcelas/:id/simular-antecipacao', simularAntecipacaoParcela);
router.get('/carnes/:id/simular-quitacao', simularQuitacao);
router.post('/carnes/:id/quitar', quitarCarne);

export default router;
