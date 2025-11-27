import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function Dashboard() {
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const response = await api.get('/dashboard');
            setDados(response.data);
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    const chartData = {
        labels: dados?.graficoVendas?.map(d => d.data) || [],
        datasets: [
            {
                label: 'Vendas Diárias',
                data: dados?.graficoVendas?.map(d => d.valor) || [],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: '#f1f5f9',
                },
            },
            x: {
                grid: {
                    display: false,
                },
            },
        },
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#0f172a', marginBottom: '4px' }}>
                    Dashboard
                </h1>
                <p style={{ fontSize: '14px', color: '#64748b' }}>
                    Visão geral do seu negócio
                </p>
            </div>

            {/* KPI Cards with Gradients */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
                <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 10px 20px -5px rgba(16, 185, 129, 0.3)',
                    color: 'white'
                }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', opacity: 0.9, marginBottom: '8px' }}>💰 Faturamento Mensal</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                        R$ {dados?.vendas?.faturamento?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.85 }}>
                        {dados?.vendas?.quantidade || 0} vendas realizadas
                    </div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.3)',
                    color: 'white'
                }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', opacity: 0.9, marginBottom: '8px' }}>📊 Ticket Médio</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                        R$ {dados?.vendas?.ticketMedio?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.85 }}>
                        Por venda realizada
                    </div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.3)',
                    color: 'white'
                }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', opacity: 0.9, marginBottom: '8px' }}>📥 A Receber Hoje</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                        R$ {dados?.financeiro?.receberHoje?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.85 }}>
                        Total Crediário: R$ {dados?.financeiro?.totalCrediario?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>

                <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    padding: '1.5rem',
                    borderRadius: '16px',
                    boxShadow: '0 10px 20px -5px rgba(245, 158, 11, 0.3)',
                    color: 'white'
                }}>
                    <div style={{ fontSize: '13px', fontWeight: '500', opacity: 0.9, marginBottom: '8px' }}>📤 A Pagar Hoje</div>
                    <div style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
                        R$ {dados?.financeiro?.pagarHoje?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.85 }}>
                        Vencimentos do dia
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.25rem' }}>
                {/* Chart Section */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '1.75rem',
                    borderRadius: '16px',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                    border: '1px solid #f1f5f9'
                }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '1.5rem' }}>
                        📈 Desempenho de Vendas
                    </h3>
                    <div style={{ height: '300px' }}>
                        <Line options={chartOptions} data={chartData} />
                    </div>
                </div>

                {/* Alerts & Top Products */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', width: '320px' }}>
                    {/* Alerts Card */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                        border: '1px solid #f1f5f9'
                    }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                            ⚠️ Atenção Necessária
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                backgroundColor: '#fef3c7',
                                borderRadius: '10px',
                                border: '1px solid #fde68a'
                            }}>
                                <span style={{ fontSize: '13px', fontWeight: '500', color: '#92400e' }}>Estoque Baixo</span>
                                <span style={{
                                    backgroundColor: 'white',
                                    color: '#d97706',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    border: '1px solid #fbbf24'
                                }}>
                                    {dados?.alertas?.produtosEstoqueBaixo || 0}
                                </span>
                            </div>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px',
                                backgroundColor: '#fee2e2',
                                borderRadius: '10px',
                                border: '1px solid #fecaca'
                            }}>
                                <span style={{ fontSize: '13px', fontWeight: '500', color: '#991b1b' }}>Parcelas Atrasadas</span>
                                <span style={{
                                    backgroundColor: 'white',
                                    color: '#dc2626',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: '700',
                                    border: '1px solid #f87171'
                                }}>
                                    {dados?.alertas?.parcelasAtrasadas || 0}
                                </span>
                            </div>
                            {dados?.alertas?.valorAtrasado > 0 && (
                                <div style={{ textAlign: 'center', paddingTop: '8px' }}>
                                    <span style={{ fontSize: '11px', color: '#dc2626', fontWeight: '600' }}>
                                        Total em atraso: R$ {dados.alertas.valorAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Top Products Card */}
                    <div style={{
                        backgroundColor: 'white',
                        padding: '1.5rem',
                        borderRadius: '16px',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
                        border: '1px solid #f1f5f9'
                    }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '1rem' }}>
                            🏆 Top Produtos
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            {dados?.topProdutos?.map((item, index) => (
                                <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '50%',
                                            background: index === 0 ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)' :
                                                index === 1 ? 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' :
                                                    index === 2 ? 'linear-gradient(135deg, #fb923c 0%, #ea580c 100%)' :
                                                        'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontSize: '11px',
                                            fontWeight: '700'
                                        }}>
                                            #{index + 1}
                                        </div>
                                        <span style={{
                                            fontSize: '13px',
                                            color: '#475569',
                                            fontWeight: '500',
                                            maxWidth: '150px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }} title={item.produto}>
                                            {item.produto}
                                        </span>
                                    </div>
                                    <span style={{
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        color: '#1e293b',
                                        backgroundColor: '#f1f5f9',
                                        padding: '4px 10px',
                                        borderRadius: '6px'
                                    }}>
                                        {item.quantidade} un
                                    </span>
                                </div>
                            ))}
                            {(!dados?.topProdutos || dados.topProdutos.length === 0) && (
                                <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>
                                    Nenhuma venda registrada
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
