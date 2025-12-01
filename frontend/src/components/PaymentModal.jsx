import { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Smartphone, Calendar, Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import PaymentMethodButton from './pdv/PaymentMethodButton';
import PixPayment from './pdv/PixPayment';

/**
 * 🪷 PaymentModal Premium - Redesigned
 * Inspirado em Shopify POS, Square e Lightspeed
 */
function PaymentModal({ isOpen, onClose, totalAmount, clienteId, onConfirm }) {
    const { isDark } = useTheme();

    const [selectedMethod, setSelectedMethod] = useState('dinheiro');
    const [paymentData, setPaymentData] = useState({
        dinheiro: { valorRecebido: totalAmount },
        cartao_credito: { parcelas: 1 },
        cartao_debito: {},
        pix: {},
        crediario: { modoCrediario: 'PADRAO', numParcelas: 2, primeiroVencimento: '' }
    });

    const bgOverlay = 'rgba(0, 0, 0, 0.5)';
    const bgModal = isDark ? '#1e293b' : '#ffffff';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#94a3b8' : '#6b7280';
    const borderColor = isDark ? '#334155' : '#e5e7eb';

    // Reset ao abrir
    useEffect(() => {
        if (isOpen) {
            setSelectedMethod('dinheiro');
            setPaymentData({
                dinheiro: { valorRecebido: totalAmount },
                cartao_credito: { parcelas: 1 },
                cartao_debito: {},
                pix: {},
                crediario: { modoCrediario: 'PADRAO', numParcelas: 2, primeiroVencimento: '' }
            });
        }
    }, [isOpen, totalAmount]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        const data = paymentData[selectedMethod];

        // Montar payload baseado no método
        let payload = { formaPagamento: selectedMethod };

        if (selectedMethod === 'cartao_credito') {
            payload.parcelas = data.parcelas;
        } else if (selectedMethod === 'crediario') {
            payload.modoCrediario = data.modoCrediario;
            payload.numParcelas = data.numParcelas;
            payload.primeiroVencimento = data.primeiroVencimento;
        }

        onConfirm(payload);
    };

    const updatePaymentData = (method, field, value) => {
        setPaymentData({
            ...paymentData,
            [method]: {
                ...paymentData[method],
                [field]: value
            }
        });
    };

    // Cálculo do troco
    const troco = selectedMethod === 'dinheiro'
        ? Math.max(0, (paymentData.dinheiro.valorRecebido || 0) - totalAmount)
        : 0;

    // Validação de crediário
    const crediarioInvalid = selectedMethod === 'crediario' && !clienteId;

    // Botão desabilitado?
    const isDisabled =
        (selectedMethod === 'dinheiro' && paymentData.dinheiro.valorRecebido < totalAmount) ||
        (selectedMethod === 'crediario' && (!clienteId || !paymentData.crediario.primeiroVencimento)) ||
        (selectedMethod === 'crediario' && paymentData.crediario.numParcelas < 1);

    // Métodos de pagamento
    const paymentMethods = [
        { id: 'dinheiro', label: 'Dinheiro', icon: DollarSign, color: '#10b981' },
        { id: 'cartao_credito', label: 'Crédito', icon: CreditCard, color: '#8b5cf6' },
        { id: 'cartao_debito', label: 'Débito', icon: CreditCard, color: '#f59e0b' },
        { id: 'pix', label: 'PIX', icon: Smartphone, color: '#a855f7' },
        { id: 'crediario', label: 'Crediário', icon: Calendar, color: '#ec4899' }
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: bgOverlay,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: bgModal,
                borderRadius: '16px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflow: 'hidden',
                boxShadow: isDark
                    ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                    : '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: textPrimary,
                        margin: 0
                    }}>
                        💳 Finalizar Pagamento
                    </h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: textSecondary,
                            transition: 'color 150ms'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={(e) => e.currentTarget.style.color = textSecondary}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '2rem'
                }}>
                    {/* Total com fundo lavanda */}
                    <div style={{
                        background: 'linear-gradient(135deg, #A48FFF 0%, #9370DB 100%)',
                        padding: '2rem',
                        borderRadius: '12px',
                        marginBottom: '2rem',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Total a pagar
                        </p>
                        <p style={{ fontSize: '42px', fontWeight: '800', color: '#ffffff', margin: 0, letterSpacing: '-1px' }}>
                            R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    {/* Payment Methods */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                        gap: '12px',
                        marginBottom: '2rem'
                    }}>
                        {paymentMethods.map(method => (
                            <PaymentMethodButton
                                key={method.id}
                                id={method.id}
                                label={method.label}
                                icon={method.icon}
                                color={method.color}
                                isActive={selectedMethod === method.id}
                                onClick={() => setSelectedMethod(method.id)}
                            />
                        ))}
                    </div>

                    {/* Método-specific inputs */}
                    <div style={{
                        backgroundColor: isDark ? '#0f172a' : '#f9fafb',
                        padding: '1.5rem',
                        borderRadius: '10px',
                        border: `1px solid ${borderColor}`
                    }}>
                        {/* DINHEIRO */}
                        {selectedMethod === 'dinheiro' && (
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    marginBottom: '8px'
                                }}>
                                    💵 Valor Recebido
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={paymentData.dinheiro.valorRecebido}
                                    onChange={(e) => updatePaymentData('dinheiro', 'valorRecebido', parseFloat(e.target.value) || 0)}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        border: `2px solid ${borderColor}`,
                                        borderRadius: '8px',
                                        backgroundColor: bgModal,
                                        color: textPrimary,
                                        outline: 'none',
                                        transition: 'border-color 150ms'
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = '#10b981'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = borderColor}
                                />
                                {troco > 0 && (
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '12px',
                                        backgroundColor: '#d1fae5',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#065f46' }}>
                                            💰 Troco
                                        </span>
                                        <span style={{ fontSize: '20px', fontWeight: '700', color: '#10b981' }}>
                                            R$ {troco.toFixed(2)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CRÉDITO */}
                        {selectedMethod === 'cartao_credito' && (
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    marginBottom: '8px'
                                }}>
                                    💳 Número de Parcelas
                                </label>
                                <select
                                    value={paymentData.cartao_credito.parcelas}
                                    onChange={(e) => updatePaymentData('cartao_credito', 'parcelas', parseInt(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        border: `2px solid ${borderColor}`,
                                        borderRadius: '8px',
                                        backgroundColor: bgModal,
                                        color: textPrimary,
                                        cursor: 'pointer',
                                        outline: 'none'
                                    }}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                                        <option key={n} value={n}>
                                            {n}x de R$ {(totalAmount / n).toFixed(2)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* DÉBITO */}
                        {selectedMethod === 'cartao_debito' && (
                            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                                <CreditCard size={48} color="#f59e0b" style={{ marginBottom: '12px' }} />
                                <p style={{ fontSize: '16px', fontWeight: '600', color: textPrimary, marginBottom: '4px' }}>
                                    Cartão de Débito
                                </p>
                                <p style={{ fontSize: '14px', color: textSecondary }}>
                                    Pagamento à vista
                                </p>
                            </div>
                        )}

                        {/* PIX */}
                        {selectedMethod === 'pix' && (
                            <PixPayment
                                valor={totalAmount}
                                onPixGenerated={(data) => {
                                    // Dados do PIX gerados com sucesso
                                    console.log('PIX gerado:', data);
                                }}
                            />
                        )}

                        {/* CREDIÁRIO */}
                        {selectedMethod === 'crediario' && (
                            <div>
                                {crediarioInvalid && (
                                    <div style={{
                                        padding: '12px',
                                        backgroundColor: '#fee2e2',
                                        borderRadius: '8px',
                                        marginBottom: '16px',
                                        border: '1px solid #ef4444'
                                    }}>
                                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#991b1b', margin: 0 }}>
                                            ⚠️ Selecione um cliente para usar crediário
                                        </p>
                                    </div>
                                )}

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: textPrimary,
                                        marginBottom: '8px'
                                    }}>
                                        📊 Número de Parcelas
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="24"
                                        value={paymentData.crediario.numParcelas}
                                        onChange={(e) => updatePaymentData('crediario', 'numParcelas', parseInt(e.target.value) || 1)}
                                        disabled={!clienteId}
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            border: `2px solid ${borderColor}`,
                                            borderRadius: '8px',
                                            backgroundColor: bgModal,
                                            color: textPrimary,
                                            outline: 'none',
                                            opacity: !clienteId ? 0.5 : 1
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: textPrimary,
                                        marginBottom: '8px'
                                    }}>
                                        📅 Primeiro Vencimento
                                    </label>
                                    <input
                                        type="date"
                                        value={paymentData.crediario.primeiroVencimento}
                                        onChange={(e) => updatePaymentData('crediario', 'primeiroVencimento', e.target.value)}
                                        disabled={!clienteId}
                                        style={{
                                            width: '100%',
                                            padding: '14px',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                            border: `2px solid ${borderColor}`,
                                            borderRadius: '8px',
                                            backgroundColor: bgModal,
                                            color: textPrimary,
                                            outline: 'none',
                                            opacity: !clienteId ? 0.5 : 1
                                        }}
                                    />
                                </div>

                                {clienteId && paymentData.crediario.numParcelas > 0 && (
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '12px',
                                        backgroundColor: isDark ? '#5b21b6' : '#faf5ff',
                                        borderRadius: '8px',
                                        border: '2px solid #ec4899'
                                    }}>
                                        <p style={{ fontSize: '12px', fontWeight: '600', color: '#ec4899', marginBottom: '8px' }}>
                                            💡 Prévia (Taxa Padrão 8% a.m.)
                                        </p>
                                        <div style={{ fontSize: '13px', color: textSecondary }}>
                                            {paymentData.crediario.numParcelas}x de ~R$ {(totalAmount / paymentData.crediario.numParcelas * 1.08).toFixed(2)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div style={{
                    padding: '1.5rem',
                    borderTop: `1px solid ${borderColor}`,
                    display: 'flex',
                    gap: '12px'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '14px',
                            fontSize: '16px',
                            fontWeight: '600',
                            border: `2px solid ${borderColor}`,
                            borderRadius: '8px',
                            background: 'transparent',
                            color: textSecondary,
                            cursor: 'pointer',
                            transition: 'all 150ms'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={isDisabled}
                        style={{
                            flex: 2,
                            padding: '14px',
                            fontSize: '16px',
                            fontWeight: '700',
                            border: 'none',
                            borderRadius: '8px',
                            background: isDisabled
                                ? (isDark ? '#334155' : '#e5e7eb')
                                : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                            color: isDisabled ? textSecondary : '#ffffff',
                            cursor: isDisabled ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 150ms',
                            opacity: isDisabled ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!isDisabled) {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.4)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        <Check size={20} />
                        Confirmar Pagamento
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PaymentModal;
