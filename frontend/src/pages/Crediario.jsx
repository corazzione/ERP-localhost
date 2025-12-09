import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { X, AlertCircle, Check, Clock, TrendingDown, CreditCard } from 'lucide-react';

function Crediario() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [resumo, setResumo] = useState(null);
    const [parcelas, setParcelas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todas'); // todas, vencidas, pendentes, pagas

    // Modal de antecipação
    const [showAnteciparModal, setShowAnteciparModal] = useState(false);
    const [parcelaSelecionada, setParcelaSelecionada] = useState(null);
    const [simulacaoAntecipacao, setSimulacaoAntecipacao] = useState(null);
    const [loadingSimulacao, setLoadingSimulacao] = useState(false);
    const [processandoPagamento, setProcessandoPagamento] = useState(false);

    useEffect(() => {
        carregarDados();
    }, [filtro]);

    const carregarDados = async () => {
        try {
            const [resumoRes, parcelasRes] = await Promise.all([
                api.get('/crediario/resumo'),
                api.get('/crediario/parcelas', {
                    params: {
                        vencidas: filtro === 'vencidas' ? 'true' : undefined,
                        status: filtro === 'pagas' ? 'pago' : filtro === 'pendentes' ? 'pendente' : undefined
                    }
                })
            ]);

            setResumo(resumoRes.data);
            setParcelas(parcelasRes.data);
        } catch (error) {
            showToast('Erro ao carregar dados', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Abrir modal de antecipação
    const abrirModalAntecipacao = useCallback(async (parcela) => {
        setParcelaSelecionada(parcela);
        setShowAnteciparModal(true);
        setLoadingSimulacao(true);

        try {
            const response = await api.get(`/crediario/parcelas/${parcela.id}/simular-antecipacao`);
            setSimulacaoAntecipacao(response.data);
        } catch (error) {
            showToast('Erro ao simular antecipação', 'error');
            setShowAnteciparModal(false);
        } finally {
            setLoadingSimulacao(false);
        }
    }, [showToast]);

    // Confirmar antecipação/pagamento
    const confirmarPagamento = useCallback(async () => {
        if (!parcelaSelecionada || !simulacaoAntecipacao) return;

        setProcessandoPagamento(true);
        try {
            await api.post(`/crediario/parcelas/${parcelaSelecionada.id}/pagar`, {
                valorPago: simulacaoAntecipacao.valorComDesconto,
                dataPagamento: new Date().toISOString()
            });

            showToast(
                simulacaoAntecipacao.desconto > 0
                    ? `Parcela paga com desconto de R$ ${simulacaoAntecipacao.desconto.toFixed(2)}!`
                    : 'Parcela paga com sucesso!',
                'success'
            );

            setShowAnteciparModal(false);
            setParcelaSelecionada(null);
            setSimulacaoAntecipacao(null);
            carregarDados();
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao processar pagamento', 'error');
        } finally {
            setProcessandoPagamento(false);
        }
    }, [parcelaSelecionada, simulacaoAntecipacao, showToast]);

    const fecharModal = useCallback(() => {
        setShowAnteciparModal(false);
        setParcelaSelecionada(null);
        setSimulacaoAntecipacao(null);
    }, []);

    const pagarParcela = async (parcelaId) => {
        if (!window.confirm('Confirma o pagamento desta parcela?')) return;

        try {
            await api.post(`/crediario/parcelas/${parcelaId}/pagar`, {
                dataPagamento: new Date().toISOString()
            });
            showToast('Parcela paga com sucesso', 'success');
            carregarDados();
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao pagar parcela', 'error');
        }
    };

    const verDetalhesCliente = (clienteId) => {
        navigate(`/clientes/${clienteId}`);
    };

    const getStatusBadge = (parcela) => {
        if (parcela.status === 'pago') return 'badge-positive';

        const hoje = new Date();
        const vencimento = new Date(parcela.dataVencimento);

        if (vencimento < hoje) return 'badge-negative';
        return 'badge-warning';
    };

    const getStatusLabel = (parcela) => {
        if (parcela.status === 'pago') return 'Pago';

        const hoje = new Date();
        const vencimento = new Date(parcela.dataVencimento);

        if (vencimento < hoje) return 'Vencida';
        return 'Pendente';
    };

    // Verifica se pode antecipar (vence no futuro)
    const podeAntecipar = (parcela) => {
        if (parcela.status === 'pago') return false;
        const hoje = new Date();
        const vencimento = new Date(parcela.dataVencimento);
        return vencimento > hoje;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-center">
                    <div className="spinner"></div>
                    <p className="mt-4">Carregando dados do crediário...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">💳 Gestão de Crediário</h1>
                    <p style={{ color: 'var(--color-neutral-500)' }}>
                        Visão geral de carnês e parcelas a receber
                    </p>
                </div>
            </div>

            {/* KPIs */}
            {resumo && (
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="card">
                        <div className="text-sm text-neutral-500">Total a Receber</div>
                        <div className="text-2xl font-bold text-primary">
                            R$ {parseFloat(resumo.totalReceber).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    <div className="card">
                        <div className="text-sm text-neutral-500">Parcelas Vencidas</div>
                        <div className="text-2xl font-bold text-negative">
                            {resumo.qtdVencidas}
                        </div>
                        <div className="text-sm text-neutral-500 mt-1">
                            R$ {parseFloat(resumo.totalVencido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    <div className="card">
                        <div className="text-sm text-neutral-500">Carnês Ativos</div>
                        <div className="text-2xl font-bold text-warning">
                            {resumo.carnesAtivos}
                        </div>
                    </div>

                    <div className="card">
                        <div className="text-sm text-neutral-500">Inadimplência</div>
                        <div className="text-2xl font-bold" style={{
                            color: parseFloat(resumo.inadimplencia) > 10 ? 'var(--color-negative-600)' : 'var(--color-positive-600)'
                        }}>
                            {resumo.inadimplencia}%
                        </div>
                    </div>
                </div>
            )}

            {/* Filtros */}
            <div className="card mb-6">
                <div className="flex gap-2">
                    <button
                        className={`btn ${filtro === 'todas' ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setFiltro('todas')}
                    >
                        Todas
                    </button>
                    <button
                        className={`btn ${filtro === 'vencidas' ? 'btn-negative' : 'btn-outline'}`}
                        onClick={() => setFiltro('vencidas')}
                    >
                        Vencidas
                    </button>
                    <button
                        className={`btn ${filtro === 'pendentes' ? 'btn-warning' : 'btn-outline'}`}
                        onClick={() => setFiltro('pendentes')}
                    >
                        Pendentes
                    </button>
                    <button
                        className={`btn ${filtro === 'pagas' ? 'btn-positive' : 'btn-outline'}`}
                        onClick={() => setFiltro('pagas')}
                    >
                        Pagas
                    </button>
                </div>
            </div>

            {/* Tabela de Parcelas */}
            <div className="card">
                <h3 className="mb-4">📋 Parcelas ({parcelas.length})</h3>

                {parcelas.length === 0 ? (
                    <div className="text-center py-8 text-neutral-500">
                        Nenhuma parcela encontrada
                    </div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Cliente</th>
                                <th>Carnê</th>
                                <th>Parcela</th>
                                <th>Vencimento</th>
                                <th>Valor</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parcelas.map(parcela => (
                                <tr key={parcela.id}>
                                    <td>
                                        <button
                                            className="text-primary hover:underline"
                                            onClick={() => verDetalhesCliente(parcela.carne.cliente.id)}
                                        >
                                            {parcela.carne.cliente.nome}
                                        </button>
                                    </td>
                                    <td className="font-mono text-sm">#{parcela.carne.numeroCarne}</td>
                                    <td className="text-center">{parcela.numeroParcela}/{parcela.carne.numParcelas}</td>
                                    <td>{new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')}</td>
                                    <td className="font-semibold">
                                        R$ {parseFloat(parcela.valorParcela).toFixed(2)}
                                    </td>
                                    <td>
                                        <span className={`badge ${getStatusBadge(parcela)}`}>
                                            {getStatusLabel(parcela)}
                                        </span>
                                    </td>
                                    <td>
                                        {parcela.status === 'pendente' && (
                                            <div className="flex gap-2">
                                                {podeAntecipar(parcela) && (
                                                    <button
                                                        className="btn btn-sm"
                                                        style={{
                                                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                            color: 'white',
                                                            border: 'none'
                                                        }}
                                                        onClick={() => abrirModalAntecipacao(parcela)}
                                                        title="Antecipar com desconto"
                                                    >
                                                        <TrendingDown size={14} style={{ marginRight: 4 }} />
                                                        Antecipar
                                                    </button>
                                                )}
                                                <button
                                                    className="btn btn-sm btn-positive"
                                                    onClick={() => pagarParcela(parcela.id)}
                                                >
                                                    💰 Pagar
                                                </button>
                                            </div>
                                        )}
                                        {parcela.status === 'pago' && (
                                            <span className="text-sm text-neutral-500">
                                                Pago em {new Date(parcela.dataPagamento).toLocaleDateString('pt-BR')}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal de Antecipação */}
            {showAnteciparModal && (
                <div className="modal-overlay" onClick={fecharModal}>
                    <div
                        className="modal-content"
                        onClick={e => e.stopPropagation()}
                        style={{
                            maxWidth: 480,
                            borderRadius: 16,
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '1.5rem',
                            borderBottom: '1px solid rgba(0,0,0,0.08)',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            color: 'white'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <CreditCard size={24} />
                                    <div>
                                        <h3 style={{ margin: 0, fontWeight: 700 }}>
                                            {simulacaoAntecipacao?.diasAntecipados > 0 ? 'Antecipar Parcela' : 'Pagar Parcela'}
                                        </h3>
                                        <p style={{ margin: 0, fontSize: 14, opacity: 0.9 }}>
                                            Parcela {simulacaoAntecipacao?.numeroParcela} - {simulacaoAntecipacao?.clienteNome}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={fecharModal}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)',
                                        border: 'none',
                                        borderRadius: 8,
                                        padding: 8,
                                        cursor: 'pointer',
                                        color: 'white'
                                    }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '1.5rem' }}>
                            {loadingSimulacao ? (
                                <div style={{ textAlign: 'center', padding: '2rem' }}>
                                    <div className="spinner"></div>
                                    <p style={{ marginTop: 16, color: 'var(--color-neutral-500)' }}>
                                        Calculando desconto...
                                    </p>
                                </div>
                            ) : simulacaoAntecipacao && (
                                <>
                                    {/* Info de desconto */}
                                    {simulacaoAntecipacao.desconto > 0 && (
                                        <div style={{
                                            background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
                                            borderRadius: 12,
                                            padding: '1rem',
                                            marginBottom: '1.5rem',
                                            border: '1px solid #10b981'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                <TrendingDown size={18} color="#059669" />
                                                <span style={{ fontWeight: 700, color: '#059669' }}>
                                                    Você economiza {simulacaoAntecipacao.economiaPercentual}%
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: 14, color: '#047857' }}>
                                                {simulacaoAntecipacao.mensagem}
                                            </p>
                                        </div>
                                    )}

                                    {/* Info de mora (se atrasado) */}
                                    {simulacaoAntecipacao.diasAtraso > 0 && (
                                        <div style={{
                                            background: '#fef2f2',
                                            borderRadius: 12,
                                            padding: '1rem',
                                            marginBottom: '1.5rem',
                                            border: '1px solid #fca5a5'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                                <AlertCircle size={18} color="#dc2626" />
                                                <span style={{ fontWeight: 700, color: '#dc2626' }}>
                                                    Parcela vencida há {simulacaoAntecipacao.diasAtraso} dias
                                                </span>
                                            </div>
                                            <p style={{ margin: 0, fontSize: 14, color: '#b91c1c' }}>
                                                Multa: R$ {simulacaoAntecipacao.multaAtraso?.toFixed(2) || '0.00'} |
                                                Juros mora: R$ {simulacaoAntecipacao.jurosMora?.toFixed(2) || '0.00'}
                                            </p>
                                        </div>
                                    )}

                                    {/* Valores */}
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem 0',
                                            borderBottom: '1px solid #e5e7eb'
                                        }}>
                                            <span style={{ color: 'var(--color-neutral-500)' }}>Valor original</span>
                                            <span style={{
                                                textDecoration: simulacaoAntecipacao.desconto > 0 ? 'line-through' : 'none',
                                                color: simulacaoAntecipacao.desconto > 0 ? 'var(--color-neutral-400)' : 'inherit'
                                            }}>
                                                R$ {simulacaoAntecipacao.valorOriginal.toFixed(2)}
                                            </span>
                                        </div>

                                        {simulacaoAntecipacao.desconto > 0 && (
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                padding: '0.75rem 0',
                                                borderBottom: '1px solid #e5e7eb',
                                                color: '#10b981'
                                            }}>
                                                <span>Desconto</span>
                                                <span>- R$ {simulacaoAntecipacao.desconto.toFixed(2)}</span>
                                            </div>
                                        )}

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: '1rem 0',
                                            fontWeight: 700,
                                            fontSize: '1.25rem'
                                        }}>
                                            <span>Valor a pagar</span>
                                            <span style={{ color: '#059669' }}>
                                                R$ {simulacaoAntecipacao.valorComDesconto.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info legal */}
                                    <div style={{
                                        background: '#f8fafc',
                                        borderRadius: 8,
                                        padding: '0.75rem 1rem',
                                        marginBottom: '1.5rem',
                                        fontSize: 12,
                                        color: 'var(--color-neutral-500)'
                                    }}>
                                        <strong>CDC Art. 52, §2º:</strong> O consumidor pode antecipar o pagamento de
                                        parcelas com redução proporcional dos juros.
                                    </div>

                                    {/* Ações */}
                                    <div style={{ display: 'flex', gap: 12 }}>
                                        <button
                                            className="btn btn-outline"
                                            onClick={fecharModal}
                                            style={{ flex: 1 }}
                                            disabled={processandoPagamento}
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            className="btn btn-positive"
                                            onClick={confirmarPagamento}
                                            style={{ flex: 2 }}
                                            disabled={processandoPagamento}
                                        >
                                            {processandoPagamento ? (
                                                <>
                                                    <div className="spinner" style={{ width: 16, height: 16 }}></div>
                                                    Processando...
                                                </>
                                            ) : (
                                                <>
                                                    <Check size={18} />
                                                    Confirmar Pagamento
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Crediario;
