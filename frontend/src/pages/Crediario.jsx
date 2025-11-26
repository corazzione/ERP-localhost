import { useState, useEffect } from 'react';
import api from '../services/api';

function Crediario() {
    const [carnes, setCarnes] = useState([]);
    const [selectedCarne, setSelectedCarne] = useState(null);
    const [simulacao, setSimulacao] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarCarnes();
    }, []);

    const carregarCarnes = async () => {
        try {
            const response = await api.get('/crediario/carnes');
            setCarnes(response.data);
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    };

    const simularQuitacao = async (carneId) => {
        try {
            const response = await api.get(`/crediario/carnes/${carneId}/simular-quitacao`);
            setSimulacao(response.data);
        } catch (error) {
            console.error('Erro:', error);
        }
    };

    const quitarCarne = async (carneId) => {
        if (!confirm('Confirma a quitação antecipada deste carnê?')) return;

        try {
            await api.post(`/crediario/carnes/${carneId}/quitar`);
            alert('Carnê quitado com sucesso!');
            setSimulacao(null);
            carregarCarnes();
        } catch (error) {
            alert('Erro ao quitar carnê');
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Crediário</h1>
                <p style={{ color: 'var(--color-neutral-500)' }}>Gestão de carnês e vendas a prazo</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Carnês Ativos</h3>
                    {loading ? <p>Carregando...</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {carnes.filter(c => c.status === 'ativo').map((carne) => (
                                <div key={carne.id} className="card" style={{ padding: '1rem', cursor: 'pointer' }}
                                    onClick={() => {
                                        setSelectedCarne(carne);
                                        simularQuitacao(carne.id);
                                    }}>
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold">{carne.cliente.nome}</div>
                                            <div className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
                                                Carnê #{carne.numeroCarne}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div className="font-semibold text-warning">
                                                R$ {parseFloat(carne.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </div>
                                            <div className="text-sm">{carne.numParcelas}x</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {carnes.filter(c => c.status === 'ativo').length === 0 && (
                                <p className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
                                    Nenhum carnê ativo
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {selectedCarne && simulacao && (
                    <div className="card">
                        <h3 style={{ marginBottom: '1rem' }}>Simulação de Quitação Antecipada</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <div className="font-semibold">{selectedCarne.cliente.nome}</div>
                            <div className="text-sm" style={{ color: 'var(--color-neutral-500)' }}>
                                Carnê #{selectedCarne.numeroCarne}
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                            <div className="flex justify-between">
                                <span>Valor original:</span>
                                <span className="font-semibold">
                                    R$ {parseFloat(selectedCarne.valorOriginal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Valor com juros:</span>
                                <span className="font-semibold">
                                    R$ {simulacao.valorSemDesconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Parcelas restantes:</span>
                                <span className="badge badge-warning">{simulacao.parcelasRestantes}</span>
                            </div>
                            <hr />
                            <div className="flex justify-between items-center">
                                <span className="font-semibold">Valor para quitar hoje:</span>
                                <span className="font-bold" style={{ fontSize: '1.5rem', color: 'var(--color-positive-600)' }}>
                                    R$ {simulacao.valorAQuitarHoje.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Economia de juros:</span>
                                <span className="font-semibold text-positive">
                                    R$ {simulacao.descontoJuros.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({simulacao.economia})
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button className="btn btn-positive" onClick={() => quitarCarne(selectedCarne.id)}>
                                Quitar Carnê
                            </button>
                            <button className="btn btn-outline" onClick={() => {
                                setSelectedCarne(null);
                                setSimulacao(null);
                            }}>
                                Cancelar
                            </button>
                        </div>

                        <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--color-positive-50)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                            <strong>💡 Benefício CDC Art. 52, §2º:</strong> Ao quitar antecipadamente, você tem direito à redução proporcional dos juros das parcelas futuras.
                        </div>
                    </div>
                )}
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Todos os Carnês</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nº Carnê</th>
                            <th>Cliente</th>
                            <th>Data</th>
                            <th>Valor Total</th>
                            <th>Parcelas</th>
                            <th>Taxa Juros</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {carnes.map((carne) => (
                            <tr key={carne.id}>
                                <td className="font-semibold">#{carne.numeroCarne}</td>
                                <td>{carne.cliente.nome}</td>
                                <td>{new Date(carne.dataCriacao).toLocaleDateString('pt-BR')}</td>
                                <td className="font-semibold">
                                    R$ {parseFloat(carne.valorTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </td>
                                <td>{carne.numParcelas}x</td>
                                <td>{parseFloat(carne.taxaJuros).toFixed(2)}%</td>
                                <td>
                                    <span className={`badge ${carne.status === 'ativo' ? 'badge-warning' :
                                            carne.status === 'quitado' ? 'badge-positive' : ''
                                        }`}>
                                        {carne.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Crediario;
