import { useState, useEffect } from 'react';
import api from '../services/api';

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
        return <div>Carregando...</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p style={{ color: 'var(--color-neutral-500)' }}>Visão geral do seu negócio</p>
            </div>

            <div className="metric-grid">
                <div className="metric-card">
                    <div className="metric-label">Faturamento do Mês</div>
                    <div className="metric-value" style={{ color: 'var(--color-positive-600)' }}>
                        R$ {dados?.vendas?.faturamento?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </div>
                    <div className="metric-change text-positive">
                        {dados?.vendas?.quantidade || 0} vendas realizadas
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-label">Ticket Médio</div>
                    <div className="metric-value">
                        R$ {dados?.vendas?.ticketMedio?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-label">Contas a Receber Hoje</div>
                    <div className="metric-value" style={{ color: 'var(--color-primary-600)' }}>
                        R$ {dados?.financeiro?.receberHoje?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-label">Contas a Pagar Hoje</div>
                    <div className="metric-value" style={{ color: 'var(--color-negative-600)' }}>
                        R$ {dados?.financeiro?.pagarHoje?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </div>
                </div>

                <div className="metric-card">
                    <div className="metric-label">Total a Receber (Crediário)</div>
                    <div className="metric-value" style={{ color: 'var(--color-warning-600)' }}>
                        R$ {dados?.financeiro?.totalCrediario?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Alertas</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="flex justify-between items-center">
                            <span>Produtos com estoque baixo</span>
                            <span className="badge badge-warning">
                                {dados?.alertas?.produtosEstoqueBaixo || 0}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Parcelas atrasadas</span>
                            <span className="badge badge-negative">
                                {dados?.alertas?.parcelasAtrasadas || 0}
                            </span>
                        </div>
                        {dados?.alertas?.valorAtrasado > 0 && (
                            <div className="flex justify-between items-center">
                                <span>Valor em atraso</span>
                                <span className="text-negative font-semibold">
                                    R$ {dados.alertas.valorAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Produtos Mais Vendidos</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {dados?.topProdutos?.map((item, index) => (
                            <div key={index} className="flex justify-between">
                                <span>{item.produto}</span>
                                <span className="font-semibold">{item.quantidade} un</span>
                            </div>
                        ))}
                        {(!dados?.topProdutos || dados.topProdutos.length === 0) && (
                            <p className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
                                Nenhuma venda registrada ainda
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
