import { prisma } from '../server.js';

/**
 * Listar pedidos
 * GET /api/pedidos
 */
export const listarPedidos = async (req, res) => {
    try {
        const { clienteId, status, dataInicio, dataFim } = req.query;

        const where = {};
        if (clienteId) where.clienteId = clienteId;
        if (status) where.status = status;
        if (dataInicio && dataFim) {
            where.dataCriacao = {
                gte: new Date(dataInicio),
                lte: new Date(dataFim)
            };
        }

        const pedidos = await prisma.pedido.findMany({
            where,
            include: {
                itens: true,
                cliente: { select: { id: true, nome: true } },
                usuario: { select: { nome: true } },
                custos: true,
                orcamento: { select: { numero: true } }
            },
            orderBy: { dataCriacao: 'desc' }
        });

        res.json(pedidos);
    } catch (error) {
        console.error('Erro ao listar pedidos:', error);
        res.status(500).json({ error: 'Erro ao listar pedidos' });
    }
};

/**
 * Buscar pedido por ID
 * GET /api/pedidos/:id
 */
export const buscarPedido = async (req, res) => {
    try {
        const { id } = req.params;

        const pedido = await prisma.pedido.findUnique({
            where: { id },
            include: {
                itens: { orderBy: { descricao: 'asc' } },
                cliente: true,
                usuario: { select: { nome: true, email: true } },
                custos: {
                    orderBy: { data: 'desc' },
                    include: { usuario: { select: { nome: true } } }
                },
                orcamento: true,
                venda: { select: { numero: true, dataVenda: true } }
            }
        });

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        res.json(pedido);
    } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        res.status(500).json({ error: 'Erro ao buscar pedido' });
    }
};

/**
 * Atualizar status do pedido
 * PUT /api/pedidos/:id/status
 */
export const atualizarStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const pedidoAtualizado = await prisma.pedido.update({
            where: { id },
            data: { status },
            include: {
                itens: true,
                cliente: true
            }
        });

        res.json(pedidoAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: 'Erro ao atualizar status do pedido' });
    }
};

/**
 * Lançar custo de produção
 * POST /api/pedidos/:id/custos
 */
export const lancarCusto = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo, descricao, valor } = req.body;
        const usuarioId = req.userId;

        const resultado = await prisma.$transaction(async (tx) => {
            // Criar registro de custo
            const custo = await tx.custoPedido.create({
                data: {
                    pedidoId: id,
                    tipo,
                    descricao,
                    valor: parseFloat(valor),
                    usuarioId
                },
                include: {
                    usuario: { select: { nome: true } }
                }
            });

            // Recalcular totais do pedido
            const custos = await tx.custoPedido.findMany({
                where: { pedidoId: id }
            });

            const custoMaterial = custos
                .filter(c => c.tipo === 'material')
                .reduce((sum, c) => sum + parseFloat(c.valor), 0);

            const custoMaoObra = custos
                .filter(c => c.tipo === 'mao_obra')
                .reduce((sum, c) => sum + parseFloat(c.valor), 0);

            const custoTotal = custos
                .reduce((sum, c) => sum + parseFloat(c.valor), 0);

            const pedido = await tx.pedido.findUnique({ where: { id } });
            const margemReal = parseFloat(pedido.total) - custoTotal;

            await tx.pedido.update({
                where: { id },
                data: {
                    custoMaterial,
                    custoMaoObra,
                    custoTotal,
                    margemReal
                }
            });

            return custo;
        });

        res.json(resultado);
    } catch (error) {
        console.error('Erro ao lançar custo:', error);
        res.status(500).json({ error: 'Erro ao lançar custo' });
    }
};

/**
 * Remover custo
 * DELETE /api/pedidos/custos/:id
 */
