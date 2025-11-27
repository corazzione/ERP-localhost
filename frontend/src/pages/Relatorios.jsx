import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';

function Relatorios() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('vendas');
    const [loading, setLoading] = useState(false);

    // Data states
    const [relatorioVendas, setRelatorioVendas] = useState(null);
    const [vendasPorVendedor, setVendasPorVendedor] = useState([]);
    const [produtosMaisVendidos, setProdutosMaisVendidos] = useState([]);
    const [relatorioFinanceiro, setRelatorioFinanceiro] = useState(null);

    // Filtros
    const [periodo, setPeriodo] = useState({
        dataInicio: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        dataFim: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        carregarRelatorio();
    }, [activeTab, periodo]);

    const carregarRelatorio = async () => {
        setLoading(true);
        try {
            if (activeTab === 'vendas') {
                const res = await api.get('/relatorios/vendas', { params: { ...periodo, agruparPor: 'dia' } });
                setRelatorioVendas(res.data);
            } else if (activeTab === 'vendedores') {
                const res = await api.get('/relatorios/vendas-por-vendedor', { params: periodo });
                setVendasPorVendedor(res.data.vendedores || []);
            } else if (activeTab === 'produtos') {
                const res = await api.get('/relatorios/produtos-mais-vendidos', { params: { ...periodo, limit: 10 } });
                setProdutosMaisVendidos(res.data.produtos || []);
            } else if (activeTab === 'financeiro') {
                const res = await api.get('/relatorios/financeiro', { params: periodo });
                setRelatorioFinanceiro(res.data);
            }
        } catch (error) {
            showToast('Erro ao carregar relatório', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">📊 Relatórios</h1>
                    <p style={{ color: 'var(--color-neutral-500)' }}>
                        Análises e insights do seu negócio
                    </p>
                </div>
            </div>

            {/* Filtro de Período */}
            <div className="card mb-6">
                <div className="flex gap-4 items-end">
                    <div className="form-group">
                        <label className="label">Data Início</label>
                        <input
                            type="date"
                            className="input"
                            value={periodo.dataInicio}
                            onChange={(e) => setPeriodo({ ...periodo, dataInicio: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="label">Data Fim</label>
                        <input
                            type="date"
                            className="input"
                            value={periodo.dataFim}
                            onChange={(e) => setPeriodo({ ...periodo, dataFim: e.target.value })}
                        />
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={carregarRelatorio}
                    >
                        Atualizar
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="card mb-6">
                <div className="flex border-b">
                    <button
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'vendas'
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        onClick={() => setActiveTab('vendas')}
                    >
                        💰 Vendas
                    </button>
                    <button
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'vendedores'
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        onClick={() => setActiveTab('vendedores')}
                    >
                        👥 Por Vendedor
                    </button>
                    <button
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'produtos'
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        onClick={() => setActiveTab('produtos')}
                    >
                        📦 Produtos
                    </button>
                    <button
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'financeiro'
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        onClick={() => setActiveTab('financeiro')}
                    >
                        💸 Financeiro
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading && (
                <div className="flex items-center justify-center p-8">
                    <div className="spinner"></div>
                </div>
            )}

            {/* Tab: Vendas */}
            {!loading && activeTab === 'vendas' && relatorioVendas && (
                <div className="space-y-6">
                    {/* KPIs */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="card">
                            <div className="text-sm text-neutral-500">Total de Vendas</div>
                            <div className="text-2xl font-bold text-primary">
                                {relatorioVendas.resumo.totalVendas}
                            </div>
                        </div>
                        <div className="card">
                            <div className="text-sm text-neutral-500">Faturamento</div>
                            <div className="text-2xl font-bold text-positive">
                                R$ {parseFloat(relatorioVendas.resumo.faturamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="card">
                            <div className="text-sm text-neutral-500">Ticket Médio</div>
                            <div className="text-2xl font-bold text-primary">
                                R$ {parseFloat(relatorioVendas.resumo.ticketMedio || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    {/* Tabela de Vendas */}
                    <div className="card">
                        <h3 className="mb-4">Vendas Detalhadas</h3>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Número</th>
                                    <th>Data</th>
                                    <th>Cliente</th>
                                    <th>Forma Pagamento</th>
                                    <th>Total</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {relatorioVendas.vendas?.slice(0, 20).map(venda => (
                                    <tr key={venda.id}>
                                        <td className="font-semibold">{venda.numero}</td>
                                        <td>{new Date(venda.dataVenda).toLocaleDateString('pt-BR')}</td>
                                        <td>{venda.cliente?.nome || 'Balcão'}</td>
                                        <td>{venda.formaPagamento}</td>
                                        <td className="font-semibold">R$ {parseFloat(venda.total).toFixed(2)}</td>
                                        <td>
                                            <span className={`badge ${venda.status === 'concluida' ? 'badge-positive' : 'badge-neutral'}`}>
                                                {venda.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab: Vendedores */}
            {!loading && activeTab === 'vendedores' && (
                <div className="card">
                    <h3 className="mb-4">Ranking de Vendedores</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Vendedor</th>
                                <th>Quantidade de Vendas</th>
                                <th>Faturamento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendasPorVendedor.map((vendedor, index) => (
                                <tr key={index}>
                                    <td className="font-bold text-primary">{index + 1}º</td>
                                    <td>{vendedor.vendedor}</td>
                                    <td>{vendedor.quantidade} vendas</td>
                                    <td className="font-semibold text-positive">
                                        R$ {parseFloat(vendedor.faturamento).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                            {vendasPorVendedor.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center py-8 text-neutral-500">
                                        Nenhum dado no período selecionado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab: Produtos */}
            {!loading && activeTab === 'produtos' && (
                <div className="card">
                    <h3 className="mb-4">Top 10 Produtos Mais Vendidos</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Código</th>
                                <th>Produto</th>
                                <th>Quantidade Vendida</th>
                                <th>Faturamento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {produtosMaisVendidos.map((produto, index) => (
                                <tr key={index}>
                                    <td className="font-bold text-primary">{index + 1}º</td>
                                    <td>{produto.codigo || '-'}</td>
                                    <td>{produto.produto}</td>
                                    <td>{produto.quantidade} un</td>
                                    <td className="font-semibold text-positive">
                                        R$ {parseFloat(produto.faturamento || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                </tr>
                            ))}
                            {produtosMaisVendidos.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-8 text-neutral-500">
                                        Nenhum dado no período selecionado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab: Financeiro */}
            {!loading && activeTab === 'financeiro' && relatorioFinanceiro && (
                <div className="space-y-6">
                    {/* KPIs */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="card bg-positive-50">
                            <div className="text-sm text-neutral-600">Total Receitas</div>
                            <div className="text-2xl font-bold text-positive-600">
                                R$ {parseFloat(relatorioFinanceiro.receitas.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-neutral-500 mt-1">
                                Recebido: R$ {parseFloat(relatorioFinanceiro.receitas.recebido || 0).toFixed(2)}
                            </div>
                        </div>
                        <div className="card bg-negative-50">
                            <div className="text-sm text-neutral-600">Total Despesas</div>
                            <div className="text-2xl font-bold text-negative-600">
                                R$ {parseFloat(relatorioFinanceiro.despesas.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-neutral-500 mt-1">
                                Pago: R$ {parseFloat(relatorioFinanceiro.despesas.pago || 0).toFixed(2)}
                            </div>
                        </div>
                        <div className={`card ${relatorioFinanceiro.resultado.lucro >= 0 ? 'bg-primary-50' : 'bg-negative-50'}`}>
                            <div className="text-sm text-neutral-600">Lucro</div>
                            <div className={`text-2xl font-bold ${relatorioFinanceiro.resultado.lucro >= 0 ? 'text-primary-600' : 'text-negative-600'}`}>
                                R$ {parseFloat(relatorioFinanceiro.resultado.lucro || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                        <div className="card">
                            <div className="text-sm text-neutral-600">Margem de Lucro</div>
                            <div className="text-2xl font-bold text-primary">
                                {parseFloat(relatorioFinanceiro.resultado.margemLucro || 0).toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    {/* Resumo */}
                    <div className="card">
                        <h3 className="mb-4">Resumo Financeiro</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between p-3 bg-positive-50 rounded">
                                <span>Receitas Pendentes:</span>
                                <span className="font-semibold">R$ {parseFloat(relatorioFinanceiro.receitas.pendente || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between p-3 bg-negative-50 rounded">
                                <span>Despesas Pendentes:</span>
                                <span className="font-semibold">R$ {parseFloat(relatorioFinanceiro.despesas.pendente || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Relatorios;
