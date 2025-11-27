import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import api from '../services/api';
import KPICard from '../components/KPICard';
import Card from '../components/Card';
import Tabs from '../components/Tabs';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useTheme } from '../contexts/ThemeContext';

function FinanceiroDashboard() {
    const { isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        saldoCaixa: 25890.50,
        totalReceber: 48320.00,
        totalPagar: 22140.00,
        saldoProjetado: 52070.50
    });

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
            // Mock data - será substituído por API
            setTimeout(() => setLoading(false), 500);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            setLoading(false);
        }
    };

    const kpiData = [
        {
            title: 'Saldo em Caixa/Bancos',
            value: `R$ ${stats.saldoCaixa.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: Wallet,
            color: '#3b82f6',
            trend: 'up',
            trendValue: '+15,2%'
        },
        {
            title: 'A Receber',
            value: `R$ ${stats.totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: TrendingUp,
            color: '#10b981',
            subtitle: 'Próximos 30 dias'
        },
        {
            title: 'A Pagar',
            value: `R$ ${stats.totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: TrendingDown,
            color: '#ef4444',
            subtitle: 'Próximos 30 dias'
        },
        {
            title: 'Saldo Projetado',
            value: `R$ ${stats.saldoProjetado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: '#8b5cf6',
            trend: 'up',
            trendValue: '+8,7%'
        }
    ];

    // Mock data para as tabelas
    const contasReceber = [
        { id: 1, cliente: 'João Silva', vencimento: '2024-12-01', valor: 450.00, status: 'aberta' },
        { id: 2, cliente: 'Maria Santos', vencimento: '2024-12-05', valor: 1200.00, status: 'aberta' },
        { id: 3, cliente: 'Pedro Costa', vencimento: '2024-11-28', valor: 850.00, status: 'vencida' }
    ];

    const contasPagar = [
        { id: 1, fornecedor: 'Fornecedor A', vencimento: '2024-12-02', valor: 2500.00, status: 'aberta' },
        { id: 2, fornecedor: 'Fornecedor B', vencimento: '2024-12-10', valor: 1800.00, status: 'aberta' }
    ];

    const columns = [
        {
            key: 'cliente',
            label: 'Cliente/Fornecedor',
            sortable: true,
            render: (value, row) => (
                <div style={{ fontWeight: '600' }}>{value || row.fornecedor}</div>
            )
        },
        {
            key: 'vencimento',
            label: 'Vencimento',
            sortable: true
        },
        {
            key: 'valor',
            label: 'Valor',
            sortable: true,
            align: 'right',
            render: (value) => `R$ ${value.toFixed(2)}`
        },
        {
            key: 'status',
            label: 'Status',
            sortable: false,
            align: 'center',
            render: (value) => (
                <Badge variant={value === 'vencida' ? 'danger' : 'warning'}>
                    {value === 'vencida' ? 'Vencida' : 'Aberta'}
                </Badge>
            )
        }
    ];

    const tabs = [
        {
            label: 'Contas a Receber',
            icon: TrendingUp,
            badge: contasReceber.length,
            content: (
                <DataTable
                    columns={columns}
                    data={contasReceber}
                    emptyMessage="Nenhuma conta a receber"
                />
            )
        },
        {
            label: 'Contas a Pagar',
            icon: TrendingDown,
            badge: contasPagar.length,
            content: (
                <DataTable
                    columns={columns}
                    data={contasPagar}
                    emptyMessage="Nenhuma conta a pagar"
                />
            )
        }
    ];

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <DollarSign size={32} color="#3b82f6" />
                    <div>
                        <h1 className="page-title">Financeiro</h1>
                        <p className="page-subtitle">Visão geral financeira do negócio</p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.5rem',
                marginBottom: '1.5rem'
            }}>
                {kpiData.map((kpi, index) => (
                    <KPICard key={index} {...kpi} />
                ))}
            </div>

            {/* Contas Tabs */}
            <Card title="Contas Próximas" subtitle="Contas com vencimento próximo">
                <Tabs tabs={tabs} />
            </Card>
        </div>
    );
}

export default FinanceiroDashboard;
