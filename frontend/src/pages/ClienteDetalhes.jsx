import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

function ClienteDetalhes() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cliente, setCliente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dados'); // dados, carnes, parcelas, historico
    const [isAddCreditModalOpen, setIsAddCreditModalOpen] = useState(false);
    const [creditAmount, setCreditAmount] = useState('');
    const [processing, setProcessing] = useState(false);
    const [simulacao, setSimulacao] = useState(null);
    const [selectedCarneId, setSelectedCarneId] = useState(null);
    const { showToast } = useToast();

    useEffect(() => {
        carregarCliente();
    }, [id]);

    const carregarCliente = async () => {
        try {
            const response = await api.get(`/clientes/${id}`);
            setCliente(response.data);
        } catch (error) {
            console.error('Erro ao carregar cliente:', error);
            showToast('Erro ao carregar dados do cliente', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCredit = async () => {
        if (!creditAmount || parseFloat(creditAmount) <= 0) {
            showToast('Valor inválido', 'warning');
            return;
        }

        setProcessing(true);
        try {
            await api.post(`/clientes/${id}/credito`, {
                valor: parseFloat(creditAmount),
                observacoes: 'Adicionado via Detalhes do Cliente'
            });
            showToast('Crédito adicionado com sucesso!', 'success');
            setIsAddCreditModalOpen(false);
            setCreditAmount('');
            carregarCliente();
        } catch (error) {
            console.error('Erro ao adicionar crédito:', error);
            showToast('Erro ao adicionar crédito', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handlePagarParcela = async (parcelaId) => {
        if (!window.confirm('Confirmar pagamento desta parcela?')) return;

        try {
            await api.post(`/crediario/parcelas/${parcelaId}/pagar`, {
                dataPagamento: new Date().toISOString()
            });
            showToast('Parcela paga com sucesso!', 'success');
            carregarCliente();
        } catch (error) {
            console.error('Erro ao pagar parcela:', error);
            showToast('Erro ao pagar parcela', 'error');
        }
    };

    const simularQuitacaoCarne = async (carneId) => {
        try {
            const response = await api.get(`/crediario/carnes/${carneId}/simular-quitacao`);
            setSimulacao(response.data);
            setSelectedCarneId(carneId);
        } catch (error) {
            showToast('Erro ao simular quitação', 'error');
        }
    };

    const quitarCarne = async () => {
        if (!window.confirm('Confirma a quitação antecipada deste carnê?')) return;

        try {
            await api.post(`/crediario/carnes/${selectedCarneId}/quitar`);
            showToast('Carnê quitado com sucesso!', 'success');
            setSimulacao(null);
            setSelectedCarneId(null);
            carregarCliente();
        } catch (error) {
            showToast('Erro ao quitar carnê', 'error');
        }
    };

    // Obter todas as parcelas de todos os carnês
    const todasParcelas = cliente?.carnes?.flatMap(carne =>
        carne.parcelas.map(p => ({ ...p, carne }))
    ) || [];

    if (loading) return <div className="p-8 text-center"><LoadingSpinner size="large" /></div>;
    if (!cliente) return <div className="p-8 text-center">Cliente não encontrado</div>;

    return (
        <div>
            <div className="page-header flex justify-between items-center">
                <div>
                    <button onClick={() => navigate('/clientes')} className="text-neutral-500 hover:text-primary-600 mb-2">
                        ← Voltar para Clientes
                    </button>
                    <h1 className="page-title">{cliente.nome}</h1>
                    <p style={{ color: 'var(--color-neutral-500)' }}>{cliente.cpfCnpj} • {cliente.email || 'Sem email'}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAddCreditModalOpen(true)}>
                    💰 Adicionar Crédito
                </button>
            </div>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                <div className="card">
                    <div className="text-sm text-neutral-500 mb-1">Saldo em Conta (Crédito)</div>
                    <div className="text-2xl font-bold text-positive-600">
                        R$ {parseFloat(cliente.saldoCredito || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="card">
                    <div className="text-sm text-neutral-500 mb-1">Dívida Atual (Crediário)</div>
                    <div className="text-2xl font-bold text-negative-600">
                        R$ {parseFloat(cliente.saldoDevedor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="card">
                    <div className="text-sm text-neutral-500 mb-1">Limite de Crédito</div>
                    <div className="text-2xl font-bold text-primary-600">
                        R$ {parseFloat(cliente.limiteCredito || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="card mb-6">
                <div className="flex border-b">
                    <button
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'dados'
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        onClick={() => setActiveTab('dados')}
                    >
                        📋 Dados
                    </button>
                    <button
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'carnes'
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        onClick={() => setActiveTab('carnes')}
                    >
                        💳 Carnês ({cliente.carnes?.length || 0})
                    </button>
                    <button
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'parcelas'
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        onClick={() => setActiveTab('parcelas')}
                    >
                        📅 Parcelas ({todasParcelas.length})
                    </button>
                    <button
                        className={`px-6 py-3 font-semibold transition-colors ${activeTab === 'historico'
                                ? 'border-b-2 border-primary-600 text-primary-600'
                                : 'text-neutral-500 hover:text-neutral-700'
                            }`}
                        onClick={() => setActiveTab('historico')}
                    >
                        🛍️ Histórico ({cliente.vendas?.length || 0})
                    </button>
                </div>

                <div className="p-6">
                    {/* Tab: Dados */}
                    {activeTab === 'dados' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <strong className="text-sm text-neutral-500">Nome:</strong>
                                <p>{cliente.nome}</p>
                            </div>
                            <div>
                                <strong className="text-sm text-neutral-500">CPF/CNPJ:</strong>
                                <p>{cliente.cpfCnpj}</p>
                            </div>
                            <div>
                                <strong className="text-sm text-neutral-500">Email:</strong>
                                <p>{cliente.email || '-'}</p>
                            </div>
                            <div>
                                <strong className="text-sm text-neutral-500">Telefone:</strong>
                                <p>{cliente.telefone || '-'}</p>
                            </div>
                            <div className="col-span-2">
                                <strong className="text-sm text-neutral-500">Endereço:</strong>
                                <p>
                                    {cliente.endereco && `${cliente.endereco}, ${cliente.cidade} - ${cliente.estado}, CEP: ${cliente.cep}`}
                                    {!cliente.endereco && '-'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Tab: Carnês */}
                    {activeTab === 'carnes' && (
                        <div>
                            {cliente.carnes && cliente.carnes.length > 0 ? (
                                <div className="flex flex-col gap-4">
                                    {cliente.carnes.map(carne => (
                                        <div key={carne.id} className="border rounded-lg p-4 bg-neutral-50">
                                            <div className="flex justify-between mb-3">
                                                <div>
                                                    <span className="font-bold text-lg">Carnê #{carne.numeroCarne}</span>
                                                    <p className="text-sm text-neutral-500">
                                                        {carne.numParcelas}x • Taxa: {parseFloat(carne.taxaJuros).toFixed(2)}%
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-lg">
                                                        R$ {parseFloat(carne.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </div>
                                                    <span className={`badge ${carne.status === 'ativo' ? 'badge-warning' : 'badge-positive'}`}>
                                                        {carne.status}
                                                    </span>
                                                </div>
                                            </div>

                                            {carne.status === 'ativo' && (
                                                <button
                                                    className="btn btn-sm btn-outline mb-3"
                                                    onClick={() => simularQuitacaoCarne(carne.id)}
                                                >
                                                    💰 Simular Quitação Antecipada
                                                </button>
                                            )}

                                            {/* Simulação de Quitação */}
                                            {selectedCarneId === carne.id && simulacao && (
                                                <div className="bg-positive-50 border border-positive-200 rounded p-4 mb-3">
                                                    <h4 className="font-bold mb-2">Simulação de QuitaçãoAntecipada</h4>
                                                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                                        <div>
                                                            <span className="text-neutral-600">Valor sem desconto:</span>
                                                            <p className="font-semibold">R$ {simulacao.valorSemDesconto.toFixed(2)}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-neutral-600">Valor para quitar hoje:</span>
                                                            <p className="font-semibold text-positive-600 text-lg">
                                                                R$ {simulacao.valorAQuitarHoje.toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-neutral-600">Desconto de juros:</span>
                                                            <p className="font-semibold text-positive-600">
                                                                R$ {simulacao.descontoJuros.toFixed(2)} ({simulacao.economia})
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-neutral-600">Parcelas restantes:</span>
                                                            <p className="font-semibold">{simulacao.parcelasRestantes}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button className="btn btn-sm btn-positive" onClick={quitarCarne}>
                                                            Confirmar Quitação
                                                        </button>
                                                        <button
                                                            className="btn btn-sm btn-outline"
                                                            onClick={() => {
                                                                setSimulacao(null);
                                                                setSelectedCarneId(null);
                                                            }}
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Parcelas do Carnê */}
                                            <div className="space-y-2">
                                                {carne.parcelas.map(parcela => (
                                                    <div key={parcela.id} className="flex justify-between items-center bg-white p-2 rounded border">
                                                        <div>
                                                            <div className="font-semibold text-sm">Parcela {parcela.numeroParcela}/{carne.numParcelas}</div>
                                                            <div className="text-xs text-neutral-500">
                                                                Venc: {new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="font-bold">
                                                                R$ {parseFloat(parcela.valorParcela).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                            </span>
                                                            {parcela.status === 'pago' ? (
                                                                <span className="badge badge-positive">Pago</span>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-xs btn-positive"
                                                                    onClick={() => handlePagarParcela(parcela.id)}
                                                                >
                                                                    Pagar
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-neutral-500">Nenhum carnê ativo</div>
                            )}
                        </div>
                    )}

                    {/* Tab: Parcelas (Consolidated) */}
                    {activeTab === 'parcelas' && (
                        <div>
                            {todasParcelas.length > 0 ? (
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Carnê</th>
                                            <th>Parcela</th>
                                            <th>Vencimento</th>
                                            <th>Valor</th>
                                            <th>Status</th>
                                            <th>Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {todasParcelas
                                            .sort((a, b) => new Date(a.dataVencimento) - new Date(b.dataVencimento))
                                            .map(parcela => (
                                                <tr key={parcela.id}>
                                                    <td className="font-mono text-sm">#{parcela.carne.numeroCarne}</td>
                                                    <td>{parcela.numeroParcela}/{parcela.carne.numParcelas}</td>
                                                    <td>{new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')}</td>
                                                    <td className="font-semibold">
                                                        R$ {parseFloat(parcela.valorParcela).toFixed(2)}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${parcela.status === 'pago' ? 'badge-positive' : 'badge-warning'}`}>
                                                            {parcela.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {parcela.status === 'pendente' && (
                                                            <button
                                                                className="btn btn-sm btn-positive"
                                                                onClick={() => handlePagarParcela(parcela.id)}
                                                            >
                                                                💰 Pagar
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-8 text-neutral-500">Nenhuma parcela</div>
                            )}
                        </div>
                    )}

                    {/* Tab: Histórico */}
                    {activeTab === 'historico' && (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Número</th>
                                    <th>Total</th>
                                    <th>Pagamento</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cliente.vendas && cliente.vendas.length > 0 ? (
                                    cliente.vendas.map(venda => (
                                        <tr key={venda.id}>
                                            <td>{new Date(venda.dataVenda).toLocaleDateString('pt-BR')}</td>
                                            <td className="font-mono text-sm">{venda.numero}</td>
                                            <td className="font-semibold">
                                                R$ {parseFloat(venda.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td>
                                                <span className="badge">{venda.formaPagamento.replace('_', ' ')}</span>
                                            </td>
                                            <td>
                                                <span className={`badge ${venda.statusPagamento === 'pago' ? 'badge-positive' : 'badge-warning'}`}>
                                                    {venda.statusPagamento}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4 text-neutral-500">
                                            Nenhuma venda registrada
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modal Adicionar Crédito */}
            <Modal
                isOpen={isAddCreditModalOpen}
                onClose={() => setIsAddCreditModalOpen(false)}
                title="Adicionar Crédito ao Cliente"
            >
                <div className="flex flex-col gap-4">
                    <div className="form-group">
                        <label className="label">Valor (R$)</label>
                        <input
                            type="number"
                            className="input"
                            value={creditAmount}
                            onChange={(e) => setCreditAmount(e.target.value)}
                            placeholder="0,00"
                            step="0.01"
                            min="0"
                            autoFocus
                        />
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            className="btn btn-ghost"
                            onClick={() => setIsAddCreditModalOpen(false)}
                            disabled={processing}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleAddCredit}
                            disabled={processing}
                        >
                            {processing ? <><LoadingSpinner size="small" color="white" /> Processando...</> : 'Confirmar'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default ClienteDetalhes;
