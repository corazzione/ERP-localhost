import { describe, test, expect } from '@jest/globals';
import {
    calcularJurosSimples,
    calcularJurosCompostos,
    gerarCronogramaParcelas,
    processarParcelasManual,
    calcularAmortizacao,
    calcularJurosMora
} from '../src/utils/crediarioCalculator.js';

describe('Crediário Calculator', () => {
    describe('Juros Simples', () => {
        test('R$1000, 5%, 10 meses', () => {
            const result = calcularJurosSimples(1000, 5, 10);
            expect(result.valorFinal).toBe(1500);
            expect(result.valorParcela).toBe(150);
            expect(result.valorJurosTotal).toBe(500);
        });

        test('R$500, 8%, 6 meses', () => {
            const result = calcularJurosSimples(500, 8, 6);
            expect(result.valorFinal).toBe(740);
            expect(result.valorParcela).toBeCloseTo(123.33, 2);
        });
    });

    describe('Juros Compostos (Price)', () => {
        test('R$1000, 5%, 10 meses', () => {
            const result = calcularJurosCompostos(1000, 5, 10);
            expect(result.valorParcela).toBeCloseTo(129.50, 1);
            expect(result.valorFinal).toBeCloseTo(1295, 0);
        });

        test('R$500, 8%, 6 meses', () => {
            const result = calcularJurosCompostos(500, 8, 6);
            expect(result.valorParcela).toBeCloseTo(99, 0);
        });
    });

    describe('Gerar Cronograma', () => {
        test('Deve gerar 12 parcelas corretamente', () => {
            const primeiraData = new Date('2024-01-15');
            const result = gerarCronogramaParcelas(1200, 5, 12, primeiraData, 'SIMPLES');

            expect(result.parcelas).toHaveLength(12);
            expect(result.parcelas[0].numero).toBe(1);
            expect(result.parcelas[11].numero).toBe(12);
            expect(result.parcelas[0].dataVencimento.getDate()).toBe(15);
        });

        test('Saldo deve diminuir a cada parcela', () => {
            const result = gerarCronogramaParcelas(1000, 5, 10, new Date(), 'SIMPLES');

            for (let i = 0; i < result.parcelas.length - 1; i++) {
                expect(result.parcelas[i].saldoAposPagamento).toBeGreaterThan(
                    result.parcelas[i + 1].saldoAposPagamento
                );
            }

            // Última parcela deve ter saldo zero
            expect(result.parcelas[9].saldoAposPagamento).toBe(0);
        });
    });

    describe('Modo Manual', () => {
        test('Deve aceitar parcelas manuais válidas', () => {
            const parcelas = [
                { numero: 1, valor: 100, vencimento: '2024-01-15' },
                { numero: 2, valor: 100, vencimento: '2024-02-15' },
                { numero: 3, valor: 100, vencimento: '2024-03-15' }
            ];

            const result = processarParcelasManual(parcelas, 300);
            expect(result.parcelas).toHaveLength(3);
            expect(result.valorTotal).toBe(300);
        });

        test('Deve rejeitar soma incorreta', () => {
            const parcelas = [
                { numero: 1, valor: 100, vencimento: '2024-01-15' },
                { numero: 2, valor: 100, vencimento: '2024-02-15' }
            ];

            expect(() => {
                processarParcelasManual(parcelas, 300);
            }).toThrow();
        });
    });

    describe('Amortização (Pagamento Antecipado)', () => {
        test('Deve calcular desconto para 10 dias de antecipação', () => {
            const parcela = {
                dataVencimento: new Date('2024-12-15'),
                valorPrincipal: 100,
                valorJurosPrevisto: 10,
                valorTotalPrevisto: 110
            };

            const dataPagamento = new Date('2024-12-05'); // 10 dias antes
            const result = calcularAmortizacao(parcela, dataPagamento);

            expect(result.diasAntecipados).toBe(10);
            expect(result.descontoAntecipacao).toBeGreaterThan(0);
            expect(result.valorFinal).toBeLessThan(110);
        });

        test('Não deve dar desconto se pago no vencimento', () => {
            const parcela = {
                dataVencimento: new Date('2024-12-15'),
                valorPrincipal: 100,
                valorJurosPrevisto: 10,
                valorTotalPrevisto: 110
            };

            const result = calcularAmortizacao(parcela, new Date('2024-12-15'));

            expect(result.diasAntecipados).toBe(0);
            expect(result.descontoAntecipacao).toBe(0);
            expect(result.valorFinal).toBe(110);
        });
    });

    describe('Juros de Mora (Atraso)', () => {
        test('Deve calcular multa e juros para 5 dias de atraso', () => {
            const config = {
                multaPercentual: 2,
                jurosDiarioPercentual: 0.033
            };

            const result = calcularJurosMora(100, 5, config);

            expect(result.multa).toBe(2); // 2% de 100
            expect(result.jurosMora).toBeCloseTo(0.17, 2); // 0.033% * 5 dias * 100
            expect(result.valorFinal).toBeGreaterThan(100);
        });

        test('Não deve cobrar multa se não está atrasado', () => {
            const result = calcularJurosMora(100, 0);

            expect(result.multa).toBe(0);
            expect(result.jurosMora).toBe(0);
            expect(result.valorFinal).toBe(100);
        });
    });
});
