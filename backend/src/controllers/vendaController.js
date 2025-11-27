import { prisma } from '../lib/prisma.js';

export const criarVenda = async (req, res) => {
    try {
        const { clienteId, itens, desconto, formaPagamento, observacoes, usarCredito } = req.body;
        const usuarioId = req.userId;

        // Calcular totais
        let subtotal = 0;
        for (const item of itens) {
            subtotal += item.quantidade * item.precoUnit;
        }

        const totalInicial = subtotal - (desconto || 0);
        let totalPagar = totalInicial;
        let creditoUsado = 0;

        // Gerar número da venda
        const ultimaVenda = await prisma.venda.findFirst({
            orderBy: { numero: 'desc' }
        });

        const numeroVenda = ultimaVenda
            ? String(parseInt(ultimaVenda.numero) + 1).padStart(8, '0')
            : '00000001';

        // Criar venda com transação
        const venda = await prisma.$transaction(async (tx) => {
            // 1. Verificar e usar crédito se solicitado
            if (usarCredito && clienteId) {
                const cliente = await tx.cliente.findUnique({ where: { id: clienteId } });
                if (cliente && cliente.saldoCredito > 0) {
                    creditoUsado = Math.min(parseFloat(cliente.saldoCredito), totalInicial);
                    totalPagar = totalInicial - creditoUsado;

                    // Deduzir do saldo do cliente
                    await tx.cliente.update({
                        where: { id: clienteId },
                        data: { saldoCredito: { decrement: creditoUsado } }
                    });
                }
            }

            // 2. Processar pagamento e gerar parcelas se necessário
            const statusPagamento = totalPagar <= 0 ? 'pago' : (formaPagamento === 'crediario' ? 'pendente' : 'pago');
            const obsFinal = `${observacoes || ''} ${creditoUsado > 0 ? `(Crédito usado: R$ ${creditoUsado.toFixed(2)})` : ''}`.trim();

            const novaVenda = await tx.venda.create({
                data: {
                    numero: numeroVenda,
                    clienteId: clienteId || null,
                    usuarioId,
                    subtotal,
                    desconto: desconto || 0,
                    total: totalInicial,
                    formaPagamento: totalPagar <= 0 ? 'credito_loja' : formaPagamento,
                    statusPagamento,
                    observacoes: obsFinal,
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

            // Gerar Carnê/Parcelas se for Crediário e houver valor a pagar
            if (formaPagamento === 'crediario' && totalPagar > 0 && clienteId) {
                const {
                    modoCrediario = 'PADRAO',
                    numParcelas = 1,
                    primeiroVencimento,
                    taxaPersonalizadaMensal,
                    tipoJurosPersonalizado,
                    parcelasManual
                } = req.body;

                let cronograma;
                let taxa = 0;
                let tipoJuros = 'COMPOSTO';

                // Importar calculadora
                const {
                    gerarCronogramaParcelas,
                    processarParcelasManual
                } = await import('../utils/crediarioCalculator.js');

                // Buscar configuração padrão
                const config = await tx.creditoConfig.findFirst({ where: { ativo: true } });

                if (modoCrediario === 'MANUAL') {
                    // Modo MANUAL - valores definidos pelo dono
                    if (!parcelasManual || parcelasManual.length === 0) {
                        throw new Error('Modo MANUAL requer parcelasManual');
                    }
                    cronograma = processarParcelasManual(parcelasManual, totalPagar);

                } else {
                    // Determinar taxa e tipo de juros
                    if (modoCrediario === 'PERSONALIZADO') {
                        taxa = parseFloat(taxaPersonalizadaMensal);
                        tipoJuros = tipoJurosPersonalizado || 'COMPOSTO';
                    } else {
                        // PADRAO
                        taxa = parseFloat(config?.taxaPadraoMensal || 8);
                        tipoJuros = config?.tipoJurosPadrao || 'COMPOSTO';
                    }

                    // Calcular data do primeiro vencimento
                    const primeiroPagamento = primeiroVencimento
                        ? new Date(primeiroVencimento)
                        : new Date(new Date().setMonth(new Date().getMonth() + 1));

                    // Gerar cronograma
                    cronograma = gerarCronogramaParcelas(
                        totalPagar,
                        taxa,
                        numParcelas,
                        primeiroPagamento,
                        tipoJuros
                    );
                }

                // Criar Carnê
                const ultimoCarne = await tx.carne.findFirst({
                    orderBy: { numeroCarne: 'desc' }
                });
                const numeroCarne = ultimoCarne
                    ? String(parseInt(ultimoCarne.numeroCarne) + 1).padStart(8, '0')
                    : '00000001';

                const carne = await tx.carne.create({
                    data: {
                        vendaId: novaVenda.id,
                        clienteId,
                        numeroCarne,
                        valorTotal: cronograma.valorTotal,
                        valorOriginal: totalPagar,
                        numParcelas,
                        taxaJuros: taxa,
                        valorJuros: cronograma.valorJurosTotal,
                        status: 'ativo'
                    }
                });

                // Criar Parcelas com breakdown detalhado
                for (const parcelaData of cronograma.parcelas) {
                    const novaParcela = await tx.parcela.create({
                        data: {
                            carneId: carne.id,
                            numeroParcela: parcelaData.numero,
                            dataVencimento: parcelaData.dataVencimento,
                            valorParcela: parcelaData.valorTotalPrevisto,
                            valorPrincipal: parcelaData.valorPrincipal,
                            valorJurosPrevisto: parcelaData.valorJurosPrevisto,
                            valorTotalPrevisto: parcelaData.valorTotalPrevisto,
                            status: 'pendente'
                        }
                    });

                    // 🪷 INTEGRAÇÃO FINANCEIRO: Criar ContaReceber para cada parcela
                    await tx.contaReceber.create({
                        data: {
                            clienteId,
                            parcelaId: novaParcela.id,
                            descricao: `Parcela ${parcelaData.numero}/${numParcelas} - Carnê ${numeroCarne} - Venda #${novaVenda.numero}`,
                            valor: parcelaData.valorTotalPrevisto,
                            dataVencimento: parcelaData.dataVencimento,
                            status: 'pendente'
                        }
                    });
                }

                // Atualizar Venda com informações de crediário
                await tx.venda.update({
                    where: { id: novaVenda.id },
                    data: {
                        modoCrediario,
                        usaTaxaPadrao: modoCrediario === 'PADRAO',
                        taxaPersonalizadaMensal: modoCrediario === 'PERSONALIZADO' ? taxa : null,
                        tipoJurosPersonalizado: modoCrediario === 'PERSONALIZADO' ? tipoJuros : null
                    }
                });

                // Atualizar Saldo Devedor do Cliente
                await tx.cliente.update({
                    where: { id: clienteId },
                    data: { saldoDevedor: { increment: cronograma.valorTotal } }
                });
            }

            return novaVenda;
        });

        res.status(201).json(venda);
    } catch (error) {
        console.error('Erro ao criar venda:', error);
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
        console.error('Erro ao listar vendas:', error);
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
