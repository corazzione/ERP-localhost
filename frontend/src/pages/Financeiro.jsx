import { useState, useEffect } from 'react';
import api from '../services/api';

function Financeiro() {
    const [contas, setContas] = useState({ receber: [], pagar: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarContas();
    }, []);

    const carregarContas = async () => {
        try {
            const [receber, pagar] = await Promise.all([
                api.get('/financeiro/contas-receber'),
                api.get('/financeiro/contas-pagar')
            ]);

            setContas({
                receber: receber.data,
                pagar: pagar.data
            });
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalReceber = contas.receber.reduce((sum, c) => sum + parseFloat(c.valor), 0);
    const totalPagar = contas.pagar.reduce((sum, c) => sum + parseFloat(c.valor), 0);
    const saldo = totalReceber - totalPagar;

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Financeiro</h1>
                <p style={{ color: 'var(--color-neutral-500)' }}>Controle de contas a pagar e receber</p>
            </div>

            <div className="metric-grid mb-6">
                <div className="metric-card">
                    <div className="metric-label">Total a Receber</div>
                    <div className="metric-value text-positive">
                        R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Total a Pagar</div>
                    <div className="metric-value text-negative">
                        R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
                <div className="metric-card">
                    <div className="metric-label">Saldo</div>
                    <div className={`metric-value ${saldo >= 0 ? 'text-positive' : 'text-negative'}`}>
                        R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Contas a Receber</h3>
                    {loading ? <p>Carregando...</p> : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Vencimento</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contas.receber.slice(0, 5).map((conta) => (
                                    <tr key={conta.id}>
                                        <td>{conta.descricao}</td>
                                        <td>{new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}</td>
                                        <td className="font-semibold">
                                            R$ {parseFloat(conta.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td>
                                            <span className={`badge ${conta.status === 'pago' ? 'badge-positive' : 'badge-warning'}`}>
                                                {conta.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="card">
                    <h3 style={{ marginBottom: '1rem' }}>Contas a Pagar</h3>
                    {loading ? <p>Carregando...</p> : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Vencimento</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {contas.pagar.slice(0, 5).map((conta) => (
                                    <tr key={conta.id}>
                                        <td>{conta.descricao}</td>
                                        <td>{new Date(conta.dataVencimento).toLocaleDateString('pt-BR')}</td>
                                        <td className="font-semibold">
                                            R$ {parseFloat(conta.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                        <td>
                                            <span className={`badge ${conta.status === 'pago' ? 'badge-positive' : 'badge-warning'}`}>
                                                {conta.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Financeiro;
