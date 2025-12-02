import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import { TrendingUp, TrendingDown, DollarSign, Calendar, User, Package, CreditCard, Banknote, BarChart3 } from 'lucide-react';

function DonutMovementChart({ data }) {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('all');

    const cardBg = isDark ? '#1e293b' : '#ffffff';
    const borderColor = isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(148, 163, 184, 0.1)';
    const titleColor = isDark ? '#f8fafc' : '#0f172a';
    const subtitleColor = isDark ? '#94a3b8' : '#64748b';
    const shadowLight = '0 2px 8px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)';
    const shadowDark = '0 8px 16px rgba(0,0,0,0.4), 0 2px 6px rgba(0,0,0,0.3)';

    const COLORS = {
        entradas: '#22d67e',
        saidas: '#ff8f3e',
        crediario: '#14d4f4'
    };

    const chartData = [
        { name: 'Entradas', value: data.entradas, color: COLORS.entradas },
        { name: 'Saídas', value: data.saidas, color: COLORS.saidas },
        { name: 'Crediário', value: data.crediario, color: COLORS.crediario }
    ];

    const getFilteredData = () => {
        switch (activeTab) {
            case 'entradas': return [chartData[0]];
            case 'saidas': return [chartData[1]];
            case 'crediario': return [chartData[2]];
            default: return chartData;
        }
    };

    const filteredData = getFilteredData();

    const tabs = [
        { id: 'all', label: 'Todas' },
        { id: 'entradas', label: 'Entradas' },
        { id: 'saidas', label: 'Saídas' },
        { id: 'crediario', label: 'Crediário' }
    ];

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

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    const StatCard = ({ icon: Icon, label, value, trend, color }) => (
        <div style={{
            padding: '10px',
            background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
            borderRadius: '8px',
            border: `1px solid ${borderColor}`
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '6px'
            }}>
                <Icon size={13} style={{ color: color || subtitleColor }} />
                <span style={{
                    fontSize: '10px',
                    fontWeight: '600',
                    color: subtitleColor,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {label}
                </span>
            </div>
            <div style={{
                fontSize: '17px',
                fontWeight: '700',
                color: titleColor,
                marginBottom: trend ? '3px' : '0'
            }}>
                {value}
            </div>
            {trend && (
                <div style={{
                    fontSize: '10px',
                    color: subtitleColor
                }}>
                    {trend}
                </div>
            )}
        </div>
    );

    const renderDetails = () => {
        const detalhes = data.detalhes || {};

        // Tab "TODAS" - Resumo Geral
        if (activeTab === 'all') {
            const resumo = detalhes.resumoGeral || {};

            return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {/* Legend */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        marginBottom: '8px',
                        paddingBottom: '12px',
                        borderBottom: `1px solid ${borderColor}`
                    }}>
                        {filteredData.map((item) => (
                            <div key={item.name} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px',
                                background: isDark ? 'rgba(15, 23, 42, 0.4)' : 'rgba(248, 250, 252, 0.8)',
                                borderRadius: '8px'
                            }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: item.color,
                                    flexShrink: 0
                                }} />
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flex: 1
                                }}>
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: '500',
                                        color: subtitleColor
                                    }}>
                                        {item.name}
                                    </span>
                                    <span style={{
                                        fontSize: '13px',
                                        fontWeight: '700',
                                        color: titleColor,
                                        fontFeatureSettings: '"tnum"'
                                    }}>
                                        {formatCurrency(item.value)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h4 style={{
                        margin: '0 0 8px 0',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: titleColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <BarChart3 size={14} style={{ color: '#8b5cf6' }} />
                        Resumo Financeiro
                    </h4>

                    <StatCard
                        icon={DollarSign}
                        label="Total Movimentado"
                        value={formatCurrency(resumo.totalMovimentado)}
                        color={COLORS.entradas}
                    />

                    {resumo.maiorEntrada && (
                        <StatCard
                            icon={TrendingUp}
                            label="Maior Entrada"
                            value={formatCurrency(resumo.maiorEntrada.valor)}
                            trend={`${formatDate(resumo.maiorEntrada.data)} - ${resumo.maiorEntrada.descricao}`}
                            color={COLORS.entradas}
                        />
                    )}

                    {resumo.maiorSaida && (
                        <StatCard
                            icon={TrendingDown}
                            label="Maior Saída"
                            value={formatCurrency(resumo.maiorSaida.valor)}
                            trend={`${formatDate(resumo.maiorSaida.data)} - ${resumo.maiorSaida.descricao}`}
                            color={COLORS.saidas}
                        />
                    )}

                    {resumo.crediarioAtivo && (
                        <StatCard
                            icon={CreditCard}
                            label="Crediário Ativo"
                            value={`${resumo.crediarioAtivo.parcelas} parcelas`}
                            trend={formatCurrency(resumo.crediarioAtivo.valor)}
                            color={COLORS.crediario}
                        />
                    )}
                </div>
            );
        }

        // Tab "ENTRADAS" - Top Entradas
        if (activeTab === 'entradas') {
            const topEntradas = detalhes.topEntradas || [];

            return (
                <div>
                    <h4 style={{
                        margin: '0 0 10px 0',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: titleColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <Banknote size={14} style={{ color: COLORS.entradas }} />
                        Top 3 Maiores Entradas
                    </h4>

                    <div style={{
                        padding: '10px 12px',
                        background: isDark ? 'rgba(34, 214, 126, 0.1)' : 'rgba(34, 214, 126, 0.08)',
                        borderRadius: '8px',
                        marginBottom: '12px'
                    }}>
                        <div style={{ fontSize: '11px', color: subtitleColor, marginBottom: '3px' }}>
                            Total Recebido
                        </div>
                        <div style={{ fontSize: '20px', fontWeight: '700', color: COLORS.entradas }}>
                            {formatCurrency(data.entradas)}
                        </div>
                    </div>

                    {topEntradas.length === 0 ? (
                        <p style={{
                            margin: 0,
                            fontSize: '12px',
                            color: subtitleColor,
                            textAlign: 'center',
                            padding: '20px'
                        }}>
                            Nenhuma entrada no período
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {topEntradas.map((entrada, index) => (
                                <div key={index} style={{
                                    padding: '10px',
                                    background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#ffffff',
                                    borderRadius: '8px',
                                    border: `1px solid ${borderColor}`
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        marginBottom: '6px'
                                    }}>
                                        <span style={{
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: titleColor
                                        }}>
                                            {index + 1}. Venda #{entrada.numero.slice(-4)}
                                        </span>
                                        <span style={{
                                            fontSize: '14px',
                                            fontWeight: '700',
                                            color: COLORS.entradas
                                        }}>
                                            {formatCurrency(entrada.valor)}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontSize: '11px',
                                        color: subtitleColor,
                                        display: 'flex',
                                        gap: '8px'
                                    }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Calendar size={10} />
                                            {formatDate(entrada.data)}, {formatTime(entrada.data)}
                                        </span>
                                        <span>•</span>
                                        <span style={{ textTransform: 'capitalize' }}>
                                            {entrada.formaPagamento.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // Tab "SAÍDAS" - Últimas Saídas
        if (activeTab === 'saidas') {
            const ultimasSaidas = detalhes.ultimasSaidas || [];

            return (
                <div>
                    <h4 style={{
                        margin: '0 0 10px 0',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: titleColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <TrendingDown size={14} style={{ color: COLORS.saidas }} />
                        Últimas 3 Saídas
                    </h4>

                    {ultimasSaidas.length === 0 ? (
                        <p style={{
                            margin: 0,
                            fontSize: '12px',
                            color: subtitleColor,
                            textAlign: 'center',
                            padding: '20px'
                        }}>
                            Nenhuma saída no período
                        </p>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {ultimasSaidas.map((saida, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '10px',
                                    background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#ffffff',
                                    borderRadius: '8px',
                                    border: `1px solid ${borderColor}`
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            color: titleColor,
                                            marginBottom: '3px'
                                        }}>
                                            <Package size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                            {saida.descricao}
                                        </div>
                                        <div style={{
                                            fontSize: '11px',
                                            color: subtitleColor,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Calendar size={11} />
                                            {formatDate(saida.data)}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        color: COLORS.saidas
                                    }}>
                                        {formatCurrency(saida.valor)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }

        // Tab "CREDIÁRIO" - Controle de Juros
        if (activeTab === 'crediario') {
            const resumo = detalhes.resumoCrediario || {};

            return (
                <div>
                    <h4 style={{
                        margin: '0 0 10px 0',
                        fontSize: '13px',
                        fontWeight: '600',
                        color: titleColor,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <CreditCard size={14} style={{ color: COLORS.crediario }} />
                        Análise de Crediário
                    </h4>

                    {/* Destaque de Juros */}
                    <div style={{
                        padding: '14px',
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(34, 214, 126, 0.15) 0%, rgba(34, 214, 126, 0.05) 100%)'
                            : 'linear-gradient(135deg, rgba(34, 214, 126, 0.12) 0%, rgba(34, 214, 126, 0.03) 100%)',
                        borderRadius: '10px',
                        border: `1px solid ${COLORS.entradas}40`,
                        marginBottom: '12px'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            color: COLORS.entradas,
                            marginBottom: '6px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <DollarSign size={12} />
                            Juros Recebidos
                        </div>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: '700',
                            color: COLORS.entradas,
                            marginBottom: '6px'
                        }}>
                            {formatCurrency(resumo.jurosRecebidos)}
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: isDark ? '#4ade80' : '#16a34a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}>
                            <TrendingUp size={11} />
                            Lucro puro • Taxa média: {resumo.taxaMediaMensal?.toFixed(2)}% a.m.
                        </div>
                    </div>

                    {/* Resumo de Parcelas */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr',
                        gap: '8px',
                        marginBottom: '12px'
                    }}>
                        <div style={{
                            padding: '10px',
                            background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
                            borderRadius: '8px',
                            border: `1px solid ${borderColor}`,
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '10px', color: subtitleColor, marginBottom: '4px' }}>
                                Pagas
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: COLORS.entradas }}>
                                {resumo.parcelasPagas || 0}
                            </div>
                        </div>
                        <div style={{
                            padding: '10px',
                            background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
                            borderRadius: '8px',
                            border: `1px solid ${borderColor}`,
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '10px', color: subtitleColor, marginBottom: '4px' }}>
                                Pendentes
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: COLORS.crediario }}>
                                {resumo.quantidadeParcelas || 0}
                            </div>
                        </div>
                        <div style={{
                            padding: '10px',
                            background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#f8fafc',
                            borderRadius: '8px',
                            border: `1px solid ${borderColor}`,
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '10px', color: subtitleColor, marginBottom: '4px' }}>
                                Vencidas
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '700', color: COLORS.saidas }}>
                                {resumo.parcelasVencidas || 0}
                            </div>
                        </div>
                    </div>

                    {/* Próximas Parcelas */}
                    {resumo.parcelas && resumo.parcelas.length > 0 && (
                        <>
                            <div style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: subtitleColor,
                                marginBottom: '8px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }}>
                                Próximas a Vencer
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {resumo.parcelas.slice(0, 3).map((parcela, index) => (
                                    <div key={index} style={{
                                        padding: '10px',
                                        background: isDark ? 'rgba(15, 23, 42, 0.5)' : '#ffffff',
                                        borderRadius: '8px',
                                        border: `1px solid ${borderColor}`
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            marginBottom: '4px'
                                        }}>
                                            <div style={{
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                color: titleColor,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '4px'
                                            }}>
                                                <User size={10} />
                                                {parcela.cliente}
                                            </div>
                                            <div style={{
                                                fontSize: '12px',
                                                fontWeight: '700',
                                                color: titleColor
                                            }}>
                                                {formatCurrency(parcela.valorParcela)}
                                            </div>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            fontSize: '10px',
                                            color: subtitleColor
                                        }}>
                                            <span>Parcela {parcela.numeroParcela}</span>
                                            <span>Juros: {formatCurrency(parcela.juros)}</span>
                                        </div>
                                        <div style={{
                                            fontSize: '10px',
                                            color: subtitleColor,
                                            marginTop: '2px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <Calendar size={9} />
                                            Venc: {formatDate(parcela.vencimento)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            );
        }

        return null;
    };

    return (
        <div style={{
            background: isDark ? cardBg : `linear-gradient(to bottom, ${cardBg} 0%, #fafafa 100%)`,
            border: `1px solid ${borderColor}`,
            borderRadius: '12px',
            padding: '24px',
            boxShadow: isDark ? shadowDark : shadowLight,
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{ marginBottom: '20px', flexShrink: 0 }}>
                <h3 style={{
                    margin: '0 0 4px 0',
                    fontSize: '18px',
                    fontWeight: '600',
                    color: titleColor,
                    letterSpacing: '-0.02em'
                }}>
                    Panorama de Movimentações
                </h3>
                <p style={{
                    margin: '0 0 16px 0',
                    fontSize: '13px',
                    fontWeight: '400',
                    color: subtitleColor
                }}>
                    Visão geral financeira
                </p>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    gap: '6px',
                    padding: '4px',
                    background: isDark ? '#1a2332' : '#f1f5f9',
                    borderRadius: '10px'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                padding: '8px 12px',
                                fontSize: '12px',
                                fontWeight: '600',
                                border: 'none',
                                borderRadius: '8px',
                                background: activeTab === tab.id
                                    ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
                                    : 'transparent',
                                color: activeTab === tab.id
                                    ? '#ffffff'
                                    : isDark ? '#64748b' : '#64748b',
                                cursor: 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                letterSpacing: '-0.01em',
                                boxShadow: activeTab === tab.id
                                    ? '0 3px 10px rgba(139, 92, 246, 0.4)'
                                    : 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== tab.id) {
                                    e.currentTarget.style.background = isDark ? 'rgba(100, 116, 139, 0.15)' : 'rgba(100, 116, 139, 0.1)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (activeTab !== tab.id) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2-Column Layout: Donut (left) + Details (right) */}
            <div style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                gap: '20px',
                minHeight: 0
            }}>
                {/* Left Column: Donut + Legend */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    minWidth: '200px'
                }}>
                    {/* Donut */}
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart
                            style={{
                                overflow: 'visible',
                                filter: isDark ? 'drop-shadow(0 0 8px rgba(139, 92, 246, 0.15))' : 'none'
                            }}
                            wrapperStyle={{ overflow: 'visible' }}
                        >
                            <defs>
                                <filter id="donutGlow">
                                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            <Pie
                                data={filteredData}
                                cx="50%"
                                cy="50%"
                                innerRadius="72%"
                                outerRadius="90%"
                                paddingAngle={1.5}
                                dataKey="value"
                                startAngle={90}
                                endAngle={450}
                                stroke={isDark ? cardBg : '#ffffff'}
                                strokeWidth={0}
                            >
                                {filteredData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        style={{
                                            filter: isDark ? 'brightness(1.15) saturate(1.1)' : 'brightness(1.05)',
                                            transition: 'all 0.3s ease',
                                            shapeRendering: 'geometricPrecision'
                                        }}
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>

                </div>

                {/* Right Column: Details (scrollable) */}
                <div style={{
                    overflowY: 'auto',
                    overflowX: 'visible',
                    paddingRight: '12px',
                    maxHeight: '100%',
                    minWidth: 0,
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'auto',
                    scrollbarColor: `${isDark ? '#8b5cf6' : '#a78bfa'} ${isDark ? '#1e293b' : '#f1f5f9'}`
                }}
                    className="custom-scrollbar"
                >
                    {renderDetails()}
                </div>
            </div>
        </div>
    );
}

export default DonutMovementChart;
