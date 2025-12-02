import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Package, Calendar, Zap, DollarSign } from 'lucide-react';
import api from '../services/api';
import { useFilters } from '../contexts/FilterContext';
import { useTheme } from '../contexts/ThemeContext';
import LoadingSpinner from './LoadingSpinner';

function IntelligentOverviewCard() {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [hoveredDay, setHoveredDay] = useState(null);
    const [activeTab, setActiveTab] = useState('todas');
    const [filters, setFilters] = useState({
        type: 'Todos',
        paymentMethod: 'Todos',
        category: 'Todos',
        origin: 'Todos',
        destination: '',
        status: 'Todos',
        sort: 'mais_recente'
    });

    const { store, period, customDateRange } = useFilters();
    const { isDark } = useTheme();

    useEffect(() => {
        loadOverviewData();
    }, [store, period, customDateRange, activeTab, filters]);

    const loadOverviewData = async () => {
        try {
            setLoading(true);
            const params = {
                period,
                store,
                tab: activeTab,
                ...filters
            };

            if (period === 'custom' && customDateRange.start && customDateRange.end) {
                params.startDate = customDateRange.start.toISOString();
                params.endDate = customDateRange.end.toISOString();
            }

            const response = await api.get('/dashboard/overview', { params });
            setData(response.data);
        } catch (error) {
            console.error('Erro ao carregar visão geral:', error);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
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
            if (intensity === 0) return '#1e293b';
            if (intensity < 0.2) return '#312e81';
            if (intensity < 0.4) return '#4c1d95';
            if (intensity < 0.6) return '#6d28d9';
            if (intensity < 0.8) return '#7c3aed';
            return '#8b5cf6';
        } else {
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

    // Styles
    const tabStyle = (isActive) => ({
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: isActive ? (isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)') : 'transparent',
        color: isActive ? '#8b5cf6' : subtitleColor,
        border: isActive ? `1px solid ${isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'}` : 'none'
    });

    const selectStyle = {
        background: isDark ? '#0f172a' : '#f8fafc',
        border: `1px solid ${borderColor}`,
        color: titleColor,
        padding: '6px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        outline: 'none',
        cursor: 'pointer'
    };

    const renderFilters = () => {
        switch (activeTab) {
            case 'todas':
                return (
                    <>
                        <select style={selectStyle} value={filters.paymentMethod} onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}>
                            <option value="Todos">Forma de Pagamento</option>
                            <option value="pix">PIX</option>
                            <option value="dinheiro">Dinheiro</option>
                            <option value="cartao_credito">Cartão Crédito</option>
                            <option value="cartao_debito">Cartão Débito</option>
                        </select>
                    </>
                );
            case 'entradas':
                return (
                    <>
                        <select style={selectStyle} value={filters.origin} onChange={(e) => handleFilterChange('origin', e.target.value)}>
                            <option value="Todos">Origem</option>
                            <option value="top3">Top 3</option>
                            <option value="top5">Top 5</option>
                            <option value="top10">Top 10</option>
                        </select>
                        <select style={selectStyle} value={filters.paymentMethod} onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}>
                            <option value="">Forma de Pagamento</option>
                            <option value="pix">PIX</option>
                            <option value="dinheiro">Dinheiro</option>
                            <option value="cartao_credito">Cartão Crédito</option>
                        </select>
                    </>
                );
            case 'saidas':
                return (
                    <>
                        <select style={selectStyle} value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                            <option value="">Categoria</option>
                            <option value="Operacional">Operacional</option>
                            <option value="Estoque">Estoque</option>
                            <option value="Impostos">Impostos</option>
                        </select>
                        <select style={selectStyle} value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)}>
                            <option value="mais_recente">Mais Recente</option>
                            <option value="maior_valor">Maior Valor</option>
                        </select>
                    </>
                );
            case 'crediario':
                return (
                    <>
                        <select style={selectStyle} value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                            <option value="Todos">Status</option>
                            <option value="em_aberto">Em Aberto</option>
                            <option value="pagas">Pagas</option>
                            <option value="atrasadas">Atrasadas</option>
                        </select>
                    </>
                );
            default:
                return null;
        }
    };

    const renderContent = () => {
        if (loading) return <LoadingSpinner />;
        if (!data) return <div style={{ color: subtitleColor, textAlign: 'center', padding: '20px' }}>Nenhum dado disponível</div>;

        if (activeTab === 'todas') {
            const maxFaturamento = Math.max(...(data?.heatmapData?.map(d => d.faturamento) || [1]));
            return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {/* Left Column: Heatmap */}
                    <div>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', fontWeight: '600', color: titleColor }}>
                            Mapa de Calor - Faturamento Diário
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', marginBottom: '12px' }}>
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
                                        boxShadow: hoveredDay === day ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none'
                                    }}
                                >
                                    {hoveredDay === day && (
                                        <div style={{
                                            position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '8px',
                                            background: isDark ? '#0f172a' : '#ffffff', border: `1px solid ${borderColor}`, borderRadius: '6px',
                                            padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', whiteSpace: 'nowrap', zIndex: 10, pointerEvents: 'none'
                                        }}>
                                            <div style={{ fontSize: '11px', color: subtitleColor, marginBottom: '2px' }}>{formatDate(day.data)}</div>
                                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#8b5cf6' }}>{formatCurrency(day.faturamento)}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: subtitleColor }}>
                            <span>Baixo</span>
                            <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: isDark ? 'linear-gradient(to right, #1e293b, #312e81, #6d28d9, #8b5cf6)' : 'linear-gradient(to right, #f8fafc, #e9d5ff, #c084fc, #9333ea)' }} />
                            <span>Alto</span>
                        </div>
                    </div>

                    {/* Right Column: Mini Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {/* Lucro Simples */}
                        <div style={{ padding: '16px', background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)', borderRadius: '10px', border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <DollarSign size={16} style={{ color: '#10b981' }} />
                                <span style={{ fontSize: '11px', fontWeight: '600', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Lucro Simples</span>
                            </div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                                {formatCurrency(data?.resumoFinanceiro?.lucroSimples)}
                            </div>
                            <div style={{ fontSize: '11px', color: subtitleColor, marginTop: '4px' }}>
                                Entradas ({formatCurrency(data?.resumoFinanceiro?.totalEntradas)}) - Saídas ({formatCurrency(data?.resumoFinanceiro?.totalSaidas)})
                            </div>
                        </div>

                        {/* Top Produto */}
                        <div style={{ padding: '16px', background: isDark ? 'rgba(34, 214, 126, 0.1)' : 'rgba(34, 214, 126, 0.08)', borderRadius: '10px', border: `1px solid ${isDark ? 'rgba(34, 214, 126, 0.3)' : 'rgba(34, 214, 126, 0.2)'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <Package size={16} style={{ color: '#22d67e' }} />
                                <span style={{ fontSize: '11px', fontWeight: '600', color: '#22d67e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Top Produto</span>
                            </div>
                            <div style={{ fontSize: '15px', fontWeight: '600', color: titleColor, marginBottom: '4px' }}>{data?.topProduto?.nome || 'N/A'}</div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: '#22d67e' }}>{formatCurrency(data?.topProduto?.valorTotal)}</div>
                        </div>

                        {/* Tendência */}
                        <div style={{ padding: '16px', background: isDark ? (data?.tendencia >= 0 ? 'rgba(34, 214, 126, 0.1)' : 'rgba(239, 68, 68, 0.1)') : (data?.tendencia >= 0 ? 'rgba(34, 214, 126, 0.08)' : 'rgba(239, 68, 68, 0.08)'), borderRadius: '10px', border: `1px solid ${isDark ? (data?.tendencia >= 0 ? 'rgba(34, 214, 126, 0.3)' : 'rgba(239, 68, 68, 0.3)') : (data?.tendencia >= 0 ? 'rgba(34, 214, 126, 0.2)' : 'rgba(239, 68, 68, 0.2)')}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                {data?.tendencia >= 0 ? <TrendingUp size={16} style={{ color: '#22d67e' }} /> : <TrendingDown size={16} style={{ color: '#ef4444' }} />}
                                <span style={{ fontSize: '11px', fontWeight: '600', color: data?.tendencia >= 0 ? '#22d67e' : '#ef4444', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tendência do Mês</span>
                            </div>
                            <div style={{ fontSize: '24px', fontWeight: '700', color: data?.tendencia >= 0 ? '#22d67e' : '#ef4444', marginBottom: '4px' }}>{data?.tendencia >= 0 ? '+' : ''}{data?.tendencia?.toFixed(1)}%</div>
                            <div style={{ fontSize: '11px', color: subtitleColor }}>em relação ao período anterior</div>
                        </div>
                    </div>
                </div>
            );
        }

        if (activeTab === 'entradas') {
            return (
                <div>
                    <div style={{ marginBottom: '16px', padding: '16px', background: isDark ? 'rgba(34, 214, 126, 0.1)' : '#f0fdf4', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(34, 214, 126, 0.3)' : '#bbf7d0'}` }}>
                        <div style={{ fontSize: '13px', color: isDark ? '#4ade80' : '#15803d', marginBottom: '4px' }}>Total Recebido</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: isDark ? '#22c55e' : '#16a34a' }}>{formatCurrency(data?.entradas?.total)}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {data?.entradas?.lista?.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '500', color: titleColor }}>{item.descricao}</div>
                                    <div style={{ fontSize: '12px', color: subtitleColor }}>{formatDate(item.data)} • {item.origem}</div>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#22c55e' }}>+{formatCurrency(item.valor)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (activeTab === 'saidas') {
            return (
                <div>
                    <div style={{ marginBottom: '16px', padding: '16px', background: isDark ? 'rgba(239, 68, 68, 0.1)' : '#fef2f2', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(239, 68, 68, 0.3)' : '#fecaca'}` }}>
                        <div style={{ fontSize: '13px', color: isDark ? '#f87171' : '#b91c1c', marginBottom: '4px' }}>Total de Saídas</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: isDark ? '#ef4444' : '#dc2626' }}>{formatCurrency(data?.saidas?.total)}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {data?.saidas?.lista?.length > 0 ? data.saidas.lista.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '500', color: titleColor }}>{item.descricao}</div>
                                    <div style={{ fontSize: '12px', color: subtitleColor }}>{formatDate(item.data)} • {item.categoria}</div>
                                </div>
                                <div style={{ fontSize: '14px', fontWeight: '600', color: '#ef4444' }}>-{formatCurrency(item.valor)}</div>
                            </div>
                        )) : <div style={{ textAlign: 'center', padding: '20px', color: subtitleColor }}>Nenhuma saída registrada</div>}
                    </div>
                </div>
            );
        }

        if (activeTab === 'crediario') {
            return (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ padding: '12px', background: isDark ? 'rgba(59, 130, 246, 0.1)' : '#eff6ff', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.3)' : '#bfdbfe'}` }}>
                            <div style={{ fontSize: '12px', color: isDark ? '#60a5fa' : '#1d4ed8' }}>Recebido</div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: isDark ? '#3b82f6' : '#2563eb' }}>{formatCurrency(data?.crediario?.recebido)}</div>
                        </div>
                        <div style={{ padding: '12px', background: isDark ? 'rgba(245, 158, 11, 0.1)' : '#fffbeb', borderRadius: '8px', border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.3)' : '#fde68a'}` }}>
                            <div style={{ fontSize: '12px', color: isDark ? '#fbbf24' : '#b45309' }}>Pendente</div>
                            <div style={{ fontSize: '18px', fontWeight: '700', color: isDark ? '#f59e0b' : '#d97706' }}>{formatCurrency(data?.crediario?.pendente)}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {data?.crediario?.lista?.map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderRadius: '8px', border: `1px solid ${borderColor}` }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '500', color: titleColor }}>{item.cliente}</div>
                                    <div style={{ fontSize: '12px', color: subtitleColor }}>Venc: {formatDate(item.vencimento)} • Parc: {item.parcela}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: titleColor }}>{formatCurrency(item.valor)}</div>
                                    <div style={{ fontSize: '11px', color: item.status === 'pago' ? '#22c55e' : (item.status === 'atrasado' ? '#ef4444' : '#f59e0b') }}>
                                        {item.status === 'pago' ? 'Pago' : (item.status === 'atrasado' ? 'Atrasado' : 'Pendente')}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
    };

    return (
        <div style={{
            background: isDark ? cardBg : `linear-gradient(to bottom, ${cardBg} 0%, #fafafa 100%)`,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: isDark ? shadowDark : shadowLight,
            transition: 'all 0.3s ease'
        }}>
            {/* Header with Tabs */}
            <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={20} style={{ color: '#8b5cf6' }} />
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: titleColor, letterSpacing: '-0.02em' }}>
                            Visão Geral Inteligente
                        </h3>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['todas', 'entradas', 'saidas', 'crediario'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={tabStyle(activeTab === tab)}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters Row */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {renderFilters()}
                </div>
            </div>

            {/* Main Content */}
            {renderContent()}
        </div>
    );
}

export default IntelligentOverviewCard;
