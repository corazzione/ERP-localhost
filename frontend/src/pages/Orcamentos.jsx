import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import './Orcamentos.css';

function Orcamentos() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [orcamentos, setOrcamentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [filtroCliente, setFiltroCliente] = useState('');

    useEffect(() => {
        carregarOrcamentos();
    }, [filtroStatus]);

    const carregarOrcamentos = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filtroStatus !== 'todos') params.status = filtroStatus;

            const response = await api.get('/orcamentos', { params });
            setOrcamentos(response.data);
        } catch (error) {
            showToast('Erro ao carregar orçamentos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const aprovarOrcamento = async (id) => {
        if (!window.confirm('Deseja aprovar este orçamento? Isso criará um pedido automaticamente.')) return;

        try {
            await api.post(`/orcamentos/${id}/aprovar`);
            showToast('Orçamento aprovado e pedido criado!', 'success');
            carregarOrcamentos();
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao aprovar orçamento', 'error');
        }
    };

    const recusarOrcamento = async (id) => {
        const motivo = window.prompt('Motivo da recusa (opcional):');
        if (motivo === null) return; // Cancelou

        try {
            await api.post(`/orcamentos/${id}/recusar`, { motivoRecusa: motivo || 'Não informado' });
            showToast('Orçamento recusado', 'success');
            carregarOrcamentos();
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao recusar orçamento', 'error');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pendente: { class: 'badge-warning', icon: '⏳', text: 'Pendente' },
            aprovado: { class: 'badge-success', icon: '✅', text: 'Aprovado' },
            recusado: { class: 'badge-danger', icon: '❌', text: 'Recusado' },
            expirado: { class: 'badge-secondary', icon: '⏰', text: 'Expirado' }
        };
        return badges[status] || badges.pendente;
    };

    const orcamentosFiltrados = orcamentos.filter(orc => {
        if (!filtroCliente) return true;
        return orc.cliente?.nome.toLowerCase().includes(filtroCliente.toLowerCase());
    });

    return (
        <div className="orcamentos-container">
            <div className="page-header">
                <h1>📋 Orçamentos</h1>
                <button
                    className="btn-primary"
                    onClick={() => navigate('/novo-orcamento')}
                >
                    + Novo Orçamento
                </button>
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
                        className={filtroStatus === 'pendente' ? 'active' : ''}
                        onClick={() => setFiltroStatus('pendente')}
                    >
                        ⏳ Pendentes
                    </button>
                    <button
                        className={filtroStatus === 'aprovado' ? 'active' : ''}
                        onClick={() => setFiltroStatus('aprovado')}
                    >
                        ✅ Aprovados
                    </button>
                    <button
                        className={filtroStatus === 'recusado' ? 'active' : ''}
                        onClick={() => setFiltroStatus('recusado')}
                    >
                        ❌ Recusados
                    </button>
                </div>

                <div className="filtro-search">
                    <input
                        type="text"
                        placeholder="🔍 Buscar por cliente..."
                        value={filtroCliente}
                        onChange={(e) => setFiltroCliente(e.target.value)}
                        className="search-input"
                    />
                </div>
            </div>

            {/* Lista de Orçamentos */}
            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Carregando orçamentos...</p>
                </div>
            ) : orcamentosFiltrados.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>Nenhum orçamento encontrado</h3>
                    <p>Comece criando um novo orçamento</p>
                    <button
                        className="btn-primary"
                        onClick={() => navigate('/novo-orcamento')}
                    >
                        + Criar Primeiro Orçamento
                    </button>
                </div>
            ) : (
                <div className="orcamentos-grid">
                    {orcamentosFiltrados.map(orc => {
                        const badge = getStatusBadge(orc.status);
                        return (
                            <div key={orc.id} className="orcamento-card">
                                <div className="card-header">
                                    <div className="card-info">
                                        <h3>{orc.numero}</h3>
                                        <span className={`status-badge ${badge.class}`}>
                                            {badge.icon} {badge.text}
                                        </span>
                                    </div>
                                    <div className="card-date">
                                        {new Date(orc.dataEmissao).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>

                                <div className="card-body">
                                    <div className="info-row">
                                        <strong>Cliente:</strong>
                                        <span>{orc.cliente?.nome || '🛒 Balcão'}</span>
                                    </div>

                                    <div className="info-row">
                                        <strong>Itens:</strong>
                                        <span>{orc.itens?.length || 0} {orc.itens?.length === 1 ? 'item' : 'itens'}</span>
                                    </div>

                                    <div className="info-row total-row">
                                        <strong>Total:</strong>
                                        <span className="total-value">
                                            R$ {parseFloat(orc.total).toFixed(2)}
                                        </span>
                                    </div>

                                    {orc.validadeAte && (
                                        <div className="info-row validade">
                                            <strong>Válido até:</strong>
                                            <span>{new Date(orc.validadeAte).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    )}

                                    {orc.observacoes && (
                                        <div className="observacoes">
                                            <em>{orc.observacoes}</em>
                                        </div>
                                    )}
                                </div>

                                <div className="card-actions">
                                    {orc.status === 'pendente' && (
                                        <>
                                            <button
                                                className="btn-action btn-approve"
                                                onClick={() => aprovarOrcamento(orc.id)}
                                            >
                                                ✅ Aprovar
                                            </button>
                                            <button
                                                className="btn-action btn-reject"
                                                onClick={() => recusarOrcamento(orc.id)}
                                            >
                                                ❌ Recusar
                                            </button>
                                        </>
                                    )}
                                    {orc.status === 'aprovado' && orc.pedido && (
                                        <button
                                            className="btn-action btn-view-pedido"
                                            onClick={() => navigate(`/pedidos/${orc.pedido.id}`)}
                                        >
                                            📦 Ver Pedido
                                        </button>
                                    )}
                                    {orc.status === 'recusado' && orc.motivoRecusa && (
                                        <div className="motivo-recusa">
                                            <strong>Motivo:</strong> {orc.motivoRecusa}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Orcamentos;
