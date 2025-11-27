import { useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

function Financeiro() {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, pagar, receber, fluxo
    const [loading, setLoading] = useState(true);

    // Data
    const [dashboard, setDashboard] = useState(null);
    const [contasPagar, setContasPagar] = useState([]);
    const [contasReceber, setContasReceber] = useState([]);
    const [fluxoCaixa, setFluxoCaixa] = useState(null);
    const [categorias, setCategorias] = useState([]);
    const [fornecedores, setFornecedores] = useState([]);

    // Modals
    const [isModalPagarOpen, setIsModalPagarOpen] = useState(false);
    const [isModalReceberOpen, setIsModalReceberOpen] = useState(false);
    const [selectedConta, setSelectedConta] = useState(null);

    // Filters
    const [filtrosPagar, setFiltrosPagar] = useState({ status: '', categoriaId: '' });
    const [filtrosReceber, setFiltrosReceber] = useState({ status: '', categoriaId: '' });
    const [periodoFluxo, setPeriodoFluxo] = useState({
        dataInicio: new Date(new Date().setDate(1)).toISOString().split('T')[0],
        dataFim: new Date().toISOString().split('T')[0]
    });

    // Form nova conta
    const [novaConta, setNovaConta] = useState({
        descricao: '',
        valor: '',
        dataVencimento: '',
        categoriaId: '',
        fornecedorId: '',
        observacoes: ''
    });

    useEffect(() => {
        carregarDados();
    }, [activeTab]);

    const carregarDados = async () => {
        try {
            if (activeTab === 'dashboard') {
                const [dashRes, catRes] = await Promise.all([
                    api.get('/financeiro/dashboard'),
                    api.get('/financeiro/categorias')
                ]);
                setDashboard(dashRes.data);
                setCategorias(catRes.data);
            } else if (activeTab === 'pagar') {
                const [pagarRes, catRes, fornRes] = await Promise.all([
                    api.get('/financeiro/contas-pagar', { params: filtrosPagar }),
                    api.get('/financeiro/categorias', { params: { tipo: 'despesa' } }),
                    api.get('/fornecedores')
                ]);
                setContasPagar(pagarRes.data);
                setCategorias(catRes.data);
                setFornecedores(fornRes.data);
            } else if (activeTab === 'receber') {
                const [receberRes, catRes] = await Promise.all([
                    api.get('/financeiro/contas-receber', { params: filtrosReceber }),
                    api.get('/financeiro/categorias', { params: { tipo: 'receita' } })
                ]);
                setContasReceber(receberRes.data);
                setCategorias(catRes.data);
            } else if (activeTab === 'fluxo') {
                const fluxoRes = await api.get('/financeiro/fluxo-caixa', { params: periodoFluxo });
                setFluxoCaixa(fluxoRes.data);
            }
        } catch (error) {
            showToast('Erro ao carregar dados', 'error');
        } finally {
            setLoading(false);
        }
    };

    const criarContaPagar = async (e) => {
        e.preventDefault();
        try {
            await api.post('/financeiro/contas-pagar', novaConta);
            showToast('Conta criada com sucesso', 'success');
            setIsModalPagarOpen(false);
            resetFormNovaConta();
            carregarDados();
        } catch (error) {
            showToast('Erro ao criar conta', 'error');
        }
    };

    const pagarConta = async (contaId) => {
        if (!window.confirm('Confirmar pagamento desta conta?')) return;

        try {
            await api.put(`/financeiro/contas-pagar/${contaId}/pagar`, {
                dataPagamento: new Date().toISOString()
            });
            showToast('Conta paga com sucesso', 'success');
            carregarDados();
        } catch (error) {
            showToast('Erro ao pagar conta', 'error');
        }
    };

    const receberConta = async (contaId) => {
        if (!window.confirm('Confirmar recebimento?')) return;

        try {
            await api.put(`/financeiro/contas-receber/${contaId}/receber`, {
                dataRecebimento: new Date().toISOString()
            });
            showToast('Conta recebida com sucesso', 'success');
            carregarDados();
        } catch (error) {
            showToast('Erro ao receber conta', 'error');
        }
    };

    const resetFormNovaConta = () => {
        setNovaConta({
            descricao: '',
            valor: '',
            dataVencimento: '',
            categoriaId: '',
            fornecedorId: '',
            observacoes: ''
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            'pago': 'badge-positive',
            'pendente': 'badge-warning',
            'atrasado': 'badge-negative',
            'cancelado': 'badge-neutral'
        };
        return badges[status] || 'badge-neutral';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="spinner"></div>
                    <p className="mt-4">Carregando dados financeiros...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">💰 Gestão Financeira</h1>
                    <p style={{ color: 'var(--color-neutral-500)' }}>
                        Controle completo de receitas e despesas
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="card mb-6">
                <div className="flex border-b">
                    <button
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'dashboard'
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        onClick={() => setActiveTab('dashboard')}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'pagar'
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        onClick={() => setActiveTab('pagar')}
                    >
                        💸 Contas a Pagar ({contasPagar.length})
                    </button>
                    <button
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'receber'
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        onClick={() => setActiveTab('receber')}
                    >
                        💰 Contas a Receber ({contasReceber.length})
                    </button>
                    <button
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'fluxo'
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        onClick={() => setActiveTab('fluxo')}
                    >
                        📈 Fluxo de Caixa
                    </button>
                </div>
            </div>

            {/* Tab: Dashboard */}
            {activeTab === 'dashboard' && dashboard && (
                <div>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        <div className="card">
                            <div className="text-sm text-neutral-500">Saldo em Caixa</div>
                            <div className="text-2xl font-bold text-primary">
                                R$ {parseFloat(dashboard.saldoCaixa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>

                        <div className="card">
                            <div className="text-sm text-neutral-500">Contas a Pagar Hoje</div>
                            <div className="text-2xl font-bold text-negative">
                                R$ {parseFloat(dashboard.totalPagarHoje || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-neutral-500 mt-1">{dashboard.qtdContasPagarHoje} contas</div>
                        </div>

                        <div className="card">
                            <div className="text-sm text-neutral-500">Contas a Receber Hoje</div>
                            <div className="text-2xl font-bold text-positive">
                                R$ {parseFloat(dashboard.totalReceberHoje || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-sm text-neutral-500 mt-1">{dashboard.qtdContasReceberHoje} contas</div>
                        </div>

                        <div className="card">
                            <div className="text-sm text-neutral-500">Resultado do Mês</div>
                            <div className={`text-2xl font-bold ${dashboard.resultadoMes >= 0 ? 'text-positive' : 'text-negative'}`}>
                                R$ {parseFloat(dashboard.resultadoMes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="mb-4">📌 Visão Rápida</h3>
                        <p className="text-neutral-600">
                            Dashboard financeiro implementado com sucesso! Use as abas acima para gerenciar contas a pagar, receber e visualizar o fluxo de caixa.
                        </p>
                    </div>
                </div>
            )}

            {/* Tab: Contas a Pagar */}
            {activeTab === 'pagar' && (
                <div>
                    <div className="card mb-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3>💸 Contas a Pagar</h3>
                            <button
                                className="btn btn-primary"
                                onClick={() => setIsModalPagarOpen(true)}
                            >
                                + Nova Conta
                            </button>
                        </div>

                        {/* Filtros */}
                        <div className="flex gap-4 mb-4">
                            <select
                                className="select"
                                value={filtrosPagar.status}
                                onChange={(e) => {
                                    setFiltrosPagar({ ...filtrosPagar, status: e.target.value });
                                    carregarDados();
                                }}
                            >
                                <option value="">Todos os Status</option>
                                <option value="pendente">Pendente</option>
                                <option value="pago">Pago</option>
                                <option value="atrasado">Atrasado</option>
                            </select>

                            <select
                                className="select"
                                value={filtrosPagar.categoriaId}
                                onChange={(e) => {
                                    setFiltrosPagar({ ...filtrosPagar, categoriaId: e.target.value });
                                    carregarDados();
                                }}
                            >
                                <option value="">Todas as Categorias</option>
                                {categorias.map(c => (
                                    <option key={c.id} value={c.id}>{c.icone || '📁'} {c.nome}</option>
                                ))}
                            </select>
                        </div>

                        {/* Tabela */}
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Fornecedor</th>
                                    <th>Categoria</th>
                                    <th>Vencimento</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contasPagar.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8 text-neutral-500">
                                            Nenhuma conta a pagar
                                        </td>
                                    </tr>
                                ) : (
                                    contasPagar.map(conta => (
                                        <tr key={conta.id}>
                                            <td>{conta.descricao}</td>
                                            <td>{conta.fornecedor?.nome || '-'}</td>
                                            <td>
                                                {conta.categoria && (
                                                    <span style={{ color: conta.categoria.cor }}>
                                                        {conta.categoria.icone} {conta.categoria.nome}
                                                    </span>
                                                )}
                                            </td>
                                            <td>{new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}</td>
                                            <td className="font-semibold">R$ {parseFloat(conta.valor).toFixed(2)}</td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(conta.status)}`}>
                                                    {conta.status}
                                                </span>
                                            </td>
                                            <td>
                                                {conta.status === 'pendente' && (
                                                    <button
                                                        className="btn btn-sm btn-positive"
                                                        onClick={() => pagarConta(conta.id)}
                                                    >
                                                        💰 Pagar
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab: Contas a Receber */}
            {activeTab === 'receber' && (
                <div>
                    <div className="card">
                        <h3 className="mb-4">💰 Contas a Receber</h3>

                        {/* Filtros */}
                        <div className="flex gap-4 mb-4">
                            <select
                                className="select"
                                value={filtrosReceber.status}
                                onChange={(e) => {
                                    setFiltrosReceber({ ...filtrosReceber, status: e.target.value });
                                    carregarDados();
                                }}
                            >
                                <option value="">Todos os Status</option>
                                <option value="pendente">Pendente</option>
                                <option value="pago">Pago</option>
                                <option value="atrasado">Atrasado</option>
                            </select>
                        </div>

                        {/* Tabela */}
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Cliente</th>
                                    <th>Origem</th>
                                    <th>Vencimento</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contasReceber.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-8 text-neutral-500">
                                            Nenhuma conta a receber
                                        </td>
                                    </tr>
                                ) : (
                                    contasReceber.map(conta => (
                                        <tr key={conta.id}>
                                            <td>{conta.descricao}</td>
                                            <td>{conta.cliente?.nome || '-'}</td>
                                            <td>
                                                {conta.venda && `Venda ${conta.venda.numero}`}
                                                {conta.parcela && `Parcela ${conta.parcela.numeroParcela}`}
                                                {!conta.venda && !conta.parcela && '-'}
                                            </td>
                                            <td>{new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}</td>
                                            <td className="font-semibold">R$ {parseFloat(conta.valor).toFixed(2)}</td>
                                            <td>
                                                <span className={`badge ${getStatusBadge(conta.status)}`}>
                                                    {conta.status}
                                                </span>
                                            </td>
                                            <td>
                                                {conta.status === 'pendente' && (
                                                    <button
                                                        className="btn btn-sm btn-positive"
                                                        onClick={() => receberConta(conta.id)}
                                                    >
                                                        💰 Receber
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab: Fluxo de Caixa */}
            {activeTab === 'fluxo' && fluxoCaixa && (
                <div>
                    <div className="card mb-6">
                        <h3 className="mb-4">📈 Fluxo de Caixa</h3>

                        {/* Filtro de Período */}
                        <div className="flex gap-4 mb-6">
                            <div className="form-group">
                                <label className="label">Data Início</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={periodoFluxo.dataInicio}
                                    onChange={(e) => setPeriodoFluxo({ ...periodoFluxo, dataInicio: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Data Fim</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={periodoFluxo.dataFim}
                                    onChange={(e) => setPeriodoFluxo({ ...periodoFluxo, dataFim: e.target.value })}
                                />
                            </div>
                            <button
                                className="btn btn-primary self-end"
                                onClick={carregarDados}
                            >
                                Atualizar
                            </button>
                        </div>

                        {/* Resumo */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="card bg-positive-50">
                                <div className="text-sm text-neutral-600">Total Entradas</div>
                                <div className="text-2xl font-bold text-positive-600">
                                    R$ {parseFloat(fluxoCaixa.totalEntradas || 0).toFixed(2)}
                                </div>
                            </div>
                            <div className="card bg-negative-50">
                                <div className="text-sm text-neutral-600">Total Saídas</div>
                                <div className="text-2xl font-bold text-negative-600">
                                    R$ {parseFloat(fluxoCaixa.totalSaidas || 0).toFixed(2)}
                                </div>
                            </div>
                            <div className={`card ${fluxoCaixa.saldo >= 0 ? 'bg-primary-50' : 'bg-negative-50'}`}>
                                <div className="text-sm text-neutral-600">Saldo</div>
                                <div className={`text-2xl font-bold ${fluxoCaixa.saldo >= 0 ? 'text-primary-600' : 'text-negative-600'}`}>
                                    R$ {parseFloat(fluxoCaixa.saldo || 0).toFixed(2)}
                                </div>
                            </div>
                        </div>

                        {/* Lista de Transações */}
                        <div>
                            <h4 className="font-semibold mb-3">Transações Detalhadas</h4>
                            <div className="space-y-2">
                                {fluxoCaixa.entradas?.map(e => (
                                    <div key={e.id} className="flex justify-between items-center p-3 bg-positive-50 rounded">
                                        <div>
                                            <div className="font-medium">{e.descricao}</div>
                                            <div className="text-sm text-neutral-500">
                                                {e.cliente?.nome || 'Cliente não informado'} • {new Date(e.dataRecebimento).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                        <div className="font-bold text-positive-600">
                                            + R$ {parseFloat(e.valor).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                                {fluxoCaixa.saidas?.map(s => (
                                    <div key={s.id} className="flex justify-between items-center p-3 bg-negative-50 rounded">
                                        <div>
                                            <div className="font-medium">{s.descricao}</div>
                                            <div className="text-sm text-neutral-500">
                                                {s.fornecedor?.nome || 'Fornecedor não informado'} • {new Date(s.dataPagamento).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                        <div className="font-bold text-negative-600">
                                            - R$ {parseFloat(s.valor).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nova Conta a Pagar */}
            <Modal
                isOpen={isModalPagarOpen}
                onClose={() => {
                    setIsModalPagarOpen(false);
                    resetFormNovaConta();
                }}
                title="Nova Conta a Pagar"
            >
                <form onSubmit={criarContaPagar}>
                    <div className="space-y-4">
                        <div className="form-group">
                            <label className="label">Descrição *</label>
                            <input
                                type="text"
                                className="input"
                                value={novaConta.descricao}
                                onChange={(e) => setNovaConta({ ...novaConta, descricao: e.target.value })}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="label">Valor (R$) *</label>
                                <input
                                    type="number"
                                    className="input"
                                    step="0.01"
                                    value={novaConta.valor}
                                    onChange={(e) => setNovaConta({ ...novaConta, valor: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="label">Vencimento *</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={novaConta.dataVencimento}
                                    onChange={(e) => setNovaConta({ ...novaConta, dataVencimento: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="label">Categoria</label>
                            <select
                                className="select"
                                value={novaConta.categoriaId}
                                onChange={(e) => setNovaConta({ ...novaConta, categoriaId: e.target.value })}
                            >
                                <option value="">Selecione...</option>
                                {categorias.map(c => (
                                    <option key={c.id} value={c.id}>{c.icone || '📁'} {c.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="label">Fornecedor</label>
                            <select
                                className="select"
                                value={novaConta.fornecedorId}
                                onChange={(e) => setNovaConta({ ...novaConta, fornecedorId: e.target.value })}
                            >
                                <option value="">Selecione...</option>
                                {fornecedores.map(f => (
                                    <option key={f.id} value={f.id}>{f.nome}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="label">Observações</label>
                            <textarea
                                className="input"
                                rows="3"
                                value={novaConta.observacoes}
                                onChange={(e) => setNovaConta({ ...novaConta, observacoes: e.target.value })}
                            />
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => setIsModalPagarOpen(false)}
                            >
                                Cancelar
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Criar Conta
                            </button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

export default Financeiro;
