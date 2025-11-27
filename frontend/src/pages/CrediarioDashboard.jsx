import { useState, useEffect } from 'react';
import { CreditCard, TrendingUp, AlertCircle, Calendar, DollarSign } from 'lucide-react';
import api from '../services/api';
import KPICard from '../components/KPICard';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

function CrediarioDashboard() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAberto: 0,
        vencendoHoje: 0,
        vencendo7Dias: 0,
        atrasado: 0,
        taxaInadimplencia: 0
    });
    const [parcelas, setParcelas] = useState([]);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
            // Mock data - será substituído por API real
            setStats({
                totalAberto: 45890.50,
                vencendoHoje: 3200.00,
                vencendo7Dias: 8450.00,
                atrasado: 12340.00,
                taxaInadimplencia: 12.5
            });

            setParcelas([
                { id: 1, cliente: 'João Silva', numeroParcela: '3/12', valor: 250.00, vencimento: '2024-11-27', diasAtraso: 0, status: 'aberta' },
                { id: 2, cliente: 'Maria Santos', numeroParcela: '5/10', valor: 180.00, vencimento: '2024-11-25', diasAtraso: 2, status: 'atrasada' },
                { id: 3, cliente: 'Pedro Costa', numeroParcela: '2/6', valor: 320.00, vencimento: '2024-11-30', diasAtraso: 0, status: 'aberta' }
            ]);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            showToast('Erro ao carregar dados', 'error');
        } finally {
            setLoading(false);
        }
    };

    const kpiData = [
        {
            title: 'Total em Aberto',
            value: `R$ ${stats.totalAberto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: '#3b82f6',
            subtitle: 'Crediário ativo'
        },
        {
            title: 'Vencendo Hoje',
            value: `R$ ${stats.vencendoHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: Calendar,
            color: '#f59e0b'
        },
        {
            title: 'Próximos 7 Dias',
            value: `R$ ${stats.vencendo7Dias.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: TrendingUp,
            color: '#10b981'
        },
        {
            title: 'Atrasado',
            value: `R$ ${stats.atrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: AlertCircle,
            color: '#ef4444',
            trend: 'down',
            trendValue: '-8,3%'
        },
        {
            title: 'Taxa Inadimplência',
            value: `${stats.taxaInadimplencia}%`,
            icon: AlertCircle,
            color: '#ef4444'
        }
    ];

    const columns = [
        {
            key: 'cliente',
            label: 'Cliente',
            sortable: true,
            render: (value) => <div style={{ fontWeight: '600' }}>{value}</div>
        },
        {
            key: 'numeroParcela',
            label: 'Parcela',
            sortable: false,
            align: 'center'
        },
        {
            key: 'valor',
            label: 'Valor',
            sortable: true,
            align: 'right',
            render: (value) => `R$ ${value.toFixed(2)}`
        },
        {
            key: 'vencimento',
            label: 'Vencimento',
            sortable: true
        },
        {
            key: 'diasAtraso',
            label: 'Atraso',
            sortable: true,
            align: 'center',
            render: (value) => value > 0 ? (
                <span style={{ color: '#ef4444', fontWeight: '600' }}>{value} dias</span>
            ) : '-'
        },
        {
            key: 'status',
            label: 'Status',
            sortable: false,
            align: 'center',
            render: (value, row) => (
                <Badge variant={row.diasAtraso > 0 ? 'danger' : 'warning'}>
                    {row.diasAtraso > 0 ? 'Atrasada' : 'Aberta'}
                </Badge>
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
                    <CreditCard size={32} color="#3b82f6" />
                    <div>
                        <h1 className="page-title">Dashboard Crediário</h1>
                        <p className="page-subtitle">Gestão de parcelas e inadimplência</p>
                    </div>
                </div>
            </div>

            {/* KPI Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '1.5rem'
            }}>
                {kpiData.map((kpi, index) => (
                    <KPICard key={index} {...kpi} />
                ))}
            </div>

            {/* Parcelas Recentes */}
            <div className="card">
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>
                        Parcelas Vencendo
                    </h3>
                </div>
                <DataTable
                    columns={columns}
                    data={parcelas}
                    emptyMessage="Nenhuma parcela encontrada"
                />
            </div>
        </div>
    );
}

export default CrediarioDashboard;
