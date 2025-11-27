import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function KPICard({ title, value, trend, trendValue, icon: Icon, color = '#3b82f6', subtitle }) {
    const { isDark } = useTheme();

    const bgColor = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? '#334155' : '#e5e7eb';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#cbd5e1' : '#6b7280';

    const isPositive = trend === 'up';
    const trendColor = isPositive ? '#10b981' : '#ef4444';
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
        <div style={{
            backgroundColor: bgColor,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '1.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: textSecondary, margin: 0, marginBottom: '0.5rem' }}>
                        {title}
                    </p>
                    <h3 style={{ fontSize: '28px', fontWeight: '700', color: textPrimary, margin: 0 }}>
                        {value}
                    </h3>
                    {subtitle && (
                        <p style={{ fontSize: '12px', color: textSecondary, margin: '4px 0 0 0' }}>
                            {subtitle}
                        </p>
                    )}
                </div>
                {Icon && (
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: `${color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Icon size={24} color={color} />
                    </div>
                )}
            </div>

            {trendValue && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        backgroundColor: `${trendColor}15`
                    }}>
                        <TrendIcon size={14} color={trendColor} />
                        <span style={{ fontSize: '12px', fontWeight: '600', color: trendColor }}>
                            {trendValue}
                        </span>
                    </div>
                    <span style={{ fontSize: '12px', color: textSecondary }}>
                        vs período anterior
                    </span>
                </div>
            )}
        </div>
    );
}

export default KPICard;
