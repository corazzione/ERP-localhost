/**
 * Crediário Utilities - Motor Financeiro (Tabela Price)
 * Taxa Base: 11,50% a.m. (Mercado Livre)
 */

// ========================================
// CONFIGURAÇÃO DE TAXAS
// ========================================

export const CREDIARIO_CONFIG = {
    // Taxa base (Mercado Livre)
    baseMonthlyRate: 0.115,  // 11,50% ao mês
    baseAnnualRate: 2.9744,  // 297,44% ao ano

    // Taxas pré-definidas permitidas
    allowedRates: [
        { value: 0.02, label: '2% a.m.' },
        { value: 0.03, label: '3% a.m.' },
        { value: 0.035, label: '3,5% a.m.' },
        { value: 0.04, label: '4% a.m.' },
        { value: 0.115, label: '11,5% a.m. (Mercado Livre)' }
    ],

    // Opções de parcelas padrão
    defaultInstallments: [2, 3, 4, 6, 10, 12],

    // Permitir taxa personalizada
    allowCustomRate: true,

    // Limites de taxa personalizada
    minRate: 0.01,  // 1% mínimo
    maxRate: 0.20   // 20% máximo
};

// ========================================
// FÓRMULA PRICE (PMT)
// ========================================

/**
 * Calcula o valor da parcela usando Tabela Price
 * PMT = P * [ i * (1 + i)^n ] / [ (1 + i)^n – 1 ]
 * 
 * @param {number} principal - Valor financiado (P)
 * @param {number} monthlyRate - Taxa de juros mensal (i) - ex: 0.115 para 11,5%
 * @param {number} installments - Número de parcelas (n)
 * @returns {number} - Valor da parcela
 */
export const calcularParcela = (principal, monthlyRate, installments) => {
    if (installments <= 0 || principal <= 0) return 0;
    if (monthlyRate <= 0) return principal / installments; // Sem juros

    const i = monthlyRate;
    const n = installments;
    const P = principal;

    // Fórmula Price
    const factor = Math.pow(1 + i, n);
    const pmt = P * (i * factor) / (factor - 1);

    return Math.round(pmt * 100) / 100; // Arredondar para 2 casas
};

/**
 * Calcula o total financiado
 * @param {number} installmentValue - Valor da parcela
 * @param {number} installments - Número de parcelas
 * @returns {number} - Total financiado
 */
export const calcularTotalFinanciado = (installmentValue, installments) => {
    return Math.round(installmentValue * installments * 100) / 100;
};

/**
 * Calcula os juros totais
 * @param {number} totalFinanciado - Total financiado
 * @param {number} principal - Valor original
 * @returns {number} - Juros totais
 */
export const calcularJurosTotais = (totalFinanciado, principal) => {
    return Math.round((totalFinanciado - principal) * 100) / 100;
};

// ========================================
// GERADOR DE SIMULAÇÃO
// ========================================

/**
 * Gera tabela de simulação completa
 * @param {number} principal - Valor a financiar
 * @param {number} monthlyRate - Taxa mensal (default: 11,5%)
 * @param {number[]} installmentOptions - Lista de opções de parcelas
 * @returns {Object[]} - Array com simulações
 */
export const gerarTabelaSimulacao = (
    principal,
    monthlyRate = CREDIARIO_CONFIG.baseMonthlyRate,
    installmentOptions = CREDIARIO_CONFIG.defaultInstallments
) => {
    if (principal <= 0) return [];

    return installmentOptions.map(numParcelas => {
        const valorParcela = calcularParcela(principal, monthlyRate, numParcelas);
        const totalFinanciado = calcularTotalFinanciado(valorParcela, numParcelas);
        const jurosTotais = calcularJurosTotais(totalFinanciado, principal);
        const percentualJuros = ((jurosTotais / principal) * 100).toFixed(2);

        return {
            parcelas: numParcelas,
            valorParcela,
            totalFinanciado,
            jurosTotais,
            percentualJuros: parseFloat(percentualJuros)
        };
    });
};

/**
 * Gera simulação completa com metadados
 * @param {number} principal - Valor a financiar
 * @param {number} monthlyRate - Taxa mensal
 * @param {number[]} installmentOptions - Opções de parcelas
 * @returns {Object} - Objeto com simulação completa
 */
export const gerarSimulacaoCompleta = (
    principal,
    monthlyRate = CREDIARIO_CONFIG.baseMonthlyRate,
    installmentOptions = CREDIARIO_CONFIG.defaultInstallments
) => {
    const simulacoes = gerarTabelaSimulacao(principal, monthlyRate, installmentOptions);

    return {
        valorOriginal: principal,
        taxaMensal: monthlyRate,
        taxaMensalFormatada: `${(monthlyRate * 100).toFixed(2).replace('.', ',')}%`,
        taxaAnual: Math.pow(1 + monthlyRate, 12) - 1,
        dataSimulacao: new Date().toISOString(),
        simulacoes,
        textoAmortizacao: TEXTO_AMORTIZACAO
    };
};

// ========================================
// FORMATADORES
// ========================================

/**
 * Formata valor como moeda brasileira
 */
export const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
};

/**
 * Formata taxa percentual
 */
export const formatarTaxa = (taxa) => {
    return `${(taxa * 100).toFixed(2).replace('.', ',')}% a.m.`;
};

// ========================================
// TEXTO DE AMORTIZAÇÃO
// ========================================

export const TEXTO_AMORTIZACAO = `Este crediário permite amortização. Caso você realize pagamentos antecipados (parciais ou totais), os juros são automaticamente recalculados, reduzindo o total final da dívida. Quanto antes você pagar, menos juros paga.`;

export const TEXTO_AMORTIZACAO_CURTO = `Pagamentos antecipados reduzem os juros automaticamente.`;

// ========================================
// VALIDADORES
// ========================================

/**
 * Valida se a taxa está dentro dos limites
 */
export const validarTaxa = (taxa) => {
    if (taxa < CREDIARIO_CONFIG.minRate) {
        return { valid: false, message: `Taxa mínima é ${CREDIARIO_CONFIG.minRate * 100}%` };
    }
    if (taxa > CREDIARIO_CONFIG.maxRate) {
        return { valid: false, message: `Taxa máxima é ${CREDIARIO_CONFIG.maxRate * 100}%` };
    }
    return { valid: true };
};

/**
 * Converte string de taxa para número
 * Ex: "11,5" ou "11.5" -> 0.115
 */
export const parseTaxaInput = (input) => {
    if (typeof input === 'number') return input / 100;
    const cleaned = input.replace(',', '.').replace('%', '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed / 100;
};
