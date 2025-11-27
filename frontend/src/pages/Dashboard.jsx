import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../services/api';
import DashboardFilters from '../components/DashboardFilters';
import KPICard from '../components/KPICard';
import MainChart from '../components/MainChart';
import AlertsCard from '../components/AlertsCard';
import TopProductsCard from '../components/TopProductsCard';
import MovementsList from '../components/MovementsList';
import LoadingSpinner from '../components/LoadingSpinner';

function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [filters, setFilters] = useState({ period: 'month', store: 'all' });

    useEffect(() => {
        loadDashboardData();
    }, [filters]);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/dashboard', {
                params: filters
            });
            setDashboardData(response.data);
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    // Mock data (will be replaced with real API data)
    const kpiData = [
        {
            title: 'Faturamento',
            value: 'R$ 45.890,00',
            trend: 'up',
            trendValue: '+12,5%',
            icon: DollarSign,
            color: '#3b82f6',
            subtitle: 'Este mês'
        },
        {
            title: 'Ticket Médio',
            value: 'R$ 285,00',
            trend: 'up',
            trendValue: '+8,2%',
            icon: ShoppingCart,
            color: '#10b981'
        },
        {
            title: 'Nº de Vendas',
            value: '161',
            trend: 'up',
            trendValue: '+15,3%',
            icon: CreditCard,
            color: '#8b5cf6'
        },
        {
            title: 'A Receber',
            value: 'R$ 12.450,00',
            trend: 'down',
            trendValue: '-5,1%',
            icon: TrendingUp,
            color: '#f59e0b',
            subtitle: 'Próximos 7 dias'
        },
        {
            title: 'A Pagar',
            value: 'R$ 8.320,00',
            trend: 'up',
            trendValue: '+3,2%',
            icon: TrendingDown,
            color: '#ef4444',
            subtitle: 'Próximos 7 dias'
        }
    ];

    return (
        <div>
            {/* Global Filters */}
            <DashboardFilters onFilterChange={setFilters} />

            {/* Main Content */}
            <div style={{ padding: '1.5rem' }}>
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

                {/* Charts and Cards Row */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 350px',
                    gap: '1.5rem',
                    marginBottom: '1.5rem'
                }}>
                    {/* Main Chart */}
                    <MainChart />

                    {/* Right Sidebar Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <AlertsCard />
                        <TopProductsCard />
                    </div>
                </div>

                {/* Recent Movements */}
                <MovementsList />
            </div>
        </div>
    );
}

export default Dashboard;
