import { prisma } from '../lib/prisma.js';

// Gerar número sequencial
const gerarNumeroPedidoCompra = async () => {
    const ultimo = await prisma.pedidoCompra.findFirst({
        where: { numero: { not: null } },
        orderBy: { dataPedido: 'desc' }
    });

    if (!ultimo || !ultimo.numero) return 'PC-00001';

    const ultimoNum = parseInt(ultimo.numero.split('-')[1]);
    const proximoNum = (ultimoNum + 1).toString().padStart(5, '0');
    return `PC-${proximoNum}`;
};

// GET /pedidos-compra - Listar todos
export const listarPedidosCompra = async (req, res) => {
    try {
        const { status, fornecedorId } = req.query;

        const where = {};
        if (status) where.status = status;
        if (fornecedorId) where.fornecedorId = fornecedorId;

        const pedidos = await prisma.pedidoCompra.findMany({
            where,
            include: {
                fornecedor: { select: { id: true, nome: true } },
                itens: {
                    include: {
                        produto: { select: { id: true, codigo: true, nome: true } }
                    }
                }
            },
            orderBy: { dataPedido: 'desc' }
        });

        res.json(pedidos);
    } catch (error) {
        console.error('Erro ao listar pedidos de compra:', error);
        res.status(500).json({ error: 'Erro ao carregar pedidos' });
    }
};

// GET /pedidos-compra/:id - Detalhes
export const obterPedidoCompra = async (req, res) => {
    try {
        const { id } = req.params;

        const pedido = await prisma.pedidoCompra.findUnique({
            where: { id },
            include: {
                fornecedor: true,
                itens: {
                    include: {
                        produto: true
                    }
                }
            }
        });

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        res.json(pedido);
    } catch (error) {
        console.error('Erro ao obter pedido:', error);
        res.status(500).json({ error: 'Erro ao carregar pedido' });
    }
};

// POST /pedidos-compra - Criar novo
export const criarPedidoCompra = async (req, res) => {
    try {
        const { fornecedorId, itens, desconto, observacoes } = req.body;

        if (!itens || itens.length === 0) {
            return res.status(400).json({ error: 'Pedido deve ter pelo menos um item' });
        }

        // Calcular totais
        const subtotal = itens.reduce((sum, item) => {
            return sum + (parseFloat(item.precoCusto) * item.quantidade);
        }, 0);

        const total = subtotal - (desconto || 0);

        // Gerar número
        const numero = await gerarNumeroPedidoCompra();

        // Criar pedido
        const pedido = await prisma.pedidoCompra.create({
            data: {
                numero,
                fornecedorId,
                usuarioId: req.user.id,
                subtotal,
                desconto: desconto || 0,
                total,
                observacoes,
                itens: {
                    create: itens.map(item => ({
                        produtoId: item.produtoId,
                        quantidade: item.quantidade,
                        precoCusto: item.precoCusto,
                        subtotal: item.quantidade * parseFloat(item.precoCusto)
                    }))
                }
            },
            include: {
                fornecedor: true,
                itens: {
                    include: {
                        produto: true
                    }
                }
            }
        });

        res.status(201).json(pedido);
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        res.status(500).json({ error: 'Erro ao criar pedido' });
    }
};

// PUT /pedidos-compra/:id/receber - Receber pedido
export const receberPedidoCompra = async (req, res) => {
    try {
        const { id } = req.params;
        const { dataRecebimento, gerarContaPagar } = req.body;

        // Buscar pedido com itens
        const pedido = await prisma.pedidoCompra.findUnique({
            where: { id },
            include: { itens: true, fornecedor: true }
        });

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        if (pedido.status === 'recebido') {
            return res.status(400).json({ error: 'Pedido já foi recebido' });
        }

        // Transaction: atualizar pedido + estoque + conta a pagar
        const result = await prisma.$transaction(async (tx) => {
            // 1. Atualizar status do pedido
            const pedidoAtualizado = await tx.pedidoCompra.update({
                where: { id },
                data: {
                    status: 'recebido',
                    dataRecebimento: dataRecebimento ? new Date(dataRecebimento) : new Date()
                },
                include: {
                    fornecedor: true,
                    itens: {
                        include: { produto: true }
                    }
                }
            });

            // 2. Atualizar estoque de cada produto
            for (const item of pedido.itens) {
                // Aumentar estoqueAtual
                await tx.produto.update({
                    where: { id: item.produtoId },
                    data: {
                        estoqueAtual: { increment: item.quantidade },
                        precoCusto: item.precoCusto // Atualizar custo
                    }
                });

                // Registrar movimentação
                await tx.movimentacaoEstoque.create({
                    data: {
                        produtoId: item.produtoId,
                        tipo: 'entrada',
                        quantidade: item.quantidade,
                        motivo: `Recebimento Pedido ${pedido.numero}`
                    }
                });
            }

            // 3. Gerar Conta a Pagar (opcional)
            if (gerarContaPagar && pedido.fornecedorId) {
                await tx.contaPagar.create({
                    data: {
                        fornecedorId: pedido.fornecedorId,
                        descricao: `Pedido de Compra ${pedido.numero}`,
                        valor: pedido.total,
                        dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
                        usuarioId: req.user.id
                    }
                });
            }

            return pedidoAtualizado;
        });

        res.json(result);
    } catch (error) {
        console.error('Erro ao receber pedido:', error);
        res.status(500).json({ error: 'Erro ao processar recebimento' });
    }
};

// DELETE /pedidos-compra/:id - Cancelar
export const cancelarPedidoCompra = async (req, res) => {
    try {
        const { id } = req.params;

        const pedido = await prisma.pedidoCompra.findUnique({
            where: { id }
        });

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado' });
        }

        if (pedido.status === 'recebido') {
            return res.status(400).json({ error: 'Não é possível cancelar pedido já recebido' });
        }

        const pedidoCancelado = await prisma.pedidoCompra.update({
            where: { id },
            data: { status: 'cancelado' }
        });

        res.json(pedidoCancelado);
    } catch (error) {
        console.error('Erro ao cancelar pedido:', error);
        res.status(500).json({ error: 'Erro ao cancelar pedido' });
    }
};
