import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const criarOrcamento = async (req, res) => {
    console.log('🔍 DEBUG: Hitting criarOrcamento controller'); // Debug log
    try {
        const { clienteId, itens, desconto, observacoes, observacoesInternas, validadeDias, lojaId } = req.body;
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
                lojaId: lojaId || null, // Added lojaId
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
                usuario: { select: { nome: true } },
                loja: { select: { id: true, nome: true } } // Include loja info
            }
        });

        res.status(201).json(orcamento);
    } catch (error) {
        console.error('Erro ao criar orçamento:', error);
        res.status(500).json({ error: 'SERVER ERROR DEBUG', details: error.message });
    }
};

export const listarOrcamentos = async (req, res) => {
    try {
        const { status, clienteId, dataInicio, dataFim } = req.query;

        const where = {};
        if (status) where.status = status;
        if (clienteId) where.clienteId = clienteId;
        if (dataInicio && dataFim) {
            where.dataEmissao = {
                gte: new Date(dataInicio),
                lte: new Date(dataFim)
            };
        }

        const orcamentos = await prisma.orcamento.findMany({
            where,
            include: {
                cliente: { select: { nome: true } },
                usuario: { select: { nome: true } },
                loja: { select: { nome: true } },
                _count: { select: { itens: true } }
            },
            orderBy: { dataEmissao: 'desc' }
        });

        res.json(orcamentos);
    } catch (error) {
        console.error('Erro ao listar orçamentos:', error);
        res.status(500).json({ error: 'Erro ao listar orçamentos' });
    }
};

export const buscarOrcamento = async (req, res) => {
    try {
        const { id } = req.params;

        const orcamento = await prisma.orcamento.findUnique({
            where: { id },
            include: {
                itens: { include: { produto: true } },
                cliente: true,
                usuario: { select: { nome: true } },
                loja: true
            }
        });

        if (!orcamento) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }

        res.json(orcamento);
    } catch (error) {
        console.error('Erro ao obter orçamento:', error);
        res.status(500).json({ error: 'Erro ao obter orçamento' });
    }
};

export const editarOrcamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, observacoesInternas } = req.body;

        const orcamento = await prisma.orcamento.update({
            where: { id },
            data: {
                status,
                observacoesInternas
            }
        });

        res.json(orcamento);
    } catch (error) {
        console.error('Erro ao atualizar orçamento:', error);
        res.status(500).json({ error: 'Erro ao atualizar orçamento' });
    }
};

export const aprovarOrcamento = async (req, res) => {
    try {
        const { id } = req.params;

        // Lógica para transformar em pedido ou venda
        const orcamento = await prisma.orcamento.update({
            where: { id },
            data: {
                status: 'aprovado',
                dataAprovacao: new Date()
            }
        });

        res.json(orcamento);
    } catch (error) {
        console.error('Erro ao aprovar orçamento:', error);
        res.status(500).json({ error: 'Erro ao aprovar orçamento' });
    }
};

export const recusarOrcamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;

        const orcamento = await prisma.orcamento.update({
            where: { id },
            data: {
                status: 'recusado',
                dataRecusa: new Date(),
                motivoRecusa: motivo
            }
        });

        res.json(orcamento);
    } catch (error) {
        console.error('Erro ao recusar orçamento:', error);
        res.status(500).json({ error: 'Erro ao recusar orçamento' });
    }
};
