import express from 'express';
import { prisma } from '../server.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const fornecedores = await prisma.fornecedor.findMany({
            where: { ativo: true },
            orderBy: { nome: 'asc' }
        });
        res.json(fornecedores);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar fornecedores' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { nome, cnpj, email, telefone, endereco } = req.body;
        const fornecedor = await prisma.fornecedor.create({
            data: { nome, cnpj, email, telefone, endereco }
        });
        res.status(201).json(fornecedor);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar fornecedor' });
    }
});

export default router;
