import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

function AppleLineChart({ data, title }) {
    const { isDark } = useTheme();

    // Apple Premium Colors
    const cardBg = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? 'rgba(139, 92, 246, 0.1)' : 'transparent';
    const titleColor = isDark ? '#e2e8f0' : '#0f172a';
    const subtitleColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.15)';
    const lineColor = '#8b5cf6';
    const gradientStartColor = isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)';
    const gradientEndColor = isDark ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.02)';
    const shadowLight = '0 2px 8px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)';
    const shadowDark = '0 4px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2)';

    // Custom Tooltip
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    background: isDark ? '#0f172a' : '#ffffff',
                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    <p style={{
                        margin: '0 0 4px 0',
                        fontSize: '11px',
                        fontWeight: '500',
                        color: subtitleColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {payload[0].payload.data}
                    </p>
                    <p style={{
                        margin: 0,
                        fontSize: '16px',
                        fontWeight: '600',
                        color: lineColor,
                        fontFeatureSettings: '"tnum"'
                    }}>
                        {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL'
                        }).format(payload[0].value)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{
            background: isDark
                ? cardBg
                : `linear-gradient(to bottom, ${cardBg} 0%, #fafafa 100%)`,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: isDark ? shadowDark : shadowLight,
            height: '400px',
            transition: 'all 0.3s ease'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                    margin: '0 0 6px 0',
                    fontSize: '20px',
                    fontWeight: '700',
                    color: titleColor,
                    letterSpacing: '-0.02em'
                }}>
                    {title}
                </h3>
                <p style={{
                    margin: 0,
                    fontSize: '14px',
                    fontWeight: '500',
                    color: subtitleColor
                }}>
                    Últimos 30 dias
                </p>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height="85%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={gradientStartColor} stopOpacity={1} />
                            <stop offset="95%" stopColor={gradientEndColor} stopOpacity={1} />
                        </linearGradient>
                    </defs>
                    <XAxis
                        dataKey="data"
                        stroke={gridColor}
                        tick={{ fill: subtitleColor, fontSize: 11, fontWeight: 500 }}
                        tickLine={false}
                        axisLine={{ stroke: gridColor, strokeWidth: 1 }}
                    />
                    <YAxis
                        stroke={gridColor}
                        tick={{ fill: subtitleColor, fontSize: 11, fontWeight: 500 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) =>
                            new Intl.NumberFormat('pt-BR', {
                                style: 'currency',
                                currency: 'BRL',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(value)
                        }
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Area
                        type="monotone"
                        dataKey="valor"
                        stroke={lineColor}
                        strokeWidth={3}
                        fill="url(#colorValue)"
                        dot={{
                            fill: lineColor,
                            strokeWidth: 2,
                            r: 4,
                            stroke: isDark ? '#1a1d29' : '#ffffff'
                        }}
                        activeDot={{
                            r: 6,
                            fill: lineColor,
                            stroke: isDark ? '#1a1d29' : '#ffffff',
                            strokeWidth: 3
                        }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

export default AppleLineChart;
