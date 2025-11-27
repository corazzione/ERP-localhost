import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import printReceipt from '../utils/printReceipt';
import { exportVendasCSV } from '../utils/exportCSV';

function Vendas() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVenda, setSelectedVenda] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filtros
    const [filtros, setFiltros] = useState({
        dataInicio: '',
        dataFim: '',
        clienteId: '',
        status: '',
        formaPagamento: '',
        numeroVenda: ''
    });

    const [clientes, setClientes] = useState([]);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            const [vendasRes, clientesRes] = await Promise.all([
                api.get('/vendas'),
                api.get('/clientes')
            ]);
            // Ambos endpoints podem retornar { data: [], pagination: {} }
            setVendas(vendasRes.data.data || vendasRes.data);
            setClientes(clientesRes.data.data || clientesRes.data);
        } catch (error) {
            showToast('Erro ao carregar dados', 'error');
        } finally {
            setLoading(false);
        }
    };

    const aplicarFiltros = () => {
        let resultado = [...vendas];

        if (filtros.numeroVenda) {
            resultado = resultado.filter(v =>
                v.numero.toLowerCase().includes(filtros.numeroVenda.toLowerCase())
            );
        }

        if (filtros.clienteId) {
            resultado = resultado.filter(v => v.clienteId === filtros.clienteId);
        }

        if (filtros.status) {
            resultado = resultado.filter(v => v.status === filtros.status);
        }

        if (filtros.formaPagamento) {
            resultado = resultado.filter(v => v.formaPagamento === filtros.formaPagamento);
        }

        if (filtros.dataInicio) {
            resultado = resultado.filter(v =>
                new Date(v.dataVenda) >= new Date(filtros.dataInicio)
            );
        }

        if (filtros.dataFim) {
            resultado = resultado.filter(v =>
                new Date(v.dataVenda) <= new Date(filtros.dataFim)
            );
        }

        return resultado;
    };

    const limparFiltros = () => {
        setFiltros({
            dataInicio: '',
            dataFim: '',
            clienteId: '',
            status: '',
            formaPagamento: '',
            numeroVenda: ''
        });
    };

    const abrirDetalhes = async (vendaId) => {
        try {
            const response = await api.get(`/vendas/${vendaId}`);
            setSelectedVenda(response.data);
            setIsModalOpen(true);
        } catch (error) {
            showToast('Erro ao carregar detalhes', 'error');
        }
    };

    const exportarExcel = () => {
        const vendasFiltradas = aplicarFiltros();
        exportVendasCSV(vendasFiltradas);
        showToast('Vendas exportadas com sucesso', 'success');
    };

    const vendasFiltradas = aplicarFiltros();

    const getStatusBadge = (status) => {
        const badges = {
            'pago': 'badge-positive',
            'pendente': 'badge-warning',
            'cancelado': 'badge-negative'
        };
        return badges[status] || 'badge-neutral';
    };

    const getFormaPagamentoLabel = (forma) => {
        const labels = {
            'dinheiro': '💵 Dinheiro',
            'cartao_credito': '💳 Crédito',
            'cartao_debito': '💳 Débito',
            'pix': '📱 PIX',
            'crediario': '💰 Crediário'
        };
        return labels[forma] || forma;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="spinner"></div>
                    <p className="mt-4">Carregando vendas...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">📊 Histórico de Vendas</h1>
                    <p style={{ color: 'var(--color-neutral-500)' }}>
                        Consulta e análise de vendas realizadas
                    </p>
                </div>
                <button className="btn btn-primary" onClick={exportarExcel}>
                    📥 Exportar Excel
                </button>
            </div>

            {/* Filtros */}
            <div className="card mb-6">
                <h3 className="mb-4">🔍 Filtros</h3>
                <div className="grid grid-cols-4 gap-4">
                    <div className="form-group">
                        <label className="label">Número da Venda</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="VND-001"
                            value={filtros.numeroVenda}
                            onChange={(e) => setFiltros({ ...filtros, numeroVenda: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Cliente</label>
                        <select
                            className="select"
                            value={filtros.clienteId}
                            onChange={(e) => setFiltros({ ...filtros, clienteId: e.target.value })}
                        >
                            <option value="">Todos</option>
                            {clientes.map(c => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label">Status</label>
                        <select
                            className="select"
                            value={filtros.status}
                            onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}
                        >
                            <option value="">Todos</option>
                            <option value="pago">Pago</option>
                            <option value="pendente">Pendente</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label">Forma Pagamento</label>
                        <select
                            className="select"
                            value={filtros.formaPagamento}
                            onChange={(e) => setFiltros({ ...filtros, formaPagamento: e.target.value })}
                        >
                            <option value="">Todas</option>
                            <option value="dinheiro">Dinheiro</option>
                            <option value="cartao_credito">Cartão Crédito</option>
                            <option value="cartao_debito">Cartão Débito</option>
                            <option value="pix">PIX</option>
                            <option value="crediario">Crediário</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="label">Data Início</label>
                        <input
                            type="date"
                            className="input"
                            value={filtros.dataInicio}
                            onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                        />
                    </div>

                    <div className="form-group">
                        <label className="label">Data Fim</label>
                        <input
                            type="date"
                            className="input"
                            value={filtros.dataFim}
                            onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <button className="btn btn-outline" onClick={limparFiltros}>
                            Limpar
                        </button>
                    </div>
                </div>
            </div>

            {/* Resumo */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card">
                    <div className="text-sm text-neutral-500">Total de Vendas</div>
                    <div className="text-2xl font-bold">{vendasFiltradas.length}</div>
                </div>
                <div className="card">
                    <div className="text-sm text-neutral-500">Valor Total</div>
                    <div className="text-2xl font-bold text-positive">
                        R$ {vendasFiltradas.reduce((acc, v) => acc + parseFloat(v.total), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="card">
                    <div className="text-sm text-neutral-500">Ticket Médio</div>
                    <div className="text-2xl font-bold text-primary">
                        R$ {vendasFiltradas.length > 0
                            ? (vendasFiltradas.reduce((acc, v) => acc + parseFloat(v.total), 0) / vendasFiltradas.length).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
                            : '0,00'
                        }
                    </div>
                </div>
            </div>

            {/* Tabela */}
            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Número</th>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Total</th>
                            <th>Forma Pagamento</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vendasFiltradas.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-8 text-neutral-500">
                                    Nenhuma venda encontrada
                                </td>
                            </tr>
                        ) : (
                            vendasFiltradas.map(venda => (
                                <tr key={venda.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => abrirDetalhes(venda.id)}>
                                    <td className="font-semibold">{venda.numero}</td>
                                    <td>{new Date(venda.dataVenda).toLocaleDateString('pt-BR')}</td>
                                    <td>{venda.cliente?.nome || '🛒 Balcão'}</td>
                                    <td className="font-semibold">R$ {parseFloat(venda.total).toFixed(2)}</td>
                                    <td>{getFormaPagamentoLabel(venda.formaPagamento)}</td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(venda.status)}`}>
                                            {venda.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                abrirDetalhes(venda.id);
                                            }}
                                        >
                                            Ver Detalhes
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal de Detalhes */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedVenda ? `Venda ${selectedVenda.numero}` : 'Detalhes da Venda'}
                size="large"
            >
                {selectedVenda && (
                    <div className="space-y-4">
                        {/* Informações Gerais */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <strong className="text-sm text-neutral-500">Data:</strong>
                                <p>{new Date(selectedVenda.dataVenda).toLocaleString('pt-BR')}</p>
                            </div>
                            <div>
                                <strong className="text-sm text-neutral-500">Cliente:</strong>
                                <p>{selectedVenda.cliente?.nome || '🛒 Balcão'}</p>
                            </div>
                            <div>
                                <strong className="text-sm text-neutral-500">Forma de Pagamento:</strong>
                                <p>{getFormaPagamentoLabel(selectedVenda.formaPagamento)}</p>
                            </div>
                            <div>
                                <strong className="text-sm text-neutral-500">Status:</strong>
                                <span className={`badge ${getStatusBadge(selectedVenda.status)}`}>
                                    {selectedVenda.status}
                                </span>
                            </div>
                        </div>

                        {/* Itens */}
                        <div>
                            <h4 className="font-semibold mb-2">Itens da Venda</h4>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Quantidade</th>
                                        <th>Preço Unit.</th>
                                        <th>Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedVenda.itens?.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{item.produto?.nome || item.descricao || 'Item Personalizado'}</td>
                                            <td>{item.quantidade}</td>
                                            <td>R$ {parseFloat(item.precoUnit).toFixed(2)}</td>
                                            <td>R$ {parseFloat(item.subtotal).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totais */}
                        <div className="border-t pt-4">
                            <div className="flex justify-between mb-2">
                                <span>Subtotal:</span>
                                <strong>R$ {parseFloat(selectedVenda.subtotal || 0).toFixed(2)}</strong>
                            </div>
                            {selectedVenda.desconto > 0 && (
                                <div className="flex justify-between mb-2 text-warning">
                                    <span>Desconto:</span>
                                    <strong>- R$ {parseFloat(selectedVenda.desconto).toFixed(2)}</strong>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold">
                                <span>Total:</span>
                                <strong className="text-positive">R$ {parseFloat(selectedVenda.total).toFixed(2)}</strong>
                            </div>
                        </div>

                        {selectedVenda.observacoes && (
                            <div className="bg-neutral-50 p-3 rounded">
                                <strong className="text-sm text-neutral-500">Observações:</strong>
                                <p>{selectedVenda.observacoes}</p>
                            </div>
                        )}

                        {/* Botão Imprimir */}
                        <div className="mt-6 pt-4 border-t flex justify-end">
                            <button
                                className="btn btn-primary"
                                onClick={() => printReceipt(selectedVenda)}
                            >
                                🖨️ Imprimir Recibo
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}

export default Vendas;
