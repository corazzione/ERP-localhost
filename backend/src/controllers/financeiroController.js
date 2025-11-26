import { prisma } from '../server.js';

export const listarContasReceber = async (req, res) => {
    try {
        const { status, dataInicio, dataFim } = req.query;

        const where = {};
        if (status) where.status = status;
        if (dataInicio && dataFim) {
            where.dataVencimento = {
                gte: new Date(dataInicio),
                lte: new Date(dataFim)
            };
        }

        const contas = await prisma.contaReceber.findMany({
            where,
            include: { cliente: { select: { nome: true } } },
            orderBy: { dataVencimento: 'asc' }
        });

        res.json(contas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar contas a receber' });
    }
};

export const criarContaReceber = async (req, res) => {
    try {
        const { clienteId, descricao, valor, dataVencimento, categoria } = req.body;

        const conta = await prisma.contaReceber.create({
            data: {
                clienteId,
                descricao,
                valor,
                dataVencimento: new Date(dataVencimento),
                categoria
            }
        });

        res.status(201).json(conta);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar conta a receber' });
    }
};

export const receberConta = async (req, res) => {
    try {
        const { id } = req.params;
        const { dataPagamento } = req.body;

        const conta = await prisma.contaReceber.update({
            where: { id },
            data: {
                status: 'pago',
                dataPagamento: dataPagamento ? new Date(dataPagamento) : new Date()
            }
        });

        res.json(conta);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao receber conta' });
    }
};

export const listarContasPagar = async (req, res) => {
    try {
        const { status, dataInicio, dataFim } = req.query;

        const where = {};
        if (status) where.status = status;
        if (dataInicio && dataFim) {
            where.dataVencimento = {
                gte: new Date(dataInicio),
                lte: new Date(dataFim)
            };
        }

        const contas = await prisma.contaPagar.findMany({
            where,
            include: { fornecedor: { select: { nome: true } } },
            orderBy: { dataVencimento: 'asc' }
        });

        res.json(contas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar contas a pagar' });
    }
};

export const criarContaPagar = async (req, res) => {
    try {
        const { fornecedorId, descricao, valor, dataVencimento, categoria } = req.body;

        const conta = await prisma.contaPagar.create({
            data: {
                fornecedorId,
                descricao,
                valor,
                dataVencimento: new Date(dataVencimento),
                categoria
            }
        });

        res.status(201).json(conta);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar conta a pagar' });
    }
};

export const pagarConta = async (req, res) => {
    try {
        const { id } = req.params;
        const { dataPagamento } = req.body;

        const conta = await prisma.contaPagar.update({
            where: { id },
            data: {
                status: 'pago',
                dataPagamento: dataPagamento ? new Date(dataPagamento) : new Date()
            }
        });

        res.json(conta);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao pagar conta' });
    }
};

export const obterFluxoCaixa = async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;

        const inicio = dataInicio ? new Date(dataInicio) : new Date();
        const fim = dataFim ? new Date(dataFim) : new Date(inicio.setMonth(inicio.getMonth() + 1));

        const [receber, pagar] = await Promise.all([
            prisma.contaReceber.findMany({
                where: {
                    dataVencimento: { gte: inicio, lte: fim }
                }
            }),
            prisma.contaPagar.findMany({
                where: {
                    dataVencimento: { gte: inicio, lte: fim }
                }
            })
        ]);

        const totalReceber = receber.reduce((sum, c) => sum + parseFloat(c.valor), 0);
        const totalPagar = pagar.reduce((sum, c) => sum + parseFloat(c.valor), 0);
        const saldo = totalReceber - totalPagar;

        res.json({
            periodo: { inicio, fim },
            receber: {
                total: totalReceber,
                quantidade: receber.length,
                contas: receber
            },
            pagar: {
                total: totalPagar,
                quantidade: pagar.length,
                contas: pagar
            },
            saldo
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao obter fluxo de caixa' });
    }
};
