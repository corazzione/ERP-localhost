// Constantes do sistema
export const STATUS_VENDA = {
    PENDENTE: 'pendente',
    CONCLUIDA: 'concluida',
    CANCELADA: 'cancelada'
};

export const STATUS_PAGAMENTO = {
    PENDENTE: 'pendente',
    PAGO: 'pago',
    VENCIDO: 'vencido',
    CANCELADO: 'cancelado'
};

export const FORMAS_PAGAMENTO = {
    DINHEIRO: 'dinheiro',
    CARTAO_CREDITO: 'cartao_credito',
    CARTAO_DEBITO: 'cartao_debito',
    PIX: 'pix',
    CREDITO_LOJA: 'credito_loja',
    CREDIARIO: 'crediario'
};

export const TIPO_MOVIMENTACAO = {
    ENTRADA: 'entrada',
    SAIDA: 'saida',
    AJUSTE: 'ajuste'
};

export const STATUS_PEDIDO = {
    PENDENTE: 'pendente',
    PRODUCAO: 'producao',
    PRONTO: 'pronto',
    ENTREGUE: 'entregue',
    CANCELADO: 'cancelado'
};

export const STATUS_PEDIDO_COMPRA = {
    PENDENTE: 'pendente',
    RECEBIDO: 'recebido',
    CANCELADO: 'cancelado'
};

export const TIPO_CATEGORIA = {
    RECEITA: 'receita',
    DESPESA: 'despesa'
};

export const ROLES = {
    ADMIN: 'admin',
    VENDEDOR: 'vendedor',
    GERENTE: 'gerente'
};

// Configurações
export const CONFIG = {
    PAGINATION: {
        DEFAULT_LIMIT: 50,
        MAX_LIMIT: 100
    },
    JWT: {
        EXPIRATION: '8h',
        REFRESH_EXPIRATION: '7d'
    },
    CACHE: {
        TTL: 300 // 5 minutos
    },
    RATE_LIMIT: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutos
        MAX_REQUESTS: 100,
        LOGIN_MAX: 5
    }
};

// Mensagens de erro
export const ERRORS = {
    UNAUTHORIZED: 'Não autorizado',
    FORBIDDEN: 'Acesso negado',
    NOT_FOUND: 'Não encontrado',
    VALIDATION_ERROR: 'Dados inválidos',
    SERVER_ERROR: 'Erro interno do servidor',
    DUPLICATE_ENTRY: 'Registro já existe',
    INSUFFICIENT_STOCK: 'Estoque insuficiente',
    INVALID_CREDENTIALS: 'Credenciais inválidas'
};
