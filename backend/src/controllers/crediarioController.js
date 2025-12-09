import { prisma } from '../lib/prisma.js';
import { calcularParcelas, calcularQuitacaoAntecipada, calcularJurosMora } from '../services/crediarioService.js';

export const criarCarne = async (req, res) => {
    try {
        const { vendaId, numParcelas, taxaJuros, primeiroVencimento } = req.body;

        const venda = await prisma.venda.findUnique({
            where: { id: vendaId },
            include: { cliente: true }
        });

        if (!venda) {
            return res.status(404).json({ error: 'Venda não encontrada' });
        }

        if (!venda.clienteId) {
            return res.status(400).json({ error: 'Venda sem cliente vinculado' });
        }

        const cliente = venda.cliente;
        const novoSaldo = parseFloat(cliente.saldoDevedor) + parseFloat(venda.total);

        if (novoSaldo > parseFloat(cliente.limiteCredito) && parseFloat(cliente.limiteCredito) > 0) {
            return res.status(400).json({
                error: 'Limite de crédito insuficiente',
                limiteCredito: cliente.limiteCredito,
                saldoDevedor: cliente.saldoDevedor,
                valorVenda: venda.total
            });
        }

        const parcelas = calcularParcelas(
            parseFloat(venda.total),
            numParcelas,
            parseFloat(taxaJuros),
            new Date(primeiroVencimento)
        );

        const ultimoCarne = await prisma.carne.findFirst({
            orderBy: { numeroCarne: 'desc' }
        });

        const numeroCarne = ultimoCarne
            ? String(parseInt(ultimoCarne.numeroCarne) + 1).padStart(8, '0')
            : '00000001';

        const carne = await prisma.$transaction(async (tx) => {
            const novoCarne = await tx.carne.create({
                data: {
                    vendaId,
                    clienteId: venda.clienteId,
                    numeroCarne,
                    valorTotal: parcelas.valorTotal,
                    valorOriginal: venda.total,
                    numParcelas,
                    taxaJuros,
                    valorJuros: parcelas.valorJuros,
                    parcelas: {
                        create: parcelas.parcelas.map((p, index) => ({
                            numeroParcela: index + 1,
                            dataVencimento: p.vencimento,
                            valorParcela: p.valor,
                            valorPrincipal: p.valor,
                            valorTotalPrevisto: p.valor
                        }))
                    }
                },
                include: {
                    parcelas: { orderBy: { numeroParcela: 'asc' } },
                    cliente: true,
                    venda: true
                }
            });

            await tx.venda.update({
                where: { id: vendaId },
                data: { formaPagamento: 'crediario', statusPagamento: 'pendente' }
            });

            await tx.cliente.update({
                where: { id: venda.clienteId },
                data: {
                    saldoDevedor: { increment: parcelas.valorTotal }
                }
            });

            return novoCarne;
        });

        res.status(201).json(carne);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao criar carnê' });
    }
};

