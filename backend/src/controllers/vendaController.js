import { prisma } from '../server.js';

export const criarVenda = async (req, res) => {
    try {
        const { clienteId, itens, desconto, formaPagamento, observacoes } = req.body;
        const usuarioId = req.userId;

        // Calcular totais
        let subtotal = 0;
        for (const item of itens) {
            subtotal += item.quantidade * item.precoUnit;
        }

        const total = subtotal - (desconto || 0);

        // Gerar número da venda
        const ultimaVenda = await prisma.venda.findFirst({
            orderBy: { numero: 'desc' }
        });

        const numeroVenda = ultimaVenda
            ? String(parseInt(ultimaVenda.numero) + 1).padStart(8, '0')
            : '00000001';

        // Criar venda com itens
        const venda = await prisma.$transaction(async (tx) => {
            const novaVenda = await tx.venda.create({
                data: {
                    numero: numeroVenda,
                    clienteId: clienteId || null,
                    usuarioId,
                    subtotal,
                    desconto: desconto || 0,
                    total,
                    formaPagamento,
                    statusPagamento: formaPagamento === 'crediario' ? 'pendente' : 'pago',
                    observacoes,
                    itens: {
                        create: itens.map(item => ({
                            produtoId: item.produtoId,
                            quantidade: item.quantidade,
                            precoUnit: item.precoUnit,
                            subtotal: item.quantidade * item.precoUnit
                        }))
                    }
                },
                include: {
                    itens: {
                        include: { produto: true }
                    },
                    cliente: true
                }
            });

            // Atualizar estoque
            for (const item of itens) {
                await tx.produto.update({
                    where: { id: item.produtoId },
                    data: {
                        estoqueAtual: {
                            decrement: item.quantidade
                        }
                    }
                });

                // Registrar movimentação
                await tx.movimentacaoEstoque.create({
                    data: {
                        produtoId: item.produtoId,
                        tipo: 'saida',
                        quantidade: item.quantidade,
                        motivo: `Venda ${numeroVenda}`
                    }
                });
            }

            return novaVenda;
        });

        res.status(201).json(venda);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar venda' });
    }
};

export const listarVendas = async (req, res) => {
    try {
        const { dataInicio, dataFim, status } = req.query;

        const where = {};

        if (dataInicio && dataFim) {
            where.dataVenda = {
                gte: new Date(dataInicio),
                lte: new Date(dataFim)
            };
        }

        if (status) {
            where.status = status;
        }

        const vendas = await prisma.venda.findMany({
            where,
            include: {
                cliente: { select: { nome: true } },
                usuario: { select: { nome: true } },
                itens: { include: { produto: { select: { nome: true } } } }
            },
            orderBy: { dataVenda: 'desc' },
            take: 100
        });

        res.json(vendas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar vendas' });
    }
};

export const buscarVenda = async (req, res) => {
    try {
        const { id } = req.params;
        const venda = await prisma.venda.findUnique({
            where: { id },
            include: {
                cliente: true,
                usuario: { select: { nome: true, email: true } },
                itens: { include: { produto: true } },
                carne: { include: { parcelas: true } }
            }
        });

        if (!venda) {
            return res.status(404).json({ error: 'Venda não encontrada' });
        }

        res.json(venda);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar venda' });
    }
};

export const cancelarVenda = async (req, res) => {
    try {
        const { id } = req.params;

        const venda = await prisma.$transaction(async (tx) => {
            const vendaAtual = await tx.venda.findUnique({
                where: { id },
                include: { itens: true }
            });

            if (!vendaAtual) {
                throw new Error('Venda não encontrada');
            }

            // Devolver estoque
            for (const item of vendaAtual.itens) {
                await tx.produto.update({
                    where: { id: item.produtoId },
                    data: {
                        estoqueAtual: { increment: item.quantidade }
                    }
                });
            }

            // Cancelar venda
            return await tx.venda.update({
                where: { id },
                data: { status: 'cancelada', statusPagamento: 'cancelado' }
            });
        });

        res.json(venda);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cancelar venda' });
    }
};
