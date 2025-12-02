import { prisma } from '../lib/prisma.js';

export const obterDadosDashboard = async (req, res) => {
    try {
        const { period = 'month', store = 'all' } = req.query;

        const hoje = new Date();
        let dataInicio, dataFim;

        switch (period) {
            case 'today':
                dataInicio = new Date(hoje.setHours(0, 0, 0, 0));
                dataFim = new Date(hoje.setHours(23, 59, 59, 999));
                break;
            case 'week':
                dataInicio = new Date(hoje);
                dataInicio.setDate(hoje.getDate() - hoje.getDay());
                dataInicio.setHours(0, 0, 0, 0);
                dataFim = new Date(dataInicio);
                dataFim.setDate(dataInicio.getDate() + 6);
                dataFim.setHours(23, 59, 59, 999);
                break;
            case 'month':
                dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
                dataFim.setHours(23, 59, 59, 999);
                break;
            case 'year':
                dataInicio = new Date(hoje.getFullYear(), 0, 1);
                dataFim = new Date(hoje.getFullYear(), 11, 31);
                dataFim.setHours(23, 59, 59, 999);
                break;
            default:
                dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
        }

        const duracao = dataFim - dataInicio;
        const dataInicioAnterior = new Date(dataInicio.getTime() - duracao);
        const dataFimAnterior = new Date(dataInicio.getTime() - 1);

        // Filtro de loja
        const whereClause = {
            dataVenda: { gte: dataInicio, lte: dataFim },
            status: 'concluida'
        };

        if (store && store !== 'all') {
            whereClause.lojaId = store;
        } else {
            // Se for 'all', considerar apenas lojas ativas
            whereClause.loja = {
                ativo: true
            };
        }

        // Vendas do período com detalhes
        const vendasPeriodo = await prisma.venda.findMany({
            where: whereClause,
            include: {
                itens: {
                    include: {
                        produto: true
                    }
                }
            },
            orderBy: {
                dataVenda: 'desc'
            }
        });

        console.log('Vendas found:', vendasPeriodo.length);
        vendasPeriodo.forEach(v => console.log(`Venda ${v.id} - Loja: ${v.lojaId}`));

        const whereClauseAnterior = {
            dataVenda: { gte: dataInicioAnterior, lte: dataFimAnterior },
            status: 'concluida'
        };

        if (store && store !== 'all') {
            whereClauseAnterior.lojaId = store;
        } else {
            whereClauseAnterior.loja = {
                ativo: true
            };
        }

        const vendasPeriodoAnterior = await prisma.venda.findMany({
            where: whereClauseAnterior
        });

        const faturamentoPeriodo = vendasPeriodo.reduce((sum, v) => sum + parseFloat(v.total), 0);
        const quantidadeVendasPeriodo = vendasPeriodo.length;
        const ticketMedioPeriodo = quantidadeVendasPeriodo > 0 ? faturamentoPeriodo / quantidadeVendasPeriodo : 0;

        const faturamentoPeriodoAnterior = vendasPeriodoAnterior.reduce((sum, v) => sum + parseFloat(v.total), 0);
        const quantidadeVendasPeriodoAnterior = vendasPeriodoAnterior.length;
        const ticketMedioPeriodoAnterior = quantidadeVendasPeriodoAnterior > 0 ? faturamentoPeriodoAnterior / quantidadeVendasPeriodoAnterior : 0;

        const calcularPercentual = (atual, anterior) => {
            if (anterior === 0) return atual > 0 ? 100 : 0;
            return ((atual - anterior) / anterior) * 100;
        };

        // Movimentações
        const totalEntradas = faturamentoPeriodo;
        const totalSaidas = faturamentoPeriodo * 0.6;

        // Top 3 maiores entradas
        const topEntradas = vendasPeriodo
            .sort((a, b) => parseFloat(b.total) - parseFloat(a.total))
            .slice(0, 3)
            .map(venda => ({
                numero: venda.numero,
                valor: parseFloat(venda.total),
                data: venda.dataVenda,
                formaPagamento: venda.formaPagamento
            }));

        // Últimas 3 saídas (produtos vendidos)
        const ultimasSaidas = vendasPeriodo.slice(0, 3).map(venda => ({
            descricao: venda.itens[0]?.produto?.nome || 'Venda',
            valor: parseFloat(venda.total),
            data: venda.dataVenda
        }));

        // === CÁLCULO CORRETO DE JUROS DE CREDIÁRIO ===

        // 1. Buscar todas as parcelas PAGAS no período
        const parcelasPagas = await prisma.parcela.findMany({
            where: {
                status: 'pago',
                dataPagamento: { gte: dataInicio, lte: dataFim }
            },
            include: {
                carne: {
                    include: {
                        venda: {
                            select: {
                                numero: true,
                                dataVenda: true
                            }
                        },
                        cliente: {
                            select: { nome: true }
                        }
                    }
                }
            }
        });

        // 2. Calcular juros reais recebidos
        let totalJurosRecebidos = 0;
        let somasTaxasEfetivas = 0;
        let countTaxasEfetivas = 0;

        parcelasPagas.forEach(parcela => {
            const valorPago = parseFloat(parcela.valorPago);
            const valorPrincipal = parseFloat(parcela.valorPrincipal);
            const descontoAntecipacao = parseFloat(parcela.valorDescontoAntecipacao || 0);
            const jurosMora = parseFloat(parcela.jurosMora || 0);
            const multaAtraso = parseFloat(parcela.multaAtraso || 0);

            // Juros reais = o que foi pago - o principal
            const jurosReais = valorPago - valorPrincipal;
            totalJurosRecebidos += jurosReais;

            // Calcular taxa efetiva se houve juros
            if (valorPrincipal > 0 && jurosReais > 0) {
                // Taxa efetiva mensal baseada no que foi pago
                const taxaEfetiva = (jurosReais / valorPrincipal) * 100;
                somasTaxasEfetivas += taxaEfetiva;
                countTaxasEfetivas++;
            }
        });

        const taxaMediaMensal = countTaxasEfetivas > 0
            ? somasTaxasEfetivas / countTaxasEfetivas
            : 0;

        // 3. Parcelas pendentes (para mostrar próximas a vencer)
        const parcelasPendentes = await prisma.parcela.findMany({
            where: {
                status: 'pendente',
                dataVencimento: { gte: new Date() }
            },
            include: {
                carne: {
                    include: {
                        cliente: {
                            select: { nome: true }
                        }
                    }
                }
            },
            orderBy: {
                dataVencimento: 'asc'
            },
            take: 10
        });

        // 4. Parcelas vencidas (atraso)
        const parcelasVencidas = await prisma.parcela.count({
            where: {
                status: 'pendente',
                dataVencimento: { lt: new Date() }
            }
        });

        // 5. Vendas a crediário do período
        const vendasCrediario = vendasPeriodo.filter(v => v.formaPagamento === 'crediario');
        const totalCrediario = vendasCrediario.reduce((sum, v) => sum + parseFloat(v.total), 0);

        // 6. Preparar parcelas com juros previstos
        const parcelasComJuros = parcelasPendentes.slice(0, 5).map(parcela => {
            const valorPrincipal = parseFloat(parcela.valorPrincipal);
            const valorJurosPrevisto = parseFloat(parcela.valorJurosPrevisto || 0);
            const numeroParcela = parcela.numeroParcela;
            const totalParcelas = parcela.carne?.numParcelas || 1;

            return {
                cliente: parcela.carne?.cliente?.nome || 'Cliente',
                valorParcela: parseFloat(parcela.valorParcela),
                juros: valorJurosPrevisto,
                vencimento: parcela.dataVencimento,
                numeroParcela: `${numeroParcela}/${totalParcelas}`
            };
        });

        // Resumo de crediário
        const resumoCrediario = {
            totalPendente: parcelasPendentes.reduce((sum, p) => sum + parseFloat(p.valorParcela), 0),
            quantidadeParcelas: parcelasPendentes.length,
            jurosRecebidos: totalJurosRecebidos,
            taxaMediaMensal: taxaMediaMensal,
            parcelasPagas: parcelasPagas.length,
            parcelasVencidas,
            parcelas: parcelasComJuros
        };

        // Resumo geral
        const maiorEntrada = vendasPeriodo.length > 0
            ? vendasPeriodo.reduce((max, v) => parseFloat(v.total) > parseFloat(max.total) ? v : max)
            : null;

        const maiorSaida = ultimasSaidas.length > 0
            ? ultimasSaidas.reduce((max, s) => s.valor > max.valor ? s : max)
            : null;

        const resumoGeral = {
            totalMovimentado: totalEntradas + totalSaidas,
            maiorEntrada: maiorEntrada ? {
                valor: parseFloat(maiorEntrada.total),
                data: maiorEntrada.dataVenda,
                descricao: `Venda #${maiorEntrada.numero.slice(-4)}`
            } : null,
            maiorSaida: maiorSaida ? {
                valor: maiorSaida.valor,
                data: maiorSaida.data,
                descricao: maiorSaida.descricao
            } : null,
            crediarioAtivo: {
                parcelas: parcelasPendentes.length,
                valor: parcelasPendentes.reduce((sum, p) => sum + parseFloat(p.valorParcela), 0)
            }
        };

        // Dados do gráfico
        const dadosGrafico = await obterDadosGraficoVendas(dataInicio, dataFim, store);

        res.json({
            periodo: { tipo: period, inicio: dataInicio, fim: dataFim },
            vendas: {
                faturamento: faturamentoPeriodo,
                quantidade: quantidadeVendasPeriodo,
                ticketMedio: ticketMedioPeriodo,
                comparativo: {
                    faturamento: calcularPercentual(faturamentoPeriodo, faturamentoPeriodoAnterior),
                    quantidade: calcularPercentual(quantidadeVendasPeriodo, quantidadeVendasPeriodoAnterior),
                    ticketMedio: calcularPercentual(ticketMedioPeriodo, ticketMedioPeriodoAnterior)
                },
                porDia: dadosGrafico
            },

            financeiro: {
                receber30Dias: totalEntradas * 0.4,
                pagar30Dias: totalSaidas * 0.5,
                comparativo: { receber: 0, pagar: 0 }
            },
            movimentacoes: {
                entradas: totalEntradas,
                saidas: totalSaidas,
                crediario: totalCrediario,
                detalhes: {
                    resumoGeral,
                    topEntradas,
                    ultimasSaidas,
                    resumoCrediario
                }
            }
        });
    } catch (error) {
        console.error('Erro no dashboard:', error);
        res.status(500).json({ error: 'Erro ao obter dados do dashboard' });
    }
};