export const listarCarnes = async (req, res) => {
    try {
        const { clienteId, status } = req.query;

        const where = {};
        if (clienteId) where.clienteId = clienteId;
        if (status) where.status = status;

        const carnes = await prisma.carne.findMany({
            where,
            include: {
                cliente: { select: { nome: true, cpfCnpj: true } },
                venda: { select: { numero: true, dataVenda: true } },
                parcelas: true
            },
            orderBy: { dataCriacao: 'desc' }
        });

        res.json(carnes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar carnês' });
    }
};

export const buscarCarne = async (req, res) => {
    try {
        const { id } = req.params;
        const carne = await prisma.carne.findUnique({
            where: { id },
            include: {
                cliente: true,
                venda: { include: { itens: { include: { produto: true } } } },
                parcelas: { orderBy: { numeroParcela: 'asc' } }
            }
        });

        if (!carne) {
            return res.status(404).json({ error: 'Carnê não encontrado' });
        }

        res.json(carne);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar carnê' });
    }
};

// 🪷 NOVO: Pagamento com Amortização Automática
export const pagarParcela = async (req, res) => {
    try {
        const { id } = req.params;
        const { valorPago, dataPagamento } = req.body;

        const parcela = await prisma.parcela.findUnique({
            where: { id },
            include: { carne: { include: { cliente: true } } }
        });

        if (!parcela) {
            return res.status(404).json({ error: 'Parcela não encontrada' });
        }

        if (parcela.status === 'pago') {
            return res.status(400).json({ error: 'Parcela já foi paga' });
        }

        // Importar funções
        const { calcularAmortizacao, calcularJurosMora } = await import('../utils/crediarioCalculator.js');

        // Buscar config
        const config = await prisma.creditoConfig.findFirst({ where: { ativo: true } });

        const dataVenc = new Date(parcela.dataVencimento);
        const dataPgto = dataPagamento ? new Date(dataPagamento) : new Date();
        const diferencaDias = Math.floor((dataPgto - dataVenc) / (1000 * 60 * 60 * 24));

        let valorFinal = parseFloat(parcela.valorTotalPrevisto);
        let multaAtraso = 0;
        let jurosMora = 0;
        let descontoAntecipacao = 0;
        let diasAtraso = 0;
        let diasAntecipados = 0;

        if (diferencaDias > 0) {
            // ATRASO
            diasAtraso = diferencaDias;
            const resultadoMora = calcularJurosMora(
                valorFinal,
                diasAtraso,
                {
                    multaPercentual: parseFloat(config?.multaAtrasoPercentual || 2),
                    jurosDiarioPercentual: parseFloat(config?.jurosDiarioAtrasoPercentual || 0.033)
                }
            );
            multaAtraso = resultadoMora.multa;
            jurosMora = resultadoMora.jurosMora;
            valorFinal = resultadoMora.valorFinal;

        } else if (diferencaDias < 0) {
            // ANTECIPADO - Amortização
            const resultadoAmortizacao = calcularAmortizacao(parcela, dataPgto);
            descontoAntecipacao = resultadoAmortizacao.descontoAntecipacao;
            diasAntecipados = resultadoAmortizacao.diasAntecipados;
            valorFinal = resultadoAmortizacao.valorFinal;
        }

        const resultado = await prisma.$transaction(async (tx) => {
            // Atualizar parcela
            const parcelaAtualizada = await tx.parcela.update({
                where: { id },
                data: {
                    valorPago: valorPago || valorFinal,
                    dataPagamento: dataPgto,
                    diasAtraso,
                    jurosMora,
                    multaAtraso,
                }
            });

            // Verificar se todas as parcelas foram pagas
            const parcelasRestantes = await tx.parcela.count({
                where: {
                    carneId: parcela.carneId,
                    status: 'pendente'
                }
            });

            if (parcelasRestantes === 0) {
                await tx.carne.update({
                    where: { id: parcela.carneId },
                    data: { status: 'quitado' }
                });
            }

            return {
                parcela: parcelaAtualizada,
                resumo: {
                    valorFinal,
                    multaAtraso,
                    jurosMora,
                    descontoAntecipacao,
                    diasAtraso,
                    diasAntecipados,
                    economizado: diasAntecipados > 0,
                    parcelasRestantes
                }
            };
        });

        res.json(resultado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao pagar parcela' });
    }
};

export const simularQuitacao = async (req, res) => {
    try {
        const { id } = req.params;

        const carne = await prisma.carne.findUnique({
            where: { id },
            include: {
                parcelas: {
                    where: { status: 'pendente' },
                    orderBy: { numeroParcela: 'asc' }
                }
            }
        });

        if (!carne) {
            return res.status(404).json({ error: 'Carnê não encontrado' });
        }

        const simulacao = calcularQuitacaoAntecipada(carne);

        res.json(simulacao);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao simular quitação' });
    }
};

export const quitarCarne = async (req, res) => {
    try {
        const { id } = req.params;
        const { dataPagamento } = req.body;

        const carne = await prisma.carne.findUnique({
            where: { id },
            include: {
                parcelas: {
                    where: { status: 'pendente' },
                    orderBy: { numeroParcela: 'asc' }
                },
                cliente: true
            }
        });

        if (!carne) {
            return res.status(404).json({ error: 'Carnê não encontrado' });
        }

        const simulacao = calcularQuitacaoAntecipada(carne);

        const resultado = await prisma.$transaction(async (tx) => {
            await tx.parcela.updateMany({
                where: {
                    carneId: id,
                    status: 'pendente'
                },
                data: {
                    status: 'pago',
                    dataPagamento: dataPagamento ? new Date(dataPagamento) : new Date(),
                    valorPago: 0
                }
            });

            const carneAtualizado = await tx.carne.update({
                where: { id },
                data: { status: 'quitado' }
            });

            await tx.cliente.update({
                where: { id: carne.clienteId },
                data: {
                    saldoDevedor: { decrement: simulacao.valorAQuitarHoje }
                }
            });

            return carneAtualizado;
        });

        res.json({
            ...resultado,
            valorQuitado: simulacao.valorAQuitarHoje,
            descontoObtido: simulacao.descontoJuros
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao quitar carnê' });
    }
};

export const getResumo = async (req, res) => {
    try {
        const totalReceber = await prisma.parcela.aggregate({
            where: { status: 'pendente' },
            _sum: { valorParcela: true }
        });

        const hoje = new Date();
        const parcelasVencidas = await prisma.parcela.findMany({
            where: {
                status: 'pendente',
                dataVencimento: { lt: hoje }
            }
        });

        const totalVencido = parcelasVencidas.reduce((acc, p) => acc + parseFloat(p.valorParcela), 0);
        const qtdVencidas = parcelasVencidas.length;

        const carnesAtivos = await prisma.carne.count({
            where: { status: 'ativo' }
        });

        const todasParcelas = await prisma.parcela.count();
        const inadimplencia = todasParcelas > 0 ? (qtdVencidas / todasParcelas) * 100 : 0;

        res.json({
            totalReceber: totalReceber._sum.valorParcela || 0,
            totalVencido,
            qtdVencidas,
            carnesAtivos,
            inadimplencia: inadimplencia.toFixed(2)
        });
    } catch (error) {
        console.error('Erro ao obter resumo crediário:', error);
        res.status(500).json({ error: 'Erro ao carregar resumo' });
    }
};

export const listarParcelas = async (req, res) => {
    try {
        const { status, clienteId, vencidas } = req.query;

        const where = {};

        if (status) {
            where.status = status;
        }

        if (clienteId) {
            where.carne = {
                clienteId: clienteId
            };
        }

        if (vencidas === 'true') {
            where.status = 'pendente';
            where.dataVencimento = { lt: new Date() };
        }

        const parcelas = await prisma.parcela.findMany({
            where,
            include: {
                carne: {
                    include: {
                        cliente: {
                            select: {
                                id: true,
                                nome: true,
                                telefone: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                dataVencimento: 'asc'
            },
            take: 100
        });

        res.json(parcelas);
    } catch (error) {
        console.error('Erro ao listar parcelas:', error);
        res.status(500).json({ error: 'Erro ao carregar parcelas' });
    }
};

// Simular antecipação de parcela única
// Seguindo CDC Art. 52 §2º - Desconto proporcional aos juros futuros
export const simularAntecipacaoParcela = async (req, res) => {
    try {
        const { id } = req.params;

        const parcela = await prisma.parcela.findUnique({
            where: { id },
            include: {
                carne: {
                    include: {
                        cliente: { select: { nome: true } }
                    }
                }
            }
        });

        if (!parcela) {
            return res.status(404).json({ error: 'Parcela não encontrada' });
        }

        if (parcela.status === 'pago') {
            return res.status(400).json({ error: 'Parcela já foi paga' });
        }

        const hoje = new Date();
        const dataVenc = new Date(parcela.dataVencimento);
        const diasAntecipados = Math.floor((dataVenc - hoje) / (1000 * 60 * 60 * 24));
        const valorParcela = parseFloat(parcela.valorParcela);

        // Calcular valor principal por parcela (sem juros) - mesma lógica do CDC
        const valorOriginalCarne = parseFloat(parcela.carne.valorOriginal);
        const numParcelas = parcela.carne.numParcelas;
        const valorPrincipalPorParcela = valorOriginalCarne / numParcelas;

        // Se não está antecipando (vencimento já passou ou é hoje)
        if (diasAntecipados <= 0) {
            // Calcular juros de mora se atrasado
            const diasAtraso = Math.abs(diasAntecipados);
            const { calcularJurosMora } = await import('../services/crediarioService.js');
            const mora = calcularJurosMora(valorParcela, diasAtraso);

            return res.json({
                parcelaId: parcela.id,
                numeroParcela: parcela.numeroParcela,
                carneNumero: parcela.carne.numeroCarne,
                clienteNome: parcela.carne.cliente?.nome,
                dataVencimento: parcela.dataVencimento,
                valorOriginal: valorParcela,
                valorComDesconto: mora.valorTotal,
                desconto: 0,
                jurosMora: mora.jurosMora,
                multaAtraso: mora.multaAtraso,
                diasAtraso,
                diasAntecipados: 0,
                economiaPercentual: '0.0',
                mensagem: diasAtraso > 0
                    ? `Parcela vencida há ${diasAtraso} dias. Valor com mora: R$ ${mora.valorTotal.toFixed(2)}`
                    : 'Parcela vence hoje. Pague sem juros adicionais.'
            });
        }

        // ANTECIPAÇÃO - Desconto total dos juros da parcela (CDC Art. 52 §2º)
        // O cliente paga apenas o valor principal, sem os juros embutidos
        const desconto = valorParcela - valorPrincipalPorParcela;
        const valorComDesconto = valorPrincipalPorParcela;
        const economiaPercentual = ((desconto / valorParcela) * 100).toFixed(1);

        res.json({
            parcelaId: parcela.id,
            numeroParcela: parcela.numeroParcela,
            carneNumero: parcela.carne.numeroCarne,
            clienteNome: parcela.carne.cliente?.nome,
            dataVencimento: parcela.dataVencimento,
            valorOriginal: valorParcela,
            valorPrincipal: parseFloat(valorPrincipalPorParcela.toFixed(2)),
            valorComDesconto: parseFloat(valorComDesconto.toFixed(2)),
            desconto: parseFloat(desconto.toFixed(2)),
            diasAntecipados,
            economiaPercentual,
            mensagem: `Pagando hoje, você economiza R$ ${desconto.toFixed(2)} (${economiaPercentual}% de desconto - ${diasAntecipados} dias antecipados)`
        });
    } catch (error) {
        console.error('Erro ao simular antecipação:', error);
        res.status(500).json({ error: 'Erro ao simular antecipação' });
    }
};
