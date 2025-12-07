import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShoppingCart, LogOut, Search, ShoppingBag, CreditCard, FileText, Trash2, Store
} from 'lucide-react';
import api from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useFilters } from '../contexts/FilterContext';
import { useToast } from '../components/Toast';
import { playSound } from '../utils/sounds';
import { devLog } from '../utils/logger';
import { formatCurrency } from '../utils/formatters';
import printReceipt from '../utils/printReceipt';
import BarcodeInput from '../components/BarcodeInput';
import PaymentModal from '../components/PaymentModal';
import QuickClientModal from '../components/QuickClientModal';
import ProductCard from '../components/pdv/ProductCard';
import CartItemCard from '../components/pdv/CartItemCard';
import ClientSelector from '../components/pdv/ClientSelector';
import ClientBadge from '../components/pdv/ClientBadge';
import ConfirmModal from '../components/ConfirmModal';
import StoreDropdown from '../components/StoreDropdown';
import MissingDataModal from '../components/MissingDataModal';

/**
 * PDV - Ponto de Venda
 * Performance Optimized Version
 */
function PDV() {
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const { store, setStore, stores } = useFilters();
    const { showToast } = useToast();

    // Refs for debounce
    const searchTimeoutRef = useRef(null);

    // Estados
    const [produtos, setProdutos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [carrinho, setCarrinho] = useState([]);
    const [busca, setBusca] = useState('');
    const [buscaDebounced, setBuscaDebounced] = useState('');
    const [clienteSelecionado, setClienteSelecionado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPagamento, setShowPagamento] = useState(false);
    const [showQuickClient, setShowQuickClient] = useState(false);
    const [descontoGlobal, setDescontoGlobal] = useState(0);
    const [acrescimo, setAcrescimo] = useState(0);
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    // Estado para dados faltantes do cliente (Recibo)
    const [missingData, setMissingData] = useState(null);
    const [showMissingDataModal, setShowMissingDataModal] = useState(false);
    const [lastCompleteSale, setLastCompleteSale] = useState(null);

    // Theme colors - memoized
    const themeColors = useMemo(() => ({
        bgMain: isDark ? '#0f172a' : '#f8fafc',
        bgCard: isDark ? '#1e293b' : '#ffffff',
        bgCardHover: isDark ? '#334155' : '#f9fafb',
        textPrimary: isDark ? '#f1f5f9' : '#1f2937',
        textSecondary: isDark ? '#94a3b8' : '#6b7280',
        borderColor: isDark ? '#334155' : '#e5e7eb'
    }), [isDark]);

    const { bgMain, bgCard, bgCardHover, textPrimary, textSecondary, borderColor } = themeColors;

    // =========== MEMOIZED CALCULATIONS ===========

    // Subtotal calculation - only recalculates when carrinho changes
    const subtotal = useMemo(() => {
        return carrinho.reduce((acc, item) => acc + item.total, 0);
    }, [carrinho]);

    // Total calculation - only recalculates when subtotal, descontoGlobal or acrescimo change
    const total = useMemo(() => {
        return subtotal - descontoGlobal + acrescimo;
    }, [subtotal, descontoGlobal, acrescimo]);

    // Cart item count - memoized
    const cartItemCount = useMemo(() => carrinho.length, [carrinho]);

    // Filtered products - only recalculates when necessary
    const produtosFiltrados = useMemo(() => {
        const searchLower = buscaDebounced.toLowerCase();
        return produtos.filter(p =>
            (p.nome.toLowerCase().includes(searchLower) ||
                p.codigo.toLowerCase().includes(searchLower)) &&
            (store === 'all' || !p.lojaId || p.lojaId === store)
        );
    }, [produtos, buscaDebounced, store]);

    // =========== DEBOUNCED SEARCH ===========

    const handleSearchChange = useCallback((e) => {
        const value = e.target.value;
        setBusca(value);

        // Debounce the actual search
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setBuscaDebounced(value);
        }, 300); // 300ms debounce
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    // =========== DATA LOADING ===========

    const carregarProdutos = useCallback(async () => {
        try {
            const response = await api.get('/produtos');
            setProdutos(response.data.data || response.data);
        } catch (error) {
            devLog('Erro ao carregar produtos:', error);
            showToast('Erro ao carregar produtos', 'error');
        }
    }, [showToast]);

    const carregarClientes = useCallback(async () => {
        try {
            const response = await api.get('/clientes');
            setClientes(response.data.data || response.data);
        } catch (error) {
            devLog('Erro ao carregar clientes:', error);
        }
    }, []);

    // Load data on mount and when store changes
    useEffect(() => {
        carregarProdutos();
        carregarClientes();
    }, [store, carregarProdutos, carregarClientes]);

    // =========== MEMOIZED HANDLERS ===========

    const handleBarcodeScan = useCallback((barcode) => {
        try {
            const produto = produtos.find(p =>
                p.codigo === barcode &&
                (store === 'all' || !p.lojaId || p.lojaId === store)
            );

            if (produto) {
                setCarrinho(prev => {
                    const itemExistente = prev.find(item => item.id === produto.id);
                    if (itemExistente) {
                        return prev.map(item => {
                            if (item.id === produto.id) {
                                const newQty = item.quantidade + 1;
                                const itemSubtotal = newQty * item.precoVenda;
                                return { ...item, quantidade: newQty, total: itemSubtotal - (item.desconto || 0) };
                            }
                            return item;
                        });
                    }
                    return [...prev, {
                        ...produto,
                        quantidade: 1,
                        desconto: 0,
                        total: parseFloat(produto.precoVenda)
                    }];
                });
                playSound('beep');
            } else {
                playSound('error');
                if (store !== 'all' && produtos.find(p => p.codigo === barcode)) {
                    showToast(`Produto pertence a outra loja`, 'error');
                } else {
                    showToast(`Produto não encontrado: ${barcode}`, 'error');
                }
            }
        } catch (error) {
            devLog('Erro ao buscar produto:', error);
            playSound('error');
        }
    }, [produtos, store, showToast]);

    const handleOpenPayment = useCallback(() => {
        if (store === 'all') {
            showToast('Selecione uma loja antes de finalizar a venda', 'error');
            playSound('error');
            return;
        }
        setShowPagamento(true);
    }, [store, showToast]);

    const limparVenda = useCallback(() => {
        setCarrinho([]);
        setClienteSelecionado(null);
        setShowPagamento(false);
        setBusca('');
        setBuscaDebounced('');
        setDescontoGlobal(0);
        setAcrescimo(0);
    }, []);

    const handlePaymentConfirm = useCallback(async (paymentData) => {
        if (store === 'all') {
            showToast('Selecione uma loja antes de finalizar a venda', 'error');
            return;
        }

        setLoading(true);
        setShowPagamento(false);
        try {
            const vendaData = {
                clienteId: clienteSelecionado?.id || null,
                lojaId: store,
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

            if (paymentData.formaPagamento === 'crediario') {
                vendaData.modoCrediario = paymentData.modoCrediario || 'PADRAO';
                vendaData.numParcelas = paymentData.numParcelas;
                vendaData.primeiroVencimento = paymentData.primeiroVencimento;
            }

            if (paymentData.formaPagamento === 'cartao_credito' && paymentData.parcelas) {
                vendaData.parcelas = paymentData.parcelas;
            }

            const response = await api.post('/vendas', vendaData);

            playSound('success');

            if (paymentData.formaPagamento === 'crediario') {
                showToast(`✅ Venda #${response.data.numero} criada! Crediário de ${paymentData.numParcelas}x parcelas gerado com sucesso!`, 'success');
            } else {
                showToast(`Venda #${response.data.numero} realizada com sucesso!`, 'success');
            }

            try {
                await printReceipt({
                    ...response.data,
                    cliente: clienteSelecionado
                });
            } catch (error) {
                devLog('Erro ao imprimir recibo no PDV:', error);
                if (error.response?.status === 400 && error.response?.data?.faltando) {
                    setLastCompleteSale({ ...response.data, cliente: clienteSelecionado });
                    setMissingData({
                        clienteId: error.response.data.clienteId,
                        missingFields: error.response.data.faltando
                    });
                    setShowMissingDataModal(true);
                } else {
                    showToast('Erro ao gerar recibo. Você pode tentar novamente na tela de Vendas.', 'error');
                }
            }

            limparVenda();
        } catch (error) {
            devLog('Erro ao finalizar venda:', error);
            showToast(error.response?.data?.error || 'Erro ao finalizar venda', 'error');
            playSound('error');
        } finally {
            setLoading(false);
        }
    }, [store, clienteSelecionado, carrinho, subtotal, descontoGlobal, acrescimo, total, showToast, limparVenda]);

    const handleSaveAsBudget = useCallback(async () => {
        if (carrinho.length === 0) {
            showToast('Adicione produtos ao carrinho primeiro', 'error');
            playSound('error');
            return;
        }

        if (store === 'all') {
            showToast('Selecione uma loja antes de criar o orçamento', 'error');
            playSound('error');
            return;
        }

        setLoading(true);
        try {
            const orcamentoData = {
                clienteId: clienteSelecionado?.id || null,
                lojaId: store,
                itens: carrinho.map(item => ({
                    produtoId: item.id,
                    descricao: item.nome,
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
            showToast(`✅ Orçamento #${response.data.numero} criado com sucesso!`, 'success');
            limparVenda();

            setTimeout(() => {
                navigate('/orcamentos');
            }, 1500);
        } catch (error) {
            devLog('Erro ao salvar orçamento:', error);
            showToast(error.response?.data?.error || 'Erro ao salvar orçamento', 'error');
            playSound('error');
        } finally {
            setLoading(false);
        }
    }, [carrinho, store, clienteSelecionado, subtotal, descontoGlobal, acrescimo, total, showToast, navigate, limparVenda]);

    const adicionarAoCarrinho = useCallback((produto) => {
        setCarrinho(prev => {
            const itemExistente = prev.find(item => item.id === produto.id);
            if (itemExistente) {
                return prev.map(item => {
                    if (item.id === produto.id) {
                        const newQty = item.quantidade + 1;
                        const itemSubtotal = newQty * item.precoVenda;
                        return { ...item, quantidade: newQty, total: itemSubtotal - (item.desconto || 0) };
                    }
                    return item;
                });
            }
            return [...prev, {
                ...produto,
                quantidade: 1,
                desconto: 0,
                total: parseFloat(produto.precoVenda)
            }];
        });
        setBusca('');
        setBuscaDebounced('');
        playSound('beep');
    }, []);

    const updateItemQuantity = useCallback((itemId, newQuantity) => {
        if (newQuantity < 1) return;

        setCarrinho(prev => prev.map(item => {
            if (item.id === itemId) {
                const itemSubtotal = newQuantity * item.precoVenda;
                const itemTotal = itemSubtotal - (item.desconto || 0);
                return { ...item, quantidade: newQuantity, total: itemTotal };
            }
            return item;
        }));
    }, []);

    const updateItemDiscount = useCallback((itemId, discount) => {
        setCarrinho(prev => prev.map(item => {
            if (item.id === itemId) {
                const itemSubtotal = item.quantidade * item.precoVenda;
                const itemTotal = itemSubtotal - discount;
                return { ...item, desconto: discount, total: itemTotal };
            }
            return item;
        }));
    }, []);

    const removerDoCarrinho = useCallback((produtoId) => {
        setCarrinho(prev => prev.filter(item => item.id !== produtoId));
    }, []);

    const handleStoreChange = useCallback((newStore) => {
        devLog('🏪 PDV: Changing store to:', newStore);
        setStore(newStore);
    }, [setStore]);

    const handleClientSelect = useCallback((cliente) => {
        setClienteSelecionado(cliente);
    }, []);

    const handleRemoveClient = useCallback(() => {
        setClienteSelecionado(null);
    }, []);

    const handleOpenQuickClient = useCallback(() => {
        setShowQuickClient(true);
    }, []);

    const handleCloseQuickClient = useCallback(() => {
        setShowQuickClient(false);
    }, []);

    const handleClientCreated = useCallback((newClient) => {
        setClienteSelecionado(newClient);
        setClientes(prev => [...prev, newClient]);
    }, []);

    const handleClosePagamento = useCallback(() => {
        setShowPagamento(false);
    }, []);

    const handleOpenClearConfirm = useCallback(() => {
        setShowClearConfirm(true);
    }, []);

    const handleCloseClearConfirm = useCallback(() => {
        setShowClearConfirm(false);
    }, []);

    const handleConfirmClear = useCallback(() => {
        limparVenda();
        playSound('error');
        setShowClearConfirm(false);
    }, [limparVenda]);

    const handleCloseMissingData = useCallback(() => {
        setShowMissingDataModal(false);
    }, []);

    const handleMissingDataSuccess = useCallback(() => {
        if (lastCompleteSale) {
            printReceipt(lastCompleteSale).catch(err => {
                devLog('Retry failed', err);
                showToast('Erro ao imprimir recibo mesmo após atualização.', 'error');
            });
        }
    }, [lastCompleteSale, showToast]);

    // =========== KEYBOARD SHORTCUTS ===========

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'F2') {
                e.preventDefault();
                document.querySelector('input[placeholder*="Buscar produto"]')?.focus();
            }
            if (e.key === 'F3' && cartItemCount > 0) {
                e.preventDefault();
                handleOpenPayment();
            }
            if (e.key === 'F4' && cartItemCount > 0) {
                e.preventDefault();
                handleOpenClearConfirm();
            }
            if (e.key === 'F5') {
                e.preventDefault();
                handleOpenQuickClient();
            }
            if (e.key === 'F8' && cartItemCount > 0) {
                e.preventDefault();
                handleSaveAsBudget();
            }
            if (e.key === 'Escape' && showPagamento) {
                e.preventDefault();
                handleClosePagamento();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [cartItemCount, showPagamento, handleOpenPayment, handleSaveAsBudget, handleOpenQuickClient, handleOpenClearConfirm, handleClosePagamento]);

    // =========== RENDER ===========

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

                    {/* Store Selector */}
                    <div style={{ minWidth: '250px' }}>
                        <StoreDropdown
                            stores={stores}
                            selectedStore={store}
                            onChange={handleStoreChange}
                            onNewStore={() => { }}
                            onManage={() => { }}
                        />
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
                        onChange={handleSearchChange}
                        style={{ fontSize: '1.125rem', padding: '0.75rem 0.75rem 0.75rem 3rem', width: '100%' }}
                        disabled={store === 'all'}
                    />
                </div>

                {/* Grid de Produtos */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '16px',
                    overflowY: 'auto',
                    paddingBottom: '1rem'
                }}>
                    {store === 'all' ? (
                        <div style={{
                            gridColumn: '1 / -1',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: '300px',
                            color: textSecondary,
                            opacity: 0.7
                        }}>
                            <Store size={64} style={{ marginBottom: '1rem' }} />
                            <p style={{ fontSize: '18px', fontWeight: '600' }}>Selecione uma loja no menu superior</p>
                            <p>Para visualizar produtos e realizar vendas</p>
                        </div>
                    ) : (
                        produtosFiltrados.map(produto => (
                            <ProductCard
                                key={produto.id}
                                produto={produto}
                                onClick={adicionarAoCarrinho}
                            />
                        ))
                    )}
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

                    {/* Cliente Selector */}
                    <div style={{ marginBottom: '0rem' }}>
                        {clienteSelecionado ? (
                            <ClientBadge
                                cliente={clienteSelecionado}
                                onRemove={handleRemoveClient}
                            />
                        ) : (
                            <ClientSelector
                                clientes={clientes}
                                onSelect={handleClientSelect}
                                onNewClient={handleOpenQuickClient}
                            />
                        )}
                    </div>
                </div>

                {/* Lista de Itens */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                    {cartItemCount === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-neutral-400">
                            <ShoppingBag size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
                            <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>Carrinho vazio</p>
                            <p className="text-sm">Adicione produtos para começar</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            {carrinho.map(item => (
                                <CartItemCard
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
                            <span style={{ fontWeight: '600' }}>{formatCurrency(subtotal)}</span>
                        </div>
                        {descontoGlobal > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#10b981' }}>
                                <span>Desconto (F6)</span>
                                <span style={{ fontWeight: '600' }}>- {formatCurrency(descontoGlobal)}</span>
                            </div>
                        )}
                        {acrescimo > 0 && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#ef4444' }}>
                                <span>Acréscimo</span>
                                <span style={{ fontWeight: '600' }}>+ {formatCurrency(acrescimo)}</span>
                            </div>
                        )}
                        <div style={{ height: '1px', backgroundColor: borderColor, margin: '0.5rem 0' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '18px', fontWeight: '600', color: textPrimary }}>Total</span>
                            <span style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>
                                {formatCurrency(total)}
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
                                gap: '0.5rem',
                                opacity: store === 'all' ? 0.5 : 1,
                                cursor: store === 'all' ? 'not-allowed' : 'pointer'
                            }}
                            disabled={cartItemCount === 0 || store === 'all'}
                            onClick={handleOpenPayment}
                        >
                            <CreditCard size={20} />
                            Finalizar Venda
                            <span style={{ opacity: 0.7, fontSize: '0.875rem' }}>(F3)</span>
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button
                                className="btn btn-outline"
                                disabled={cartItemCount === 0 || store === 'all'}
                                onClick={handleSaveAsBudget}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '14px',
                                    opacity: store === 'all' ? 0.5 : 1,
                                    cursor: store === 'all' ? 'not-allowed' : 'pointer'
                                }}
                            >
                                <FileText size={16} />
                                Orçamento (F8)
                            </button>

                            <button
                                className="btn btn-outline"
                                disabled={cartItemCount === 0}
                                onClick={handleOpenClearConfirm}
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
                onClose={handleClosePagamento}
                totalAmount={total}
                clienteId={clienteSelecionado?.id}
                onConfirm={handlePaymentConfirm}
            />

            <QuickClientModal
                isOpen={showQuickClient}
                onClose={handleCloseQuickClient}
                onClientCreated={handleClientCreated}
            />

            <ConfirmModal
                isOpen={showClearConfirm}
                onClose={handleCloseClearConfirm}
                onConfirm={handleConfirmClear}
                title="Limpar Carrinho"
                message="Tem certeza que deseja limpar todos os itens do carrinho? Esta ação não pode ser desfeita."
                type="warning"
            />

            <MissingDataModal
                isOpen={showMissingDataModal}
                onClose={handleCloseMissingData}
                missingFields={missingData?.missingFields}
                clienteId={missingData?.clienteId}
                onSuccess={handleMissingDataSuccess}
            />
        </div>
    );
}

export default PDV;
