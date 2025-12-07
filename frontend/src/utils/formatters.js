/**
 * Shared Formatters and Labels
 * Centralized utilities to avoid duplication and improve performance
 */

// Status Labels
export const STATUS_LABELS = {
    concluida: 'Concluída',
    concluido: 'Concluída',
    pago: 'Concluída',
    pendente: 'Pendente',
    cancelada: 'Cancelada',
    cancelado: 'Cancelada',
    orcamento: 'Orçamento',
    crediario: 'Crediário'
};

export const getStatusLabel = (status) =>
    STATUS_LABELS[status?.toLowerCase()] || status;

// Status CSS Classes
export const STATUS_CLASSES = {
    pago: 'concluida',
    concluida: 'concluida',
    concluido: 'concluida',
    pendente: 'pendente',
    cancelada: 'cancelada',
    cancelado: 'cancelada',
    orcamento: 'orcamento',
    crediario: 'crediario'
};

export const getStatusClass = (status) =>
    STATUS_CLASSES[status?.toLowerCase()] || 'pendente';

// Payment Method Labels
export const FORMA_LABELS = {
    dinheiro: 'Dinheiro',
    pix: 'PIX',
    cartao: 'Cartão',
    cartao_credito: 'Crédito',
    cartao_debito: 'Débito',
    credito: 'Cartão de Crédito',
    debito: 'Cartão de Débito',
    crediario: 'Crediário',
    credito_loja: 'Crédito Loja'
};

export const getFormaPagamentoLabel = (forma) =>
    FORMA_LABELS[forma?.toLowerCase()] || forma;

// Currency Formatter - Single instance for performance
export const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
});

export const formatCurrency = (value = 0) => currencyFormatter.format(value);

// Date Formatters
export const formatDateShort = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
};

export const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short'
    });
};

export const formatDateLong = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};
