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
    const [isAddCreditModalOpen, setIsAddCreditModalOpen] = useState(false);
    const [creditAmount, setCreditAmount] = useState('');
    const [processing, setProcessing] = useState(false);
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
            await api.post(`/clientes/parcelas/${parcelaId}/pagar`, {
                formaPagamento: 'dinheiro' // Simplificado por enquanto
            });
            showToast('Parcela paga com sucesso!', 'success');
            carregarCliente();
        } catch (error) {
            console.error('Erro ao pagar parcela:', error);
            showToast('Erro ao pagar parcela', 'error');
        }
    };

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
                <div className="flex gap-2">
                    <button className="btn btn-primary" onClick={() => setIsAddCreditModalOpen(true)}>
                        💰 Adicionar Crédito
                    </button>
                </div>
            </div>

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">Carnês em Aberto</h3>
                    {cliente.carnes && cliente.carnes.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {cliente.carnes.map(carne => (
                                <div key={carne.id} className="border rounded-lg p-4 bg-neutral-50">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-bold">Venda #{carne.numeroCarne}</span>
                                        <span className="text-sm text-neutral-500">Total: R$ {parseFloat(carne.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="space-y-2">
                                        {carne.parcelas.map(parcela => (
                                            <div key={parcela.id} className="flex justify-between items-center bg-white p-2 rounded border">
                                                <div>
                                                    <div className="font-semibold text-sm">Parcela {parcela.numeroParcela}/{carne.numParcelas}</div>
                                                    <div className="text-xs text-neutral-500">Venc: {new Date(parcela.dataVencimento).toLocaleDateString('pt-BR')}</div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="font-bold text-neutral-700">R$ {parseFloat(parcela.valorParcela).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                    {parcela.status === 'pago' ? (
                                                        <span className="badge badge-positive">Pago</span>
                                                    ) : (
                                                        <button
                                                            className="btn btn-xs btn-outline-primary"
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

                <div className="card">
                    <h3 className="text-lg font-bold mb-4 border-b pb-2">Últimas Vendas</h3>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Data</th>
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
                                        <td className="font-semibold">R$ {parseFloat(venda.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                        <td><span className="badge">{venda.formaPagamento.replace('_', ' ')}</span></td>
                                        <td>
                                            <span className={`badge ${venda.statusPagamento === 'pago' ? 'badge-positive' : 'badge-warning'}`}>
                                                {venda.statusPagamento}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center py-4 text-neutral-500">Nenhuma venda registrada</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

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
