// API Error Handler
export const handleApiError = (error, defaultMessage = 'Erro ao processar requisição') => {
    if (error.response) {
        // Erro do servidor com resposta
        const { status, data } = error.response;

        switch (status) {
            case 400:
                return data.error || 'Dados inválidos';
            case 401:
                return 'Sessão expirada. Faça login novamente.';
            case 403:
                return 'Você não tem permissão para esta ação';
            case 404:
                return 'Recurso não encontrado';
            case 409:
                return data.error || 'Conflito de dados';
            case 422:
                return data.error || 'Erro de validação';
            case 429:
                return 'Muitas requisições. Aguarde alguns minutos.';
            case 500:
                return 'Erro no servidor. Tente novamente.';
            default:
                return data.error || defaultMessage;
        }
    } else if (error.request) {
        // Requisição feita mas sem resposta
        return 'Sem conexão com o servidor. Verifique sua internet.';
    } else {
        // Erro na configuração da requisição
        return error.message || defaultMessage;
    }
};

// Formatadores
export const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
};

export const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
};

export const formatDateTime = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('pt-BR');
};

export const formatPercent = (value) => {
    return `${(value || 0).toFixed(2)}%`;
};

// Truncar texto
export const truncate = (text, length = 50) => {
    if (!text) return '';
    return text.length > length ? `${text.substring(0, length)}...` : text;
};

// Debounce function
export const debounce = (func, wait = 300) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Copiar para clipboard
export const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Erro ao copiar:', err);
        return false;
    }
};

// Download de arquivo
export const downloadFile = (data, filename, type = 'text/csv') => {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
};

// Gerar cor aleatória
export const generateColor = (seed) => {
    const colors = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
        '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'
    ];
    const index = seed ? seed.length % colors.length : Math.floor(Math.random() * colors.length);
    return colors[index];
};

// Status badge helper
export const getStatusColor = (status) => {
    const colors = {
        pendente: 'badge-warning',
        concluida: 'badge-positive',
        cancelada: 'badge-neutral',
        pago: 'badge-positive',
        ativo: 'badge-positive',
        inativo: 'badge-neutral',
        recebido: 'badge-positive',
        vencido: 'badge-negative'
    };
    return colors[status] || 'badge-neutral';
};

// Calcular dias desde/até
export const daysSince = (date) => {
    const diff = new Date() - new Date(date);
    return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const daysUntil = (date) => {
    const diff = new Date(date) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Agrupar array por propriedade
export const groupBy = (array, key) => {
    return array.reduce((result, item) => {
        const group = item[key];
        if (!result[group]) {
            result[group] = [];
        }
        result[group].push(item);
        return result;
    }, {});
};

// Ordenar por múltiplos campos
export const sortBy = (array, fields) => {
    return array.sort((a, b) => {
        for (const field of fields) {
            const desc = field.startsWith('-');
            const key = desc ? field.substr(1) : field;
            const direction = desc ? -1 : 1;

            if (a[key] < b[key]) return -1 * direction;
            if (a[key] > b[key]) return 1 * direction;
        }
        return 0;
    });
};