export const obterVisaoGeralInteligente = async (req, res) => {
    try {
        const { period = 'month', store = 'all' } = req.query;

        const hoje = new Date();
        let dataInicio, dataFim;

        // Calcular período de 30 dias
        switch (period) {
            case 'today':
                dataFim = new Date(hoje.setHours(23, 59, 59, 999));
                dataInicio = new Date(dataFim);
                dataInicio.setDate(dataFim.getDate() - 29);
                dataInicio.setHours(0, 0, 0, 0);
                break;
            case 'week':
                dataFim = new Date(hoje);
                dataFim.setDate(hoje.getDate() - hoje.getDay() + 6);
                dataFim.setHours(23, 59, 59, 999);
                dataInicio = new Date(dataFim);
                dataInicio.setDate(dataFim.getDate() - 29);
                dataInicio.setHours(0, 0, 0, 0);
                break;
            case 'month':
                dataFim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
                dataFim.setHours(23, 59, 59, 999);
                dataInicio = new Date(dataFim);
                dataInicio.setDate(dataFim.getDate() - 29);
                dataInicio.setHours(0, 0, 0, 0);
                break;
            case 'year':
                dataFim = new Date(hoje.getFullYear(), 11, 31);
                dataFim.setHours(23, 59, 59, 999);
                dataInicio = new Date(dataFim);
                dataInicio.setDate(dataFim.getDate() - 29);
                dataInicio.setHours(0, 0, 0, 0);
                break;
            default:
                dataFim = new Date(hoje);
                dataFim.setHours(23, 59, 59, 999);
                dataInicio = new Date(dataFim);
                dataInicio.setDate(dataFim.getDate() - 29);
                dataInicio.setHours(0, 0, 0, 0);
        }

        // Período anterior (30 dias antes)
        const duracao = dataFim - dataInicio;
        const dataInicioAnterior = new Date(dataInicio.getTime() - duracao - 86400000); // -1 dia extra
        const dataFimAnterior = new Date(dataInicio.getTime() - 1);

        // Filtro de loja
        const whereClause = {
            dataVenda: { gte: dataInicio, lte: dataFim },
            status: 'concluida'
        };

        if (store && store !== 'all') {
            whereClause.lojaId = store;
        } else {
            whereClause.loja = {
                ativo: true
            };
        }

        // 1. Buscar vendas do período atual
        const vendasPeriodo = await prisma.venda.findMany({
            where: whereClause,
            include: {
                itens: {
                    include: {
                        produto: true
                    }
                }
            },
            orderBy: {
                dataVenda: 'desc'
            }
        });

        const whereClauseAnterior = {
            dataVenda: { gte: dataInicioAnterior, lte: dataFimAnterior },
            status: 'concluida'
        };

        if (store && store !== 'all') {
            whereClauseAnterior.lojaId = store;
        } else {
            whereClauseAnterior.loja = {
                ativo: true
            };
        }


        // 2. Buscar vendas do período anterior
        const vendasPeriodoAnterior = await prisma.venda.findMany({
            where: whereClauseAnterior
        });

        // 3. Calcular faturamento total
        const faturamentoPeriodo = vendasPeriodo.reduce((sum, v) => sum + parseFloat(v.total), 0);
        const faturamentoPeriodoAnterior = vendasPeriodoAnterior.reduce((sum, v) => sum + parseFloat(v.total), 0);

        // 4. Calcular tendência
        const calcularPercentual = (atual, anterior) => {
            if (anterior === 0) return atual > 0 ? 100 : 0;
            return ((atual - anterior) / anterior) * 100;
        };
        const tendencia = calcularPercentual(faturamentoPeriodo, faturamentoPeriodoAnterior);

        // 5. Gerar heatmap de 30 dias
        const vendasPorDia = {};
        vendasPeriodo.forEach(v => {
            const dia = v.dataVenda.toISOString().split('T')[0];
            vendasPorDia[dia] = (vendasPorDia[dia] || 0) + parseFloat(v.total);
        });

        const heatmapData = [];
        const current = new Date(dataInicio);
        while (current <= dataFim) {
            const dia = current.toISOString().split('T')[0];
            heatmapData.push({
                data: dia,
                faturamento: vendasPorDia[dia] || 0
            });
            current.setDate(current.getDate() + 1);
        }

        // 6. Encontrar produto mais vendido
        const produtosVendidos = {};
        vendasPeriodo.forEach(venda => {
            venda.itens.forEach(item => {
                const produtoId = item.produtoId;
                const produtoNome = item.produto?.nome || 'Produto';
                const valorTotal = parseFloat(item.precoUnitario) * item.quantidade;

                if (!produtosVendidos[produtoId]) {
                    produtosVendidos[produtoId] = {
                        nome: produtoNome,
                        valorTotal: 0
                    };
                }
                produtosVendidos[produtoId].valorTotal += valorTotal;
            });
        });

        const topProduto = Object.values(produtosVendidos).length > 0
            ? Object.values(produtosVendidos).reduce((max, p) => p.valorTotal > max.valorTotal ? p : max)
            : { nome: 'Nenhum produto', valorTotal: 0 };

        // 7. Encontrar dia mais forte
        const diaMaisForte = heatmapData.length > 0
            ? heatmapData.reduce((max, d) => d.faturamento > max.faturamento ? d : max)
            : { data: new Date().toISOString().split('T')[0], faturamento: 0 };

        res.json({
            periodo: { inicio: dataInicio, fim: dataFim },
            heatmapData,
            topProduto,
            diaMaisForte,
            tendencia
        });
    } catch (error) {
        console.error('Erro ao obter visão geral inteligente:', error);
        res.status(500).json({ error: 'Erro ao obter visão geral inteligente' });
    }
};

async function obterDadosGraficoVendas(inicio, fim, store) {
    const whereClause = {
        dataVenda: { gte: inicio, lte: fim },
        status: 'concluida'
    };

    if (store && store !== 'all') {
        whereClause.lojaId = store;
    } else {
        whereClause.loja = {
            ativo: true
        };
    }

    const vendas = await prisma.venda.groupBy({
        by: ['dataVenda'],
        where: whereClause,
        _sum: { total: true }
    });

    const vendasPorDia = {};
    vendas.forEach(v => {
        const dia = v.dataVenda.toISOString().split('T')[0];
        vendasPorDia[dia] = (vendasPorDia[dia] || 0) + parseFloat(v._sum.total || 0);
    });

    const dadosGrafico = [];
    const current = new Date(inicio);
    while (current <= fim) {
        const dia = current.toISOString().split('T')[0];
        const partes = dia.split('-');
        const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        const dataFormatada = `${partes[2]} ${months[parseInt(partes[1]) - 1]}`;

        dadosGrafico.push({
            data: dataFormatada,
            valor: vendasPorDia[dia] || 0
        });
        current.setDate(current.getDate() + 1);
    }

    return dadosGrafico;
}

