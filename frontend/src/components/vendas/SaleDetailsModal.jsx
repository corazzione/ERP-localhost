import { memo } from 'react';
import {
    Calendar,
    User,
    Store,
    CreditCard,
    FileText,
    MessageCircle,
    X,
    Package,
    ShoppingBag
} from 'lucide-react';
import {
    getStatusLabel,
    getFormaPagamentoLabel,
    formatCurrency,
    formatDateLong
} from '../../utils/formatters';
import './SaleDetailsModal.css';

/**
 * SaleDetailsModal - Premium Sale Details Modal
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const SaleDetailsModal = memo(function SaleDetailsModal({
    isOpen,
    onClose,
    venda,
    onDownloadPDF,
    onWhatsAppShare,
    loading
}) {
    // Early return for performance - don't render anything when closed
    if (!isOpen) return null;

    return (
        <div className="sale-modal-overlay" onClick={onClose}>
            <div className="sale-modal-container" onClick={(e) => e.stopPropagation()}>
                {/* Minimal Close Button */}
                <button className="sale-modal-close" onClick={onClose}>
                    <X size={20} />
                </button>

                {venda ? (
                    <>
                        {/* Premium Header */}
                        <header className="sale-modal-header">
                            <div className="sale-modal-title-group">
                                <span className="sale-modal-label">Detalhes da Venda</span>
                                <h1 className="sale-modal-title">#{venda.numero?.toString().padStart(8, '0')}</h1>
                            </div>
                            <span className={`sale-status-badge status-${venda.status}`}>
                                {getStatusLabel(venda.status)}
                            </span>
                        </header>

                        {/* Two Column Info Grid */}
                        <div className="sale-info-grid">
                            {/* Left Column */}
                            <div className="sale-info-column">
                                <div className="sale-info-item">
                                    <div className="sale-info-icon">
                                        <Calendar size={18} />
                                    </div>
                                    <div className="sale-info-content">
                                        <span className="sale-info-label">Data da Venda</span>
                                        <span className="sale-info-value">{formatDateLong(venda.dataVenda)}</span>
                                    </div>
                                </div>

                                <div className="sale-info-item">
                                    <div className="sale-info-icon">
                                        <User size={18} />
                                    </div>
                                    <div className="sale-info-content">
                                        <span className="sale-info-label">Cliente</span>
                                        <span className="sale-info-value">{venda.cliente?.nome || 'Cliente Balcão'}</span>
                                    </div>
                                </div>

                                <div className="sale-info-item">
                                    <div className="sale-info-icon">
                                        <Store size={18} />
                                    </div>
                                    <div className="sale-info-content">
                                        <span className="sale-info-label">Loja</span>
                                        <span className="sale-info-value">{venda.loja?.nome || 'Loja Principal'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="sale-info-column">
                                <div className="sale-info-item">
                                    <div className="sale-info-icon">
                                        <CreditCard size={18} />
                                    </div>
                                    <div className="sale-info-content">
                                        <span className="sale-info-label">Forma de Pagamento</span>
                                        <span className="sale-info-value">{getFormaPagamentoLabel(venda.formaPagamento)}</span>
                                    </div>
                                </div>

                                {venda.observacoes && (
                                    <div className="sale-info-item sale-info-observations">
                                        <div className="sale-info-icon">
                                            <FileText size={18} />
                                        </div>
                                        <div className="sale-info-content">
                                            <span className="sale-info-label">Observações</span>
                                            <span className="sale-info-value sale-observations-text">{venda.observacoes}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Products Card - Apple/Shopify Style */}
                        <div className="sale-products-card">
                            <div className="sale-products-header">
                                <ShoppingBag size={18} />
                                <span>Produtos</span>
                                <span className="sale-products-count">{venda.itens?.length || 0} itens</span>
                            </div>

                            {loading && !venda.itens ? (
                                <div className="sale-products-loading">
                                    <div className="spinner"></div>
                                </div>
                            ) : (
                                <table className="sale-products-table">
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th className="text-center">Qtd</th>
                                            <th className="text-right">Valor Unit.</th>
                                            <th className="text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {venda.itens?.map((item, i) => (
                                            <tr key={item.id || i}>
                                                <td>
                                                    <div className="product-name-cell">
                                                        <Package size={16} className="product-icon" />
                                                        <span>{item.produto?.nome || 'Produto'}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <span className="quantity-badge">{item.quantidade}</span>
                                                </td>
                                                <td className="text-right text-muted">
                                                    {formatCurrency(item.precoUnit || 0)}
                                                </td>
                                                <td className="text-right font-semibold">
                                                    {formatCurrency(item.subtotal || 0)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Premium Total Section */}
                        <div className="sale-total-section">
                            <div className="sale-total-divider"></div>
                            <div className="sale-total-content">
                                <span className="sale-total-label">Total Final</span>
                                <span className="sale-total-value">{formatCurrency(venda.total || 0)}</span>
                            </div>
                        </div>

                        {/* Premium Action Buttons */}
                        <div className="sale-actions">
                            <button
                                className="sale-action-btn sale-btn-pdf"
                                onClick={() => onDownloadPDF(venda.id)}
                            >
                                <FileText size={18} />
                                <span>Baixar PDF</span>
                            </button>
                            <button
                                className="sale-action-btn sale-btn-whatsapp"
                                onClick={() => onWhatsAppShare(venda)}
                            >
                                <MessageCircle size={18} />
                                <span>WhatsApp</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="sale-modal-loading">
                        <div className="spinner"></div>
                        <span>Carregando detalhes...</span>
                    </div>
                )}
            </div>
        </div>
    );
});

export default SaleDetailsModal;
