import { TrendingUp, TrendingDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function PremiumKPICard({ title, value, icon: Icon, trend, trendValue, iconColor }) {
    const { isDark } = useTheme();

    // Apple Premium Colors - Melhor visibilidade no dark mode
    const cardBg = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(148, 163, 184, 0.1)';
    const titleColor = isDark ? '#cbd5e1' : '#64748b';
    const valueColor = isDark ? '#f1f5f9' : '#0f172a';
    const trendColorPositive = isDark ? '#4ade80' : '#22c55e';
    const trendColorNegative = isDark ? '#fb7185' : '#ef4444';
    const shadowLight = '0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)';
    const shadowDark = '0 8px 16px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3)';

    const isPositive = trend === 'up';
    const trendColor = isPositive ? trendColorPositive : trendColorNegative;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
        <div style={{
            background: isDark
                ? cardBg
                : `linear-gradient(to bottom, ${cardBg} 0%, #fafafa 100%)`,
            border: `1px solid ${borderColor}`,
            borderRadius: '16px',
            padding: '24px',
            boxShadow: isDark ? shadowDark : shadowLight,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = isDark
                    ? '0 12px 24px rgba(0,0,0,0.5), 0 4px 10px rgba(0,0,0,0.3)'
                    : '0 6px 20px rgba(0,0,0,0.12), 0 3px 6px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.15)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = isDark ? shadowDark : shadowLight;
                e.currentTarget.style.borderColor = borderColor;
            }}
        >
            {/* Icon Background Glow */}
            <div style={{
                position: 'absolute',
                top: '-25px',
                right: '-25px',
                width: '120px',
                height: '120px',
                background: `radial-gradient(circle, ${iconColor}${isDark ? '25' : '15'} 0%, transparent 70%)`,
                pointerEvents: 'none'
            }} />

            {/* Header: Icon + Title */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px'
            }}>
                <div style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: isDark
                        ? `${iconColor}25`
                        : `${iconColor}12`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    boxShadow: `0 4px 12px ${iconColor}30`
                }}>
                    <Icon
                        size={22}
                        style={{
                            color: iconColor,
                            strokeWidth: 2.5
                        }}
                    />
                </div>
                <h3 style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: '600',
                    color: titleColor,
                    letterSpacing: '-0.01em'
                }}>
                    {title}
                </h3>
            </div>

            {/* Value */}
            <div style={{
                fontSize: '34px',
                fontWeight: '700',
                color: valueColor,
                marginBottom: '18px',
                letterSpacing: '-0.03em',
                fontFeatureSettings: '"tnum"'
            }}>
                {value}
            </div>

            {/* Trend */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
            }}>
                <TrendIcon
                    size={16}
                    style={{
                        color: trendColor,
                        strokeWidth: 2.5
                    }}
                />
                <span style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: trendColor,
                    letterSpacing: '-0.01em'
                }}>
                    {trendValue}
                </span>
                <span style={{
                    fontSize: '13px',
                    fontWeight: '500',
                    color: titleColor,
                    marginLeft: '6px'
                }}>
                    vs período anterior
                </span>
            </div>
        </div>
    );
}

export default PremiumKPICard;
