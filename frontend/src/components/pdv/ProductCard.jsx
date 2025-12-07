import { memo, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatCurrency } from '../../utils/formatters';

/**
 * 🪷 ProductCard - Card premium de produto com hover effect
 * Inspirado em Shopify POS / Square / Lightspeed
 * Optimized with React.memo to prevent unnecessary re-renders
 */
const ProductCard = memo(function ProductCard({ produto, onClick }) {
    const { isDark } = useTheme();

    const cardBg = isDark ? '#1e293b' : '#ffffff';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#94a3b8' : '#6b7280';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const shadowDefault = isDark ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)';
    const shadowHover = isDark ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.15)';

    // Memoized click handler
    const handleClick = useCallback(() => {
        onClick(produto);
    }, [onClick, produto]);

    const handleMouseEnter = useCallback((e) => {
        e.currentTarget.style.transform = 'scale(1.01)';
        e.currentTarget.style.boxShadow = shadowHover;
    }, [shadowHover]);

    const handleMouseLeave = useCallback((e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = shadowDefault;
    }, [shadowDefault]);

    return (
        <div
            onClick={handleClick}
            style={{
                backgroundColor: cardBg,
                borderRadius: '12px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: shadowDefault,
                border: `1px solid ${borderColor}`,
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Image Placeholder */}
            <div style={{
                width: '100%',
                aspectRatio: '1',
                backgroundColor: isDark ? '#334155' : '#f3f4f6',
                borderRadius: '8px',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                {produto.imagemUrl ? (
                    <img
                        src={produto.imagemUrl}
                        alt={produto.nome}
                        loading="lazy"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                ) : (
                    <svg
                        width="48"
                        height="48"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={textSecondary}
                        strokeWidth="1.5"
                    >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                    </svg>
                )}
            </div>

            {/* Product Info */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Code */}
                <div style={{
                    fontSize: '11px',
                    color: textSecondary,
                    marginBottom: '6px',
                    fontWeight: '500',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                }}>
                    {produto.codigo}
                </div>

                {/* Name */}
                <div style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: textPrimary,
                    marginBottom: '12px',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    minHeight: '42px'
                }}>
                    {produto.nome}
                </div>

                {/* Price */}
                <div style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#8b5cf6',
                    marginTop: 'auto'
                }}>
                    {formatCurrency(produto.precoVenda)}
                </div>

                {/* Stock indicator (optional) */}
                {produto.estoque !== undefined && (
                    <div style={{
                        fontSize: '11px',
                        color: produto.estoque > 10 ? '#10b981' : produto.estoque > 0 ? '#f59e0b' : '#ef4444',
                        marginTop: '8px',
                        fontWeight: '500'
                    }}>
                        {produto.estoque > 0 ? `${produto.estoque} em estoque` : 'Sem estoque'}
                    </div>
                )}
            </div>

            {/* Ripple effect on click */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: 'none',
                borderRadius: '12px',
                background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
                opacity: 0,
                transition: 'opacity 300ms'
            }} />
        </div>
    );
});

export default ProductCard;
