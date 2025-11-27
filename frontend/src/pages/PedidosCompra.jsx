import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

function PedidosCompra() {
    const { showToast } = useToast();
    const [loading, setLoading] = useState(true);
    const [pedidos, setPedidos] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);
    const [produtos, setProdutos] = useState([]);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
    const [selectedPedido, setSelectedPedido] = useState(null);

    // Form states
    const [novoPedido, setNovoPedido] = useState({
        fornecedorId: '',
        desconto: 0,
        observacoes: ''
    });
    const [itens, setItens] = useState([]);
    const [itemAtual, setItemAtual] = useState({
        produtoId: '',
        quantidade: 1,
        precoCusto: 0
    });

    const [filtros, setFiltros] = useState({
        status: '',
        fornecedorId: ''
    });

    useEffect(() => {
        carregarDados();
    }, [filtros]);

    const carregarDados = async () => {
        try {
            const [pedidosRes, fornecedoresRes, produtosRes] = await Promise.all([
                api.get('/pedidos-compra', { params: filtros }),
                api.get('/fornecedores'),
                api.get('/produtos')
            ]);

            // Todos endpoints podem retornar paginação
            setPedidos(pedidosRes.data.data || pedagidosRes.data);
            setFornecedores(fornecedoresRes.data.data || fornecedoresRes.data);
            setProdutos(produtosRes.data.data || produtosRes.data);
        } catch (error) {
            showToast('Erro ao carregar dados', 'error');
        } finally {
            setLoading(false);
        }
    };

    const adicionarItem = () => {
        if (!itemAtual.produtoId || itemAtual.quantidade < 1 || itemAtual.precoCusto <= 0) {
            showToast('Preencha todos os campos do item', 'error');
            return;
        }

        const produto = produtos.find(p => p.id === itemAtual.produtoId);
        const subtotal = itemAtual.quantidade * parseFloat(itemAtual.precoCusto);

        setItens([...itens, {
            ...itemAtual,
            produto,
            subtotal
        }]);

        setItemAtual({ produtoId: '', quantidade: 1, precoCusto: 0 });
    };

    const removerItem = (index) => {
        setItens(itens.filter((_, i) => i !== index));
    };

    const calcularTotais = () => {
        const subtotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
        const desconto = parseFloat(novoPedido.desconto) || 0;
        const total = subtotal - desconto;
        return { subtotal, desconto, total };
    };

    const criarPedido = async (e) => {
        e.preventDefault();

        if (itens.length === 0) {
            showToast('Adicione pelo menos um item', 'error');
            return;
        }

        try {
            const { subtotal, desconto, total } = calcularTotais();

            await api.post('/pedidos-compra', {
                ...novoPedido,
                itens: itens.map(item => ({
                    produtoId: item.produtoId,
                    quantidade: item.quantidade,
                    precoCusto: item.precoCusto
                })),
                subtotal,
                desconto,
                total
            });

            showToast('Pedido criado com sucesso', 'success');
            setIsModalOpen(false);
            resetForm();
            carregarDados();
        } catch (error) {
            showToast('Erro ao criar pedido', 'error');
        }
    };

    const receberPedido = async () => {
        if (!selectedPedido) return;

        try {
            await api.put(`/pedidos-compra/${selectedPedido.id}/receber`, {
                dataRecebimento: new Date().toISOString(),
                gerarContaPagar: true
            });

            showToast('Pedido recebido! Estoque atualizado e conta gerada', 'success');
            setIsReceiveModalOpen(false);
            setSelectedPedido(null);
            carregarDados();
        } catch (error) {
            showToast('Erro ao receber pedido', 'error');
        }
    };

    const cancelarPedido = async (id) => {
        if (!window.confirm('Deseja realmente cancelar este pedido?')) return;

        try {
            await api.delete(`/pedidos-compra/${id}/cancelar`);
            showToast('Pedido cancelado', 'success');
            carregarDados();
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao cancelar pedido', 'error');
        }
    };

    const resetForm = () => {
        setNovoPedido({ fornecedorId: '', desconto: 0, observacoes: '' });
        setItens([]);
        setItemAtual({ produtoId: '', quantidade: 1, precoCusto: 0 });
    };

    const getStatusBadge = (status) => {
        const badges = {
            'pendente': 'badge-warning',
            'recebido': 'badge-positive',
            'cancelado': 'badge-neutral'
        };
        return badges[status] || 'badge-neutral';
    };

    const { subtotal, desconto, total } = calcularTotais();

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">🏭 Pedidos de Compra</h1>
                    <p style={{ color: 'var(--color-neutral-500)' }}>
                        Gerenciamento de compras e entrada de mercadorias
                    </p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
                    + Novo Pedido
                </button>
            </div>

            {/* Filtros */}
            <div className="card mb-6">
                <div className="flex gap-4">
                    <select
                        className="select"
                        value={filtros.status}
                        onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                    >
                        <option value="">Todos os Status</option>
                        <option value="pendente">Pendente</option>
                        <option value="recebido">Recebido</option>
                        <option value="cancelado">Cancelado</option>
                    </select>

                    <select
                        className="select"
                        value={filtros.fornecedorId}
                        onChange={(e) => setFiltros({ ...filtros, fornecedorId: e.target.value })}
                    >
                        <option value="">Todos os Fornecedores</option>
                        {fornecedores.map(f => (
                            <option key={f.id} value={f.id}>{f.nome}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Tabela de Pedidos */}
            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Número</th>
                            <th>Fornecedor</th>
                            <th>Data</th>
                            <th>Itens</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidos.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-8 text-neutral-500">
                                    Nenhum pedido de compra
                                </td>
                            </tr>
                        ) : (
                            pedidos.map(pedido => (
                                <tr key={pedido.id}>
                                    <td className="font-semibold">{pedido.numero}</td>
                                    <td>{pedido.fornecedor?.nome || '-'}</td>
                                    <td>{new Date(pedido.dataPedido).toLocaleDateString('pt-BR')}</td>
                                    <td>{pedido.itens?.length || 0} itens</td>
                                    <td className="font-semibold">
                                        R$ {parseFloat(pedido.total).toFixed(2)}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(pedido.status)}`}>
                                            {pedido.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            {pedido.status === 'pendente' && (
                                                <>
                                                    <button
                                                        className="btn btn-sm btn-positive"
                                                        onClick={() => {
                                                            setSelectedPedido(pedido);
                                                            setIsReceiveModalOpen(true);
                                                        }}
                                                    >
                                                        ✅ Receber
                                                    </button>
                                                    <button
                                                        className="btn btn-sm btn-ghost"
                                                        onClick={() => cancelarPedido(pedido.id)}
                                                    >
                                                        ❌ Cancelar
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal: Novo Pedido */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title="Novo Pedido de Compra"
            >
                <form onSubmit={criarPedido}>
                    <div className="space-y-4">
                        {/* Fornecedor */}
                        <div className="form-group">
                            <label className="label">Fornecedor *</label>
                            <select
                                className="select"
                                value={novoPedido.fornecedorId}
                                onChange={(e) => setNovoPedido({ ...novoPedido, fornecedorId: e.target.value })}
                                required
                            >
                                <option value="">Selecione...</option>
                                {fornecedores.map(f => (
                                    <option key={f.id} value={f.id}>{f.nome}</option>
                                ))}
                            </select>
                        </div>

                        {/* Adicionar Item */}
                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-3">Adicionar Item</h4>
                            <div className="grid grid-cols-4 gap-3">
                                <div className="form-group col-span-2">
                                    <label className="label">Produto</label>
                                    <select
                                        className="select"
                                        value={itemAtual.produtoId}
                                        onChange={(e) => setItemAtual({ ...itemAtual, produtoId: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {produtos.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.codigo} - {p.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="label">Qtd</label>
                                    <input
                                        type="number"
                                        className="input"
                                        value={itemAtual.quantidade}
                                        onChange={(e) => setItemAtual({ ...itemAtual, quantidade: parseInt(e.target.value) })}
                                        min="1"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="label">Custo (R$)</label>
                                    <input
                                        type="number"
                                        className="input"
                                        step="0.01"
                                        value={itemAtual.precoCusto}
                                        onChange={(e) => setItemAtual({ ...itemAtual, precoCusto: parseFloat(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn btn-sm btn-ghost mt-2"
                                onClick={adicionarItem}
                            >
                                + Adicionar Item
                            </button>
                        </div>

                        {/* Lista de Itens */}
                        {itens.length > 0 && (
                            <div className="border-t pt-4">
                                <h4 className="font-semibold mb-3">Itens do Pedido</h4>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th>Qtd</th>
                                            <th>Custo Unit.</th>
                                            <th>Subtotal</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {itens.map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.produto.nome}</td>
                                                <td>{item.quantidade}</td>
                                                <td>R$ {parseFloat(item.precoCusto).toFixed(2)}</td>
                                                <td className="font-semibold">R$ {item.subtotal.toFixed(2)}</td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-ghost"
                                                        onClick={() => removerItem(index)}
                                                    >
                                                        ❌
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Totais */}
                        {itens.length > 0 && (
                            <div className="border-t pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Desconto (R$)</label>
                                        <input
                                            type="number"
                                            className="input"
                                            step="0.01"
                                            value={novoPedido.desconto}
                                            onChange={(e) => setNovoPedido({ ...novoPedido, desconto: parseFloat(e.target.value) || 0 })}
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Observações</label>
                                        <input
                                            type="text"
                                            className="input"
                                            value={novoPedido.observacoes}
                                            onChange={(e) => setNovoPedido({ ...novoPedido, observacoes: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 p-4 bg-neutral-100 rounded">
                                    <div className="flex justify-between mb-2">
                                        <span>Subtotal:</span>
                                        <span className="font-semibold">R$ {subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between mb-2">
                                        <span>Desconto:</span>
                                        <span className="font-semibold text-negative">- R$ {desconto.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                                        <span>Total:</span>
                                        <span className="text-primary">R$ {total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={itens.length === 0}
                            >
                                Criar Pedido
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Modal: Receber Pedido */}
            <Modal
                isOpen={isReceiveModalOpen}
                onClose={() => {
                    setIsReceiveModalOpen(false);
                    setSelectedPedido(null);
                }}
                title="Receber Pedido de Compra"
            >
                {selectedPedido && (
                    <div className="space-y-4">
                        <div className="p-4 bg-warning-50 border border-warning-200 rounded">
                            <p className="font-semibold mb-2">⚠️ Ao receber este pedido:</p>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                <li>O estoque de todos os produtos será <strong>aumentado</strong></li>
                                <li>O custo dos produtos será <strong>atualizado</strong></li>
                                <li>Uma <strong>Conta a Pagar</strong> será gerada automaticamente</li>
                                <li>O status mudará para <strong>"Recebido"</strong></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Itens do Pedido:</h4>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Quantidade</th>
                                        <th>Custo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedPedido.itens?.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.produto?.nome}</td>
                                            <td>{item.quantidade} un</td>
                                            <td>R$ {parseFloat(item.precoCusto).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setIsReceiveModalOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-positive"
                                onClick={receberPedido}
                            >
                                ✅ Confirmar Recebimento
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default PedidosCompra;
