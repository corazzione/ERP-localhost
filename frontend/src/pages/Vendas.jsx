import { useState, useEffect } from 'react';
import api from '../services/api';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../components/Toast';

function Vendas() {
    const [produtos, setProdutos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [carrinho, setCarrinho] = useState([]);
    const [selectedClientId, setSelectedClientId] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('dinheiro');
    const [desconto, setDesconto] = useState(0);
    const [observacoes, setObservacoes] = useState('');
    const [processing, setProcessing] = useState(false);
    const [useCredit, setUseCredit] = useState(false);
    const [numParcelas, setNumParcelas] = useState(1);

    const { showToast } = useToast();

    useEffect(() => {
        Promise.all([
            api.get('/produtos'),
            api.get('/clientes')
        ]).then(([produtosRes, clientesRes]) => {
            setProdutos(produtosRes.data);
            setClientes(clientesRes.data);
        }).catch(err => {
            console.error('Erro ao carregar dados:', err);
            showToast('Erro ao carregar dados', 'error');
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const addToCart = (produto) => {
        if (produto.estoqueAtual <= 0) {
            showToast('Produto sem estoque!', 'warning');
            return;
        }

        setCarrinho(prev => {
            const existingItem = prev.find(item => item.produtoId === produto.id);
            if (existingItem) {
                if (existingItem.quantidade >= produto.estoqueAtual) {
                    showToast('Quantidade máxima em estoque atingida', 'warning');
                    return prev;
                }
                return prev.map(item =>
                    item.produtoId === produto.id
                        ? { ...item, quantidade: item.quantidade + 1, subtotal: (item.quantidade + 1) * item.precoUnit }
                        : item
                );
            }
            return [...prev, {
                produtoId: produto.id,
                nome: produto.nome,
                precoUnit: parseFloat(produto.precoVenda),
                quantidade: 1,
                subtotal: parseFloat(produto.precoVenda),
                estoqueMax: produto.estoqueAtual
            }];
        });
    };

    const removeFromCart = (produtoId) => {
        setCarrinho(prev => prev.filter(item => item.produtoId !== produtoId));
    };

    const updateQuantity = (produtoId, delta) => {
        setCarrinho(prev => {
            return prev.map(item => {
                if (item.produtoId === produtoId) {
                    const newQty = item.quantidade + delta;
                    if (newQty <= 0) return item;
                    if (newQty > item.estoqueMax) {
                        showToast('Quantidade excede o estoque', 'warning');
                        return item;
                    }
                    return { ...item, quantidade: newQty, subtotal: newQty * item.precoUnit };
                }
                return item;
            });
        });
    };

    const calculateTotal = () => {
        const subtotal = carrinho.reduce((acc, item) => acc + item.subtotal, 0);
        return Math.max(0, subtotal - desconto);
    };

    const getSelectedClientObj = () => {
        return clientes.find(c => c.id === selectedClientId);
    };

    const handleFinalizeSale = async () => {
        if (carrinho.length === 0) {
            showToast('O carrinho está vazio', 'warning');
            return;
        }

        setProcessing(true);
        try {
            const vendaData = {
                clienteId: selectedClientId || null,
                itens: carrinho.map(item => ({
                    produtoId: item.produtoId,
                    quantidade: item.quantidade,
                    precoUnit: item.precoUnit
                })),
                desconto: parseFloat(desconto),
                formaPagamento: paymentMethod,
                observacoes,
                usarCredito: useCredit,
                numParcelas: paymentMethod === 'crediario' ? parseInt(numParcelas) : 1
            };

            await api.post('/vendas', vendaData);

            showToast('Venda realizada com sucesso!', 'success');
            setCarrinho([]);
            setSelectedClientId('');
            setDesconto(0);
            setObservacoes('');
            setUseCredit(false);
            setNumParcelas(1);
            setIsPaymentModalOpen(false);

            // Recarregar dados
            const [prodRes, cliRes] = await Promise.all([
                api.get('/produtos'),
                api.get('/clientes')
            ]);
            setProdutos(prodRes.data);
            setClientes(cliRes.data);

        } catch (error) {
            console.error('Erro ao finalizar venda:', error);
            showToast('Erro ao finalizar venda', 'error');
        } finally {
            setProcessing(false);
        }
    };

    const filteredProducts = produtos.filter(p =>
        p.ativo && (
            p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const totalVenda = calculateTotal();
    const clientObj = getSelectedClientObj();
    const saldoCredito = clientObj ? parseFloat(clientObj.saldoCredito || 0) : 0;

    let creditToUse = 0;
    let remainingTotal = totalVenda;

    if (useCredit && saldoCredito > 0) {
        creditToUse = Math.min(saldoCredito, totalVenda);
        remainingTotal = Math.max(0, totalVenda - creditToUse);
    }

    if (loading) return <div className="p-8 text-center"><LoadingSpinner size="large" /></div>;

    return (
        <div style={{ height: 'calc(100vh - 100px)', display: 'flex', gap: '1.5rem' }}>
            {/* Esquerda: Lista de Produtos */}
            <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
                <div className="card" style={{ padding: '1rem' }}>
                    <input
                        type="text"
                        className="input"
                        placeholder="Buscar produto por nome ou código..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        autoFocus
                    />
                </div>

                <div style={{ flex: '1', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', alignContent: 'start' }}>
                    {filteredProducts.map(produto => (
                        <div
                            key={produto.id}
                            className="card hover-card"
                            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                            onClick={() => addToCart(produto)}
                        >
                            <div>
                                <div style={{ fontSize: '0.875rem', color: 'var(--color-neutral-500)', marginBottom: '0.25rem' }}>
                                    {produto.codigo}
                                </div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{produto.nome}</h3>
                                <div className={`badge ${produto.estoqueAtual > 0 ? 'badge-neutral' : 'badge-negative'}`} style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
                                    Estoque: {produto.estoqueAtual} {produto.unidade}
                                </div>
                            </div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary-600)', marginTop: '0.5rem' }}>
                                R$ {parseFloat(produto.precoVenda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Direita: Carrinho */}
            <div className="card" style={{ width: '400px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 className="text-xl font-bold border-b pb-4">Carrinho de Compras</h2>

                <div className="form-group">
                    <label className="label">Cliente</label>
                    <select
                        className="select"
                        value={selectedClientId}
                        onChange={(e) => {
                            setSelectedClientId(e.target.value);
                            setUseCredit(false); // Resetar uso de crédito ao trocar cliente
                        }}
                    >
                        <option value="">Cliente Balcão (Não identificado)</option>
                        {clientes.map(cliente => (
                            <option key={cliente.id} value={cliente.id}>{cliente.nome}</option>
                        ))}
                    </select>
                    {clientObj && (
                        <div className="text-xs text-primary-600 mt-1 font-semibold">
                            Saldo em Conta: R$ {parseFloat(clientObj.saldoCredito || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    )}
                </div>

                <div style={{ flex: '1', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {carrinho.length === 0 ? (
                        <div className="text-center text-neutral-500 py-8">
                            Seu carrinho está vazio
                        </div>
                    ) : (
                        carrinho.map(item => (
                            <div key={item.produtoId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--color-neutral-100)', borderRadius: '8px' }}>
                                <div style={{ flex: '1' }}>
                                    <div className="font-semibold">{item.nome}</div>
                                    <div className="text-sm text-neutral-500">
                                        {item.quantidade} x R$ {item.precoUnit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>
                                        R$ {item.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                        <button className="btn btn-xs btn-ghost" onClick={(e) => { e.stopPropagation(); updateQuantity(item.produtoId, 1); }}>▲</button>
                                        <button className="btn btn-xs btn-ghost" onClick={(e) => { e.stopPropagation(); updateQuantity(item.produtoId, -1); }}>▼</button>
                                    </div>
                                    <button className="text-negative hover:text-negative-700" onClick={(e) => { e.stopPropagation(); removeFromCart(item.produtoId); }}>
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="border-t pt-4 mt-auto">
                    <div className="flex justify-between items-center mb-2">
                        <span>Subtotal</span>
                        <span className="font-semibold">R$ {carrinho.reduce((acc, item) => acc + item.subtotal, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                        <span>Desconto</span>
                        <input
                            type="number"
                            className="input"
                            style={{ width: '100px', textAlign: 'right' }}
                            value={desconto}
                            onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                            min="0"
                        />
                    </div>
                    <div className="flex justify-between items-center mb-4 text-xl font-bold">
                        <span>Total</span>
                        <span className="text-primary-600">R$ {totalVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>

                    <button
                        className="btn btn-primary w-full py-3 text-lg"
                        onClick={() => setIsPaymentModalOpen(true)}
                        disabled={carrinho.length === 0}
                    >
                        Finalizar Venda
                    </button>
                </div>
            </div>

            <Modal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                title="Finalizar Venda"
                size="medium"
            >
                <div className="flex flex-col gap-4">
                    <div className="text-center py-4 bg-neutral-100 rounded-lg">
                        <div className="text-sm text-neutral-500">Valor Total da Venda</div>
                        <div className="text-3xl font-bold text-neutral-800">
                            R$ {totalVenda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                    </div>

                    {clientObj && saldoCredito > 0 && (
                        <div className="bg-positive-50 p-4 rounded-lg border border-positive-200">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={useCredit}
                                    onChange={(e) => setUseCredit(e.target.checked)}
                                    className="w-5 h-5 text-positive-600"
                                />
                                <span className="font-semibold text-positive-800">
                                    Usar Saldo em Conta (R$ {saldoCredito.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
                                </span>
                            </label>
                            {useCredit && (
                                <div className="mt-2 text-sm text-positive-700 ml-7">
                                    Será descontado: <strong>R$ {creditToUse.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                                </div>
                            )}
                        </div>
                    )}

                    {remainingTotal > 0 ? (
                        <>
                            <div className="text-center py-2">
                                <div className="text-sm text-neutral-500">Restante a Pagar</div>
                                <div className="text-2xl font-bold text-primary-600">
                                    R$ {remainingTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="label">Forma de Pagamento (Restante)</label>
                                <select
                                    className="select"
                                    value={paymentMethod}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                >
                                    <option value="dinheiro">Dinheiro</option>
                                    <option value="cartao_credito">Cartão de Crédito</option>
                                    <option value="cartao_debito">Cartão de Débito</option>
                                    <option value="pix">PIX</option>
                                    <option value="crediario">Crediário / Fiado</option>
                                </select>
                            </div>

                            {paymentMethod === 'crediario' && (
                                <div className="form-group">
                                    <label className="label">Número de Parcelas</label>
                                    <select
                                        className="select"
                                        value={numParcelas}
                                        onChange={(e) => setNumParcelas(e.target.value)}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 10, 12].map(n => (
                                            <option key={n} value={n}>{n}x</option>
                                        ))}
                                    </select>
                                    <div className="text-sm text-neutral-500 mt-1">
                                        Valor da Parcela: R$ {(remainingTotal / numParcelas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-2 text-positive-600 font-bold">
                            Venda totalmente coberta pelo saldo em conta!
                        </div>
                    )}

                    <div className="form-group">
                        <label className="label">Observações</label>
                        <textarea
                            className="textarea"
                            rows="3"
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                            placeholder="Opcional..."
                        />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            className="btn btn-ghost"
                            onClick={() => setIsPaymentModalOpen(false)}
                            disabled={processing}
                        >
                            Cancelar
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleFinalizeSale}
                            disabled={processing}
                        >
                            {processing ? <><LoadingSpinner size="small" color="white" /> Processando...</> : 'Confirmar Pagamento'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Vendas;
