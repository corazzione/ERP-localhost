import { prisma } from '../lib/prisma.js';

/**
 * Criar novo orçamento
 * POST /api/orcamentos
 */
export const criarOrcamento = async (req, res) => {
    try {
        const { clienteId, itens, desconto, observacoes, observacoesInternas, validadeDias } = req.body;
        const usuarioId = req.userId;

        // Gerar número do orçamento
        const ultimoOrc = await prisma.orcamento.findFirst({
            orderBy: { numero: 'desc' }
        });
        const numero = ultimoOrc
            ? `ORC-${String(parseInt(ultimoOrc.numero.split('-')[1]) + 1).padStart(5, '0')}`
            : 'ORC-00001';

        // Calcular valores
        const subtotal = itens.reduce((sum, item) =>
            sum + (parseFloat(item.precoUnit) * item.quantidade), 0
        );
        const total = subtotal - (parseFloat(desconto) || 0);

        // Calcular validade
        const validadeAte = validadeDias
            ? new Date(Date.now() + validadeDias * 24 * 60 * 60 * 1000)
            : null;

        const orcamento = await prisma.orcamento.create({
            data: {
                numero,
                clienteId: clienteId || null,
                usuarioId,
                subtotal,
                desconto: parseFloat(desconto) || 0,
                total,
                validadeAte,
                observacoes,
                observacoesInternas,
                itens: {
                    create: itens.map(item => ({
                        produtoId: item.produtoId || null,
                        descricao: item.descricao,
                        quantidade: item.quantidade,
                        precoUnit: parseFloat(item.precoUnit),
                        subtotal: parseFloat(item.precoUnit) * item.quantidade,
                        especificacoes: item.especificacoes || null,
                        tempoEstimado: item.tempoEstimado || null
                    }))
                }
            },
            include: {
                itens: true,
                cliente: { select: { id: true, nome: true, cpfCnpj: true } },
                usuario: { select: { nome: true } }
            }
        });

        res.status(201).json(orcamento);
    } catch (error) {
        console.error('Erro ao criar orçamento:', error);
        res.status(500).json({ error: 'Erro ao criar orçamento' });
    }
};

/**
 * Listar orçamentos com filtros
 * GET /api/orcamentos
 */
export const listarOrcamentos = async (req, res) => {
    try {
        const { clienteId, status, dataInicio, dataFim } = req.query;

        const where = {};
        if (clienteId) where.clienteId = clienteId;
        if (status) where.status = status;
        if (dataInicio && dataFim) {
            where.dataEmissao = {
                gte: new Date(dataInicio),
                lte: new Date(dataFim)
            };
        }

        const orcamentos = await prisma.orcamento.findMany({
            where,
            include: {
                itens: true,
                cliente: { select: { id: true, nome: true } },
                usuario: { select: { nome: true } }
            },
            orderBy: { dataEmissao: 'desc' }
        });

        res.json(orcamentos);
    } catch (error) {
        console.error('Erro ao listar orçamentos:', error);
        res.status(500).json({ error: 'Erro ao listar orçamentos' });
    }
};

/**
 * Buscar orçamento por ID
 * GET /api/orcamentos/:id
 */
export const buscarOrcamento = async (req, res) => {
    try {
        const { id } = req.params;

        const orcamento = await prisma.orcamento.findUnique({
            where: { id },
            include: {
                itens: { orderBy: { descricao: 'asc' } },
                cliente: true,
                usuario: { select: { nome: true, email: true } },
                pedido: { select: { id: true, numero: true, status: true } }
            }
        });

        if (!orcamento) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }

        res.json(orcamento);
    } catch (error) {
        console.error('Erro ao buscar orçamento:', error);
        res.status(500).json({ error: 'Erro ao buscar orçamento' });
    }
};

/**
 * Aprovar orçamento e criar pedido
 * POST /api/orcamentos/:id/aprovar
 */
