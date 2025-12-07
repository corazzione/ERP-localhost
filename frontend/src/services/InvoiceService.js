import api from './api';

const InvoiceService = {
    generateInvoice: async (vendaId) => {
        try {
            const response = await api.get(`/vendas/${vendaId}/invoice`, {
                responseType: 'blob'
            });
            return response.data;
        } catch (error) {
            console.error('Erro ao gerar invoice:', error);
            throw error;
        }
    },

    downloadInvoice: async (vendaId) => {
        return InvoiceService.downloadReceipt(vendaId); // Redirect deprecated method to new one
    },

    downloadReceipt: async (vendaId) => {
        try {
            // Usando endpoint /recibo novo
            const response = await api.get(`/vendas/${vendaId}/recibo`, {
                responseType: 'blob'
            });

            const blob = new Blob([response.data], { type: response.headers['content-type'] });

            // Check if it's JSON (error) despite blob response type
            if (blob.type === 'application/json' || blob.type.includes('json')) {
                // We need to read the blob to get the JSON error
                const text = await blob.text();
                const errorData = JSON.parse(text);
                throw { response: { data: errorData, status: 400 } }; // Throw object structure similar to axios error
            }

            // Criar URL do blob
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `recibo-${vendaId}.pdf`);
            document.body.appendChild(link);
            link.click();

            link.remove();
            window.URL.revokeObjectURL(url);

            return true;
        } catch (error) {
            console.error('Erro ao baixar recibo:', error);
            throw error;
        }
    }
};

export default InvoiceService;
