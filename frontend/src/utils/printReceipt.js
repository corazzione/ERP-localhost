import api from '../services/api';

// Utility para impressão de recibos/cupons via PDF do backend
export const printReceipt = async (venda) => {
    try {
        // Fetch the PDF blob from the backend
        const response = await api.get(`/vendas/${venda.id}/recibo`, {
            responseType: 'blob'
        });

        const blob = new Blob([response.data], { type: response.headers['content-type'] });

        if (blob.type === 'application/json' || blob.type.includes('json')) {
            const text = await blob.text();
            const errorData = JSON.parse(text);
            // Re-throw formatted error for the caller to handle (e.g., showing Modal)
            throw { response: { data: errorData, status: 400 } };
        }

        // Create a URL for the blob
        const pdfUrl = window.URL.createObjectURL(blob);

        const printWindow = window.open(pdfUrl);

        if (printWindow) {
            printWindow.onload = () => {
                printWindow.print();
            };
        } else {
            console.error('Pop-up blocked. Cannot print receipt.');
            alert('Por favor, permita pop-ups para imprimir o recibo.');
        }

        setTimeout(() => {
            window.URL.revokeObjectURL(pdfUrl);
        }, 60000);

    } catch (error) {
        console.error('Erro ao imprimir recibo:', error);
        throw error; // Propagate error so PDV can catch it
    }
};

export default printReceipt;

