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

// GET /financeiro/dashboard - KPIs gerais
export const getDashboardFinanceiro = async (req, res) => {
    try {
        const hoje = new Date();
        const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

        // Saldo em caixa (último registro)
        const ultimoCaixa = await prisma.caixa.findFirst({
            orderBy: { data: 'desc' }
        });

        // Contas a Pagar Hoje
        const contasPagarHoje = await prisma.contaPagar.findMany({
            where: {
                status: 'pendente',
                dataVencimento: {
                    gte: hoje,
                    lte: new Date(hoje.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        const totalPagarHoje = contasPagarHoje.reduce((acc, c) => acc + parseFloat(c.valor), 0);

        // Contas a Receber Hoje
        const contasReceberHoje = await prisma.contaReceber.findMany({
            where: {
                status: 'pendente',
                dataVencimento: {
                    gte: hoje,
                    lte: new Date(hoje.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        const totalReceberHoje = contasReceberHoje.reduce((acc, c) => acc + parseFloat(c.valor), 0);

        // Resultado do Mês (Receitas - Despesas)
        const receitasMes = await prisma.contaReceber.aggregate({
            where: {
                status: 'pago',
                dataRecebimento: {
                    gte: inicioMes,
                    lte: fimMes
                }
            },
            _sum: { valor: true }
        });

        const despesasMes = await prisma.contaPagar.aggregate({
            where: {
                status: 'pago',
                dataPagamento: {
                    gte: inicioMes,
                    lte: fimMes
                }
            },
            _sum: { valor: true }
        });

        const resultadoMes = (receitasMes._sum.valor || 0) - (despesasMes._sum.valor || 0);

        res.json({
            saldoCaixa: ultimoCaixa?.saldoAtual || 0,
            totalPagarHoje,
            totalReceberHoje,
            resultadoMes,
            qtdContasPagarHoje: contasPagarHoje.length,
            qtdContasReceberHoje: contasReceberHoje.length
        });
    } catch (error) {
        console.error('Erro ao obter dashboard financeiro:', error);
        res.status(500).json({ error: 'Erro ao carregar dashboard' });
    }
};

// GET /financeiro/categorias
export const listarCategorias = async (req, res) => {
    try {
        const { tipo } = req.query;

        const where = { ativo: true };
        if (tipo) where.tipo = tipo;

        const categorias = await prisma.categoria.findMany({
            where,
            orderBy: { nome: 'asc' }
        });

        res.json(categorias);
    } catch (error) {
        console.error('Erro ao listar categorias:', error);
        res.status(500).json({ error: 'Erro ao carregar categorias' });
    }
};

// POST /financeiro/categorias
export const criarCategoria = async (req, res) => {
    try {
        const { nome, tipo, cor, icone } = req.body;

        const categoria = await prisma.categoria.create({
            data: { nome, tipo, cor, icone }
        });

        res.status(201).json(categoria);
    } catch (error) {
        console.error('Erro ao criar categoria:', error);
        res.status(500).json({ error: 'Erro ao criar categoria' });
    }
};
