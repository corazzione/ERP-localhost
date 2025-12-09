import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';
import { generatePdfFromHtml } from '../services/pdfService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Helper to check if budget is expired
const isExpired = (validadeAte) => {
    if (!validadeAte) return false;
    return new Date(validadeAte) < new Date();
};

// Helper to get effective status (considering expiration)
const getEffectiveStatus = (orcamento) => {
    if (orcamento.status === 'pendente' && isExpired(orcamento.validadeAte)) {
        return 'vencido';
    }
    return orcamento.status;
};

export const criarOrcamento = async (req, res) => {
    try {
        const {
            clienteId,
            itens,
            desconto,
            observacoes,
            observacoesInternas,
            validadeDias,
            validadeAte: validadeAteInput,
            lojaId,
            origem = 'manual',
            crediario  // NEW: receive crediário data
        } = req.body;
        const usuarioId = req.userId;

        // ===== VALIDATION =====
        if (!itens || !Array.isArray(itens) || itens.length === 0) {
            return res.status(400).json({
                error: 'Orçamento deve conter pelo menos um item',
                field: 'itens'
            });
        }

        // Validate each item
        for (let i = 0; i < itens.length; i++) {
            const item = itens[i];
            if (!item.quantidade || item.quantidade <= 0) {
                return res.status(400).json({
                    error: `Item ${i + 1}: quantidade inválida`,
                    field: 'itens'
                });
            }
            if (!item.precoUnit || parseFloat(item.precoUnit) <= 0) {
                return res.status(400).json({
                    error: `Item ${i + 1}: preço unitário inválido`,
                    field: 'itens'
                });
            }
        }

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

        // Calcular validade: use validadeAte if provided, otherwise calculate from validadeDias
        let validadeAte;
        if (validadeAteInput) {
            validadeAte = new Date(validadeAteInput);
        } else {
            const dias = validadeDias || 7;
            validadeAte = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
        }

        // Process crediário data
        const incluiCrediario = crediario?.incluirSimulacao || false;
        const taxaCrediario = incluiCrediario ? crediario.taxaMensal : null;
        const simulacaoCrediario = incluiCrediario ? crediario.simulacoes : null;

        const orcamento = await prisma.orcamento.create({
            data: {
                numero,
                clienteId: clienteId || null,
                usuarioId,
                lojaId: lojaId || null,
                subtotal,
                desconto: parseFloat(desconto) || 0,
                total,
                validadeAte,
                origem,
                observacoes,
                observacoesInternas,
                // Crediário fields
                incluiCrediario,
                taxaCrediario,
                simulacaoCrediario,
                itens: {
                    create: itens.map(item => ({
                        produtoId: item.produtoId || null,
                        descricao: item.descricao || item.nome,
                        quantidade: item.quantidade,
                        precoUnit: parseFloat(item.precoUnit),
                        subtotal: parseFloat(item.precoUnit) * item.quantidade,
                        especificacoes: item.especificacoes || null,
                        tempoEstimado: item.tempoEstimado || null
                    }))
                }
            },
            include: {
                itens: { include: { produto: true } },
                cliente: { select: { id: true, nome: true, cpfCnpj: true, telefone: true } },
                usuario: { select: { nome: true } },
                loja: { select: { id: true, nome: true } }
            }
        });

        res.status(201).json(orcamento);
    } catch (error) {
        console.error('Erro ao criar orçamento:', error);
        res.status(500).json({ error: 'Erro ao criar orçamento', details: error.message });
    }
};

