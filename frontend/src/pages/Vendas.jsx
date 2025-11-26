import { useState, useEffect } from 'react';
import api from '../services/api';

function Vendas() {
    const [vendas, setVendas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carregarVendas();
    }, []);

    const carregarVendas = async () => {
        try {
            const response = await api.get('/vendas');
            setVendas(response.data);
        } catch (error) {
            console.error('Erro:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Vendas</h1>
                <p style={{ color: 'var(--color-neutral-500)' }}>Histórico de vendas realizadas</p>
            </div>

            <div className="card">
                {loading ? <p>Carregando...</p> : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Número</th>
                                <th>Data</th>
                                <th>Cliente</th>
                                <th>Total</th>
                                <th>Pagamento</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendas.map((venda) => (
                                <tr key={venda.id}>
                                    <td className="font-semibold">#{venda.numero}</td>
                                    <td>{new Date(venda.dataVenda).toLocaleDateString('pt-BR')}</td>
                                    <td>{venda.cliente?.nome || 'Cliente não informado'}</td>
                                    <td className="font-semibold">
                                        R$ {parseFloat(venda.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </td>
                                    <td>
                                        <span className="badge">{venda.formaPagamento.replace('_', ' ')}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${venda.statusPagamento === 'pago' ? 'badge-positive' :
                                                venda.statusPagamento === 'pendente' ? 'badge-warning' : ''
                                            }`}>
                                            {venda.statusPagamento}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {vendas.length === 0 && (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                                        Nenhuma venda registrada
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Vendas;
