/**
 * 🪷 Lotus Core ERP - Crediário Calculator
 * 
 * Funções padronizadas para cálculo de crediário com juros simples e compostos
 */

/**
 * Calcula juros SIMPLES
 * Fórmula: M = C * (1 + i * n)
 * 
 * @param {number} valorInicial - Valor principal sem juros
 * @param {number} taxaMensal - Taxa mensal em % (ex: 8 para 8%)
 * @param {number} meses - Número de meses
 * @returns {Object} { valorFinal, valorParcela, valorJurosTotal }
 */
export function calcularJurosSimples(valorInicial, taxaMensal, meses) {
    const i = taxaMensal / 100;
    const valorFinal = valorInicial * (1 + i * meses);
    const valorParcela = valorFinal / meses;
    const valorJurosTotal = valorFinal - valorInicial;

    return {
        valorFinal: parseFloat(valorFinal.toFixed(2)),
        valorParcela: parseFloat(valorParcela.toFixed(2)),
        valorJurosTotal: parseFloat(valorJurosTotal.toFixed(2))
    };
}

/**
 * Calcula juros COMPOSTOS (Tabela Price)
 * Fórmula: PMT = PV * [i * (1 + i)^n] / [(1 + i)^n - 1]
 * 
 * @param {number} valorInicial - Valor principal sem juros
 * @param {number} taxaMensal - Taxa mensal em % (ex: 8 para 8%)
 * @param {number} meses - Número de meses
 * @returns {Object} { valorFinal, valorParcela, valorJurosTotal }
 */
export function calcularJurosCompostos(valorInicial, taxaMensal, meses) {
    const i = taxaMensal / 100;
    const fator = Math.pow(1 + i, meses);
    const valorParcela = (valorInicial * fator * i) / (fator - 1);
    const valorFinal = valorParcela * meses;
    const valorJurosTotal = valorFinal - valorInicial;

    return {
        valorFinal: parseFloat(valorFinal.toFixed(2)),
        valorParcela: parseFloat(valorParcela.toFixed(2)),
        valorJurosTotal: parseFloat(valorJurosTotal.toFixed(2))
    };
}

/**
 * Gera cronograma completo de parcelas
 * 
 * @param {number} valorInicial - Valor principal sem juros
 * @param {number} taxaMensal - Taxa mensal em %
 * @param {number} meses - Número de parcelas
 * @param {Date} primeiraData - Data do primeiro vencimento
 * @param {string} tipoJuros - 'SIMPLES' ou 'COMPOSTO'
 * @returns {Object} { parcelas, valorTotal, valorJurosTotal }
 */
export function gerarCronogramaParcelas(valorInicial, taxaMensal, meses, primeiraData, tipoJuros = 'COMPOSTO') {
    // Escolher função de cálculo
    const calc = tipoJuros === 'SIMPLES'
        ? calcularJurosSimples(valorInicial, taxaMensal, meses)
        : calcularJurosCompostos(valorInicial, taxaMensal, meses);

    const parcelas = [];
    const valorPrincipalPorParcela = valorInicial / meses;
    const valorJurosPorParcela = (calc.valorFinal - valorInicial) / meses;

    let saldoRestante = valorInicial;

    for (let i = 0; i < meses; i++) {
        const dataVencimento = new Date(primeiraData);
        dataVencimento.setMonth(dataVencimento.getMonth() + i);

        // Ajustar última parcela para evitar arredondamento
        const isUltima = i === meses - 1;
        const principal = isUltima ? saldoRestante : valorPrincipalPorParcela;

        parcelas.push({
            numero: i + 1,
            dataVencimento,
            valorPrincipal: parseFloat(principal.toFixed(2)),
            valorJurosPrevisto: parseFloat(valorJurosPorParcela.toFixed(2)),
            valorTotalPrevisto: parseFloat(calc.valorParcela.toFixed(2)),
            saldoAposPagamento: parseFloat((saldoRestante - principal).toFixed(2))
        });

        saldoRestante -= principal;
    }

    return {
        parcelas,
        valorTotal: calc.valorFinal,
        valorJurosTotal: calc.valorJurosTotal,
        valorParcela: calc.valorParcela
    };
}