export const listarOrcamentos = async (req, res) => {
    try {
        const { status, clienteId, lojaId, busca, dataInicio, dataFim } = req.query;

        const where = {};

        // Filter by status (excluding 'vencido' which is calculated)
        if (status && status !== 'todos' && status !== 'vencido') {
            where.status = status;
        }

        if (clienteId) where.clienteId = clienteId;
        if (lojaId) where.lojaId = lojaId;

        // Search by number or client name
        if (busca) {
            where.OR = [
                { numero: { contains: busca, mode: 'insensitive' } },
                { cliente: { nome: { contains: busca, mode: 'insensitive' } } }
            ];
        }

        if (dataInicio && dataFim) {
            where.dataEmissao = {
                gte: new Date(dataInicio),
                lte: new Date(dataFim)
            };
        }

        let orcamentos = await prisma.orcamento.findMany({
            where,
            include: {
                cliente: { select: { id: true, nome: true, telefone: true } },
                usuario: { select: { nome: true } },
                loja: { select: { id: true, nome: true } },
                _count: { select: { itens: true } }
            },
            orderBy: { dataEmissao: 'desc' }
        });

        // Add effective status and filter by 'vencido' if requested
        orcamentos = orcamentos.map(orc => ({
            ...orc,
            statusEfetivo: getEffectiveStatus(orc)
        }));

        // Filter for 'vencido' status
        if (status === 'vencido') {
            orcamentos = orcamentos.filter(orc => orc.statusEfetivo === 'vencido');
        }

        // Calculate KPIs
        const kpis = {
            total: orcamentos.length,
            pendentes: orcamentos.filter(o => o.statusEfetivo === 'pendente').length,
            aprovados: orcamentos.filter(o => o.statusEfetivo === 'aprovado').length,
            recusados: orcamentos.filter(o => o.statusEfetivo === 'recusado').length,
            vencidos: orcamentos.filter(o => o.statusEfetivo === 'vencido').length,
            convertidos: orcamentos.filter(o => o.statusEfetivo === 'convertido').length,
            valorTotal: orcamentos.reduce((sum, o) => sum + parseFloat(o.total), 0),
            valorPendente: orcamentos
                .filter(o => o.statusEfetivo === 'pendente')
                .reduce((sum, o) => sum + parseFloat(o.total), 0)
        };

        res.json({ data: orcamentos, kpis });
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

        // Add effective status
        const result = {
            ...orcamento,
            statusEfetivo: getEffectiveStatus(orcamento)
        };

        res.json(result);
    } catch (error) {
        console.error('Erro ao obter orçamento:', error);
        res.status(500).json({ error: 'Erro ao obter orçamento' });
    }
};