export const aprovarOrcamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { dataEntregaPrevista } = req.body;

        const orcamento = await prisma.orcamento.findUnique({
            where: { id },
            include: { itens: true }
        });

        if (!orcamento) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }

        if (orcamento.status !== 'pendente') {
            return res.status(400).json({ error: 'Orçamento já foi processado' });
        }

        // Gerar número do pedido
        const ultimoPed = await prisma.pedido.findFirst({
            orderBy: { numero: 'desc' }
        });
        const numeroPedido = ultimoPed
            ? `PED-${String(parseInt(ultimoPed.numero.split('-')[1]) + 1).padStart(5, '0')}`
            : 'PED-00001';

        const resultado = await prisma.$transaction(async (tx) => {
            // Atualizar orçamento
            const orcamentoAtualizado = await tx.orcamento.update({
                where: { id },
                data: {
                    status: 'aprovado',
                    dataAprovacao: new Date()
                }
            });

            // Criar pedido
            const pedido = await tx.pedido.create({
                data: {
                    numero: numeroPedido,
                    orcamentoId: id,
                    clienteId: orcamento.clienteId,
                    usuarioId: orcamento.usuarioId,
                    subtotal: orcamento.subtotal,
                    desconto: orcamento.desconto,
                    total: orcamento.total,
                    dataEntrega: dataEntregaPrevista ? new Date(dataEntregaPrevista) : null,
                    observacoes: orcamento.observacoes,
                    itens: {
                        create: orcamento.itens.map(item => ({
                            produtoId: item.produtoId,
                            descricao: item.descricao,
                            quantidade: item.quantidade,
                            precoUnit: item.precoUnit,
                            subtotal: item.subtotal,
                            especificacoes: item.especificacoes
                        }))
                    }
                },
                include: {
                    itens: true,
                    cliente: true,
                    usuario: { select: { nome: true } }
                }
            });

            return { orcamento: orcamentoAtualizado, pedido };
        });

        res.json(resultado);
    } catch (error) {
        console.error('Erro ao aprovar orçamento:', error);
        res.status(500).json({ error: 'Erro ao aprovar orçamento' });
    }
};

/**
 * Recusar orçamento
 * POST /api/orcamentos/:id/recusar
 */
export const recusarOrcamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivoRecusa } = req.body;

        const orcamento = await prisma.orcamento.findUnique({
            where: { id }
        });

        if (!orcamento) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }

        if (orcamento.status !== 'pendente') {
            return res.status(400).json({ error: 'Orçamento já foi processado' });
        }

        const orcamentoAtualizado = await prisma.orcamento.update({
            where: { id },
            data: {
                status: 'recusado',
                dataRecusa: new Date(),
                motivoRecusa: motivoRecusa || 'Não informado'
            },
            include: {
                itens: true,
                cliente: true,
                usuario: { select: { nome: true } }
            }
        });

        res.json(orcamentoAtualizado);
    } catch (error) {
        console.error('Erro ao recusar orçamento:', error);
        res.status(500).json({ error: 'Erro ao recusar orçamento' });
    }
};

/**
 * Editar orçamento (apenas se pendente)
 * PUT /api/orcamentos/:id
 */
export const editarOrcamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { itens, desconto, observacoes, observacoesInternas, validadeDias } = req.body;

        const orcamento = await prisma.orcamento.findUnique({
            where: { id }
        });

        if (!orcamento) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }

        if (orcamento.status !== 'pendente') {
            return res.status(400).json({ error: 'Apenas orçamentos pendentes podem ser editados' });
        }

        // Calcular valores
        const subtotal = itens.reduce((sum, item) =>
            sum + (parseFloat(item.precoUnit) * item.quantidade), 0
        );
        const total = subtotal - (parseFloat(desconto) || 0);

        // Calcular nova validade
        const validadeAte = validadeDias
            ? new Date(Date.now() + validadeDias * 24 * 60 * 60 * 1000)
            : orcamento.validadeAte;

        const orcamentoAtualizado = await prisma.$transaction(async (tx) => {
            // Deletar itens antigos
            await tx.itemOrcamento.deleteMany({
                where: { orcamentoId: id }
            });

            // Atualizar orçamento
            return await tx.orcamento.update({
                where: { id },
                data: {
                    subtotal,
                    desconto: parseFloat(desconto) || 0,
                    total,
                    validadeAte,
                    observacoes,
                    observacoesInternas,
                    itens: {
                        create: itens.map(item => ({
                            produtoId: item.produtoId || null,
                            descricao: item.descricao,
                            quantidade: item.quantidade,
                            precoUnit: parseFloat(item.precoUnit),
                            subtotal: parseFloat(item.precoUnit) * item.quantidade,
                            especificacoes: item.especificacoes || null,
                            tempoEstimado: item.tempoEstimado || null
                        }))
                    }
                },
                include: {
                    itens: true,
                    cliente: true,
                    usuario: { select: { nome: true } }
                }
            });
        });

        res.json(orcamentoAtualizado);
    } catch (error) {
        console.error('Erro ao editar orçamento:', error);
        res.status(500).json({ error: 'Erro ao editar orçamento' });
    }
};
