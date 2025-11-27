import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart, LogOut, Search, ShoppingBag, User, UserPlus,
    Trash2, CreditCard, FileText
} from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/Toast';
import { playSound } from '../utils/sounds';
import printReceipt from '../utils/printReceipt';
import BarcodeInput from '../components/BarcodeInput';
import PaymentModal from '../components/PaymentModal';
import QuickClientModal from '../components/QuickClientModal';
import CartItem from '../components/CartItem';

function PDV() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { showToast } = useToast();

    // Estados
    const [produtos, setProdutos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [carrinho, setCarrinho] = useState([]);
    const [busca, setBusca] = useState('');
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPagamento, setShowPagamento] = useState(false);
    const [showQuickClient, setShowQuickClient] = useState(false);
    const [descontoGlobal, setDescontoGlobal] = useState(0);
    const [acrescimo, setAcrescimo] = useState(0);

    // Theme colors
    const bgMain = isDark ? '#0f172a' : '#f8fafc';
    const bgCard = isDark ? '#1e293b' : '#ffffff';
    const bgCardHover = isDark ? '#334155' : '#f9fafb';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#94a3b8' : '#6b7280';
    const borderColor = isDark ? '#334155' : '#e5e7eb';

    // Carregar dados ao iniciar
    useEffect(() => {
        carregarProdutos();
        carregarClientes();
    }, []);

    // Atalhos de teclado
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                document.querySelector('input[placeholder*="Buscar produto"]')?.focus();
            }
            if (e.key === 'F3' && carrinho.length > 0) {
                e.preventDefault();
                setShowPagamento(true);
            }
            if (e.key === 'F4' && carrinho.length > 0) {
                e.preventDefault();
                if (window.confirm('Limpar carrinho?')) {
                    limparVenda();
                    playSound('error');
                }
            }
            if (e.key === 'F5') {
                e.preventDefault();
                setShowQuickClient(true);
            }
            if (e.key === 'F8' && carrinho.length > 0) {
                e.preventDefault();
                handleSaveAsBudget();
            }
            if (e.key === 'Escape' && showPagamento) {
                e.preventDefault();
                setShowPagamento(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [carrinho, showPagamento]);

    const carregarProdutos = async () => {
        try {
            const response = await api.get('/produtos');
            setProdutos(response.data.data || response.data);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            showToast('Erro ao carregar produtos', 'error');
        }
    };

    const carregarClientes = async () => {
        try {
            const response = await api.get('/clientes');
            setClientes(response.data.data || response.data);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        }
    };

    const handleBarcodeScan = async (barcode) => {
        try {
            const produto = produtos.find(p => p.codigo === barcode);
            if (produto) {
                adicionarAoCarrinho(produto);
                playSound('beep');
            } else {
                playSound('error');
                showToast(`Produto não encontrado: ${barcode}`, 'error');
            }
        } catch (error) {
            console.error('Erro ao buscar produto:', error);
            playSound('error');
        }
    };

    const handlePaymentConfirm = async (paymentData) => {
        setLoading(true);
        setShowPagamento(false);
        try {
            const subtotal = calcularSubtotal();
            const total = subtotal - descontoGlobal + acrescimo;

            const vendaData = {
                clienteId: clienteSelecionado?.id || null,
                itens: carrinho.map(item => ({
                    produtoId: item.id,
                    quantidade: item.quantidade,
                    precoUnit: parseFloat(item.precoVenda),
                    desconto: item.desconto || 0,
                    total: item.total
                })),
                subtotal: subtotal,
                desconto: descontoGlobal,
                acrescimo: acrescimo,
                total: total,
                formaPagamento: paymentData.formaPagamento,
                status: 'concluida'
            };

            // 🪷 Se for crediário, adicionar dados específicos
            if (paymentData.formaPagamento === 'crediario') {
                vendaData.modoCrediario = paymentData.modoCrediario || 'PADRAO';
                vendaData.numParcelas = paymentData.numParcelas;
                vendaData.primeiroVencimento = paymentData.primeiroVencimento;
            }

            const response = await api.post('/vendas', vendaData);

            playSound('success');

            if (paymentData.formaPagamento === 'crediario') {
                showToast(`✅ Venda #${response.data.numero} criada! Crediário de ${paymentData.numParcelas}x parcelas gerado com sucesso!`, 'success');
            } else {
                showToast(`Venda #${response.data.numero} realizada com sucesso!`, 'success');
            }

            printReceipt({
                ...response.data,
                cliente: clienteSelecionado
            });

            limparVenda();
        } catch (error) {
            console.error('Erro ao finalizar venda:', error);
            showToast(error.response?.data?.error || 'Erro ao finalizar venda', 'error');
            playSound('error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAsBudget = async () => {
        try {
            const subtotal = calcularSubtotal();
            const total = subtotal - descontoGlobal + acrescimo;

            const orcamentoData = {
                clienteId: clienteSelecionado?.id || null,
                itens: carrinho.map(item => ({
                    produtoId: item.id,
                    quantidade: item.quantidade,
                    precoUnit: parseFloat(item.precoVenda),
                    desconto: item.desconto || 0,
                    total: item.total
                })),
                subtotal: subtotal,
                desconto: descontoGlobal,
                acrescimo: acrescimo,
                total: total,
                status: 'pendente'
            };

            const response = await api.post('/orcamentos', orcamentoData);

            playSound('success');
            showToast(`Orçamento #${response.data.numero} salvo com sucesso!`, 'success');
            limparVenda();
            navigate('/orcamentos');
        } catch (error) {
            console.error('Erro ao salvar orçamento:', error);
            showToast(error.response?.data?.error || 'Erro ao salvar orçamento', 'error');
            playSound('error');
        }
    };

    const adicionarAoCarrinho = (produto) => {
        const itemExistente = carrinho.find(item => item.id === produto.id);

        if (itemExistente) {
            updateItemQuantity(produto.id, itemExistente.quantidade + 1);
        } else {
            setCarrinho([...carrinho, {
                ...produto,
                quantidade: 1,
                desconto: 0,
                total: parseFloat(produto.precoVenda)
            }]);
        }
        setBusca('');
        playSound('beep');
    };

    const updateItemQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;

        setCarrinho(carrinho.map(item => {
            if (item.id === itemId) {
                const subtotal = newQuantity * item.precoVenda;
                const total = subtotal - (item.desconto || 0);
                return { ...item, quantidade: newQuantity, total };
            }
            return item;
        }));
    };

    const updateItemDiscount = (itemId, discount) => {
        setCarrinho(carrinho.map(item => {
            if (item.id === itemId) {
                const subtotal = item.quantidade * item.precoVenda;
                const total = subtotal - discount;
                return { ...item, desconto: discount, total };
            }
            return item;
        }));
    };

    const removerDoCarrinho = (produtoId) => {
        setCarrinho(carrinho.filter(item => item.id !== produtoId));
    };

    const calcularSubtotal = () => {
        return carrinho.reduce((acc, item) => acc + item.total, 0);
    };

    const calcularTotal = () => {
        const subtotal = calcularSubtotal();
        return subtotal - descontoGlobal + acrescimo;
    };

    const limparVenda = () => {
        setCarrinho([]);
        setClienteSelecionado(null);
        setShowPagamento(false);
        setBusca('');
        setDescontoGlobal(0);
        setAcrescimo(0);
    };

    const produtosFiltrados = produtos.filter(p =>
        p.nome.toLowerCase().includes(busca.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: bgMain }}>
            {/* Área Esquerda - Busca e Produtos */}
            <div style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Header PDV */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <ShoppingCart size={28} color="#8b5cf6" />
                        <h1 style={{ fontSize: '24px', fontWeight: '700', color: textPrimary, margin: 0 }}>Ponto de Venda</h1>
                    </div>
                    <button
                        className="btn btn-outline"
                        onClick={() => navigate('/')}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <LogOut size={18} />
                        Sair (ESC)
                    </button>
                </div>

                {/* Barcode Scanner */}
                <BarcodeInput onScan={handleBarcodeScan} />

                {/* Barra de Busca */}
                <div className="card" style={{ padding: '1rem', position: 'relative' }}>
                    <Search
                        size={20}
                        style={{
                            position: 'absolute',
                            left: '1.75rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: textSecondary,
                            pointerEvents: 'none'
                        }}
                    />
                    <input
                        type="text"
                        className="input"
                        placeholder="Buscar produto por nome ou código (F2)..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        style={{ fontSize: '1.125rem', padding: '0.75rem 0.75rem 0.75rem 3rem', width: '100%' }}
                    />
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
            <div style={{ width: '450px', backgroundColor: bgCard, borderLeft: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column' }}>
                {/* Header Carrinho */}
                <div style={{ padding: '1.5rem', borderBottom: `1px solid ${borderColor}`, backgroundColor: bgCardHover }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        <ShoppingBag size={24} color="#8b5cf6" />
                        <h2 style={{ fontSize: '20px', fontWeight: '700', color: textPrimary, margin: 0 }}>Carrinho</h2>
                    </div>

                    {/* 🪷 Cliente Selector */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {clienteSelecionado ? (
                            <div style={{
                                flex: 1,
                                padding: '0.5rem',
                                backgroundColor: isDark ? '#5b21b6' : '#faf5ff',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <User size={16} color="#8b5cf6" />
                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#8b5cf6' }}>
                                        {clienteSelecionado.nome}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setClienteSelecionado(null)}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        padding: '2px'
                                    }}
                                    title="Remover cliente (F5)"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ) : (
                            <>
                                <select
                                    value=""
                                    onChange={(e) => {
                                        const cliente = clientes.find(c => c.id === parseInt(e.target.value));
                                        if (cliente) {
                                            setClienteSelecionado(cliente);
                                            playSound('success');
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.5rem',
                                        border: `1px solid ${borderColor}`,
                                        borderRadius: '6px',
                                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                                        color: textPrimary,
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <option value="">👤 Selecionar Cliente...</option>
                                    {clientes.map(cliente => (
                                        <option key={cliente.id} value={cliente.id}>
                                            {cliente.nome} {cliente.cpf ? `- ${cliente.cpf}` : ''}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    className="btn btn-outline"
                                    onClick={() => setShowQuickClient(true)}
                                    style={{
                                        padding: '0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    title="Cadastrar novo cliente (F5)"
                                >
                                    <UserPlus size={16} />
                                </button>
                            </>
                        )}
                    </div>
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
                                <CartItem
                                    key={item.id}
                                    item={item}
                                    onUpdateQuantity={updateItemQuantity}
                                    onUpdateDiscount={updateItemDiscount}
                                    onRemove={removerDoCarrinho}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Rodapé Totais */}
                <div style={{ padding: '1.5rem', backgroundColor: bgCardHover, borderTop: `1px solid ${borderColor}` }}>
                    {/* Resumo Financeiro */}
                    <div style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: textSecondary }}>
                            <span>Subtotal</span>
                            <span style={{ fontWeight: '600' }}>R$ {calcularSubtotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        </div>
                        {descontoGlobal > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#10b981' }}>
                                <span>Desconto (F6)</span>
                                <span style={{ fontWeight: '600' }}>- R$ {descontoGlobal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        {acrescimo > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#ef4444' }}>
                                <span>Acréscimo</span>
                                <span style={{ fontWeight: '600' }}>+ R$ {acrescimo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}
                        <div style={{ height: '1px', backgroundColor: borderColor, margin: '0.5rem 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '18px', fontWeight: '600', color: textPrimary }}>Total</span>
                            <span style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>
                                R$ {calcularTotal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    {/* Botões */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <button
                            className="btn btn-primary"
                            style={{
                                padding: '1rem',
                                fontSize: '1.125rem',
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                            disabled={carrinho.length === 0}
                            onClick={() => setShowPagamento(true)}
                        >
                            <CreditCard size={20} />
                            Finalizar Venda
                            <span style={{ opacity: 0.7, fontSize: '0.875rem' }}>(F3)</span>
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button
                                className="btn btn-outline"
                                disabled={carrinho.length === 0}
                                onClick={handleSaveAsBudget}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '14px'
                                }}
                            >
                                <FileText size={16} />
                                Orçamento (F8)
                            </button>

                            <button
                                className="btn btn-outline"
                                disabled={carrinho.length === 0}
                                onClick={() => {
                                    if (window.confirm('Limpar carrinho?')) {
                                        limparVenda();
                                        playSound('error');
                                    }
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '14px'
                                }}
                            >
                                <Trash2 size={16} />
                                Limpar (F4)
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <PaymentModal
                isOpen={showPagamento}
                onClose={() => setShowPagamento(false)}
                totalAmount={calcularTotal()}
                clienteId={clienteSelecionado?.id}
                onConfirm={handlePaymentConfirm}
            />

            <QuickClientModal
                isOpen={showQuickClient}
                onClose={() => setShowQuickClient(false)}
                onClientCreated={(newClient) => {
                    setClienteSelecionado(newClient);
                    setClientes([...clientes, newClient]);
                }}
            />
        </div>
    );
}

export default PDV;
