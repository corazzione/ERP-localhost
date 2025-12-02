import { prisma } from '../lib/prisma.js';

export const listarLojas = async (req, res) => {
    try {
        const lojas = await prisma.loja.findMany({
            where: { ativo: true },
            orderBy: { nome: 'asc' }
        });
        res.json(lojas);
    } catch (error) {
        console.error('Erro ao listar lojas:', error);
        res.status(500).json({ error: 'Erro ao listar lojas' });
    }
};

export const criarLoja = async (req, res) => {
    try {
        const { nome, codigo, endereco, telefone } = req.body;

        if (!nome) {
            return res.status(400).json({ error: 'Nome é obrigatório' });
        }

        // Gerar código se não fornecido
        const codigoFinal = codigo || nome.toLowerCase().replace(/[^a-z0-9]/g, '-');

        // Verificar se código já existe
        const existe = await prisma.loja.findUnique({
            where: { codigo: codigoFinal }
        });

        if (existe) {
            return res.status(400).json({ error: 'Código de loja já existe' });
        }

        const loja = await prisma.loja.create({
            data: {
                nome,
                codigo: codigoFinal,
                endereco,
                telefone
            }
        });

        res.status(201).json(loja);
    } catch (error) {
        console.error('Erro ao criar loja:', error);
        res.status(500).json({ error: 'Erro ao criar loja' });
    }
};

export const atualizarLoja = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, codigo } = req.body;

        if (!nome) {
            return res.status(400).json({ error: 'Nome é obrigatório' });
        }

        // Verificar se código já existe em outra loja
        if (codigo) {
            const codigoFinal = codigo.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const existe = await prisma.loja.findFirst({
                where: {
                    codigo: codigoFinal,
                    id: { not: id }
                }
            });

            if (existe) {
                return res.status(400).json({ error: 'Código de loja já existe' });
            }
        }

        const loja = await prisma.loja.update({
            where: { id },
            data: {
                nome,
                ...(codigo && { codigo: codigo.toLowerCase().replace(/[^a-z0-9]/g, '-') })
            }
        });

        res.json(loja);
    } catch (error) {
        console.error('Erro ao atualizar loja:', error);
        res.status(500).json({ error: 'Erro ao atualizar loja' });
    }
};

export const excluirLoja = async (req, res) => {
    try {
        const { id } = req.params;

        // Soft delete
        await prisma.loja.update({
            where: { id },
            data: { ativo: false }
        });

        res.json({ success: true });
    } catch (error) {
        console.error('Erro ao excluir loja:', error);
        res.status(500).json({ error: 'Erro ao excluir loja' });
    }
};
