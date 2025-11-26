import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function PDV() {
    const navigate = useNavigate();
    const [produtos, setProdutos] = useState([]);
    const [carrinho, setCarrinho] = useState([]);
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPagamento, setShowPagamento] = useState(false);
    const buscaInputRef = useRef(null);

    // Carregar produtos ao iniciar
    useEffect(() => {
        carregarProdutos();
    }, []);

    // Atalhos de teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                buscaInputRef.current?.focus();
            }
            if (e.key === 'F5') {
                e.preventDefault();
                if (carrinho.length > 0) setShowPagamento(true);
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                if (showPagamento) setShowPagamento(false);
                else if (confirm('Sair do PDV?')) navigate('/');
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [carrinho, showPagamento, navigate]);

    const carregarProdutos = async () => {
        try {
            const response = await api.get('/produtos');
            setProdutos(response.data);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        }
    };

    const adicionarAoCarrinho = (produto) => {
        const itemExistente = carrinho.find(item => item.id === produto.id);

        if (itemExistente) {
            setCarrinho(carrinho.map(item =>
                item.id === produto.id
                    ? { ...item, quantidade: item.quantidade + 1, total: (item.quantidade + 1) * item.precoVenda }
                    : item
            ));
        } else {
            setCarrinho([...carrinho, {
                ...produto,
                quantidade: 1,
                total: parseFloat(produto.precoVenda)
            }]);
        }
        setBusca('');
    };

    const removerDoCarrinho = (produtoId) => {
        setCarrinho(carrinho.filter(item => item.id !== produtoId));
    };

    const calcularTotal = () => {
        return carrinho.reduce((acc, item) => acc + item.total, 0);
    };

    const produtosFiltrados = produtos.filter(p =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: '#f3f4f6' }}>
            {/* Área Esquerda - Busca e Produtos */}
            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Header PDV */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-neutral-800">Caixa Rápido (PDV)</h1>
                    <button className="btn btn-outline" onClick={() => navigate('/')}>Sair (ESC)</button>
                </div>

                {/* Barra de Busca */}
                <div className="card" style={{ padding: '1rem' }}>
                    <div className="flex gap-2">
                        <input
                            ref={buscaInputRef}
                            type="text"
                            className="input"
                            placeholder="Buscar produto por nome ou código (F2)..."
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                            autoFocus
                            style={{ fontSize: '1.25rem', padding: '0.75rem' }}
                        />
                    </div>
                </div>

                {/* Grid de Produtos */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '1rem',
                    overflowY: 'auto',
                    paddingBottom: '1rem'
                }}>
                    {produtosFiltrados.map(produto => (
                        <div
                            key={produto.id}
                            className="card hover:shadow-md cursor-pointer transition-all"
                            onClick={() => adicionarAoCarrinho(produto)}
                            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}
                        >
                            <div>
                                <div className="text-sm text-neutral-500 mb-1">{produto.codigo}</div>
                                <div className="font-semibold mb-2 line-clamp-2">{produto.nome}</div>
                            </div>
                            <div className="font-bold text-primary-600 text-lg">
                                R$ {parseFloat(produto.precoVenda).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Área Direita - Carrinho e Totais */}
            <div style={{ width: '400px', backgroundColor: 'white', borderLeft: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                    <h2 className="text-xl font-bold">Carrinho de Compras</h2>
                    <p className="text-sm text-neutral-500">{carrinho.length} itens adicionados</p>
                </div>

                {/* Lista de Itens */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {carrinho.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                            <p>Carrinho vazio</p>
                            <p className="text-sm">Adicione produtos para começar</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {carrinho.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-2 bg-neutral-50 rounded-lg">
                                    <div className="flex-1">
                                        <div className="font-medium">{item.nome}</div>
                                        <div className="text-sm text-neutral-500">
                                            {item.quantidade}x R$ {parseFloat(item.precoVenda).toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="font-bold">
                                            R$ {item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </div>
                                        <button
                                            onClick={() => removerDoCarrinho(item.id)}
                                            className="text-negative-500 hover:text-negative-700"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Rodapé Totais */}
                <div style={{ padding: '1.5rem', backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg text-neutral-600">Total</span>
                        <span className="text-3xl font-bold text-primary-600">
                            R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>

                    <button
                        className="btn btn-primary w-full"
                        style={{ padding: '1rem', fontSize: '1.125rem', width: '100%' }}
                        disabled={carrinho.length === 0}
                        onClick={() => setShowPagamento(true)}
                    >
                        Finalizar Venda (F5)
                    </button>
                </div>
            </div>

            {/* Modal de Pagamento (Placeholder) */}
            {showPagamento && (
                <div style={{
                    position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div className="card" style={{ width: '500px', padding: '2rem' }}>
                        <h2 className="text-2xl font-bold mb-4">Finalizar Pagamento</h2>
                        <p className="mb-6 text-lg">Total a pagar: <span className="font-bold text-primary-600">R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <button className="btn btn-outline h-12">Dinheiro</button>
                            <button className="btn btn-outline h-12">Cartão de Crédito</button>
                            <button className="btn btn-outline h-12">Cartão de Débito</button>
                            <button className="btn btn-outline h-12">Pix</button>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button className="btn btn-outline" onClick={() => setShowPagamento(false)}>Cancelar</button>
                            <button className="btn btn-positive" onClick={() => alert('Venda finalizada com sucesso!')}>Confirmar Pagamento</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PDV;
