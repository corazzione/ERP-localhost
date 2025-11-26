import { prisma } from '../server.js';

export const obterDadosDashboard = async (req, res) => {
    try {
        const hoje = new Date();
        const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

        // Vendas do mês
        const vendasMes = await prisma.venda.findMany({
            where: {
                dataVenda: {
                    gte: primeiroDiaMes,
                    lte: ultimoDiaMes
                },
                status: 'concluida'
            }
        });

        const faturamentoMes = vendasMes.reduce((sum, v) => sum + parseFloat(v.total), 0);
        const quantidadeVendasMes = vendasMes.length;

        // Contas a receber vencendo hoje
        const contasVencendoHoje = await prisma.contaReceber.findMany({
            where: {
                status: 'pendente',
                dataVencimento: {
                    gte: hoje,
                    lt: new Date(hoje.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        const totalVencendoHoje = contasVencendoHoje.reduce((sum, c) => sum + parseFloat(c.valor), 0);

        // Contas a pagar vencendo hoje
        const contasPagarHoje = await prisma.contaPagar.findMany({
            where: {
                status: 'pendente',
                dataVencimento: {
                    gte: hoje,
                    lt: new Date(hoje.getTime() + 24 * 60 * 60 * 1000)
                }
            }
        });

        const totalPagarHoje = contasPagarHoje.reduce((sum, c) => sum + parseFloat(c.valor), 0);

        // Total a receber (Crediário)
        const totalCrediario = await prisma.cliente.aggregate({
            _sum: {
                saldoDevedor: true
            }
        });
        const totalCrediarioReceber = totalCrediario._sum.saldoDevedor || 0;

        // Produtos com estoque baixo
        const produtosEstoqueBaixo = await prisma.$queryRaw`
            SELECT * FROM "Produto" 
            WHERE ativo = true 
            AND "estoqueAtual" <= "estoqueMinimo"
            LIMIT 10
        `;

        // Parcelas em atraso
        const parcelasAtrasadas = await prisma.parcela.findMany({
            where: {
                status: 'pendente',
                dataVencimento: {
                    lt: hoje
                }
            },
            include: {
                carne: {
                    include: {
                        cliente: { select: { nome: true } }
                    }
                }
            }
        });

        const totalParcelasAtrasadas = parcelasAtrasadas.reduce((sum, p) => sum + parseFloat(p.valorParcela), 0);

        // Top 5 produtos mais vendidos
        const topProdutos = await prisma.itemVenda.groupBy({
            by: ['produtoId'],
            _sum: {
                quantidade: true
            },
            orderBy: {
                _sum: {
                    quantidade: 'desc'
                }
            },
            take: 5
        });

        const topProdutosDetalhes = await Promise.all(
            topProdutos.map(async (item) => {
                const produto = await prisma.produto.findUnique({
                    where: { id: item.produtoId }
                });
                return {
                    produto: produto.nome,
                    quantidade: item._sum.quantidade
                };
            })
        );

        res.json({
            periodo: {
                inicio: primeiroDiaMes,
                fim: ultimoDiaMes
            },
            vendas: {
                faturamento: faturamentoMes,
                quantidade: quantidadeVendasMes,
                ticketMedio: quantidadeVendasMes > 0 ? faturamentoMes / quantidadeVendasMes : 0
            },
            financeiro: {
                receberHoje: totalVencendoHoje,
                pagarHoje: totalPagarHoje,
                saldoDia: totalVencendoHoje - totalPagarHoje,
                totalCrediario: totalCrediarioReceber
            },
            alertas: {
                produtosEstoqueBaixo: produtosEstoqueBaixo.length,
                parcelasAtrasadas: parcelasAtrasadas.length,
                valorAtrasado: totalParcelasAtrasadas
            },
            topProdutos: topProdutosDetalhes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao obter dados do dashboard' });
    }
};