export const editarOrcamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { observacoes, observacoesInternas, validadeAte } = req.body;

        // Check if can edit
        const existing = await prisma.orcamento.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }
        if (existing.status !== 'pendente') {
            return res.status(400).json({ error: 'Apenas orçamentos pendentes podem ser editados' });
        }

        const orcamento = await prisma.orcamento.update({
            where: { id },
            data: {
                observacoes,
                observacoesInternas,
                validadeAte: validadeAte ? new Date(validadeAte) : undefined
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

        const existing = await prisma.orcamento.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }
        if (existing.status !== 'pendente') {
            return res.status(400).json({ error: 'Apenas orçamentos pendentes podem ser aprovados' });
        }

        const orcamento = await prisma.orcamento.update({
            where: { id },
            data: {
                status: 'aprovado',
                dataAprovacao: new Date()
            },
            include: {
                cliente: { select: { nome: true } },
                loja: { select: { nome: true } }
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

        const existing = await prisma.orcamento.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }
        if (existing.status !== 'pendente') {
            return res.status(400).json({ error: 'Apenas orçamentos pendentes podem ser recusados' });
        }

        const orcamento = await prisma.orcamento.update({
            where: { id },
            data: {
                status: 'recusado',
                dataRecusa: new Date(),
                motivoRecusa: motivo || 'Não informado'
            }
        });

        res.json(orcamento);
    } catch (error) {
        console.error('Erro ao recusar orçamento:', error);
        res.status(500).json({ error: 'Erro ao recusar orçamento' });
    }
};

export const converterEmVenda = async (req, res) => {
    try {
        const { id } = req.params;
        const { formaPagamento = 'dinheiro' } = req.body;
        const usuarioId = req.userId;

        // Get budget with items
        const orcamento = await prisma.orcamento.findUnique({
            where: { id },
            include: { itens: true }
        });

        if (!orcamento) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }

        if (orcamento.status !== 'pendente' && orcamento.status !== 'aprovado') {
            return res.status(400).json({ error: 'Apenas orçamentos pendentes ou aprovados podem ser convertidos' });
        }

        // For crediário, client is required
        if (formaPagamento === 'crediario' && !orcamento.clienteId) {
            return res.status(400).json({ error: 'Venda no crediário requer cliente vinculado' });
        }

        // Generate sale number
        const ultimaVenda = await prisma.venda.findFirst({
            orderBy: { numero: 'desc' }
        });
        const numeroVenda = ultimaVenda
            ? String(parseInt(ultimaVenda.numero) + 1).padStart(8, '0')
            : '00000001';

        // Create sale from budget in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create sale
            const venda = await tx.venda.create({
                data: {
                    numero: numeroVenda,
                    clienteId: orcamento.clienteId,
                    usuarioId,
                    lojaId: orcamento.lojaId,
                    subtotal: orcamento.subtotal,
                    desconto: orcamento.desconto,
                    total: orcamento.total,
                    formaPagamento,
                    status: 'concluida',
                    statusPagamento: formaPagamento === 'crediario' ? 'pendente' : 'pago',
                    observacoes: `Convertido do orçamento ${orcamento.numero}`,
                    itens: {
                        create: orcamento.itens.map(item => ({
                            produtoId: item.produtoId,
                            quantidade: item.quantidade,
                            precoUnit: item.precoUnit,
                            subtotal: item.subtotal
                        }))
                    }
                },
                include: {
                    itens: true,
                    cliente: { select: { nome: true, saldoDevedor: true, limiteCredito: true } },
                    loja: { select: { nome: true } }
                }
            });

            // Update budget status
            await tx.orcamento.update({
                where: { id },
                data: {
                    status: 'convertido',
                    dataAprovacao: orcamento.dataAprovacao || new Date()
                }
            });

            // If crediário, create carnê with installments
            if (formaPagamento === 'crediario') {
                // Get crediário parameters from request or use defaults
                const {
                    numParcelas: parcelasReq = 6,
                    primeiroVencimento: vencimentoReq,
                    modoCrediario = 'PADRAO',
                    taxaPersonalizadaMensal = 0
                } = req.body;

                // Determine rate based on mode
                let taxaJuros;
                if (modoCrediario === 'PERSONALIZADO') {
                    taxaJuros = parseFloat(taxaPersonalizadaMensal) || 0;
                } else if (modoCrediario === 'PADRAO') {
                    taxaJuros = orcamento.taxaCrediario ? parseFloat(orcamento.taxaCrediario) : 8.0;
                } else {
                    taxaJuros = 8.0;
                }

                const numParcelas = parseInt(parcelasReq) || 6;

                // Set first due date from request or default to 30 days
                const primeiroVencimento = vencimentoReq
                    ? new Date(vencimentoReq)
                    : (() => {
                        const d = new Date();
                        d.setDate(d.getDate() + 30);
                        return d;
                    })();

                // Calculate installments using Price formula
                const taxaDecimal = taxaJuros / 100;
                const fatorJuros = Math.pow(1 + taxaDecimal, numParcelas);
                const valorParcela = (parseFloat(orcamento.total) * fatorJuros * taxaDecimal) / (fatorJuros - 1);
                const valorTotal = valorParcela * numParcelas;
                const valorJuros = valorTotal - parseFloat(orcamento.total);

                // Generate carnê number
                const ultimoCarne = await tx.carne.findFirst({
                    orderBy: { numeroCarne: 'desc' }
                });
                const numeroCarne = ultimoCarne
                    ? String(parseInt(ultimoCarne.numeroCarne) + 1).padStart(8, '0')
                    : '00000001';

                // Create parcelas array
                const parcelasData = [];
                for (let i = 0; i < numParcelas; i++) {
                    const vencimento = new Date(primeiroVencimento);
                    vencimento.setMonth(vencimento.getMonth() + i);

                    parcelasData.push({
                        numeroParcela: i + 1,
                        dataVencimento: vencimento,
                        valorParcela: parseFloat(valorParcela.toFixed(2)),
                        valorPrincipal: parseFloat((parseFloat(orcamento.total) / numParcelas).toFixed(2)),
                        valorTotalPrevisto: parseFloat(valorParcela.toFixed(2))
                    });
                }

                // Create carnê
                await tx.carne.create({
                    data: {
                        vendaId: venda.id,
                        clienteId: orcamento.clienteId,
                        numeroCarne,
                        valorTotal: parseFloat(valorTotal.toFixed(2)),
                        valorOriginal: parseFloat(orcamento.total),
                        numParcelas,
                        taxaJuros,
                        valorJuros: parseFloat(valorJuros.toFixed(2)),
                        parcelas: {
                            create: parcelasData
                        }
                    }
                });

                // Update client's saldoDevedor
                await tx.cliente.update({
                    where: { id: orcamento.clienteId },
                    data: {
                        saldoDevedor: { increment: parseFloat(valorTotal.toFixed(2)) }
                    }
                });
            }

            return venda;
        });

        res.json({
            message: formaPagamento === 'crediario'
                ? 'Orçamento convertido em venda com crediário. Carnê criado automaticamente!'
                : 'Orçamento convertido em venda com sucesso',
            venda: result,
            vendaNumero: result.numero
        });
    } catch (error) {
        console.error('Erro ao converter orçamento em venda:', error);
        res.status(500).json({ error: 'Erro ao converter orçamento em venda' });
    }
};

