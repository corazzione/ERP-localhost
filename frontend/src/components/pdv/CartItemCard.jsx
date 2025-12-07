import { memo, useState, useCallback, useMemo } from 'react';
import { Minus, Plus, Trash2, Tag, Percent } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/formatters';

/**
 * CartItemCard - Item do carrinho com desconto em R$ ou %
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const CartItemCard = memo(function CartItemCard({ item, onUpdateQuantity, onUpdateDiscount, onRemove }) {
    const { isDark } = useTheme();
    const [discountType, setDiscountType] = useState('R$');
    const [discountInput, setDiscountInput] = useState('');

    // Memoized theme colors
    const themeColors = useMemo(() => ({
        cardBg: isDark ? '#1e293b' : '#ffffff',
        textPrimary: isDark ? '#f1f5f9' : '#1f2937',
        textSecondary: isDark ? '#94a3b8' : '#6b7280',
        borderColor: isDark ? '#334155' : '#e5e7eb',
        inputBg: isDark ? '#0f172a' : '#f9fafb'
    }), [isDark]);

    const { cardBg, textPrimary, textSecondary, borderColor, inputBg } = themeColors;

    // Memoized calculations
    const subtotalSemDesconto = useMemo(() =>
        item.quantidade * parseFloat(item.precoVenda),
        [item.quantidade, item.precoVenda]
    );

    const subtotalComDesconto = item.total;

    // Memoized handlers
    const handleDiscountInputChange = useCallback((e) => {
        const value = e.target.value;
        setDiscountInput(value);
        const numValue = parseFloat(value) || 0;

        if (discountType === '%') {
            const descontoValor = (subtotalSemDesconto * numValue) / 100;
            onUpdateDiscount(item.id, descontoValor);
        } else {
            onUpdateDiscount(item.id, numValue);
        }
    }, [discountType, subtotalSemDesconto, item.id, onUpdateDiscount]);

    const handleToggleType = useCallback(() => {
        const newType = discountType === '%' ? 'R$' : '%';
        setDiscountType(newType);
        setDiscountInput('');
        onUpdateDiscount(item.id, 0);
    }, [discountType, item.id, onUpdateDiscount]);

    const handleRemove = useCallback(() => {
        onRemove(item.id);
    }, [onRemove, item.id]);

    const handleDecreaseQty = useCallback(() => {
        onUpdateQuantity(item.id, item.quantidade - 1);
    }, [onUpdateQuantity, item.id, item.quantidade]);

    const handleIncreaseQty = useCallback(() => {
        onUpdateQuantity(item.id, item.quantidade + 1);
    }, [onUpdateQuantity, item.id, item.quantidade]);

    const handleMouseEnterTrash = useCallback((e) => {
        e.currentTarget.style.color = '#ef4444';
    }, []);

    const handleMouseLeaveTrash = useCallback((e) => {
        e.currentTarget.style.color = textSecondary;
    }, [textSecondary]);

    const handleInputFocus = useCallback((e) => {
        e.currentTarget.style.borderColor = '#8b5cf6';
    }, []);

    const handleInputBlur = useCallback((e) => {
        e.currentTarget.style.borderColor = borderColor;
    }, [borderColor]);

    return (
        <div style={{
            backgroundColor: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '12px'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px'
            }}>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: textPrimary,
                        marginBottom: '4px'
                    }}>
                        {item.nome}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: textSecondary
                    }}>
                        Cód: {item.codigo}
                    </div>
                </div>

                <button
                    onClick={handleRemove}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: textSecondary,
                        transition: 'color 150ms'
                    }}
                    onMouseEnter={handleMouseEnterTrash}
                    onMouseLeave={handleMouseLeaveTrash}
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Quantidade */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                        onClick={handleDecreaseQty}
                        disabled={item.quantidade <= 1}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: `2px solid ${item.quantidade <= 1 ? borderColor : '#8b5cf6'}`,
                            background: 'transparent',
                            cursor: item.quantidade <= 1 ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: item.quantidade <= 1 ? 0.4 : 1
                        }}
                    >
                        <Minus size={16} color={item.quantidade <= 1 ? textSecondary : '#8b5cf6'} />
                    </button>

                    <span style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: textPrimary,
                        minWidth: '32px',
                        textAlign: 'center'
                    }}>
                        {item.quantidade}
                    </span>

                    <button
                        onClick={handleIncreaseQty}
                        style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: '2px solid #8b5cf6',
                            background: 'transparent',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Plus size={16} color="#8b5cf6" />
                    </button>
                </div>

                <div style={{ fontSize: '15px', color: textSecondary }}>
                    {formatCurrency(item.precoVenda)} <span style={{ fontSize: '12px' }}>un</span>
                </div>
            </div>

            {/* Desconto */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '90px' }}>
                    <Tag size={14} color={textSecondary} />
                    <label style={{ fontSize: '13px', color: textSecondary }}>Desconto:</label>
                </div>

                <input
                    type="text"
                    value={discountInput}
                    onChange={handleDiscountInputChange}
                    placeholder="0"
                    style={{
                        flex: 1,
                        padding: '8px 12px',
                        fontSize: '14px',
                        border: `1px solid ${borderColor}`,
                        borderRadius: '6px',
                        backgroundColor: inputBg,
                        color: textPrimary,
                        outline: 'none'
                    }}
                    onFocus={handleInputFocus}
                    onBlur={handleInputBlur}
                />

                <button
                    type="button"
                    onClick={handleToggleType}
                    style={{
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        border: `1px solid ${borderColor}`,
                        borderRadius: '6px',
                        backgroundColor: discountType === '%' ? '#8b5cf6' : inputBg,
                        color: discountType === '%' ? '#ffffff' : textPrimary,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        minWidth: '60px',
                        justifyContent: 'center'
                    }}
                >
                    {discountType === '%' && <Percent size={14} />}
                    {discountType}
                </button>
            </div>

            {/* Divider */}
            <div style={{ height: '1px', backgroundColor: borderColor, margin: '12px 0' }} />

            {/* Subtotal */}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', color: textSecondary }}>Subtotal</span>
                <div style={{ textAlign: 'right' }}>
                    {item.desconto > 0 && (
                        <div style={{
                            fontSize: '12px',
                            color: textSecondary,
                            textDecoration: 'line-through',
                            marginBottom: '2px'
                        }}>
                            {formatCurrency(subtotalSemDesconto)}
                        </div>
                    )}
                    <div style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: item.desconto > 0 ? '#10b981' : '#8b5cf6'
                    }}>
                        {formatCurrency(subtotalComDesconto)}
                    </div>
                </div>
            </div>
        </div>
    );
});

export default CartItemCard;
