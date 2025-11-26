// Serviço de cálculos do crediário

/**
 * Calcula as parcelas do carnê com juros
 */
export const calcularParcelas = (valorOriginal, numParcelas, taxaJurosMensal, primeiroVencimento) => {
    const taxaDecimal = taxaJurosMensal / 100;

    // Calcular valor com juros compostos
    const fatorJuros = Math.pow(1 + taxaDecimal, numParcelas);
    const valorParcela = (valorOriginal * fatorJuros * taxaDecimal) / (fatorJuros - 1);

    const valorTotal = valorParcela * numParcelas;
    const valorJuros = valorTotal - valorOriginal;

    const parcelas = [];
    const dataBase = new Date(primeiroVencimento);

    for (let i = 0; i < numParcelas; i++) {
        const vencimento = new Date(dataBase);
        vencimento.setMonth(vencimento.getMonth() + i);

        parcelas.push({
            numero: i + 1,
            vencimento,
            valor: parseFloat(valorParcela.toFixed(2))
        });
    }

    return {
        valorOriginal,
        valorTotal: parseFloat(valorTotal.toFixed(2)),
        valorJuros: parseFloat(valorJuros.toFixed(2)),
        valorParcela: parseFloat(valorParcela.toFixed(2)),
        parcelas
    };
};

/**
 * Calcula quitação antecipada com redução de juros (CDC Art. 52, §2º)
 */
export const calcularQuitacaoAntecipada = (carne) => {
    const parcelasPendentes = carne.parcelas.filter(p => p.status === 'pendente');

    if (parcelasPendentes.length === 0) {
        return {
            valorAQuitarHoje: 0,
            descontoJuros: 0,
            parcelasRestantes: 0
        };
    }

    const hoje = new Date();
    let valorSemJuros = 0;
    let valorComJuros = 0;

    // Calcular valor principal de cada parcela (sem os juros futuros)
    const valorOriginalPorParcela = parseFloat(carne.valorOriginal) / carne.numParcelas;

    parcelasPendentes.forEach(parcela => {
        const vencimento = new Date(parcela.dataVencimento);

        if (vencimento > hoje) {
            // Parcela ainda não vencida - desconto total dos juros
            valorSemJuros += valorOriginalPorParcela;
        } else {
            // Parcela vencida - sem desconto de juros + juros de mora
            const diasAtraso = Math.floor((hoje - vencimento) / (1000 * 60 * 60 * 24));
            const { valorTotal } = calcularJurosMora(parseFloat(parcela.valorParcela), diasAtraso);
            valorSemJuros += valorTotal;
        }

        valorComJuros += parseFloat(parcela.valorParcela);
    });

    const descontoJuros = valorComJuros - valorSemJuros;

    return {
        valorAQuitarHoje: parseFloat(valorSemJuros.toFixed(2)),
        valorSemDesconto: parseFloat(valorComJuros.toFixed(2)),
        descontoJuros: parseFloat(Math.max(0, descontoJuros).toFixed(2)),
        parcelasRestantes: parcelasPendentes.length,
        economia: `${((descontoJuros / valorComJuros) * 100).toFixed(1)}%`
    };
};

/**
 * Calcula juros de mora e multa por atraso
 */
export const calcularJurosMora = (valorParcela, diasAtraso) => {
    if (diasAtraso <= 0) {
        return {
            jurosMora: 0,
            multaAtraso: 0,
            valorTotal: valorParcela
        };
    }

    // Configurações de multa e juros (podem vir do banco de dados)
    const TAXA_JUROS_DIA = 0.033; // 0.033% ao dia = 1% ao mês (aproximadamente)
    const MULTA_PERCENTUAL = 2; // 2% de multa

    const multaAtraso = valorParcela * (MULTA_PERCENTUAL / 100);
    const jurosMora = valorParcela * (TAXA_JUROS_DIA / 100) * diasAtraso;
    const valorTotal = valorParcela + multaAtraso + jurosMora;

    return {
        jurosMora: parseFloat(jurosMora.toFixed(2)),
        multaAtraso: parseFloat(multaAtraso.toFixed(2)),
        valorTotal: parseFloat(valorTotal.toFixed(2)),
        diasAtraso
    };
};

/**
 * Valida se cliente pode fazer nova compra a crédito
 */
export const validarLimiteCredito = (cliente, valorNovaCompra) => {
    const limiteCredito = parseFloat(cliente.limiteCredito);
    const saldoDevedor = parseFloat(cliente.saldoDevedor);
    const creditoDisponivel = limiteCredito - saldoDevedor;

    return {
        aprovado: valorNovaCompra <= creditoDisponivel || limiteCredito === 0,
        limiteCredito,
        saldoDevedor,
        creditoDisponivel,
        valorSolicitado: valorNovaCompra
    };
};
