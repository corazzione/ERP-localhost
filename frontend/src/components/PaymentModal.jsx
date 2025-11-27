import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { DollarSign, CreditCard, Smartphone, X, Calendar } from 'lucide-react';

/**
 * 🪷 PaymentModal - Modal unificado para todas as formas de pagamento
 * Suporta: Dinheiro, Cartão Crédito/Débito, PIX e Crediário
 */
function PaymentModal({ isOpen, onClose, totalAmount, onConfirm, clienteId }) {
    const { isDark } = useTheme();

    // Estado principal
    const [selectedMethod, setSelectedMethod] = useState('dinheiro');
    const [paymentData, setPaymentData] = useState({
        dinheiro: { valor: 0 },
        cartao_credito: { valor: 0, parcelas: 1 },
        cartao_debito: { valor: 0 },
        pix: { valor: 0 },
        crediario: {
            valor: 0,
            numParcelas: 12,
            primeiroVencimento: '',
            modoCrediario: 'PADRAO'
        }
    });

    // Reset ao abrir - SEM totalAmount nas dependências!
    useEffect(() => {
        if (isOpen) {
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const nextMonthStr = nextMonth.toISOString().split('T')[0];

            setSelectedMethod('dinheiro');
            setPaymentData({
                dinheiro: { valor: totalAmount },
                cartao_credito: { valor: totalAmount, parcelas: 1 },
                cartao_debito: { valor: totalAmount },
                pix: { valor: totalAmount },
                crediario: {
                    valor: totalAmount,
                    numParcelas: 12,
                    primeiroVencimento: nextMonthStr,
                    modoCrediario: 'PADRAO'
                }
            });
        }
    }, [isOpen]); // Sem totalAmount!

    // ESC para fechar
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    const handleConfirm = () => {
        // Validações
        if (selectedMethod === 'crediario' && !clienteId) {
            alert('❌ Crediário requer um cliente selecionado!');
            return;
        }

        if (selectedMethod === 'crediario' && !paymentData.crediario.primeiroVencimento) {
            alert('❌ Informe a data do primeiro vencimento!');
            return;
        }

        // Preparar dados para envio - cada método envia apenas o necessário
        let result = {
            formaPagamento: selectedMethod
        };

        // Adicionar dados específicos apenas para crediário
        if (selectedMethod === 'crediario') {
            result.modoCrediario = paymentData.crediario.modoCrediario;
            result.numParcelas = paymentData.crediario.numParcelas;
            result.primeiroVencimento = paymentData.crediario.primeiroVencimento;
        }

        // Para cartão de crédito, adicionar parcelas
        if (selectedMethod === 'cartao_credito') {
            result.parcelas = paymentData.cartao_credito.parcelas;
        }

        onConfirm(result);
    };

    if (!isOpen) return null;

    // Theme colors
    const cardBg = isDark ? '#1e293b' : '#ffffff';
    const overlayBg = isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(0, 0, 0, 0.5)';
    const textPrimary = isDark ? '#f1f5f9' : '#0f172a';
    const textSecondary = isDark ? '#cbd5e1' : '#64748b';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const bgSecondary = isDark ? '#334155' : '#f9fafb';

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: overlayBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: cardBg,
                borderRadius: '16px',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: isDark ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)' : '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                border: `1px solid ${borderColor}`
            }} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '1.5rem',
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ fontSize: '24px', fontWeight: '700', color: textPrimary, margin: 0 }}>
                        💳 Finalizar Pagamento
                    </h2>
                    <button onClick={onClose} style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: textSecondary
                    }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.5rem' }}>
                    {/* Total */}
                    <div style={{
                        padding: '1rem',
                        backgroundColor: bgSecondary,
                        borderRadius: '12px',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        <p style={{ fontSize: '14px', color: textSecondary, marginBottom: '0.5rem' }}>Total a pagar</p>
                        <p style={{ fontSize: '36px', fontWeight: '700', color: '#8b5cf6', margin: 0 }}>
                            R$ {totalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                    </div>

                    {/* Payment Methods Tabs */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                        gap: '0.5rem',
                        marginBottom: '1.5rem'
                    }}>
                        {[
                            { id: 'dinheiro', label: 'Dinheiro', icon: DollarSign, color: '#10b981' },
                            { id: 'cartao_credito', label: 'Crédito', icon: CreditCard, color: '#8b5cf6' },
                            { id: 'cartao_debito', label: 'Débito', icon: CreditCard, color: '#f59e0b' },
                            { id: 'pix', label: 'PIX', icon: Smartphone, color: '#a855f7' },
                            { id: 'crediario', label: 'Crediário', icon: Calendar, color: '#ec4899' }
                        ].map(({ id, label, icon: Icon, color }) => (
                            <button
                                key={id}
                                onClick={() => setSelectedMethod(id)}
                                style={{
                                    padding: '0.75rem',
                                    border: `2px solid ${selectedMethod === id ? color : borderColor}`,
                                    borderRadius: '8px',
                                    background: selectedMethod === id ? `${color}15` : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Icon size={20} color={selectedMethod === id ? color : textSecondary} />
                                <span style={{
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    color: selectedMethod === id ? color : textSecondary
                                }}>
                                    {label}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Payment Form */}
                    <div style={{
                        border: `1px solid ${borderColor}`,
                        borderRadius: '12px',
                        padding: '1.5rem',
                        backgroundColor: bgSecondary
                    }}>
                        {/* DINHEIRO */}
                        {selectedMethod === 'dinheiro' && (
                            <div>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: textPrimary, display: 'block', marginBottom: '0.5rem' }}>
                                    💵 Valor Recebido
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={paymentData.dinheiro.valor || ''}
                                    onChange={(e) => setPaymentData({
                                        ...paymentData,
                                        dinheiro: { valor: parseFloat(e.target.value) || 0 }
                                    })}
                                    autoFocus
                                    style={{
                                        pointerEvents: 'auto',
                                        fontSize: '18px',
                                        padding: '0.75rem',
                                        width: '100%',
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: '8px',
                                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                        color: textPrimary
                                    }}
                                />
                                {paymentData.dinheiro.valor > totalAmount && (
                                    <p style={{ marginTop: '0.75rem', fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
                                        💵 Troco: R$ {(paymentData.dinheiro.valor - totalAmount).toFixed(2)}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* CARTÃO CRÉDITO */}
                        {selectedMethod === 'cartao_credito' && (
                            <div>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: textPrimary, display: 'block', marginBottom: '0.5rem' }}>
                                    💳 Número de Parcelas
                                </label>
                                <select
                                    value={paymentData.cartao_credito.parcelas}
                                    onChange={(e) => setPaymentData({
                                        ...paymentData,
                                        cartao_credito: { ...paymentData.cartao_credito, parcelas: parseInt(e.target.value) }
                                    })}
                                    style={{
                                        pointerEvents: 'auto',
                                        width: '100%',
                                        padding: '0.75rem',
                                        fontSize: '16px',
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: '8px',
                                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                        color: textPrimary,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map(n => (
                                        <option key={n} value={n}>
                                            {n}x de R$ {(totalAmount / n).toFixed(2)} {n > 1 && '(sem juros)'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* CARTÃO DÉBITO */}
                        {selectedMethod === 'cartao_debito' && (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <CreditCard size={48} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                                <p style={{ fontSize: '16px', fontWeight: '600', color: textPrimary }}>
                                    Cartão de Débito
                                </p>
                                <p style={{ fontSize: '14px', color: textSecondary }}>
                                    Valor: R$ {totalAmount.toFixed(2)}
                                </p>
                            </div>
                        )}

                        {/* PIX */}
                        {selectedMethod === 'pix' && (
                            <div style={{ textAlign: 'center', padding: '1rem' }}>
                                <Smartphone size={48} color="#8b5cf6" style={{ marginBottom: '1rem' }} />
                                <p style={{ fontSize: '16px', fontWeight: '600', color: textPrimary }}>
                                    Pagamento via PIX
                                </p>
                                <p style={{ fontSize: '14px', color: textSecondary }}>
                                    Valor: R$ {totalAmount.toFixed(2)}
                                </p>
                            </div>
                        )}

                        {/* 🪷 CREDIÁRIO */}
                        {selectedMethod === 'crediario' && (
                            <div>
                                {!clienteId && (
                                    <div style={{
                                        padding: '1rem',
                                        backgroundColor: isDark ? '#7f1d1d' : '#fef2f2',
                                        border: '2px solid #ef4444',
                                        borderRadius: '8px',
                                        marginBottom: '1rem'
                                    }}>
                                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444', margin: 0 }}>
                                            ⚠️ Selecione um cliente antes de usar crediário!
                                        </p>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {/* Número de Parcelas */}
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: '600', color: textPrimary, display: 'block', marginBottom: '0.5rem' }}>
                                            📅 Número de Parcelas
                                        </label>
                                        <select
                                            value={paymentData.crediario.numParcelas}
                                            onChange={(e) => setPaymentData({
                                                ...paymentData,
                                                crediario: { ...paymentData.crediario, numParcelas: parseInt(e.target.value) }
                                            })}
                                            disabled={!clienteId}
                                            style={{
                                                pointerEvents: clienteId ? 'auto' : 'none',
                                                width: '100%',
                                                padding: '0.75rem',
                                                fontSize: '16px',
                                                border: `1px solid ${borderColor}`,
                                                borderRadius: '8px',
                                                backgroundColor: clienteId ? (isDark ? '#1e293b' : '#ffffff') : (isDark ? '#0f172a' : '#f3f4f6'),
                                                color: clienteId ? textPrimary : textSecondary,
                                                cursor: clienteId ? 'pointer' : 'not-allowed'
                                            }}
                                        >
                                            {[3, 6, 9, 10, 12, 15, 18, 24].map(n => (
                                                <option key={n} value={n}>{n}x</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Primeiro Vencimento */}
                                    <div>
                                        <label style={{ fontSize: '14px', fontWeight: '600', color: textPrimary, display: 'block', marginBottom: '0.5rem' }}>
                                            📆 Primeiro Vencimento
                                        </label>
                                        <input
                                            type="date"
                                            value={paymentData.crediario.primeiroVencimento}
                                            onChange={(e) => setPaymentData({
                                                ...paymentData,
                                                crediario: { ...paymentData.crediario, primeiroVencimento: e.target.value }
                                            })}
                                            disabled={!clienteId}
                                            style={{
                                                pointerEvents: clienteId ? 'auto' : 'none',
                                                width: '100%',
                                                padding: '0.75rem',
                                                fontSize: '16px',
                                                border: `1px solid ${borderColor}`,
                                                borderRadius: '8px',
                                                backgroundColor: clienteId ? (isDark ? '#1e293b' : '#ffffff') : (isDark ? '#0f172a' : '#f3f4f6'),
                                                color: clienteId ? textPrimary : textSecondary,
                                                cursor: clienteId ? 'text' : 'not-allowed'
                                            }}
                                        />
                                    </div>

                                    {/* Preview */}
                                    {clienteId && (
                                        <div style={{
                                            padding: '1rem',
                                            backgroundColor: isDark ? '#5b21b6' : '#faf5ff',
                                            borderRadius: '8px',
                                            border: `2px solid #8b5cf6`
                                        }}>
                                            <p style={{ fontSize: '12px', fontWeight: '600', color: '#8b5cf6', marginBottom: '0.5rem' }}>
                                                💡 Prévia (Taxa Padrão 8% a.m.)
                                            </p>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                                <span style={{ fontSize: '14px', color: textSecondary }}>Valor Original:</span>
                                                <span style={{ fontSize: '14px', fontWeight: '600', color: textPrimary }}>
                                                    R$ {totalAmount.toFixed(2)}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '14px', color: textSecondary }}>Parcelas:</span>
                                                <span style={{ fontSize: '14px', fontWeight: '600', color: '#ec4899' }}>
                                                    {paymentData.crediario.numParcelas}x (calculado no checkout)
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button
                            onClick={onClose}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: `2px solid ${borderColor}`,
                                background: 'transparent',
                                color: textPrimary,
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleConfirm}
                            style={{
                                flex: 2,
                                padding: '0.75rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                color: '#ffffff',
                                fontSize: '16px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            ✅ Confirmar Pagamento
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentModal;
