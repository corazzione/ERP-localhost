import { Plus, Minus, X, Percent } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function CartItem({ item, onUpdateQuantity, onUpdateDiscount, onRemove }) {
    const { isDark } = useTheme();

    const bgColor = isDark ? '#334155' : '#f9fafb';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#cbd5e1' : '#6b7280';

    const subtotal = item.quantidade * item.precoVenda;
    const discount = item.desconto || 0;
    const total = subtotal - discount;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            padding: '0.75rem',
            backgroundColor: bgColor,
            borderRadius: '8px'
        }}>
            {/* Main Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', color: textPrimary, fontSize: '14px' }}>
                        {item.nome}
                    </div>
                    <div style={{ fontSize: '12px', color: textSecondary }}>
                        R$ {parseFloat(item.precoVenda).toFixed(2)} cada
                    </div>
                </div>

                {/* Quantity Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                        onClick={() => onUpdateQuantity(item.id, item.quantidade - 1)}
                        disabled={item.quantidade <= 1}
                        style={{
                            padding: '4px',
                            backgroundColor: 'transparent',
                            border: '1px solid',
                            borderColor: isDark ? '#475569' : '#d1d5db',
                            borderRadius: '4px',
                            cursor: item.quantidade <= 1 ? 'not-allowed' : 'pointer',
                            opacity: item.quantidade <= 1 ? 0.5 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            color: textPrimary
                        }}
                    >
                        <Minus size={14} />
                    </button>

                    <input
                        type="number"
                        value={item.quantidade}
                        onChange={(e) => onUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                        style={{
                            width: '50px',
                            textAlign: 'center',
                            padding: '4px',
                            border: '1px solid',
                            borderColor: isDark ? '#475569' : '#d1d5db',
                            borderRadius: '4px',
                            backgroundColor: isDark ? '#1e293b' : '#ffffff',
                            color: textPrimary,
                            fontSize: '14px',
                            fontWeight: '600'
                        }}
                    />

                    <button
                        onClick={() => onUpdateQuantity(item.id, item.quantidade + 1)}
                        style={{
                            padding: '4px',
                            backgroundColor: 'transparent',
                            border: '1px solid',
                            borderColor: isDark ? '#475569' : '#d1d5db',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            color: textPrimary
                        }}
                    >
                        <Plus size={14} />
                    </button>
                </div>

                {/* Total */}
                <div style={{ fontWeight: '700', color: textPrimary, fontSize: '16px', minWidth: '100px', textAlign: 'right' }}>
                    R$ {total.toFixed(2)}
                </div>

                {/* Remove Button */}
                <button
                    onClick={() => onRemove(item.id)}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <X size={18} />
                </button>
            </div>

            {/* Discount Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '0.5rem', borderTop: `1px solid ${isDark ? '#475569' : '#e5e7eb'}` }}>
                <Percent size={14} color={textSecondary} />
                <span style={{ fontSize: '12px', color: textSecondary }}>Desconto:</span>
                <input
                    type="number"
                    value={discount}
                    onChange={(e) => onUpdateDiscount(item.id, parseFloat(e.target.value) || 0)}
                    placeholder="0,00"
                    style={{
                        width: '80px',
                        padding: '4px 8px',
                        border: '1px solid',
                        borderColor: isDark ? '#475569' : '#d1d5db',
                        borderRadius: '4px',
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        color: textPrimary,
                        fontSize: '12px'
                    }}
                />
                <span style={{ fontSize: '12px', color: textSecondary }}>
                    Subtotal: R$ {subtotal.toFixed(2)}
                </span>
            </div>
        </div>
    );
}

export default CartItem;