export const removerCusto = async (req, res) => {
    try {
        const { id } = req.params;

        const custo = await prisma.custoPedido.findUnique({
            where: { id }
        });

        if (!custo) {
            return res.status(404).json({ error: 'Custo não encontrado' });
        }

        const pedidoId = custo.pedidoId;

        await prisma.$transaction(async (tx) => {
            await tx.custoPedido.delete({ where: { id } });

            const custos = await tx.custoPedido.findMany({ where: { pedidoId } });

            const custoMaterial = custos.filter(c => c.tipo === 'material').reduce((sum, c) => sum + parseFloat(c.valor), 0);
            const custoMaoObra = custos.filter(c => c.tipo === 'mao_obra').reduce((sum, c) => sum + parseFloat(c.valor), 0);
            const custoTotal = custos.reduce((sum, c) => sum + parseFloat(c.valor), 0);

            const pedido = await tx.pedido.findUnique({ where: { id: pedidoId } });
            const margemReal = parseFloat(pedido.total) - custoTotal;

            await tx.pedido.update({
                where: { id: pedidoId },
                data: { custoMaterial, custoMaoObra, custoTotal, margemReal }
            });
        });

        res.json({ message: 'Custo removido com sucesso' });
    } catch (error) {
        console.error('Erro ao remover custo:', error);
        res.status(500).json({ error: 'Erro ao remover custo' });
    }
};

/**
 * Finalizar pedido e criar venda
 * POST /api/pedidos/:id/finalizar
 */
export const finalizarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const { formaPagamento } = req.body;

        const pedido = await prisma.pedido.findUnique({
            where: { id },
            include: { itens: true, custos: true }
        });

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        if (pedido.status === 'entregue') {
            return res.status(400).json({ error: 'Pedido já foi finalizado' });
        }

        const resultado = await prisma.$transaction(async (tx) => {
            const pedidoAtualizado = await tx.pedido.update({
                where: { id },
                data: { status: 'entregue' }
            });

            const venda = await tx.venda.create({
                data: {
                    numero: numeroVenda,
                    clienteId: pedido.clienteId,
                    usuarioId: pedido.usuarioId,
                    subtotal: pedido.subtotal,
                    desconto: pedido.desconto,
                    total: pedido.total,
                    formaPagamento: formaPagamento || 'dinheiro',
                    statusPagamento: 'pago',
                    status: 'concluida',
                    observacoes: `Pedido: ${pedido.numero}\nCusto: R$ ${parseFloat(pedido.custoTotal).toFixed(2)}\nMargem: R$ ${parseFloat(pedido.margemReal || 0).toFixed(2)}`,
                    itens: {
                        create: pedido.itens.map(item => {
                            const itemData = {
                                quantidade: item.quantidade,
                                precoUnit: item.precoUnit,
                                subtotal: item.subtotal
                            };
                            // Somente adiciona produtoId se existir
                            if (item.produtoId) {
                                itemData.produtoId = item.produtoId;
                            }
                            return itemData;
                        })
                    }
                },
                include: {
                    itens: true,
                    cliente: true
                }
            });

            await tx.pedido.update({
                where: { id },
                data: { vendaId: venda.id }
            });

            // Baixar estoque
            for (const item of pedido.itens) {
                if (item.produtoId) {
                    await tx.produto.update({
                        where: { id: item.produtoId },
                        data: { estoqueAtual: { decrement: item.quantidade } }
                    });
                }
            }

            // Registrar no caixa
            const caixaAnterior = await tx.caixa.findFirst({ orderBy: { data: 'desc' } });
            const saldoAnterior = caixaAnterior ? parseFloat(caixaAnterior.saldoAtual) : 0;
            const saldoAtual = saldoAnterior + parseFloat(pedido.total);

            await tx.caixa.create({
                data: {
                    tipo: 'entrada',
                    valor: pedido.total,
                    saldoAnterior,
                    saldoAtual,
                    observacoes: `Venda ${numeroVenda} - Pedido ${pedido.numero}`,
                    usuarioId: pedido.usuarioId
                }
            });

            return { pedido: pedidoAtualizado, venda };
        });

        res.json(resultado);
    } catch (error) {
        console.error('Erro ao finalizar pedido:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ error: 'Erro ao finalizar pedido', details: error.message });
    }
};
