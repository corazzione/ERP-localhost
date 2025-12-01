import express from 'express';
import {
    salvarConfigPix,
    buscarConfigPix,
    gerarPixPagamento,
    listarHistoricoPix
} from '../controllers/pixController.js';

const router = express.Router();

/**
 * 🪷 Rotas de Configuração PIX
 */

// Configuração PIX
router.post('/config/pix', salvarConfigPix);
router.get('/config/pix', buscarConfigPix);
router.get('/config/pix/historico', listarHistoricoPix);

// Geração de PIX para pagamento
router.post('/pagamentos/pix/gerar', gerarPixPagamento);

export default router;
