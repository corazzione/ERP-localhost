import express from 'express';
import { emitirNFe, emitirNFCe, emitirNFSe, cancelarNota, listarNotasFiscais } from '../controllers/fiscalController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/notas', listarNotasFiscais);
router.post('/nfe', emitirNFe);
router.post('/nfce', emitirNFCe);
router.post('/nfse', emitirNFSe);
router.post('/cancelar', cancelarNota);

export default router;
