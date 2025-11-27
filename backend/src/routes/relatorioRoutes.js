import express from 'express';
import {
    relatorioVendas,
    relatorioFinanceiro,
    relatorioEstoque,
    relatorioCrediario,
    relatorioVendasPorVendedor,
    relatorioProdutosMaisVendidos
} from '../controllers/relatorioController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/vendas', relatorioVendas);
router.get('/financeiro', relatorioFinanceiro);
router.get('/estoque', relatorioEstoque);
router.get('/crediario', relatorioCrediario);
router.get('/vendas-por-vendedor', relatorioVendasPorVendedor);
router.get('/produtos-mais-vendidos', relatorioProdutosMaisVendidos);

export default router;
