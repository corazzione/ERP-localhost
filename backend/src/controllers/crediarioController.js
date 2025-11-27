import { prisma } from '../lib/prisma.js';
import { calcularParcelas, calcularQuitacaoAntecipada, calcularJurosMora } from '../services/crediarioService.js';

export const criarCarne = async (req, res) => {
    try {
        const { vendaId, numParcelas, taxaJuros, primeiroVencimento } = req.body;

        // Buscar venda
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

        // Verificar limite de crédito
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

        // Calcular parcelas
        const parcelas = calcularParcelas(
            parseFloat(venda.total),
            numParcelas,
            parseFloat(taxaJuros),
            new Date(primeiroVencimento)
        );

        // Gerar número do carnê
        const ultimoCarne = await prisma.carne.findFirst({
            orderBy: { numeroCarne: 'desc' }
        });

        const numeroCarne = ultimoCarne
            ? String(parseInt(ultimoCarne.numeroCarne) + 1).padStart(8, '0')
            : '00000001';

        // Criar carnê
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
                            valorParcela: p.valor
                        }))
                    }
                },
                include: {
                    parcelas: { orderBy: { numeroParcela: 'asc' } },
                    cliente: true,
                    venda: true
                }
            });

            // Atualizar venda
            await tx.venda.update({
                where: { id: vendaId },
                data: { formaPagamento: 'crediario', statusPagamento: 'pendente' }
            });

            // Atualizar saldo devedor do cliente
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

        // Calcular juros de mora se houver atraso
        const dataVenc = new Date(parcela.dataVencimento);
        const dataPgto = dataPagamento ? new Date(dataPagamento) : new Date();
        const diasAtraso = Math.max(0, Math.floor((dataPgto - dataVenc) / (1000 * 60 * 60 * 24)));

        const { jurosMora, multaAtraso, valorTotal } = calcularJurosMora(
            parseFloat(parcela.valorParcela),
            diasAtraso
        );

        const resultado = await prisma.$transaction(async (tx) => {
            // Atualizar parcela
            const parcelaAtualizada = await tx.parcela.update({
                where: { id },
                data: {
                    valorPago: valorPago || valorTotal,
                    dataPagamento: dataPgto,
                    diasAtraso,
                    jurosMora,
                    multaAtraso,
                    status: 'pago'
                }
            });

            // Atualizar saldo devedor do cliente
            await tx.cliente.update({
                where: { id: parcela.carne.clienteId },
                data: {
                    saldoDevedor: { decrement: valorPago || valorTotal }
                }
            });

            // Verificar se todas as parcelas foram pagas
            const parcelasRestantes = await tx.parcela.count({
                where: {
                    carneId: parcela.carneId,
                    status: { not: 'pago' }
                }
            });

            if (parcelasRestantes === 0) {
                await tx.carne.update({
                    where: { id: parcela.carneId },
                    data: { status: 'quitado' }
                });
            }

            return parcelaAtualizada;
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
            // Marcar todas as parcelas como pagas
            await tx.parcela.updateMany({
                where: {
                    carneId: id,
                    status: 'pendente'
                },
                data: {
                    status: 'pago',
                    dataPagamento: dataPagamento ? new Date(dataPagamento) : new Date(),
                    valorPago: 0 // Será recalculado individualmente se necessário
                }
            });

            // Atualizar carnê
            const carneAtualizado = await tx.carne.update({
                where: { id },
                data: { status: 'quitado' }
            });

            // Atualizar saldo devedor do cliente
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

// GET /crediario/resumo - KPIs gerais de crediário
export const getResumo = async (req, res) => {
    try {
        // Total a receber (soma de parcelas pendentes)
        const totalReceber = await prisma.parcela.aggregate({
            where: { status: 'pendente' },
            _sum: { valorParcela: true }
        });

        // Parcelas vencidas
        const hoje = new Date();
        const parcelasVencidas = await prisma.parcela.findMany({
            where: {
                status: 'pendente',
                dataVencimento: { lt: hoje }
            }
        });

        const totalVencido = parcelasVencidas.reduce((acc, p) => acc + parseFloat(p.valorParcela), 0);
        const qtdVencidas = parcelasVencidas.length;

        // Total de carnês ativos
        const carnesAtivos = await prisma.carne.count({
            where: { status: 'ativo' }
        });

        // Calcular inadimplência %
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

// GET /crediario/parcelas - Lista consolidada de parcelas
export const listarParcelas = async (req, res) => {
    try {
        const { status, clienteId, vencidas } = req.query;

        const where = {};

        // Filtro por status
        if (status) {
            where.status = status;
        }

        // Filtro por cliente
        if (clienteId) {
            where.carne = {
                clienteId: clienteId
            };
        }

        // Filtro por vencidas
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
            take: 100 // Limitar a 100 para performance
        });

        res.json(parcelas);
    } catch (error) {
        console.error('Erro ao listar parcelas:', error);
        res.status(500).json({ error: 'Erro ao carregar parcelas' });
    }
};

