import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Package, Calendar, Zap } from 'lucide-react';
import api from '../services/api';
import { useFilters } from '../contexts/FilterContext';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from './LoadingSpinner';

function IntelligentOverviewCard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [hoveredDay, setHoveredDay] = useState(null);
    const { store, period, customDateRange } = useFilters();
    const { isDark } = useTheme();

    useEffect(() => {
        loadOverviewData();
    }, [store, period, customDateRange]);

    const loadOverviewData = async () => {
        try {
            setLoading(true);
            const params = { period, store };
            if (period === 'custom' && customDateRange.start && customDateRange.end) {
                params.startDate = customDateRange.start.toISOString();
                params.endDate = customDateRange.end.toISOString();
            }

            const response = await api.get('/dashboard/overview', { params });
            setData(response.data);
        } catch (error) {
            console.error('Erro ao carregar visão geral:', error);
            // Fallback com dados de exemplo
            setData({
                heatmapData: generateMockHeatmap(),
                topProduto: { nome: 'Produto Exemplo', valorTotal: 1250.00 },
                diaMaisForte: { data: new Date().toISOString().split('T')[0], faturamento: 850.00 },
                tendencia: 12.5
            });
        } finally {
            setLoading(false);
        }
    };

    const generateMockHeatmap = () => {
        const data = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.push({
                data: date.toISOString().split('T')[0],
                faturamento: Math.random() * 1000
            });
        }
        return data;
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value || 0);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    const getHeatmapColor = (value, maxValue) => {
        if (maxValue === 0) return isDark ? '#1e293b' : '#f1f5f9';
        const intensity = value / maxValue;

        if (isDark) {
            // Dark mode: vibrant gradient from dark to purple/cyan
            if (intensity === 0) return '#1e293b';
            if (intensity < 0.2) return '#312e81'; // deep purple
            if (intensity < 0.4) return '#4c1d95'; // purple
            if (intensity < 0.6) return '#6d28d9'; // vibrant purple
            if (intensity < 0.8) return '#7c3aed'; // bright purple
            return '#8b5cf6'; // vivid purple
        } else {
            // Light mode: soft gradient from light to purple
            if (intensity === 0) return '#f8fafc';
            if (intensity < 0.2) return '#e9d5ff';
            if (intensity < 0.4) return '#d8b4fe';
            if (intensity < 0.6) return '#c084fc';
            if (intensity < 0.8) return '#a855f7';
            return '#9333ea';
        }
    };

    // Theme colors
    const cardBg = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(148, 163, 184, 0.1)';
    const titleColor = isDark ? '#f8fafc' : '#0f172a';
    const subtitleColor = isDark ? '#94a3b8' : '#64748b';
    const shadowLight = '0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)';
    const shadowDark = '0 8px 16px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3)';

    if (loading) {
        return (
            <div style={{
                background: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '12px',
                padding: '24px',
                boxShadow: isDark ? shadowDark : shadowLight,
                minHeight: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <LoadingSpinner />
            </div>
        );
    }

    const maxFaturamento = Math.max(...(data?.heatmapData?.map(d => d.faturamento) || [1]));

    return (
        <div style={{
            background: isDark ? cardBg : `linear-gradient(to bottom, ${cardBg} 0%, #fafafa 100%)`,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: isDark ? shadowDark : shadowLight,
            transition: 'all 0.3s ease'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px'
                }}>
                    <Zap size={20} style={{ color: '#8b5cf6' }} />
                    <h3 style={{
                        margin: 0,
                        fontSize: '18px',
                        fontWeight: '600',
                        color: titleColor,
                        letterSpacing: '-0.02em'
                    }}>
                        Visão Geral Inteligente
                    </h3>
                </div>
                <p style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: '400',
                    color: subtitleColor
                }}>
                    Últimos 30 dias
                </p>
            </div>

            {/* Main Content - 2 Columns on Desktop */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px'
            }}>
                {/* Left Column: Heatmap */}
                <div>
                    <h4 style={{
                        margin: '0 0 12px 0',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: titleColor
                    }}>
                        Mapa de Calor - Faturamento Diário
                    </h4>

                    {/* Heatmap Grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(6, 1fr)',
                        gap: '6px',
                        marginBottom: '12px'
                    }}>
                        {data?.heatmapData?.map((day, index) => (
                            <div
                                key={index}
                                onMouseEnter={() => setHoveredDay(day)}
                                onMouseLeave={() => setHoveredDay(null)}
                                style={{
                                    aspectRatio: '1',
                                    background: getHeatmapColor(day.faturamento, maxFaturamento),
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(148, 163, 184, 0.15)'}`,
                                    position: 'relative',
                                    transform: hoveredDay === day ? 'scale(1.1)' : 'scale(1)',
                                    boxShadow: hoveredDay === day
                                        ? '0 4px 12px rgba(139, 92, 246, 0.3)'
                                        : 'none'
                                }}
                            >
                                {hoveredDay === day && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        marginBottom: '8px',
                                        background: isDark ? '#0f172a' : '#ffffff',
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: '6px',
                                        padding: '8px 12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                        whiteSpace: 'nowrap',
                                        zIndex: 10,
                                        pointerEvents: 'none'
                                    }}>
                                        <div style={{
                                            fontSize: '11px',
                                            color: subtitleColor,
                                            marginBottom: '2px'
                                        }}>
                                            {formatDate(day.data)}
                                        </div>
                                        <div style={{
                                            fontSize: '13px',
                                            fontWeight: '700',
                                            color: '#8b5cf6'
                                        }}>
                                            {formatCurrency(day.faturamento)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Legend */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '11px',
                        color: subtitleColor
                    }}>
                        <span>Baixo</span>
                        <div style={{
                            flex: 1,
                            height: '6px',
                            borderRadius: '3px',
                            background: isDark
                                ? 'linear-gradient(to right, #1e293b, #312e81, #6d28d9, #8b5cf6)'
                                : 'linear-gradient(to right, #f8fafc, #e9d5ff, #c084fc, #9333ea)'
                        }} />
                        <span>Alto</span>
                    </div>
                </div>

                {/* Right Column: Mini Cards */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                }}>
                    {/* Top Produto */}
                    <div style={{
                        padding: '16px',
                        background: isDark ? 'rgba(34, 214, 126, 0.1)' : 'rgba(34, 214, 126, 0.08)',
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? 'rgba(34, 214, 126, 0.3)' : 'rgba(34, 214, 126, 0.2)'}`
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                        }}>
                            <Package size={16} style={{ color: '#22d67e' }} />
                            <span style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#22d67e',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Top Produto
                            </span>
                        </div>
                        <div style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: titleColor,
                            marginBottom: '4px'
                        }}>
                            {data?.topProduto?.nome || 'N/A'}
                        </div>
                        <div style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#22d67e'
                        }}>
                            {formatCurrency(data?.topProduto?.valorTotal)}
                        </div>
                    </div>

                    {/* Dia Mais Forte */}
                    <div style={{
                        padding: '16px',
                        background: isDark ? 'rgba(20, 212, 244, 0.1)' : 'rgba(20, 212, 244, 0.08)',
                        borderRadius: '10px',
                        border: `1px solid ${isDark ? 'rgba(20, 212, 244, 0.3)' : 'rgba(20, 212, 244, 0.2)'}`
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                        }}>
                            <Calendar size={16} style={{ color: '#14d4f4' }} />
                            <span style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#14d4f4',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Dia Mais Forte
                            </span>
                        </div>
                        <div style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: titleColor,
                            marginBottom: '4px'
                        }}>
                            {formatDate(data?.diaMaisForte?.data)}
                        </div>
                        <div style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#14d4f4'
                        }}>
                            {formatCurrency(data?.diaMaisForte?.faturamento)}
                        </div>
                    </div>

                    {/* Tendência do Mês */}
                    <div style={{
                        padding: '16px',
                        background: isDark
                            ? (data?.tendencia >= 0 ? 'rgba(34, 214, 126, 0.1)' : 'rgba(239, 68, 68, 0.1)')
                            : (data?.tendencia >= 0 ? 'rgba(34, 214, 126, 0.08)' : 'rgba(239, 68, 68, 0.08)'),
                        borderRadius: '10px',
                        border: `1px solid ${isDark
                                ? (data?.tendencia >= 0 ? 'rgba(34, 214, 126, 0.3)' : 'rgba(239, 68, 68, 0.3)')
                                : (data?.tendencia >= 0 ? 'rgba(34, 214, 126, 0.2)' : 'rgba(239, 68, 68, 0.2)')
                            }`
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px'
                        }}>
                            {data?.tendencia >= 0 ? (
                                <TrendingUp size={16} style={{ color: '#22d67e' }} />
                            ) : (
                                <TrendingDown size={16} style={{ color: '#ef4444' }} />
                            )}
                            <span style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: data?.tendencia >= 0 ? '#22d67e' : '#ef4444',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Tendência do Mês
                            </span>
                        </div>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: data?.tendencia >= 0 ? '#22d67e' : '#ef4444',
                            marginBottom: '4px'
                        }}>
                            {data?.tendencia >= 0 ? '+' : ''}{data?.tendencia?.toFixed(1)}%
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: subtitleColor
                        }}>
                            em relação ao período anterior
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default IntelligentOverviewCard;