/**
 * Processa parcelas em modo MANUAL
 * Valida se a soma bate e retorna estrutura padronizada
 * 
 * @param {Array} parcelasManual - Array de { numero, valor, vencimento }
 * @param {number} valorTotal - Valor total esperado
 * @returns {Object} { parcelas, valorTotal }
 */
export function processarParcelasManual(parcelasManual, valorTotal) {
    if (!parcelasManual || parcelasManual.length === 0) {
        throw new Error('Nenhuma parcela informada');
    }

    const somaValores = parcelasManual.reduce((sum, p) => sum + parseFloat(p.valor), 0);

    if (Math.abs(somaValores - valorTotal) > 0.01) {
        throw new Error(
            `Soma das parcelas (R$ ${somaValores.toFixed(2)}) não bate com valor total (R$ ${valorTotal.toFixed(2)})`
        );
    }

    const parcelas = parcelasManual.map((p, index) => ({
        numero: p.numero || index + 1,
        dataVencimento: new Date(p.vencimento),
        valorPrincipal: parseFloat(p.valor),
        valorJurosPrevisto: 0, // Modo manual não calcula juros separadamente
        valorTotalPrevisto: parseFloat(p.valor),
        saldoAposPagamento: valorTotal - parcelasManual.slice(0, index + 1).reduce((s, pp) => s + parseFloat(pp.valor), 0)
    }));

    return {
        parcelas,
        valorTotal: parseFloat(somaValores.toFixed(2)),
        valorJurosTotal: 0
    };
}

/**
 * Calcula amortização por pagamento antecipado
 * Reduz os juros proporcionalmente aos dias antecipados
 * 
 * @param {Object} parcela - Dados da parcela
 * @param {Date} dataPagamento - Data do pagamento
 * @returns {Object} { valorFinal, descontoAntecipacao, diasAntecipados }
 */
export function calcularAmortizacao(parcela, dataPagamento) {
    const vencimento = new Date(parcela.dataVencimento);
    const pagamento = new Date(dataPagamento);

    const diferencaDias = Math.floor((vencimento - pagamento) / (1000 * 60 * 60 * 24));

    if (diferencaDias <= 0) {
        // Não é antecipado
        return {
            valorFinal: parcela.valorTotalPrevisto,
            descontoAntecipacao: 0,
            diasAntecipados: 0
        };
    }

    // Calcular desconto proporcional aos dias
    const jurosDiarios = parcela.valorJurosPrevisto / 30; // Simplificado: assume 30 dias/mês
    const descontoAntecipacao = Math.min(
        jurosDiarios * diferencaDias,
        parcela.valorJurosPrevisto // Não pode descontar mais que os juros totais
    );

    const valorFinal = parcela.valorPrincipal + (parcela.valorJurosPrevisto - descontoAntecipacao);

    return {
        valorFinal: parseFloat(valorFinal.toFixed(2)),
        descontoAntecipacao: parseFloat(descontoAntecipacao.toFixed(2)),
        diasAntecipados: diferencaDias,
        economiaPercentual: ((descontoAntecipacao / parcela.valorTotalPrevisto) * 100).toFixed(1) + '%'
    };
}

/**
 * Calcula multa e juros de mora por atraso
 * 
 * @param {number} valorParcela - Valor da parcela
 * @param {number} diasAtraso - Dias em atraso
 * @param {Object} config - Configuração { multaPercentual, jurosDiarioPercentual }
 * @returns {Object} { multa, jurosMora, valorFinal, diasAtraso }
 */
export function calcularJurosMora(valorParcela, diasAtraso, config = {}) {
    if (diasAtraso <= 0) {
        return {
            multa: 0,
            jurosMora: 0,
            valorFinal: valorParcela,
            diasAtraso: 0
        };
    }

    const multaPercentual = config.multaPercentual || 2.0;
    const jurosDiarioPercentual = config.jurosDiarioPercentual || 0.033;

    const multa = valorParcela * (multaPercentual / 100);
    const jurosMora = valorParcela * (jurosDiarioPercentual / 100) * diasAtraso;
    const valorFinal = valorParcela + multa + jurosMora;

    return {
        multa: parseFloat(multa.toFixed(2)),
        jurosMora: parseFloat(jurosMora.toFixed(2)),
        valorFinal: parseFloat(valorFinal.toFixed(2)),
        diasAtraso
    };
}
