import { TrendingUp, Package } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Badge from './Badge';

function TopProductsCard({ products }) {
    const { isDark } = useTheme();

    const bgColor = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#cbd5e1' : '#6b7280';
    const hoverBg = isDark ? '#334155' : '#f9fafb';

    const defaultProducts = products || [
        { id: 1, name: 'Produto A', sales: 145, growth: 12 },
        { id: 2, name: 'Produto B', sales: 132, growth: 8 },
        { id: 3, name: 'Produto C', sales: 98, growth: -3 },
        { id: 4, name: 'Produto D', sales: 87, growth: 15 },
        { id: 5, name: 'Produto E', sales: 76, growth: 5 }
    ];

    const getRankColor = (index) => {
        const colors = ['#fbbf24', '#94a3b8', '#cd7f32'];
        return colors[index] || '#6b7280';
    };

    return (
        <div style={{
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <TrendingUp size={20} color="#3b82f6" />
                <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: textPrimary,
                    margin: 0
                }}>
                    Top Produtos
                </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {defaultProducts.map((product, index) => (
                    <div
                        key={product.id}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = hoverBg;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                            {/* Rank Badge */}
                            <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                backgroundColor: `${getRankColor(index)}20`,
                                color: getRankColor(index),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: '700'
                            }}>
                                #{index + 1}
                            </div>

                            {/* Product Info */}
                            <div style={{ flex: 1 }}>
                                <div style={{
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    color: textPrimary,
                                    marginBottom: '2px'
                                }}>
                                    {product.name}
                                </div>
                                <div style={{
                                    fontSize: '12px',
                                    color: textSecondary
                                }}>
                                    {product.sales} vendas
                                </div>
                            </div>

                            {/* Growth Badge */}
                            {product.growth > 0 && (
                                <Badge variant="success" size="sm">
                                    +{product.growth}%
                                </Badge>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default TopProductsCard;
