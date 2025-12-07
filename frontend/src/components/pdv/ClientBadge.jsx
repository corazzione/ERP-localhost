import { memo, useCallback, useMemo } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * 🪷 ClientBadge - Badge horizontal do cliente selecionado
 * Optimized with React.memo
 */
const ClientBadge = memo(function ClientBadge({ cliente, onRemove }) {
    const { isDark } = useTheme();

    // Memoized theme colors
    const themeColors = useMemo(() => ({
        bgBadge: isDark ? '#5b21b6' : '#faf5ff',
        textSecondary: isDark ? '#cbd5e1' : '#6b7280'
    }), [isDark]);

    const { bgBadge, textSecondary } = themeColors;

    // Memoized initial
    const initial = useMemo(() =>
        cliente.nome?.charAt(0).toUpperCase(),
        [cliente.nome]
    );

    const handleMouseEnter = useCallback((e) => {
        e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.2)';
        e.currentTarget.style.color = '#ef4444';
    }, []);

    const handleMouseLeave = useCallback((e) => {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = '#8b5cf6';
    }, []);

    return (
        <div style={{
            backgroundColor: bgBadge,
            border: '2px solid #8b5cf6',
            borderRadius: '10px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            transition: 'all 150ms'
        }}>
            {/* Avatar */}
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '16px',
                fontWeight: '700',
                flexShrink: 0
            }}>
                {initial}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: '#8b5cf6',
                    marginBottom: '2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {cliente.nome}
                </div>
                <div style={{
                    fontSize: '12px',
                    color: textSecondary,
                    display: 'flex',
                    gap: '12px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {cliente.telefone && <span>📱 {cliente.telefone}</span>}
                    {cliente.cpf && <span>📄 {cliente.cpf}</span>}
                </div>
            </div>

            {/* Botão Trocar */}
            <button
                onClick={onRemove}
                style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8b5cf6',
                    transition: 'all 150ms'
                }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                title="Trocar cliente"
            >
                <X size={20} />
            </button>
        </div>
    );
});

export default ClientBadge;
