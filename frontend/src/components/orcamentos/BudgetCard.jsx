import { memo, useCallback, useMemo } from 'react';
import {
    Eye,
    Check,
    X,
    ShoppingCart,
    User,
    Package,
    Calendar,
    Clock,
    Store,
    AlertTriangle,
    Monitor,
    DollarSign
} from 'lucide-react';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import './BudgetCard.css';

const STATUS_CONFIG = {
    pendente: {
        label: 'Pendente',
        class: 'status-pending',
        icon: Clock
    },
    aprovado: {
        label: 'Aprovado',
        class: 'status-approved',
        icon: Check
    },
    recusado: {
        label: 'Recusado',
        class: 'status-rejected',
        icon: X
    },
    vencido: {
        label: 'Vencido',
        class: 'status-expired',
        icon: AlertTriangle
    },
    convertido: {
        label: 'Convertido',
        class: 'status-converted',
        icon: ShoppingCart
    }
};

const BudgetCard = memo(function BudgetCard({
    orcamento,
    onView,
    onApprove,
    onReject,
    onConvert
}) {
    const status = orcamento.statusEfetivo || orcamento.status;
    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pendente;
    const StatusIcon = statusConfig.icon;
    const origin = orcamento.origem || 'manual';

    const isPending = status === 'pendente';
    const isExpiringSoon = useMemo(() => {
        if (!orcamento.validadeAte || status !== 'pendente') return false;
        const daysUntilExpiry = Math.ceil(
            (new Date(orcamento.validadeAte) - new Date()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 2 && daysUntilExpiry > 0;
    }, [orcamento.validadeAte, status]);

    const handleView = useCallback(() => onView(orcamento), [onView, orcamento]);
    const handleApprove = useCallback(() => onApprove(orcamento.id), [onApprove, orcamento.id]);
    const handleReject = useCallback(() => onReject(orcamento.id), [onReject, orcamento.id]);
    const handleConvert = useCallback(() => onConvert(orcamento.id), [onConvert, orcamento.id]);

    return (
        <div className={`budget-card ${isExpiringSoon ? 'expiring-soon' : ''}`}>
            {/* Header */}
            <div className="budget-card-header">
                <div className="budget-card-title-row">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 className="budget-number">{orcamento.numero}</h3>
                        {origin === 'pdv' && (
                            <span className="budget-origin-badge origin-pdv">
                                <Monitor size={10} />
                                PDV
                            </span>
                        )}
                    </div>
                    <span className={`budget-status-badge ${statusConfig.class}`}>
                        <StatusIcon size={14} />
                        {statusConfig.label}
                    </span>
                </div>
                <div className="budget-date">
                    <Calendar size={14} />
                    {formatDateShort(orcamento.dataEmissao)}
                </div>
            </div>

            {/* Body */}
            <div className="budget-card-body">
                <div className="budget-info-row">
                    <User size={16} className="budget-info-icon" />
                    <span className="budget-info-label">Cliente</span>
                    <span className="budget-info-value">
                        {orcamento.cliente?.nome || 'Cliente Balcão'}
                    </span>
                </div>

                {orcamento.loja && (
                    <div className="budget-info-row">
                        <Store size={16} className="budget-info-icon" />
                        <span className="budget-info-label">Loja</span>
                        <span className="budget-info-value">{orcamento.loja.nome}</span>
                    </div>
                )}

                <div className="budget-info-row">
                    <Package size={16} className="budget-info-icon" />
                    <span className="budget-info-label">Itens</span>
                    <span className="budget-info-value">
                        {orcamento._count?.itens || orcamento.itens?.length || 0}
                        {' '}produto{(orcamento._count?.itens || orcamento.itens?.length || 0) !== 1 ? 's' : ''}
                    </span>
                </div>

                {orcamento.validadeAte && (
                    <div className={`budget-info-row ${isExpiringSoon ? 'expiring' : ''}`}>
                        <Clock size={16} className="budget-info-icon" />
                        <span className="budget-info-label">Válido até</span>
                        <span className="budget-info-value">
                            {formatDateShort(orcamento.validadeAte)}
                            {isExpiringSoon && <AlertTriangle size={14} className="expiring-icon" />}
                        </span>
                    </div>
                )}

                <div className="budget-info-row budget-row-total">
                    <DollarSign size={16} className="budget-info-icon" />
                    <span className="budget-info-label">Total</span>
                    <span className="budget-info-value budget-total-value">{formatCurrency(orcamento.total)}</span>
                </div>
            </div>

            {/* Actions */}
            <div className="budget-card-actions">
                <button
                    className="budget-action-btn budget-btn-view"
                    onClick={handleView}
                    title="Ver Detalhes"
                >
                    <Eye size={16} />
                    <span>Ver</span>
                </button>

                {isPending && (
                    <>
                        <button
                            className="budget-action-btn budget-btn-approve"
                            onClick={handleApprove}
                            title="Aprovar"
                        >
                            <Check size={16} />
                            <span>Aprovar</span>
                        </button>
                        <button
                            className="budget-action-btn budget-btn-reject"
                            onClick={handleReject}
                            title="Recusar"
                        >
                            <X size={16} />
                            <span>Recusar</span>
                        </button>
                    </>
                )}

                {(isPending || status === 'aprovado') && (
                    <button
                        className="budget-action-btn budget-btn-convert"
                        onClick={handleConvert}
                        title="Converter em Venda"
                    >
                        <ShoppingCart size={16} />
                        <span>Vender</span>
                    </button>
                )}
            </div>
        </div>
    );
});

export default BudgetCard;
