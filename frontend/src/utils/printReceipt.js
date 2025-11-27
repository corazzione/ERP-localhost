// Utility para impressão de recibos/cupons
export const printReceipt = (venda) => {
    const printWindow = window.open('', '', 'width=350,height=700');

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Recibo - ${venda.numero}</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Courier New', monospace;
                    font-size: 12px;
                    padding: 10px;
                    width: 300px;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px dashed #000;
                    padding-bottom: 10px;
                    margin-bottom: 10px;
                }
                .header h1 {
                    font-size: 18px;
                    margin-bottom: 5px;
                }
                .info {
                    margin-bottom: 10px;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 10px;
                }
                .info p {
                    margin: 3px 0;
                }
                .items {
                    margin-bottom: 10px;
                }
                .item {
                    margin: 5px 0;
                    border-bottom: 1px dotted #ccc;
                    padding-bottom: 5px;
                }
                .item-name {
                    font-weight: bold;
                }
                .item-details {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                }
                .totals {
                    border-top: 2px solid #000;
                    padding-top: 10px;
                    margin-top: 10px;
                }
                .total-line {
                    display: flex;
                    justify-content: space-between;
                    margin: 3px 0;
                }
                .total-final {
                    font-size: 16px;
                    font-weight: bold;
                    border-top: 2px solid #000;
                    padding-top: 5px;
                    margin-top: 5px;
                }
                .footer {
                    text-align: center;
                    margin-top: 15px;
                    padding-top: 10px;
                    border-top: 2px dashed #000;
                    font-size: 10px;
                }
                @media print {
                    body { width: 300px; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>ERP UNIFICADO</h1>
                <p>Sistema de Gestão</p>
            </div>
            
            <div class="info">
                <p><strong>Venda:</strong> ${venda.numero}</p>
                <p><strong>Data:</strong> ${new Date(venda.dataVenda).toLocaleString('pt-BR')}</p>
                ${venda.cliente ? `<p><strong>Cliente:</strong> ${venda.cliente.nome}</p>` : ''}
                ${venda.cliente?.cpfCnpj ? `<p><strong>CPF/CNPJ:</strong> ${venda.cliente.cpfCnpj}</p>` : ''}
            </div>
            
            <div class="items">
                <p style="font-weight: bold; margin-bottom: 5px;">ITENS:</p>
                ${venda.itens.map(item => `
                    <div class="item">
                        <div class="item-name">${item.produto?.nome || item.descricao || 'Item'}</div>
                        <div class="item-details">
                            <span>${item.quantidade} x R$ ${parseFloat(item.precoUnit).toFixed(2)}</span>
                            <span>R$ ${parseFloat(item.subtotal).toFixed(2)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="totals">
                <div class="total-line">
                    <span>Subtotal:</span>
                    <span>R$ ${parseFloat(venda.subtotal || venda.total).toFixed(2)}</span>
                </div>
                ${venda.desconto && parseFloat(venda.desconto) > 0 ? `
                    <div class="total-line">
                        <span>Desconto:</span>
                        <span>- R$ ${parseFloat(venda.desconto).toFixed(2)}</span>
                    </div>
                ` : ''}
                <div class="total-line total-final">
                    <span>TOTAL:</span>
                    <span>R$ ${parseFloat(venda.total).toFixed(2)}</span>
                </div>
                <div class="total-line" style="margin-top: 10px;">
                    <span>Forma de Pagamento:</span>
                    <span>${formatFormaPagamento(venda.formaPagamento)}</span>
                </div>
            </div>
            
            ${venda.observacoes ? `
                <div style="margin-top: 10px; font-size: 10px;">
                    <p><strong>Obs:</strong> ${venda.observacoes}</p>
                </div>
            ` : ''}
            
            <div class="footer">
                <p>Obrigado pela preferência!</p>
                <p>Volte sempre!</p>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();

    // Aguardar carregar e imprimir
    printWindow.onload = () => {
        printWindow.focus();
        printWindow.print();
        // Fechar janela após imprimir (opcional)
        setTimeout(() => printWindow.close(), 100);
    };
};

const formatFormaPagamento = (forma) => {
    const formas = {
        'dinheiro': '💵 Dinheiro',
        'cartao_credito': '💳 Cartão de Crédito',
        'cartao_debito': '💳 Cartão de Débito',
        'pix': '📱 PIX',
        'crediario': '💰 Crediário',
        'credito_conta': '💰 Crédito em Conta'
    };
    return formas[forma] || forma;
};

export default printReceipt;
