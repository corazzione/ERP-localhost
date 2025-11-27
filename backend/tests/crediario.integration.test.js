/**
 * 🪷 Lotus Core ERP - Crediário Integration Tests
 * 
 * Comprehensive test suite for crediário module
 */

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { prisma } from '../src/lib/prisma.js';
import app from '../src/server.js';

let authToken;
let clienteId;
let usuarioId;
let produtoId;

beforeAll(async () => {
    // Login
    const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'admin@erp.com',
            password: 'senha123'
        });

    authToken = loginRes.body.token;
    usuarioId = loginRes.body.user.id;

    // Criar cliente de teste
    const clienteRes = await request(app)
        .post('/api/clientes')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
            nome: 'Cliente Teste Crediário',
            cpfCnpj: '12398765400',
            limiteCredito: 10000,
            telefone: '(11) 99999-9999'
        });

    clienteId = clienteRes.body.id;

    // Criar produto de teste
    const produtoRes = await request(app)
        .post('/api/produtos')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
            codigo: 'TEST-CRED-001',
            nome: 'Produto Teste Crediário',
            precoVenda: 1000,
            precoCusto: 600,
            estoqueAtual: 100
        });

    produtoId = produtoRes.body.id;
});

afterAll(async () => {
    // Cleanup
    await prisma.itemVenda.deleteMany({});
    await prisma.parcela.deleteMany({});
    await prisma.contaReceber.deleteMany({});
    await prisma.carne.deleteMany({});
    await prisma.venda.deleteMany({});
    await prisma.produto.deleteMany({ where: { codigo: 'TEST-CRED-001' } });
    await prisma.cliente.deleteMany({ where: { cpfCnpj: '12398765400' } });
    await prisma.$disconnect();
});

