import express from 'express';
import { criarCarne, listarCarnes, buscarCarne, pagarParcela, simularQuitacao, quitarCarne } from '../controllers/crediarioController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/carnes', listarCarnes);
router.get('/carnes/:id', buscarCarne);
router.post('/carnes', criarCarne);
router.post('/parcelas/:id/pagar', pagarParcela);
router.get('/carnes/:id/simular-quitacao', simularQuitacao);
router.post('/carnes/:id/quitar', quitarCarne);

export default router;
