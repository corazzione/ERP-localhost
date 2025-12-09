import { memo, useCallback, useMemo } from 'react';
import {
    X, Calendar, User, Store, Package, Clock,
    Check, XCircle, ShoppingCart, FileText, MessageCircle,
    AlertTriangle, CreditCard, Percent, Info
} from 'lucide-react';
import { formatCurrency, formatDateShort, formatDateTime } from '../../utils/formatters';
import {
    gerarTabelaSimulacao,
    CREDIARIO_CONFIG,
    formatarTaxa,
    TEXTO_AMORTIZACAO
} from '../../utils/crediarioUtils';
import './BudgetDetailsModal.css';

const STATUS_CONFIG = {
    pendente: { label: 'Pendente', class: 'status-pending', icon: Clock },
    aprovado: { label: 'Aprovado', class: 'status-approved', icon: Check },
    recusado: { label: 'Recusado', class: 'status-rejected', icon: XCircle },
    vencido: { label: 'Vencido', class: 'status-expired', icon: AlertTriangle },
    convertido: { label: 'Convertido', class: 'status-converted', icon: ShoppingCart }
};

// Credit Simulation Section Component
const CreditSimulationSection = memo(function CreditSimulationSection({ total, orcamento }) {
    // Use persisted data from database if available
    const incluiCrediario = orcamento?.incluiCrediario || false;
    const taxaMensal = orcamento?.taxaCrediario
        ? parseFloat(orcamento.taxaCrediario)
        : CREDIARIO_CONFIG.baseMonthlyRate;

    const simulacoes = useMemo(() => {
        // Use persisted simulation if available
        if (orcamento?.simulacaoCrediario?.length > 0) {
            return orcamento.simulacaoCrediario;
        }
        // Fallback: generate simulation based on current total
        return gerarTabelaSimulacao(total, taxaMensal);
    }, [total, taxaMensal, orcamento?.simulacaoCrediario]);

    // Only show if crediário was included OR if it's a legacy budget (always show for backwards compat)
    if (!total || total <= 0) return null;

    return (
        <div className="budget-crediario-section">
            <div className="crediario-section-header">
                <div className="crediario-title">
                    <CreditCard size={18} />
                    <span>Simulação de Crediário</span>
                </div>
                <div className="crediario-rate">
                    <Percent size={14} />
                    <span>{formatarTaxa(taxaMensal)}</span>
                </div>
            </div>

            <div className="crediario-table-wrapper">
                <table className="crediario-table">
                    <thead>
                        <tr>
                            <th>Parcelas</th>
                            <th>Valor da Parcela</th>
                            <th>Total Financiado</th>
                            <th>Juros Totais</th>
                        </tr>
                    </thead>
                    <tbody>
                        {simulacoes.map(sim => (
                            <tr key={sim.parcelas}>
                                <td className="parcelas-col">
                                    <span className="parcelas-badge">{sim.parcelas}x</span>
                                </td>
                                <td className="valor-col">{formatCurrency(sim.valorParcela)}</td>
                                <td className="total-col">{formatCurrency(sim.totalFinanciado)}</td>
                                <td className="juros-col">
                                    <span className="juros-valor">{formatCurrency(sim.jurosTotais)}</span>
                                    <span className="juros-percent">({sim.percentualJuros}%)</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="crediario-amortization-notice">
                <Info size={16} />
                <p>{TEXTO_AMORTIZACAO}</p>
            </div>
        </div>
    );
});

const BudgetDetailsModal = memo(function BudgetDetailsModal({
    isOpen,
    onClose,
    orcamento,
    onApprove,
    onReject,
    onConvert,
    onDownloadPDF,
    onWhatsAppShare,
    loading
}) {
    if (!isOpen) return null;

    const status = orcamento?.statusEfetivo || orcamento?.status || 'pendente';
    const statusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.pendente;
    const StatusIcon = statusConfig.icon;
    const isPending = status === 'pendente';
    const canConvert = isPending || status === 'aprovado';

    const isExpiringSoon = useMemo(() => {
        if (!orcamento?.validadeAte || status !== 'pendente') return false;
        const daysUntilExpiry = Math.ceil(
            (new Date(orcamento.validadeAte) - new Date()) / (1000 * 60 * 60 * 24)
        );
        return daysUntilExpiry <= 2 && daysUntilExpiry > 0;
    }, [orcamento?.validadeAte, status]);

    const handleApprove = useCallback(() => {
        onApprove(orcamento.id);
    }, [onApprove, orcamento?.id]);

    const handleReject = useCallback(() => {
        onReject(orcamento.id);
    }, [onReject, orcamento?.id]);

    const handleConvert = useCallback(() => {
        onConvert(orcamento.id);
    }, [onConvert, orcamento?.id]);

    const handleDownloadPDF = useCallback(() => {
        onDownloadPDF(orcamento.id);
    }, [onDownloadPDF, orcamento?.id]);

    const handleWhatsApp = useCallback(() => {
        if (!orcamento?.cliente?.telefone) return;

        const telefone = orcamento.cliente.telefone.replace(/\D/g, '');
        const total = formatCurrency(orcamento.total);
        const validade = orcamento.validadeAte
            ? ` Válido até ${formatDateShort(orcamento.validadeAte)}.`
            : '';
        const mensagem = `Olá ${orcamento.cliente.nome}! Segue seu orçamento ${orcamento.numero} no valor de ${total}.${validade} Aguardamos sua confirmação!`;

        const link = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
        window.open(link, '_blank');
    }, [orcamento]);

    return (
        <div className="budget-modal-overlay" onClick={onClose}>
            <div className="budget-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="budget-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                {orcamento ? (
                    <>
                        {/* Header */}
                        <header className="budget-modal-header">
                            <div className="budget-modal-title-group">
                                <span className="budget-modal-label">Detalhes do Orçamento</span>
                                <h1 className="budget-modal-title">{orcamento.numero}</h1>
                            </div>
                            <span className={`budget-modal-status ${statusConfig.class}`}>
                                <StatusIcon size={16} />
                                {statusConfig.label}
                            </span>
                        </header>

                        {/* Dates */}
                        <div className="budget-dates-row">
                            <div className="budget-date-item">
                                <Calendar size={16} />
                                <span>Criado em {formatDateTime(orcamento.dataEmissao)}</span>
                            </div>
                            {orcamento.validadeAte && (
                                <div className={`budget-date-item ${isExpiringSoon ? 'expiring' : ''} ${status === 'vencido' ? 'expired' : ''}`}>
                                    <Clock size={16} />
                                    <span>
                                        {status === 'vencido' ? 'Venceu em' : 'Válido até'} {formatDateShort(orcamento.validadeAte)}
                                    </span>
                                    {isExpiringSoon && <AlertTriangle size={14} className="expiring-icon" />}
                                </div>
                            )}
                        </div>

                        {/* Info Grid */}
                        <div className="budget-info-grid">
                            {/* Client */}
                            <div className="budget-info-card">
                                <div className="budget-info-card-header">
                                    <User size={18} />
                                    <span>Cliente</span>
                                </div>
                                <div className="budget-info-card-content">
                                    <strong>{orcamento.cliente?.nome || 'Cliente Balcão'}</strong>
                                    {orcamento.cliente?.cpfCnpj && (
                                        <span className="info-detail">{orcamento.cliente.cpfCnpj}</span>
                                    )}
                                    {orcamento.cliente?.telefone && (
                                        <span className="info-detail">{orcamento.cliente.telefone}</span>
                                    )}
                                </div>
                            </div>

                            {/* Store */}
                            {orcamento.loja && (
                                <div className="budget-info-card">
                                    <div className="budget-info-card-header">
                                        <Store size={18} />
                                        <span>Loja</span>
                                    </div>
                                    <div className="budget-info-card-content">
                                        <strong>{orcamento.loja.nome}</strong>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Items Table */}
                        <div className="budget-items-section">
                            <div className="budget-items-header">
                                <Package size={18} />
                                <span>Itens</span>
                                <span className="items-count">{orcamento.itens?.length || 0} itens</span>
                            </div>

                            {loading && !orcamento.itens ? (
                                <div className="budget-items-loading">
                                    <div className="spinner"></div>
                                </div>
                            ) : (
                                <table className="budget-items-table">
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th className="text-center">Qtd</th>
                                            <th className="text-right">Valor Unit.</th>
                                            <th className="text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orcamento.itens?.map((item, i) => (
                                            <tr key={item.id || i}>
                                                <td>
                                                    <div className="item-name-cell">
                                                        <span>{item.descricao || item.produto?.nome || 'Item'}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <span className="quantity-badge">{item.quantidade}</span>
                                                </td>
                                                <td className="text-right text-muted">
                                                    {formatCurrency(item.precoUnit)}
                                                </td>
                                                <td className="text-right font-semibold">
                                                    {formatCurrency(item.subtotal)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Totals */}
                        <div className="budget-totals-section">
                            {orcamento.desconto > 0 && (
                                <div className="budget-total-row">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(orcamento.subtotal)}</span>
                                </div>
                            )}
                            {orcamento.desconto > 0 && (
                                <div className="budget-total-row discount">
                                    <span>Desconto</span>
                                    <span>- {formatCurrency(orcamento.desconto)}</span>
                                </div>
                            )}
                            <div className="budget-total-row final">
                                <span>Total</span>
                                <span>{formatCurrency(orcamento.total)}</span>
                            </div>
                        </div>

                        {/* Observations */}
                        {orcamento.observacoes && (
                            <div className="budget-observations">
                                <h4>Observações</h4>
                                <p>{orcamento.observacoes}</p>
                            </div>
                        )}

                        {/* Rejection reason */}
                        {status === 'recusado' && orcamento.motivoRecusa && (
                            <div className="budget-rejection-reason">
                                <h4><XCircle size={16} /> Motivo da Recusa</h4>
                                <p>{orcamento.motivoRecusa}</p>
                            </div>
                        )}

                        {/* Credit Simulation Section */}
                        <CreditSimulationSection total={orcamento.total} orcamento={orcamento} />

                        {/* Actions */}
                        <div className="budget-modal-actions">
                            {isPending && (
                                <>
                                    <button
                                        className="budget-action-btn budget-btn-approve"
                                        onClick={handleApprove}
                                    >
                                        <Check size={18} />
                                        <span>Aprovar</span>
                                    </button>
                                    <button
                                        className="budget-action-btn budget-btn-reject"
                                        onClick={handleReject}
                                    >
                                        <XCircle size={18} />
                                        <span>Recusar</span>
                                    </button>
                                </>
                            )}

                            {canConvert && (
                                <button
                                    className="budget-action-btn budget-btn-convert"
                                    onClick={handleConvert}
                                >
                                    <ShoppingCart size={18} />
                                    <span>Converter em Venda</span>
                                </button>
                            )}

                            <button
                                className="budget-action-btn budget-btn-pdf"
                                onClick={handleDownloadPDF}
                            >
                                <FileText size={18} />
                                <span>PDF</span>
                            </button>

                            {orcamento.cliente?.telefone && (
                                <button
                                    className="budget-action-btn budget-btn-whatsapp"
                                    onClick={handleWhatsApp}
                                >
                                    <MessageCircle size={18} />
                                    <span>WhatsApp</span>
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="budget-modal-loading">
                        <div className="spinner"></div>
                        <span>Carregando detalhes...</span>
                    </div>
                )}
            </div>
        </div>
    );
});

export default BudgetDetailsModal;
