import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import './Pedidos.css';

function Pedidos() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState('todos');

    useEffect(() => {
        carregarPedidos();
    }, [filtroStatus]);

    const carregarPedidos = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filtroStatus !== 'todos') params.status = filtroStatus;

            const response = await api.get('/pedidos', { params });
            setPedidos(response.data);
        } catch (error) {
            showToast('Erro ao carregar pedidos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            producao: { class: 'badge-primary', icon: '⚙️', text: 'Em Produção' },
            pronto: { class: 'badge-info', icon: '✅', text: 'Pronto' },
            entregue: { class: 'badge-success', icon: '📦', text: 'Entregue' },
            cancelado: { class: 'badge-danger', icon: '❌', text: 'Cancelado' }
        };
        return badges[status] || badges.producao;
    };

    const calcularMargem = (pedido) => {
        const total = parseFloat(pedido.total) || 0;
        const custoTotal = parseFloat(pedido.custoTotal) || 0;
        return total - custoTotal;
    };

    const calcularPercentualMargem = (pedido) => {
        const total = parseFloat(pedido.total) || 0;
        if (total === 0) return 0;
        const margem = calcularMargem(pedido);
        return (margem / total) * 100;
    };

    return (
        <div className="pedidos-container">
            <div className="page-header">
                <h1>📦 Pedidos em Produção</h1>
            </div>

            {/* Filtros */}
            <div className="filtros-bar">
                <div className="filtro-tabs">
                    <button
                        className={filtroStatus === 'todos' ? 'active' : ''}
                        onClick={() => setFiltroStatus('todos')}
                    >
                        Todos
                    </button>
                    <button
                        className={filtroStatus === 'producao' ? 'active' : ''}
                        onClick={() => setFiltroStatus('producao')}
                    >
                        ⚙️ Em Produção
                    </button>
                    <button
                        className={filtroStatus === 'pronto' ? 'active' : ''}
                        onClick={() => setFiltroStatus('pronto')}
                    >
                        ✅ Prontos
                    </button>
                    <button
                        className={filtroStatus === 'entregue' ? 'active' : ''}
                        onClick={() => setFiltroStatus('entregue')}
                    >
                        📦 Entregues
                    </button>
                </div>
            </div>

            {/* Lista de Pedidos */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Carregando pedidos...</p>
                </div>
            ) : pedidos.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>Nenhum pedido encontrado</h3>
                    <p>Os pedidos aparecem aqui quando orçamentos são aprovados</p>
                </div>
            ) : (
                <div className="pedidos-list">
                    {pedidos.map(pedido => {
                        const badge = getStatusBadge(pedido.status);
                        const margem = calcularMargem(pedido);
                        const percentualMargem = calcularPercentualMargem(pedido);

                        return (
                            <div key={pedido.id} className="pedido-card">
                                <div className="card-header">
                                    <div className="card-info">
                                        <h3>{pedido.numero}</h3>
                                        <span className={`status-badge ${badge.class}`}>
                                            {badge.icon} {badge.text}
                                        </span>
                                    </div>
                                    <div className="card-meta">
                                        <div className="meta-item">
                                            <strong>Orçamento:</strong> {pedido.orcamento?.numero}
                                        </div>
                                        <div className="meta-item">
                                            <strong>Criado em:</strong> {new Date(pedido.dataCriacao).toLocaleDateString('pt-BR')}
                                        </div>
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="info-section">
                                        <div className="info-row">
                                            <strong>Cliente:</strong>
                                            <span>{pedido.cliente?.nome || '🛒 Balcão'}</span>
                                        </div>
                                        <div className="info-row">
                                            <strong>Itens:</strong>
                                            <span>{pedido.itens?.length || 0} {pedido.itens?.length === 1 ? 'item' : 'itens'}</span>
                                        </div>
                                    </div>

                                    <div className="financeiro-section">
                                        <div className="financeiro-row">
                                            <span>Faturamento:</span>
                                            <strong className="valor-positivo">R$ {parseFloat(pedido.total).toFixed(2)}</strong>
                                        </div>
                                        <div className="financeiro-row">
                                            <span>Custo Total:</span>
                                            <strong className="valor-negativo">R$ {parseFloat(pedido.custoTotal || 0).toFixed(2)}</strong>
                                        </div>
                                        <div className="financeiro-row destaque">
                                            <span>💰 Margem Real:</span>
                                            <strong className={margem >= 0 ? 'margem-positiva' : 'margem-negativa'}>
                                                R$ {margem.toFixed(2)} ({percentualMargem.toFixed(1)}%)
                                            </strong>
                                        </div>
                                    </div>

                                    {pedido.dataEntrega && (
                                        <div className="entrega-info">
                                            <strong>📅 Entrega prevista:</strong>
                                            <span>{new Date(pedido.dataEntrega).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="card-actions">
                                    <button
                                        className="btn-action btn-details"
                                        onClick={() => navigate(`/pedidos/${pedido.id}`)}
                                    >
                                        📋 Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Pedidos;