// PDF Generation Helpers
const formatMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor || 0);
};

const formatDateBR = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('pt-BR');
};

const getStatusLabel = (status) => {
    const labels = {
        pendente: 'Pendente',
        aprovado: 'Aprovado',
        recusado: 'Recusado',
        vencido: 'Vencido',
        convertido: 'Convertido'
    };
    return labels[status] || status;
};

// Credit Simulation Generator - Price Formula (11.50% monthly rate)
const BASE_MONTHLY_RATE = 0.115; // 11.50% a.m. (Mercado Livre base)
const DEFAULT_INSTALLMENTS = [2, 3, 4, 6, 10, 12];

const calcularParcela = (principal, rate, n) => {
    if (n <= 0 || principal <= 0) return 0;
    if (rate <= 0) return principal / n;
    const factor = Math.pow(1 + rate, n);
    return principal * (rate * factor) / (factor - 1);
};

const gerarSimulacaoCredito = (total, rate = BASE_MONTHLY_RATE) => {
    if (!total || total <= 0) return null;

    return DEFAULT_INSTALLMENTS.map(n => {
        const valorParcela = calcularParcela(total, rate, n);
        const totalFinanciado = valorParcela * n;
        const jurosTotais = totalFinanciado - total;
        const percentualJuros = ((jurosTotais / total) * 100).toFixed(2);

        return {
            parcelas: n,
            valorParcela: formatMoeda(valorParcela),
            totalFinanciado: formatMoeda(totalFinanciado),
            jurosTotais: formatMoeda(jurosTotais),
            percentualJuros
        };
    });
};

export const gerarPDF = async (req, res) => {
    try {
        const { id } = req.params;

        const orcamento = await prisma.orcamento.findUnique({
            where: { id },
            include: {
                itens: { include: { produto: true } },
                cliente: true,
                loja: true,
                usuario: { select: { nome: true } }
            }
        });

        if (!orcamento) {
            return res.status(404).json({ error: 'Orçamento não encontrado' });
        }

        // Load template
        const templatePath = path.join(__dirname, '../templates/orcamento.hbs');
        const templateHtml = fs.readFileSync(templatePath, 'utf8');
        const template = Handlebars.compile(templateHtml);

        // Get effective status
        const effectiveStatus = getEffectiveStatus(orcamento);

        // Prepare data
        const data = {
            numero: orcamento.numero,
            status: effectiveStatus,
            statusLabel: getStatusLabel(effectiveStatus),
            dataEmissao: formatDateBR(orcamento.dataEmissao),
            validadeAte: orcamento.validadeAte ? formatDateBR(orcamento.validadeAte) : null,
            cliente: {
                nome: orcamento.cliente?.nome || 'Cliente Balcão',
                cpfCnpj: orcamento.cliente?.cpfCnpj || null,
                telefone: orcamento.cliente?.telefone || null
            },
            loja: {
                nome: orcamento.loja?.nome || 'Loja Principal',
                endereco: orcamento.loja?.endereco || null,
                telefone: orcamento.loja?.telefone || null
            },
            itens: orcamento.itens.map(item => ({
                descricao: item.descricao || item.produto?.nome || 'Item',
                quantidade: item.quantidade,
                precoUnit: formatMoeda(item.precoUnit),
                subtotal: formatMoeda(item.subtotal)
            })),
            subtotalFormatted: formatMoeda(orcamento.subtotal),
            descontoFormatted: formatMoeda(orcamento.desconto),
            totalFormatted: formatMoeda(orcamento.total),
            desconto: parseFloat(orcamento.desconto) > 0,
            observacoes: orcamento.observacoes,
            // Credit simulation - always include with base rate (11.50%)
            taxaMensalFormatada: '11,50%',
            simulacaoCredito: gerarSimulacaoCredito(parseFloat(orcamento.total))
        };

        // Render HTML
        const htmlPreenchido = template(data);

        // Generate PDF
        const pdfBuffer = await generatePdfFromHtml(htmlPreenchido, {
            format: 'A4',
            printBackground: true,
            margin: { top: '0', right: '0', bottom: '0', left: '0' }
        });

        // Return PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="orcamento-${orcamento.numero}.pdf"`);
        res.setHeader('Content-Length', pdfBuffer.length);
        return res.status(200).end(pdfBuffer);

    } catch (error) {
        console.error('Erro ao gerar PDF do orçamento:', error);
        res.status(500).json({ error: 'Erro ao gerar PDF do orçamento' });
    }
};
