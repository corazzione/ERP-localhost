import { prisma } from '../lib/prisma.js';
import { generateReceiptPDF } from '../services/pdfService.js';

export const criarVenda = async (req, res) => {
    try {
        const { clienteId, itens, desconto, formaPagamento, observacoes, usarCredito, lojaId } = req.body;
        const usuarioId = req.userId;

        // 1. Validar Loja
        if (!lojaId) {
            return res.status(400).json({ error: 'Loja é obrigatória para realizar a venda.' });
        }

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
            // 2. Verificar Estoque por Loja
            // Assumindo que o produto tem um campo lojaId ou que o estoque é global por enquanto.
            // O usuário pediu: "estoque deve ser controlado por loja".
            // Se o schema atual do Produto tem `lojaId`, então o produto pertence a uma loja específica.
            // Vamos verificar se o produto pertence à loja selecionada.

            for (const item of itens) {
                const produto = await tx.produto.findUnique({ where: { id: item.produtoId } });

                if (!produto) {
                    throw new Error(`Produto ${item.produtoId} não encontrado.`);
                }

                // Se o produto tem lojaId, deve bater com a loja da venda
                if (produto.lojaId && produto.lojaId !== lojaId) {
                    throw new Error(`Produto ${produto.nome} não pertence à loja selecionada.`);
                }

                if (produto.estoqueAtual < item.quantidade) {
                    throw new Error(`Estoque insuficiente para ${produto.nome}. Disponível: ${produto.estoqueAtual}`);
                }

                // Deduzir estoque
                await tx.produto.update({
                    where: { id: item.produtoId },
                    data: { estoqueAtual: { decrement: item.quantidade } }
                });
            }

            // 3. Verificar e usar crédito se solicitado
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

            // 4. Processar pagamento e gerar parcelas se necessário
            const statusPagamento = totalPagar <= 0 ? 'pago' : (formaPagamento === 'crediario' ? 'pendente' : 'pago');
            const obsFinal = `${observacoes || ''} ${creditoUsado > 0 ? `(Crédito usado: R$ ${creditoUsado.toFixed(2)})` : ''}`.trim();

            const novaVenda = await tx.venda.create({
                data: {
                    numero: numeroVenda,
                    clienteId: clienteId || null,
                    usuarioId,
                    lojaId: lojaId,
                    subtotal,
                    desconto: desconto || 0,
                    total: totalInicial,
                    formaPagamento: totalPagar <= 0 ? 'credito_loja' : formaPagamento,
                    statusPagamento,
                    status: 'concluida', // Default status
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
        res.status(500).json({ error: error.message || 'Erro ao criar venda' });
    }
};

export const listarVendas = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            lojaId,
            dataInicio,
            dataFim,
            status,
            formaPagamento,
            clienteId,
            numero,
            orderBy = 'dataVenda',
            orderDirection = 'desc'
        } = req.query;

        console.log('🔍 FILTROS RECEBIDOS:', { lojaId, status, formaPagamento, clienteId, numero });

        const where = {};

        // Filtro por Loja (lojaId is UUID/String, not Int)
        if (lojaId && lojaId !== 'todas' && lojaId !== '') {
            console.log('🏪 Filtro de Loja (UUID):', { lojaId, type: typeof lojaId });
            // IMPORTANT: Only show sales from this specific store (exclude nulls)
            where.lojaId = lojaId;
        }

        // Filtro por Data
        if (dataInicio && dataFim) {
            where.dataVenda = {
                gte: new Date(dataInicio),
                lte: new Date(dataFim)
            };
        } else if (dataInicio) {
            where.dataVenda = {
                gte: new Date(dataInicio)
            };
        }

        // Filtro por Status - Map frontend status to backend values
        // Backend values: 'concluida', 'pendente', 'cancelada', 'orcamento'
        if (status && status !== 'todos') {
            // Map 'pago' -> 'concluida' for compatibility
            where.status = status === 'pago' ? 'concluida' : status;
        }

        // Filtro por Forma de Pagamento
        if (formaPagamento && formaPagamento !== 'todas') {
            where.formaPagamento = formaPagamento;
        }

        // Filtro por Cliente (clienteId is also UUID/String)
        if (clienteId && clienteId !== '') {
            where.clienteId = clienteId; // Keep as string for UUID
        }

        // Filtro por Número (busca parcial)
        if (numero) {
            where.numero = {
                contains: numero
            };
        }

        // Paginação
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Ordenação
        const orderByClause = {};
        if (orderBy === 'cliente') {
            orderByClause.cliente = { nome: orderDirection };
        } else {
            orderByClause[orderBy] = orderDirection;
        }

        console.log('📋 WHERE FINAL:', JSON.stringify(where, null, 2));

        const [vendas, total] = await Promise.all([
            prisma.venda.findMany({
                where,
                include: {
                    cliente: { select: { nome: true, telefone: true } },
                    usuario: { select: { nome: true } },
                    itens: { include: { produto: { select: { nome: true } } } },
                    loja: { select: { nome: true } } // Incluir nome da loja
                },
                orderBy: orderByClause,
                skip,
                take
            }),
            prisma.venda.count({ where })
        ]);

        res.json({
            data: vendas,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Erro ao listar vendas:', error);
        res.status(500).json({ error: 'Erro ao listar vendas' });
    }
};

export const obterKPIsVendas = async (req, res) => {
    try {
        const {
            lojaId,
            dataInicio,
            dataFim,
            status,
            formaPagamento,
            clienteId
        } = req.query;

        const where = {};

        // Aplicar mesmos filtros do listarVendas
        if (lojaId && lojaId !== 'todas') {
            where.lojaId = lojaId;
        }

        if (dataInicio && dataFim) {
            where.dataVenda = {
                gte: new Date(dataInicio),
                lte: new Date(dataFim)
            };
        } else if (dataInicio) {
            where.dataVenda = {
                gte: new Date(dataInicio)
            };
        }

        if (status && status !== 'todos') {
            where.status = status;
        }

        if (formaPagamento && formaPagamento !== 'todas') {
            where.formaPagamento = formaPagamento;
        }

        if (clienteId) {
            where.clienteId = clienteId;
        }

        // Buscar todas as vendas com os filtros
        const vendas = await prisma.venda.findMany({
            where,
            include: {
                carne: true
            }
        });

        // Calcular KPIs
        const totalVendas = vendas.length;
        const totalRecebido = vendas
            .filter(v => v.statusPagamento === 'pago')
            .reduce((sum, v) => sum + parseFloat(v.total), 0);
        const ticketMedio = totalVendas > 0 ? totalRecebido / totalVendas : 0;
        const crediarioGerado = vendas
            .filter(v => v.formaPagamento === 'crediario')
            .reduce((sum, v) => sum + parseFloat(v.total), 0);

        // Breakdown por status
        const statusBreakdown = {
            pago: vendas.filter(v => v.status === 'concluida' || v.statusPagamento === 'pago').length,
            pendente: vendas.filter(v => v.status === 'pendente').length,
            crediario: vendas.filter(v => v.formaPagamento === 'crediario').length,
            cancelada: vendas.filter(v => v.status === 'cancelada').length,
            orcamento: vendas.filter(v => v.status === 'orcamento').length
        };

        res.json({
            totalVendas,
            totalRecebido,
            ticketMedio,
            crediarioGerado,
            statusBreakdown
        });
    } catch (error) {
        console.error('Erro ao obter KPIs de vendas:', error);
        res.status(500).json({ error: 'Erro ao obter KPIs de vendas', details: error.message });
    }
};

export const gerarInvoicePDF = async (req, res) => {
    try {
        const { id } = req.params;

        const venda = await prisma.venda.findUnique({
            where: { id },
            include: {
                cliente: true,
                itens: { include: { produto: true } },
                loja: true
            }
        });

        if (!venda) {
            return res.status(404).json({ error: 'Venda não encontrada' });
        }

        // Gerar PDF usando o serviço
        const pdfBuffer = await generateReceiptPDF(venda);

        // DEBUG: Save to file to verify integrity
        try {
            const fs = await import('fs');
            fs.writeFileSync('debug-receipt.pdf', pdfBuffer);
            console.log('📝 DEBUG: PDF saved to debug-receipt.pdf');
        } catch (err) {
            console.error('Error saving debug PDF:', err);
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=recibo-${venda.numero}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error('Erro ao gerar invoice:', error);
        res.status(500).json({ error: 'Erro ao gerar invoice' });
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
