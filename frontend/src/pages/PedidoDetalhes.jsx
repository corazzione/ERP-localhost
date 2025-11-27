import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import './PedidoDetalhes.css';

function PedidoDetalhes() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [pedido, setPedido] = useState(null);
    const [loading, setLoading] = useState(true);

    // Form para novo custo
    const [showCustoForm, setShowCustoForm] = useState(false);
    const [novoCusto, setNovoCusto] = useState({
        tipo: 'material',
        descricao: '',
        valor: ''
    });

    // Estado para edição de custos  
    const [editingCustoId, setEditingCustoId] = useState(null);
    const [editCustoData, setEditCustoData] = useState({
        tipo: '',
        descricao: '',
        valor: ''
    });

    useEffect(() => {
        carregarPedido();
    }, [id]);

    const carregarPedido = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/pedidos/${id}`);
            setPedido(response.data);
        } catch (error) {
            showToast('Erro ao carregar pedido', 'error');
            navigate('/pedidos');
        } finally {
            setLoading(false);
        }
    };

    const adicionarCusto = async (e) => {
        e.preventDefault();

        if (!novoCusto.descricao || !novoCusto.valor || parseFloat(novoCusto.valor) <= 0) {
            showToast('Preencha todos os campos corretamente', 'error');
            return;
        }

        try {
            await api.post(`/pedidos/${id}/custos`, novoCusto);
            showToast('Custo adicionado com sucesso', 'success');
            setNovoCusto({ tipo: 'material', descricao: '', valor: '' });
            setShowCustoForm(false);
            carregarPedido();
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao adicionar custo', 'error');
        }
    };

    const iniciarEdicaoCusto = (custo) => {
        setEditingCustoId(custo.id);
        setEditCustoData({
            tipo: custo.tipo,
            descricao: custo.descricao,
            valor: custo.valor
        });
    };

    const salvarEdicaoCusto = async () => {
        if (!editCustoData.descricao || !editCustoData.valor || parseFloat(editCustoData.valor) <= 0) {
            showToast('Preencha todos os campos corretamente', 'error');
            return;
        }

        try {
            await api.put(`/pedidos/custos/${editingCustoId}`, editCustoData);
            showToast('Custo atualizado com sucesso', 'success');
            setEditingCustoId(null);
            carregarPedido();
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao atualizar custo', 'error');
        }
    };

    const cancelarEdicao = () => {
        setEditingCustoId(null);
        setEditCustoData({ tipo: '', descricao: '', valor: '' });
    };

    const removerCusto = async (custoId) => {
        if (!window.confirm('Deseja remover este custo?')) return;

        try {
            await api.delete(`/pedidos/custos/${custoId}`);
            showToast('Custo removido', 'success');
            carregarPedido();
        } catch (error) {
            showToast('Erro ao remover custo', 'error');
        }
    };

    const atualizarStatus = async (novoStatus) => {
        try {
            await api.put(`/pedidos/${id}/status`, { status: novoStatus });
            showToast('Status atualizado', 'success');
            carregarPedido();
        } catch (error) {
            showToast('Erro ao atualizar status', 'error');
        }
    };

    const finalizarPedido = async () => {
        if (!window.confirm('Deseja finalizar este pedido? Isso criará uma venda e registrará entrada no caixa.')) {
            return;
        }

        const formaPagamento = prompt('Forma de pagamento (dinheiro/cartao/pix):');
        if (!formaPagamento) return;

        try {
            await api.post(`/pedidos/${id}/finalizar`, { formaPagamento });
            showToast('Pedido finalizado! Venda criada com sucesso.', 'success');
            navigate('/pedidos');
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao finalizar pedido', 'error');
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando pedido...</p>
            </div>
        );
    }

    if (!pedido) return null;

    const margem = parseFloat(pedido.total) - (parseFloat(pedido.custoTotal) || 0);
    const percentualMargem = (margem / parseFloat(pedido.total)) * 100;

    return (
        <div className="pedido-detalhes-container">
            <div className="page-header">
                <div>
                    <button className="btn-back" onClick={() => navigate('/pedidos')}>
                        ← Voltar
                    </button>
                    <h1>{pedido.numero}</h1>
                    <select
                        value={pedido.status}
                        onChange={(e) => atualizarStatus(e.target.value)}
                        className="status-selector"
                        disabled={pedido.status === 'entregue'}
                    >
                        <option value="producao">⚙️ Em Produção</option>
                        <option value="pronto">✅ Pronto</option>
                        <option value="entregue">📦 Entregue</option>
                    </select>
                </div>
            </div>

            <div className="detalhes-grid">
                {/* Informações do Pedido */}
                <div className="card info-card">
                    <h2>📋 Informações</h2>
                    <div className="info-list">
                        <div className="info-item">
                            <strong>Cliente:</strong>
                            <span>{pedido.cliente?.nome || '🛒 Balcão'}</span>
                        </div>
                        <div className="info-item">
                            <strong>Orçamento:</strong>
                            <span>{pedido.orcamento?.numero}</span>
                        </div>
                        <div className="info-item">
                            <strong>Data Criação:</strong>
                            <span>{new Date(pedido.dataCriacao).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {pedido.dataEntrega && (
                            <div className="info-item">
                                <strong>Entrega Prevista:</strong>
                                <span>{new Date(pedido.dataEntrega).toLocaleDateString('pt-BR')}</span>
                            </div>
                        )}
                        {pedido.observacoes && (
                            <div className="info-item full-width">
                                <strong>Observações:</strong>
                                <span className="observacoes-text">{pedido.observacoes}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Itens do Pedido */}
                <div className="card itens-card">
                    <h2>📦 Itens</h2>
                    <div className="itens-table">
                        {pedido.itens?.map((item, index) => (
                            <div key={index} className="item-row">
                                <div className="item-info">
                                    <strong>{item.descricao}</strong>
                                    {item.especificacoes && (
                                        <small>{item.especificacoes}</small>
                                    )}
                                </div>
                                <div className="item-valores">
                                    <span className="quantidade">{item.quantidade}x</span>
                                    <span className="preco">R$ {parseFloat(item.precoUnit).toFixed(2)}</span>
                                    <strong className="subtotal">R$ {parseFloat(item.subtotal).toFixed(2)}</strong>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Financeiro */}
                <div className="card financeiro-card">
                    <h2>💰 Financeiro</h2>
                    <div className="valores-list">
                        <div className="valor-row">
                            <span>Subtotal:</span>
                            <strong>R$ {parseFloat(pedido.subtotal).toFixed(2)}</strong>
                        </div>
                        {parseFloat(pedido.desconto) > 0 && (
                            <div className="valor-row">
                                <span>Desconto:</span>
                                <strong className="negativo">- R$ {parseFloat(pedido.desconto).toFixed(2)}</strong>
                            </div>
                        )}
                        <div className="valor-row total">
                            <span>Total:</span>
                            <strong>R$ {parseFloat(pedido.total).toFixed(2)}</strong>
                        </div>
                        <div className="separador"></div>
                        <div className="valor-row">
                            <span>Custo Material:</span>
                            <strong className="custo">R$ {parseFloat(pedido.custoMaterial || 0).toFixed(2)}</strong>
                        </div>
                        <div className="valor-row">
                            <span>Custo Mão de Obra:</span>
                            <strong className="custo">R$ {parseFloat(pedido.custoMaoObra || 0).toFixed(2)}</strong>
                        </div>
                        <div className="valor-row">
                            <span>Custo Total:</span>
                            <strong className="custo-total">R$ {parseFloat(pedido.custoTotal || 0).toFixed(2)}</strong>
                        </div>
                        <div className="separador"></div>
                        <div className="valor-row margem">
                            <span>💰 Margem Real:</span>
                            <strong className={margem >= 0 ? 'margem-positiva' : 'margem-negativa'}>
                                R$ {margem.toFixed(2)} ({percentualMargem.toFixed(1)}%)
                            </strong>
                        </div>
                    </div>
                </div>

                {/* Custos de Produção */}
                <div className="card custos-card">
                    <div className="card-header-actions">
                        <h2>📊 Custos de Produção</h2>
                        {pedido.status !== 'entregue' && (
                            <button
                                className="btn-add-custo"
                                onClick={() => setShowCustoForm(!showCustoForm)}
                            >
                                + Adicionar Custo
                            </button>
                        )}
                    </div>

                    {showCustoForm && (
                        <form onSubmit={adicionarCusto} className="custo-form">
                            <select
                                value={novoCusto.tipo}
                                onChange={(e) => setNovoCusto({ ...novoCusto, tipo: e.target.value })}
                                className="form-control"
                                required
                            >
                                <option value="material">💎 Material</option>
                                <option value="mao_obra">👷 Mão de Obra</option>
                                <option value="terceiros">🤝 Terceiros</option>
                                <option value="outros">📦 Outros</option>
                            </select>

                            <input
                                type="text"
                                placeholder="Descrição do custo"
                                value={novoCusto.descricao}
                                onChange={(e) => setNovoCusto({ ...novoCusto, descricao: e.target.value })}
                                className="form-control"
                                required
                            />

                            <input
                                type="number"
                                step="0.01"
                                placeholder="Valor (R$)"
                                value={novoCusto.valor}
                                onChange={(e) => setNovoCusto({ ...novoCusto, valor: e.target.value })}
                                className="form-control"
                                required
                            />

                            <div className="form-actions">
                                <button type="submit" className="btn-primary">Salvar</button>
                                <button type="button" className="btn-secondary" onClick={() => setShowCustoForm(false)}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="custos-list">
                        {pedido.custos?.length === 0 ? (
                            <div className="empty-custos">
                                <p>Nenhum custo lançado ainda</p>
                            </div>
                        ) : (
                            pedido.custos?.map(custo => (
                                <div key={custo.id} className="custo-item">
                                    {editingCustoId === custo.id ? (
                                        // Modo de edição
                                        <div className="custo-edit-form">
                                            <select
                                                value={editCustoData.tipo}
                                                onChange={(e) => setEditCustoData({ ...editCustoData, tipo: e.target.value })}
                                                className="form-control-small"
                                            >
                                                <option value="material">💎 Material</option>
                                                <option value="mao_obra">👷 Mão de Obra</option>
                                                <option value="terceiros">🤝 Terceiros</option>
                                                <option value="outros">📦 Outros</option>
                                            </select>

                                            <input
                                                type="text"
                                                value={editCustoData.descricao}
                                                onChange={(e) => setEditCustoData({ ...editCustoData, descricao: e.target.value })}
                                                className="form-control-small"
                                                placeholder="Descrição"
                                            />

                                            <input
                                                type="number"
                                                step="0.01"
                                                value={editCustoData.valor}
                                                onChange={(e) => setEditCustoData({ ...editCustoData, valor: e.target.value })}
                                                className="form-control-small"
                                                placeholder="Valor"
                                                style={{ width: '100px' }}
                                            />

                                            <div className="edit-actions">
                                                <button className="btn-save-edit" onClick={salvarEdicaoCusto} type="button">
                                                    ✓
                                                </button>
                                                <button className="btn-cancel-edit" onClick={cancelarEdicao} type="button">
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // Modo de visualização
                                        <>
                                            <div className="custo-info">
                                                <div className="custo-header">
                                                    <span className={`tipo-badge tipo-${custo.tipo}`}>
                                                        {custo.tipo === 'material' && '💎'}
                                                        {custo.tipo === 'mao_obra' && '👷'}
                                                        {custo.tipo === 'terceiros' && '🤝'}
                                                        {custo.tipo === 'outros' && '📦'}
                                                        {' '}{custo.tipo.replace('_', ' ')}
                                                    </span>
                                                    <span className="custo-data">
                                                        {new Date(custo.data).toLocaleDateString('pt-BR')}
                                                    </span>
                                                </div>
                                                <div className="custo-descricao">{custo.descricao}</div>
                                                <div className="custo-usuario">Por: {custo.usuario?.nome}</div>
                                            </div>
                                            <div className="custo-valor-actions">
                                                <strong className="custo-valor">R$ {parseFloat(custo.valor).toFixed(2)}</strong>
                                                {pedido.status !== 'entregue' && (
                                                    <div className="action-buttons">
                                                        <button
                                                            className="btn-edit-custo"
                                                            onClick={() => iniciarEdicaoCusto(custo)}
                                                            title="Editar custo"
                                                        >
                                                            ✏️
                                                        </button>
                                                        <button
                                                            className="btn-remove-custo"
                                                            onClick={() => removerCusto(custo.id)}
                                                            title="Remover custo"
                                                        >
                                                            🗑️
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Ações Finais */}
            {pedido.status !== 'entregue' && (
                <div className="actions-bar">
                    <button
                        className="btn-finalizar"
                        onClick={finalizarPedido}
                        disabled={pedido.status !== 'pronto'}
                    >
                        {pedido.status === 'pronto'
                            ? '🎉 Finalizar Pedido e Criar Venda'
                            : '⚠️ Marque como "Pronto" para finalizar'
                        }
                    </button>
                </div>
            )}

            {pedido.status === 'entregue' && pedido.venda && (
                <div className="venda-info-bar">
                    <strong>✅ Pedido Finalizado</strong>
                    <span>Venda: {pedido.venda.numero} • Data: {new Date(pedido.venda.dataVenda).toLocaleDateString('pt-BR')}</span>
                </div>
            )}
        </div>
    );
}

export default PedidoDetalhes;
