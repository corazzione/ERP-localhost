import { prisma } from '../server.js';

export const relatorioVendas = async (req, res) => {
    try {
        const { dataInicio, dataFim, agruparPor } = req.query;

        const inicio = dataInicio ? new Date(dataInicio) : new Date(new Date().setDate(1));
        const fim = dataFim ? new Date(dataFim) : new Date();

        const vendas = await prisma.venda.findMany({
            where: {
                dataVenda: {
                    gte: inicio,
                    lte: fim
                },
                status: 'concluida'
            },
            include: {
                itens: { include: { produto: true } },
                cliente: { select: { nome: true } }
            }
        });

        const totalVendas = vendas.length;
        const faturamento = vendas.reduce((sum, v) => sum + parseFloat(v.total), 0);
        const ticketMedio = totalVendas > 0 ? faturamento / totalVendas : 0;

        let dadosAgrupados = [];

        if (agruparPor === 'dia') {
            const vendasPorDia = {};
            vendas.forEach(v => {
                const dia = v.dataVenda.toISOString().split('T')[0];
                if (!vendasPorDia[dia]) {
                    vendasPorDia[dia] = { data: dia, quantidade: 0, total: 0 };
                }
                vendasPorDia[dia].quantidade++;
                vendasPorDia[dia].total += parseFloat(v.total);
            });
            dadosAgrupados = Object.values(vendasPorDia);
        }

        res.json({
            periodo: { inicio, fim },
            resumo: {
                totalVendas,
                faturamento,
                ticketMedio
            },
            vendas,
            dadosAgrupados
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao gerar relatório de vendas' });
    }
};

export const relatorioFinanceiro = async (req, res) => {
    try {
        const { dataInicio, dataFim } = req.query;

        const inicio = dataInicio ? new Date(dataInicio) : new Date(new Date().setDate(1));
        const fim = dataFim ? new Date(dataFim) : new Date();

        const [receber, pagar] = await Promise.all([
            prisma.contaReceber.findMany({
                where: {
                    OR: [
                        { dataVencimento: { gte: inicio, lte: fim } },
                        { dataPagamento: { gte: inicio, lte: fim } }
                    ]
                }
            }),
            prisma.contaPagar.findMany({
                where: {
                    OR: [
                        { dataVencimento: { gte: inicio, lte: fim } },
                        { dataPagamento: { gte: inicio, lte: fim } }
                    ]
                }
            })
        ]);

        const totalReceber = receber.reduce((sum, c) => sum + parseFloat(c.valor), 0);
        const totalRecebido = receber.filter(c => c.status === 'pago').reduce((sum, c) => sum + parseFloat(c.valor), 0);
        const totalPagar = pagar.reduce((sum, c) => sum + parseFloat(c.valor), 0);
        const totalPago = pagar.filter(c => c.status === 'pago').reduce((sum, c) => sum + parseFloat(c.valor), 0);

        const lucro = totalRecebido - totalPago;

        res.json({
            periodo: { inicio, fim },
            receitas: {
                total: totalReceber,
                recebido: totalRecebido,
                pendente: totalReceber - totalRecebido
            },
            despesas: {
                total: totalPagar,
                pago: totalPago,
                pendente: totalPagar - totalPago
            },
            resultado: {
                lucro,
                margemLucro: totalRecebido > 0 ? (lucro / totalRecebido) * 100 : 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar relatório financeiro' });
    }
};

export const relatorioEstoque = async (req, res) => {
    try {
        const produtos = await prisma.produto.findMany({
            where: { ativo: true },
            include: {
                movimentacoes: {
                    orderBy: { data: 'desc' },
                    take: 5
                }
            }
        });

        const valorTotalEstoque = produtos.reduce(
            (sum, p) => sum + (p.estoqueAtual * parseFloat(p.precoCusto)),
            0
        );

        const produtosEstoqueBaixo = produtos.filter(
            p => p.estoqueAtual <= p.estoqueMinimo
        );

        const produtosSemEstoque = produtos.filter(
            p => p.estoqueAtual === 0
        );

        res.json({
            resumo: {
                totalProdutos: produtos.length,
                valorTotalEstoque,
                produtosEstoqueBaixo: produtosEstoqueBaixo.length,
                produtosSemEstoque: produtosSemEstoque.length
            },
            produtos,
            alertas: {
                estoqueBaixo: produtosEstoqueBaixo,
                semEstoque: produtosSemEstoque
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar relatório de estoque' });
    }
};

export const relatorioCrediario = async (req, res) => {
    try {
        const { clienteId } = req.query;

        const where = {};
        if (clienteId) where.clienteId = clienteId;

        const carnes = await prisma.carne.findMany({
            where,
            include: {
                cliente: { select: { nome: true, cpfCnpj: true } },
                parcelas: true
            }
        });

        const totalAtivo = carnes
            .filter(c => c.status === 'ativo')
            .reduce((sum, c) => sum + parseFloat(c.valorTotal), 0);

        const parcelasAtrasadas = await prisma.parcela.findMany({
            where: {
                status: 'pendente',
                dataVencimento: { lt: new Date() }
            },
            include: {
                carne: {
                    include: { cliente: { select: { nome: true } } }
                }
            }
        });

        const valorAtrasado = parcelasAtrasadas.reduce(
            (sum, p) => sum + parseFloat(p.valorParcela),
            0
        );

        res.json({
            resumo: {
                carnesAtivos: carnes.filter(c => c.status === 'ativo').length,
                valorTotalAtivo: totalAtivo,
                parcelasAtrasadas: parcelasAtrasadas.length,
                valorAtrasado
            },
            carnes,
            parcelasAtrasadas
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar relatório de crediário' });
    }
};