describe('Crediário Module - Integration Tests', () => {

    // =========================
    // FASE 3: MODO PADRÃO
    // =========================
    describe('Modo PADRÃO (taxa global)', () => {
        let vendaId, carneId, parcelaId;

        test('Deve criar venda em crediário com taxa padrão', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    clienteId,
                    itens: [
                        {
                            produtoId,
                            quantidade: 1,
                            precoUnit: 1000
                        }
                    ],
                    desconto: 0,
                    formaPagamento: 'crediario',
                    modoCrediario: 'PADRAO',
                    numParcelas: 10,
                    primeiroVencimento: '2024-12-15'
                });

            expect(res.status).toBe(201);
            expect(res.body).toHaveProperty('id');
            expect(res.body.formaPagamento).toBe('crediario');
            expect(res.body.modoCrediario).toBe('PADRAO');

            vendaId = res.body.id;
        });

        test('Deve ter criado carnê com 10 parcelas', async () => {
            const carne = await prisma.carne.findFirst({
                where: { vendaId },
                include: { parcelas: true }
            });

            expect(carne).toBeTruthy();
            expect(carne.parcelas).toHaveLength(10);
            expect(parseFloat(carne.taxaJuros)).toBe(8); // Taxa padrão
            expect(carne.status).toBe('ativo');

            carneId = carne.id;
            parcelaId = carne.parcelas[0].id;
        });

        test('Parcelas devem ter breakdown detalhado', async () => {
            const parcela = await prisma.parcela.findUnique({
                where: { id: parcelaId }
            });

            expect(parcela.valorPrincipal).toBeTruthy();
            expect(parcela.valorJurosPrevisto).toBeGreaterThan(0);
            expect(parcela.valorTotalPrevisto).toBeTruthy();
            expect(parseFloat(parcela.valorTotalPrevisto)).toBeGreaterThan(parseFloat(parcela.valorPrincipal));
        });

        test('Deve ter criado ContaReceber para cada parcela', async () => {
            const contasReceber = await prisma.contaReceber.findMany({
                where: {
                    clienteId,
                    parcela: { carneId }
                }
            });

            expect(contasReceber).toHaveLength(10);
            expect(contasReceber[0].status).toBe('pendente');
        });
    });

    // =========================
    // FASE 4: MODO MANUAL
    // =========================
    describe('Modo MANUAL (valores personalizados)', () => {
        let vendaManualId;

        test('Deve criar venda com parcelas manuais', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    clienteId,
                    itens: [{ produtoId, quantidade: 1, precoUnit: 600 }],
                    desconto: 0,
                    formaPagamento: 'crediario',
                    modoCrediario: 'MANUAL',
                    numParcelas: 3,
                    parcelasManual: [
                        { numero: 1, valor: 200, vencimento: '2024-12-15' },
                        { numero: 2, valor: 200, vencimento: '2025-01-15' },
                        { numero: 3, valor: 200, vencimento: '2025-02-15' }
                    ]
                });

            expect(res.status).toBe(201);
            expect(res.body.modoCrediario).toBe('MANUAL');

            vendaManualId = res.body.id;
        });

        test('Deve rejeitar parcelas manuais com soma incorreta', async () => {
            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    clienteId,
                    itens: [{ produtoId, quantidade: 1, precoUnit: 600 }],
                    desconto: 0,
                    formaPagamento: 'crediario',
                    modoCrediario: 'MANUAL',
                    numParcelas: 3,
                    parcelasManual: [
                        { numero: 1, valor: 200, vencimento: '2024-12-15' },
                        { numero: 2, valor: 200, vencimento: '2025-01-15' }
                        // Falta uma parcela!
                    ]
                });

            expect(res.status).toBe(500); // Deve dar erro
        });
    });

    // =========================
    // FASE 5: PAGAMENTO ANTECIPADO
    // =========================
    describe('Pagamento Antecipado (Amortização)', () => {
        let parcelaAntecipadaId;

        beforeAll(async () => {
            // Criar venda com vencimento futuro
            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    clienteId,
                    itens: [{ produtoId, quantidade: 1, precoUnit: 1200 }],
                    formaPagamento: 'crediario',
                    modoCrediario: 'PADRAO',
                    numParcelas: 12,
                    primeiroVencimento: '2025-01-15' // Futuro
                });

            const carne = await prisma.carne.findFirst({
                where: { vendaId: res.body.id },
                include: { parcelas: true }
            });

            parcelaAntecipadaId = carne.parcelas[0].id;
        });

        test('Deve aplicar desconto em pagamento antecipado', async () => {
            const parcela = await prisma.parcela.findUnique({
                where: { id: parcelaAntecipadaId }
            });

            const valorOriginal = parseFloat(parcela.valorTotalPrevisto);

            // Pagar 15 dias antes do vencimento
            const dataAntes = new Date('2024-12-31'); // 15 dias antes de 2025-01-15

            const res = await request(app)
                .post(`/api/crediario/parcelas/${parcelaAntecipadaId}/pagar`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    dataPagamento: dataAntes.toISOString().split('T')[0]
                });

            expect(res.status).toBe(200);
            expect(res.body.resumo.diasAntecipados).toBeGreaterThan(0);
            expect(res.body.resumo.descontoAntecipacao).toBeGreaterThan(0);
            expect(res.body.resumo.valorFinal).toBeLessThan(valorOriginal);
            expect(res.body.resumo.economizado).toBe(true);
        });

        test('ContaReceber deve ser atualizada com valor final', async () => {
            const contaReceber = await prisma.contaReceber.findUnique({
                where: { parcelaId: parcelaAntecipadaId }
            });

            expect(contaReceber.status).toBe('pago');
            expect(contaReceber.dataRecebimento).toBeTruthy();
        });
    });

    // =========================
    // FASE 5: PAGAMENTO ATRASADO
    // =========================
    describe('Pagamento Atrasado (Multa + Juros)', () => {
        let parcelaAtrasadaId;

        beforeAll(async () => {
            // Criar venda com vencimento passado
            const res = await request(app)
                .post('/api/vendas')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    clienteId,
                    itens: [{ produtoId, quantidade: 1, precoUnit: 500 }],
                    formaPagamento: 'crediario',
                    modoCrediario: 'PADRAO',
                    numParcelas: 5,
                    primeiroVencimento: '2024-11-01' // Passado
                });

            const carne = await prisma.carne.findFirst({
                where: { vendaId: res.body.id },
                include: { parcelas: true }
            });

            parcelaAtrasadaId = carne.parcelas[0].id;
        });

        test('Deve aplicar multa e juros em pagamento atrasado', async () => {
            const parcela = await prisma.parcela.findUnique({
                where: { id: parcelaAtrasadaId }
            });

            const valorOriginal = parseFloat(parcela.valorTotalPrevisto);

            // Pagar 10 dias após vencimento
            const dataApos = new Date('2024-11-11');

            const res = await request(app)
                .post(`/api/crediario/parcelas/${parcelaAtrasadaId}/pagar`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    dataPagamento: dataApos.toISOString().split('T')[0]
                });

            expect(res.status).toBe(200);
            expect(res.body.resumo.diasAtraso).toBe(10);
            expect(res.body.resumo.multaAtraso).toBeGreaterThan(0);
            expect(res.body.resumo.jurosMora).toBeGreaterThan(0);
            expect(res.body.resumo.valorFinal).toBeGreaterThan(valorOriginal);
        });
    });

    // =========================
    // FASE 6: INTEGRAÇÃO FINANCEIRO
    // =========================
    describe('Integração com Financeiro', () => {
        test('Dashboard deve incluir parcelas pendentes em A Receber', async () => {
            const parcelasPendentes = await prisma.contaReceber.aggregate({
                where: {
                    status: 'pendente',
                    parcela: { isNot: null }
                },
                _sum: { valor: true },
                _count: true
            });

            expect(parcelasPendentes._count).toBeGreaterThan(0);
            expect(parcelasPendentes._sum.valor).toBeGreaterThan(0);
        });

        test('Parcelas atrasadas devem ser identificadas', async () => {
            const hoje = new Date();
            const atrasadas = await prisma.parcela.count({
                where: {
                    status: 'pendente',
                    dataVencimento: { lt: hoje }
                }
            });

            // Deve ter pelo menos uma (criamos uma com vencimento passado)
            expect(atrasadas).toBeGreaterThan(0);
        });
    });
});
