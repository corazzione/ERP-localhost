// Utility para exportar dados para CSV (Excel)
export const exportToCSV = (data, filename = 'export.csv') => {
    const csv = data.join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

// Exportar vendas para CSV
export const exportVendasCSV = (vendas) => {
    const headers = ['Número', 'Data', 'Cliente', 'Total', 'Forma Pagamento', 'Status'];
    const rows = vendas.map(v => [
        v.numero,
        new Date(v.dataVenda).toLocaleDateString('pt-BR'),
        v.cliente?.nome || 'Balcão',
        `R$ ${parseFloat(v.total).toFixed(2)}`,
        formatFormaPagamento(v.formaPagamento),
        v.status || v.statusPagamento || 'N/A'
    ]);

    const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ];

    const filename = `vendas_${new Date().toISOString().split('T')[0]}.csv`;
    exportToCSV(csv, filename);
};

const formatFormaPagamento = (forma) => {
    const formas = {
        'dinheiro': 'Dinheiro',
        'cartao_credito': 'Crédito',
        'cartao_debito': 'Débito',
        'pix': 'PIX',
        'crediario': 'Crediário',
        'credito_conta': 'Crédito Conta'
    };
    return formas[forma] || forma;
};

export default { exportToCSV, exportVendasCSV };
