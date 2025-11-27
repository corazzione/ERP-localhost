import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';

function Crediario() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [resumo, setResumo] = useState(null);
    const [parcelas, setParcelas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('todas'); // todas, vencidas, pendentes, pagas

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
                                            <button
                                                className="btn btn-sm btn-positive"
                                                onClick={() => pagarParcela(parcela.id)}
                                            >
                                                💰 Pagar
                                            </button>
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
        </div>
    );
}

export default Crediario;
