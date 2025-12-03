import { prisma } from '../lib/prisma.js';

export const listarProdutos = async (req, res) => {
    try {
        const { page = 1, limit = 50, search = '', ativo } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = Math.min(parseInt(limit), 100);

        const where = {
            ...(search && {
                OR: [
                    { nome: { contains: search, mode: 'insensitive' } },
                    { codigo: { contains: search, mode: 'insensitive' } }
                ]
            }),
            ...(ativo !== undefined && { ativo: ativo === 'true' })
        };

        const [produtos, total] = await Promise.all([
            prisma.produto.findMany({
                where,
                skip,
                take,
                include: { variacoes: true },
                orderBy: { nome: 'asc' }
            }),
            prisma.produto.count({ where })
        ]);

        res.json({
            data: produtos,
            pagination: {
                page: parseInt(page),
                limit: take,
                total,
                pages: Math.ceil(total / take)
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar produtos' });
    }
};

export const buscarProduto = async (req, res) => {
    try {
        const { id } = req.params;
        const produto = await prisma.produto.findUnique({
            where: { id },
            include: { variacoes: true }
        });

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        res.json(produto);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar produto' });
    }
};

export const criarProduto = async (req, res) => {
    try {
        const { codigo, nome, descricao, categoria, unidade, precoVenda, precoCusto, estoqueAtual, estoqueMinimo, lojaId } = req.body;

        const produtoExiste = await prisma.produto.findUnique({
            where: { codigo }
        });

        if (produtoExiste) {
            return res.status(400).json({ error: 'Código já cadastrado' });
        }

        if (estoqueAtual < 0 || estoqueMinimo < 0) {
            return res.status(400).json({ error: 'Estoque não pode ser negativo' });
        }

        const produto = await prisma.produto.create({
            data: {
                codigo,
                nome,
                descricao,
                categoria,
                unidade: unidade || 'UN',
                precoVenda,
                precoCusto: precoCusto || 0,
                estoqueAtual: estoqueAtual || 0,
                estoqueMinimo: estoqueMinimo || 0,
                lojaId: lojaId || null // Add lojaId
            }
        });

        res.status(201).json(produto);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar produto' });
    }
};

export const atualizarProduto = async (req, res) => {
    try {
        const { id } = req.params;
        const dados = req.body;

        if (dados.estoqueAtual !== undefined && dados.estoqueAtual < 0) {
            return res.status(400).json({ error: 'Estoque atual não pode ser negativo' });
        }

        if (dados.estoqueMinimo !== undefined && dados.estoqueMinimo < 0) {
            return res.status(400).json({ error: 'Estoque mínimo não pode ser negativo' });
        }

        const produto = await prisma.produto.update({
            where: { id },
            data: dados
        });

        res.json(produto);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
};

export const ajustarEstoque = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantidade, tipo, motivo } = req.body;

        const produto = await prisma.produto.findUnique({ where: { id } });

        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado' });
        }

        let novoEstoque = produto.estoqueAtual;

        if (tipo === 'entrada' || tipo === 'ajuste') {
            novoEstoque += quantidade;
        } else if (tipo === 'saida') {
            novoEstoque -= quantidade;
        }

        await prisma.$transaction([
            prisma.produto.update({
                where: { id },
                data: { estoqueAtual: novoEstoque }
            }),
            prisma.movimentacaoEstoque.create({
                data: {
                    produtoId: id,
                    tipo,
                    quantidade,
                    motivo
                }
            })
        ]);

        res.json({ message: 'Estoque ajustado com sucesso', novoEstoque });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao ajustar estoque' });
    }
};
