import { useState, useEffect } from 'react';
import { Package, AlertTriangle, CheckCircle, TrendingUp, Plus, Edit } from 'lucide-react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';
import { useTheme } from '../contexts/ThemeContext';

function Estoque() {
    const { showToast } = useToast();
    const { isDark } = useTheme();
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, low, ok, high

    useEffect(() => {
        carregarEstoque();
    }, []);

    const carregarEstoque = async () => {
        try {
            setLoading(true);
            const response = await api.get('/produtos');
            const data = response.data.data || response.data;
            setProdutos(data);
        } catch (error) {
            console.error('Erro ao carregar estoque:', error);
            showToast('Erro ao carregar estoque', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStockStatus = (produto) => {
        const estoque = produto.estoque || 0;
        const estoqueMinimo = produto.estoqueMinimo || 10;

        if (estoque === 0) return { label: 'Zerado', variant: 'danger', icon: AlertTriangle };
        if (estoque <= estoqueMinimo) return { label: 'Baixo', variant: 'warning', icon: AlertTriangle };
        if (estoque > estoqueMinimo * 3) return { label: 'Alto', variant: 'info', icon: TrendingUp };
        return { label: 'Ok', variant: 'success', icon: CheckCircle };
    };

    const filteredProdutos = produtos.filter(p => {
        const status = getStockStatus(p);
        if (filter === 'low') return status.variant === 'warning' || status.variant === 'danger';
        if (filter === 'ok') return status.variant === 'success';
        if (filter === 'high') return status.variant === 'info';
        return true;
    });

    const stats = {
        total: produtos.length,
        low: produtos.filter(p => {
            const s = getStockStatus(p);
            return s.variant === 'warning' || s.variant === 'danger';
        }).length,
        ok: produtos.filter(p => getStockStatus(p).variant === 'success').length,
        high: produtos.filter(p => getStockStatus(p).variant === 'info').length
    };

    const columns = [
        {
            key: 'codigo',
            label: 'Código',
            sortable: true,
            render: (value) => (
                <div style={{ fontWeight: '600', fontFamily: 'monospace' }}>{value}</div>
            )
        },
        {
            key: 'nome',
            label: 'Produto',
            sortable: true
        },
        {
            key: 'estoque',
            label: 'Estoque Atual',
            sortable: true,
            align: 'center',
            render: (value, row) => {
                const status = getStockStatus(row);
                const Icon = status.icon;
                return (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                        <Icon size={16} color={
                            status.variant === 'danger' ? '#ef4444' :
                                status.variant === 'warning' ? '#f59e0b' :
                                    status.variant === 'success' ? '#10b981' : '#3b82f6'
                        } />
                        <span style={{ fontWeight: '700', fontSize: '16px' }}>{value || 0}</span>
                    </div>
                );
            }
        },
        {
            key: 'estoqueMinimo',
            label: 'Estoque Mínimo',
            sortable: true,
            align: 'center'
        },
        {
            key: 'status',
            label: 'Status',
            sortable: false,
            align: 'center',
            render: (value, row) => {
                const status = getStockStatus(row);
                return <Badge variant={status.variant}>{status.label}</Badge>;
            }
        }
    ];

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Package size={32} color="#3b82f6" />
                    <div>
                        <h1 className="page-title">Controle de Estoque</h1>
                        <p className="page-subtitle">Gerencie o inventário de produtos</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline">
                        <Edit size={18} />
                        Ajustar Estoque
                    </button>
                    <button className="btn btn-primary">
                        <Plus size={18} />
                        Inventário
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '1.5rem'
            }}>
                <div
                    onClick={() => setFilter('all')}
                    className="card"
                    style={{
                        padding: '1.25rem',
                        cursor: 'pointer',
                        border: filter === 'all' ? '2px solid #3b82f6' : undefined,
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>Total de Produtos</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>{stats.total}</div>
                </div>

                <div
                    onClick={() => setFilter('low')}
                    className="card"
                    style={{
                        padding: '1.25rem',
                        cursor: 'pointer',
                        border: filter === 'low' ? '2px solid #ef4444' : undefined,
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>Estoque Baixo</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>{stats.low}</div>
                </div>

                <div
                    onClick={() => setFilter('ok')}
                    className="card"
                    style={{
                        padding: '1.25rem',
                        cursor: 'pointer',
                        border: filter === 'ok' ? '2px solid #10b981' : undefined,
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>Estoque Ok</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{stats.ok}</div>
                </div>

                <div
                    onClick={() => setFilter('high')}
                    className="card"
                    style={{
                        padding: '1.25rem',
                        cursor: 'pointer',
                        border: filter === 'high' ? '2px solid #3b82f6' : undefined,
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '0.5rem' }}>Estoque Alto</div>
                    <div style={{ fontSize: '32px', fontWeight: '700', color: '#3b82f6' }}>{stats.high}</div>
                </div>
            </div>

            {/* Data Table */}
            <div className="card">
                <DataTable
                    columns={columns}
                    data={filteredProdutos}
                    emptyMessage="Nenhum produto encontrado"
                />
            </div>
        </div>
    );
}

export default Estoque;
