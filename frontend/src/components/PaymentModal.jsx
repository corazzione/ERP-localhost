import { useState, useEffect } from 'react';
import { X, DollarSign, CreditCard, Smartphone, Calendar, Check, Wallet, Percent, Calculator, AlertCircle, Search, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import PaymentMethodButton from './pdv/PaymentMethodButton';
import PixPayment from './pdv/PixPayment';
import api from '../services/api';
import { toast } from 'react-hot-toast';

/**
 * 🪷 PaymentModal Premium - Redesigned
 * Inspirado em Shopify POS, Square e Lightspeed
 */
function PaymentModal({ isOpen, onClose, totalAmount, clienteId, onConfirm }) {
    const { isDark } = useTheme();

    const [selectedMethod, setSelectedMethod] = useState('dinheiro');
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [loadingMethods, setLoadingMethods] = useState(true);
    const [paymentData, setPaymentData] = useState({
        dinheiro: { valorRecebido: totalAmount },
        cartao_credito: { parcelas: 1 },
        cartao_debito: {},
        pix: {},
        crediario: {
            modoCrediario: 'PADRAO', // PADRAO, PERSONALIZADO, SEM_JUROS
            numParcelas: 2,
            primeiroVencimento: '',
            taxaPersonalizadaMensal: 0,
            tipoJurosPersonalizado: 'COMPOSTO'
        }
    });

    const bgOverlay = 'rgba(0, 0, 0, 0.5)';
    const bgModal = isDark ? '#1e293b' : '#ffffff';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#94a3b8' : '#6b7280';
    const borderColor = isDark ? '#334155' : '#e5e7eb';

    // Icon mapping
    const iconMap = {
        DollarSign: DollarSign,
        CreditCard: CreditCard,
        Smartphone: Smartphone,
        Calendar: Calendar,
        Wallet: Wallet
    };

    // Carregar métodos de pagamento
    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const response = await api.get('/payment-methods');
                setPaymentMethods(response.data);
                if (response.data.length > 0) {
                    setSelectedMethod(response.data[0].slug);
                }
            } catch (error) {
                console.error('Erro ao carregar formas de pagamento:', error);
            } finally {
                setLoadingMethods(false);
            }
        };

        if (isOpen) {
            fetchPaymentMethods();
            setPaymentData(prev => ({
                ...prev,
                dinheiro: { valorRecebido: totalAmount },
                crediario: {
                    modoCrediario: 'PADRAO',
                    numParcelas: 2,
                    primeiroVencimento: '',
                    taxaPersonalizadaMensal: 0,
                    tipoJurosPersonalizado: 'COMPOSTO'
                }
            }));
        }
    }, [isOpen, totalAmount]);

    if (!isOpen) return null;

    const validateCrediarioDate = (dateString) => {
        if (!dateString) return false;
        const selectedDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time part for accurate comparison

        // Check if selected date is today or in the past
        if (selectedDate <= today) {
            toast.error('A data do primeiro vencimento deve ser posterior à data da venda. Escolha uma data futura.', {
                id: 'date-validation-error', // Prevent duplicate toasts
                duration: 4000
            });
            return false;
        }
        return true;
    };

    const handleConfirm = () => {
        const data = paymentData[selectedMethod];
        const methodConfig = paymentMethods.find(m => m.slug === selectedMethod);

        // Montar payload baseado no método
        let payload = { formaPagamento: selectedMethod };

        if (selectedMethod === 'cartao_credito' || (methodConfig && methodConfig.requiresParcels && !methodConfig.requiresClient)) {
            payload.parcelas = data.parcelas;
        } else if (selectedMethod === 'crediario' || (methodConfig && methodConfig.requiresClient)) {
            // Validate date before proceeding
            if (!validateCrediarioDate(data.primeiroVencimento)) {
                return; // Stop if invalid
            }

            payload.modoCrediario = data.modoCrediario === 'SEM_JUROS' ? 'PERSONALIZADO' : data.modoCrediario;
            payload.numParcelas = data.numParcelas;
            payload.primeiroVencimento = data.primeiroVencimento;

            if (data.modoCrediario === 'PERSONALIZADO') {
                payload.taxaPersonalizadaMensal = data.taxaPersonalizadaMensal;
                payload.tipoJurosPersonalizado = data.tipoJurosPersonalizado;
            } else if (data.modoCrediario === 'SEM_JUROS') {
                payload.taxaPersonalizadaMensal = 0;
                payload.tipoJurosPersonalizado = 'SIMPLES';
            }
        }

        onConfirm(payload);
    };

    const updatePaymentData = (method, field, value) => {
        if (method === 'crediario' && field === 'primeiroVencimento') {
            validateCrediarioDate(value);
        }

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
    const currentMethodConfig = paymentMethods.find(m => m.slug === selectedMethod);
    const crediarioInvalid = currentMethodConfig?.requiresClient && !clienteId;

    // Check date validity for disabling button
    const isDateInvalid = selectedMethod === 'crediario' && paymentData.crediario.primeiroVencimento && (() => {
        const selectedDate = new Date(paymentData.crediario.primeiroVencimento);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate <= today;
    })();

    // Botão desabilitado?
    const isDisabled =
        (selectedMethod === 'dinheiro' && paymentData.dinheiro.valorRecebido < totalAmount) ||
        (currentMethodConfig?.requiresClient && (!clienteId || !paymentData.crediario.primeiroVencimento)) ||
        (currentMethodConfig?.requiresClient && paymentData.crediario.numParcelas < 1) ||
        isDateInvalid;

    // Prévia do Crediário
    const getCrediarioPreview = () => {
        const { modoCrediario, numParcelas, taxaPersonalizadaMensal } = paymentData.crediario;
        let taxa = 8; // Padrão

        if (modoCrediario === 'PERSONALIZADO') taxa = parseFloat(taxaPersonalizadaMensal) || 0;
        if (modoCrediario === 'SEM_JUROS') taxa = 0;

        // Cálculo simples para preview (backend usa composto se configurado, mas aqui damos uma estimativa)
        // Usando composto para ficar mais próximo do padrão
        const i = taxa / 100;
        let valorParcela, totalFinal;

        if (i === 0) {
            valorParcela = totalAmount / numParcelas;
            totalFinal = totalAmount;
        } else {
            const fator = Math.pow(1 + i, numParcelas);
            valorParcela = (totalAmount * fator * i) / (fator - 1);
            totalFinal = valorParcela * numParcelas;
        }

        return {
            valorParcela,
            totalFinal,
            jurosTotal: totalFinal - totalAmount
        };
    };

    const preview = selectedMethod === 'crediario' ? getCrediarioPreview() : null;

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CreditCard size={24} color={textPrimary} />
                        <h2 style={{
                            fontSize: '20px',
                            fontWeight: '700',
                            color: textPrimary,
                            margin: 0
                        }}>
                            Finalizar Pagamento
                        </h2>
                    </div>
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
                    {loadingMethods ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: textSecondary }}>
                            Carregando formas de pagamento...
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                            gap: '12px',
                            marginBottom: '2rem'
                        }}>
                            {paymentMethods.map(method => (
                                <PaymentMethodButton
                                    key={method.id}
                                    id={method.slug}
                                    label={method.label}
                                    icon={iconMap[method.icon] || CreditCard}
                                    color={selectedMethod === method.slug ? '#8b5cf6' : textSecondary}
                                    isActive={selectedMethod === method.slug}
                                    onClick={() => setSelectedMethod(method.slug)}
                                />
                            ))}
                        </div>
                    )}

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
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    marginBottom: '8px'
                                }}>
                                    <DollarSign size={16} />
                                    Valor Recebido
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
                                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#065f46', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Wallet size={16} />
                                            Troco
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
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: textPrimary,
                                    marginBottom: '8px'
                                }}>
                                    <CreditCard size={16} />
                                    Número de Parcelas
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
                                        border: '1px solid #ef4444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <AlertCircle size={18} color="#991b1b" />
                                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#991b1b', margin: 0 }}>
                                            Selecione um cliente para usar crediário
                                        </p>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                                    <div>
                                        <label style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: textPrimary,
                                            marginBottom: '8px'
                                        }}>
                                            <Calculator size={16} />
                                            Parcelas
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
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: textPrimary,
                                            marginBottom: '8px'
                                        }}>
                                            <Calendar size={16} />
                                            1º Vencimento
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
                                                border: `2px solid ${isDateInvalid ? '#ef4444' : borderColor}`,
                                                borderRadius: '8px',
                                                backgroundColor: bgModal,
                                                color: textPrimary,
                                                outline: 'none',
                                                opacity: !clienteId ? 0.5 : 1
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: textPrimary,
                                        marginBottom: '8px'
                                    }}>
                                        <Percent size={16} />
                                        Tipo de Taxa
                                    </label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {['PADRAO', 'PERSONALIZADO', 'SEM_JUROS'].map(mode => (
                                            <button
                                                key={mode}
                                                onClick={() => updatePaymentData('crediario', 'modoCrediario', mode)}
                                                disabled={!clienteId}
                                                style={{
                                                    flex: 1,
                                                    padding: '10px',
                                                    fontSize: '13px',
                                                    fontWeight: '600',
                                                    borderRadius: '8px',
                                                    border: `2px solid ${paymentData.crediario.modoCrediario === mode ? '#ec4899' : borderColor}`,
                                                    backgroundColor: paymentData.crediario.modoCrediario === mode ? (isDark ? 'rgba(236, 72, 153, 0.2)' : '#fdf2f8') : 'transparent',
                                                    color: paymentData.crediario.modoCrediario === mode ? '#ec4899' : textSecondary,
                                                    cursor: !clienteId ? 'not-allowed' : 'pointer',
                                                    opacity: !clienteId ? 0.5 : 1
                                                }}
                                            >
                                                {mode === 'PADRAO' && 'Padrão'}
                                                {mode === 'PERSONALIZADO' && 'Personalizada'}
                                                {mode === 'SEM_JUROS' && 'Sem Juros'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {paymentData.crediario.modoCrediario === 'PERSONALIZADO' && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: textPrimary,
                                            marginBottom: '8px'
                                        }}>
                                            % Taxa Mensal
                                        </label>
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="number"
                                                step="0.01"
                                                value={paymentData.crediario.taxaPersonalizadaMensal}
                                                onChange={(e) => updatePaymentData('crediario', 'taxaPersonalizadaMensal', parseFloat(e.target.value) || 0)}
                                                style={{
                                                    width: '100%',
                                                    padding: '14px',
                                                    paddingRight: '40px',
                                                    fontSize: '16px',
                                                    fontWeight: '600',
                                                    border: `2px solid ${borderColor}`,
                                                    borderRadius: '8px',
                                                    backgroundColor: bgModal,
                                                    color: textPrimary,
                                                    outline: 'none'
                                                }}
                                            />
                                            <Percent size={16} color={textSecondary} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                                        </div>
                                    </div>
                                )}

                                {clienteId && paymentData.crediario.numParcelas > 0 && preview && (
                                    <div style={{
                                        marginTop: '16px',
                                        padding: '16px',
                                        backgroundColor: isDark ? '#5b21b6' : '#faf5ff',
                                        borderRadius: '12px',
                                        border: '2px solid #ec4899'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '14px', color: textSecondary }}>Valor da Parcela</span>
                                            <span style={{ fontSize: '16px', fontWeight: '700', color: '#ec4899' }}>
                                                R$ {preview.valorParcela.toFixed(2)}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '14px', color: textSecondary }}>Total com Juros</span>
                                            <span style={{ fontSize: '14px', fontWeight: '600', color: textPrimary }}>
                                                R$ {preview.totalFinal.toFixed(2)}
                                            </span>
                                        </div>
                                        {preview.jurosTotal > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, paddingTop: '8px' }}>
                                                <span style={{ fontSize: '13px', color: textSecondary }}>Juros Totais</span>
                                                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ec4899' }}>
                                                    + R$ {preview.jurosTotal.toFixed(2)}
                                                </span>
                                            </div>
                                        )}
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
