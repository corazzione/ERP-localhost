import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import InvoiceService from '../services/InvoiceService';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';
import MissingDataModal from '../components/MissingDataModal';
import SalesKPIs from '../components/vendas/SalesKPIs';
import OrderOverview from '../components/vendas/OrderOverview';
import SalesFilters from '../components/vendas/SalesFilters';
import {
    Eye,
    Download,
    Send,
    ChevronLeft,
    ChevronRight,
    Package,
    ClipboardList,
    Store,
    User,
    Calendar,
    CreditCard
} from 'lucide-react';
import '../components/vendas/Sales.css';

import { useTheme } from '../contexts/ThemeContext';

// ... imports ...

function Vendas() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { isDark } = useTheme();

    // Estados de Dados
    const [vendas, setVendas] = useState([]);
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingKPIs, setLoadingKPIs] = useState(true);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1
    });

    // Estados de Filtros
    const [filtros, setFiltros] = useState({
        lojaId: '',
        dataInicio: '',
        dataFim: '',
        status: '',
        formaPagamento: '',
        clienteId: '',
        numero: ''
    });
    const [showFilters, setShowFilters] = useState(false);

    // Estados de Seleção e Modal
    const [selectedVenda, setSelectedVenda] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Estado para dados faltantes do cliente
    const [missingData, setMissingData] = useState(null);
    const [showMissingDataModal, setShowMissingDataModal] = useState(false);

    // Dados Auxiliares
    const [clientes, setClientes] = useState([]);
    const [lojas, setLojas] = useState([]);

    // Carregar dados auxiliares
    useEffect(() => {
        const loadAuxData = async () => {
            try {
                const [clientesRes, lojasRes] = await Promise.all([
                    api.get('/clientes'),
                    api.get('/stores')
                ]);
                setClientes(clientesRes.data.data || clientesRes.data || []);
                setLojas(lojasRes.data || []);
            } catch (error) {
                console.error('Erro ao carregar dados auxiliares', error);
            }
        };
        loadAuxData();
    }, []);

    // Carregar KPIs
    const carregarKPIs = useCallback(async () => {
        setLoadingKPIs(true);
        try {
            const params = { ...filtros };
            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            const response = await api.get('/vendas/kpis', { params });
            setKpis(response.data);
        } catch (error) {
            console.error('Erro ao carregar KPIs:', error);
        } finally {
            setLoadingKPIs(false);
        }
    }, [filtros]);

    // Carregar vendas
    const carregarVendas = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit,
                ...filtros
            };

            Object.keys(params).forEach(key => {
                if (params[key] === '' || params[key] === null) {
                    delete params[key];
                }
            });

            console.log('🚀 Enviando para API /vendas com params:', params);

            const response = await api.get('/vendas', { params });

            if (response.data.pagination) {
                setVendas(response.data.data);
                setPagination(prev => ({ ...prev, ...response.data.pagination }));
            } else {
                setVendas(response.data);
            }
        } catch (error) {
            console.error('Erro ao carregar vendas:', error);
        } finally {
            setLoading(false);
        }
    }, [pagination.page, pagination.limit, filtros]);

    useEffect(() => {
        carregarVendas();
        carregarKPIs();
    }, [carregarVendas, carregarKPIs]);

    // Handlers
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        console.log('🎯 Filter Changed:', { name, value, type: typeof value });
        setFiltros(prev => {
            const newFiltros = { ...prev, [name]: value };
            console.log('📦 New Filtros State:', newFiltros);
            return newFiltros;
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const limparFiltros = () => {
        setFiltros({
            lojaId: '',
            dataInicio: '',
            dataFim: '',
            status: '',
            formaPagamento: '',
            clienteId: '',
            numero: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleStatusFilter = (status) => {
        setFiltros(prev => ({ ...prev, status }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({ ...prev, page: newPage }));
        }
    };

    const abrirDetalhes = async (vendaId) => {
        // 1. Tentar encontrar nos dados locais primeiro para abrir rápido
        const vendaLocal = vendas.find(v => v.id === vendaId);
        if (vendaLocal) {
            setSelectedVenda(vendaLocal);
            setIsModalOpen(true);
        }

        // 2. Buscar dados completos em background (itens, etc podem não estar na lista)
        setLoadingDetails(true);
        try {
            const response = await api.get(`/vendas/${vendaId}`);
            setSelectedVenda(response.data);
            if (!vendaLocal) setIsModalOpen(true); // Se não tinha local, abre agora
        } catch (error) {
            showToast('Erro ao carregar detalhes da venda', 'error');
            if (!vendaLocal) setIsModalOpen(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleDownloadPDF = async (vendaId) => {
        try {
            showToast('Gerando PDF...', 'info');
            await InvoiceService.downloadInvoice(vendaId);
            showToast('PDF baixado com sucesso', 'success');
        } catch (error) {
            console.error(error);
            if (error.response?.status === 400 && error.response?.data?.faltando) {
                setMissingData({
                    vendaId: vendaId,
                    clienteId: error.response.data.clienteId,
                    missingFields: error.response.data.faltando
                });
                setShowMissingDataModal(true);
            } else {
                showToast('Erro ao baixar PDF', 'error');
            }
        }
    };

    const handleWhatsAppShare = (venda) => {
        const telefone = venda.cliente?.telefone?.replace(/\D/g, '');
        if (!telefone) {
            showToast('Cliente sem telefone cadastrado', 'warning');
            return;
        }

        const data = new Date(venda.dataVenda).toLocaleDateString('pt-BR');
        const total = parseFloat(venda.total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const mensagem = `Olá ${venda.cliente.nome}, aqui está o resumo da sua compra #${venda.numero} realizada em ${data}. Total: ${total}.`;

        const link = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
        window.open(link, '_blank');
    };

    // Helpers
    const getStatusClass = (status) => {
        const map = {
            'pago': 'concluida',
            'concluida': 'concluida',
            'concluido': 'concluida',
            'pendente': 'pendente',
            'cancelada': 'cancelada',
            'cancelado': 'cancelada',
            'orcamento': 'orcamento',
            'crediario': 'crediario'
        };
        return map[status] || 'pendente';
    };

    const getStatusLabel = (status) => {
        const map = {
            'pago': 'Concluída',
            'concluida': 'Concluída',
            'concluido': 'Concluída',
            'pendente': 'Pendente',
            'cancelada': 'Cancelada',
            'cancelado': 'Cancelada',
            'orcamento': 'Orçamento',
            'crediario': 'Crediário'
        };
        return map[status] || status;
    };

    const getFormaPagamentoLabel = (forma) => {
        const labels = {
            'dinheiro': 'Dinheiro',
            'cartao_credito': 'Crédito',
            'cartao_debito': 'Débito',
            'pix': 'Pix',
            'crediario': 'Crediário',
            'credito_loja': 'Crédito Loja'
        };
        return labels[forma] || forma;
    };

    // Debug Panel Component
    const DebugPanel = () => (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '20px', // Left side to avoid conflict with PDV panel if both open (unlikely but safe)
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            color: '#00ff00',
            padding: '15px',
            borderRadius: '8px',
            fontFamily: 'monospace',
            fontSize: '11px',
            zIndex: 9999,
            pointerEvents: 'none',
            maxWidth: '350px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
        }}>
            <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #00ff00', paddingBottom: '5px' }}>🐞 Sales Debug Info</h3>

            <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#fff' }}>Status:</strong>
                <div>Loading: {loading ? 'YES' : 'NO'}</div>
                <div>Sales Count: {vendas.length}</div>
                <div>Total Records: {pagination.total}</div>
                <div>Theme: {isDark ? 'DARK' : 'LIGHT'}</div>
            </div>

            <div style={{ marginBottom: '8px' }}>
                <strong style={{ color: '#fff' }}>Active Filters:</strong>
                {Object.entries(filtros).map(([key, value]) => {
                    if (!value) return null;
                    let displayValue = String(value);
                    if (key === 'lojaId') {
                        const store = lojas.find(l => l.id === value);
                        displayValue = store ? store.nome : value;
                    }
                    return <div key={key}>{key}: <span style={{ color: '#ffff00' }}>{displayValue}</span></div>
                })}
                {!Object.values(filtros).some(Boolean) && <div>(None)</div>}
            </div>

            <div>
                <strong style={{ color: '#fff' }}>Pagination:</strong>
                <div>Page: {pagination.page} / {pagination.totalPages}</div>
            </div>
        </div>
    );

    return (
        <div className="sales-page-container">
            <DebugPanel />
            {/* 1. KPI Cards */}
            <SalesKPIs kpis={kpis} loading={loadingKPIs} />

            {/* 2. Order Overview */}
            <OrderOverview
                statusBreakdown={kpis?.statusBreakdown}
                onStatusFilter={handleStatusFilter}
                loading={loadingKPIs}
            />

            {/* 3. Filters */}
            <SalesFilters
                filtros={filtros}
                onFilterChange={handleFilterChange}
                onClearFilters={limparFiltros}
                clientes={clientes}
                lojas={lojas}
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
            />

            {/* 4. Table */}
            <div className="sales-table-container">
                <table className="sales-table">
                    <thead>
                        <tr>
                            <th>Nº Venda</th>
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Loja</th>
                            <th>Pagamento</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th className="text-right">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td colSpan="8" className="px-6 py-4">
                                        <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                                    </td>
                                </tr>
                            ))
                        ) : vendas.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                                    <Package size={32} className="mx-auto mb-2 opacity-50" />
                                    Nenhuma venda encontrada.
                                </td>
                            </tr>
                        ) : (
                            vendas.map((venda) => (
                                <tr key={venda.id}>
                                    <td className="font-semibold">#{venda.numero}</td>
                                    <td>{new Date(venda.dataVenda).toLocaleDateString('pt-BR')}</td>
                                    <td>{venda.cliente?.nome || 'Cliente Balcão'}</td>
                                    <td>{venda.loja?.nome || 'Loja Principal'}</td>
                                    <td>{getFormaPagamentoLabel(venda.formaPagamento)}</td>
                                    <td>
                                        <span className={`status-chip ${getStatusClass(venda.status)}`}>
                                            {getStatusLabel(venda.status)}
                                        </span>
                                    </td>
                                    <td className="font-bold">R$ {parseFloat(venda.total).toFixed(2)}</td>
                                    <td className="text-right">
                                        <div className="flex justify-end items-center">
                                            <button
                                                className="action-btn"
                                                title="Ver Detalhes"
                                                onClick={() => abrirDetalhes(venda.id)}
                                            >
                                                <Eye size={18} />
                                            </button>
                                            <button
                                                className="action-btn"
                                                title="Baixar PDF"
                                                onClick={() => handleDownloadPDF(venda.id)}
                                            >
                                                <Download size={18} />
                                            </button>
                                            <button
                                                className="action-btn"
                                                title="Enviar WhatsApp"
                                                onClick={() => handleWhatsAppShare(venda)}
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* 5. Pagination */}
            {!loading && vendas.length > 0 && (
                <div className="pagination-container">
                    <button
                        className="pagination-btn"
                        disabled={pagination.page === 1}
                        onClick={() => handlePageChange(pagination.page - 1)}
                    >
                        <ChevronLeft size={18} />
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            className={`pagination-btn ${pagination.page === page ? 'active' : ''}`}
                            onClick={() => handlePageChange(page)}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        className="pagination-btn"
                        disabled={pagination.page === pagination.totalPages}
                        onClick={() => handlePageChange(pagination.page + 1)}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="" // Custom header inside content
                size="large"
            >
                {selectedVenda ? (
                    <div className="p-2">
                        {/* Custom Header */}
                        <div className="modal-header-custom">
                            <div className="modal-title-wrapper">
                                <ClipboardList size={24} className="modal-title-icon" />
                                <span className="modal-title-text">Venda #{selectedVenda.numero}</span>
                            </div>
                            <span className={`status-chip ${getStatusClass(selectedVenda.status)}`}>
                                {getStatusLabel(selectedVenda.status)}
                            </span>
                        </div>

                        {/* 2-Column Body */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Data</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {new Date(selectedVenda.dataVenda).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User size={18} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Cliente</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {selectedVenda.cliente?.nome || 'Não identificado'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Store size={18} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Loja</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {selectedVenda.loja?.nome || 'Matriz'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <CreditCard size={18} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Pagamento</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {getFormaPagamentoLabel(selectedVenda.formaPagamento)}
                                        </p>
                                    </div>
                                </div>
                                {selectedVenda.observacoes && (
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Observações</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-2 rounded">
                                            {selectedVenda.observacoes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Products Box */}
                        <div className="modal-products-box">
                            {loadingDetails && !selectedVenda.itens ? (
                                <div className="flex justify-center p-4"><div className="spinner"></div></div>
                            ) : (
                                <table className="w-full modal-products-table">
                                    <thead>
                                        <tr>
                                            <th className="text-left">Produto</th>
                                            <th className="text-right">Qtd</th>
                                            <th className="text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedVenda.itens?.map((item, i) => (
                                            <tr key={i}>
                                                <td>{item.produto?.nome}</td>
                                                <td className="text-right">{item.quantidade}</td>
                                                <td className="text-right font-medium">
                                                    R$ {parseFloat(item.subtotal).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <div className="mb-4 md:mb-0 flex flex-col">
                                <span className="text-xs text-gray-500 uppercase font-semibold">Total Final</span>
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    R$ {parseFloat(selectedVenda.total).toFixed(2)}
                                </span>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    className="btn-clear flex items-center gap-2"
                                    onClick={() => handleDownloadPDF(selectedVenda.id)}
                                >
                                    <Download size={18} />
                                    Baixar PDF
                                </button>
                                <button
                                    className="btn-apply flex items-center gap-2"
                                    onClick={() => handleWhatsAppShare(selectedVenda)}
                                    style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: 'white' }}
                                >
                                    <Send size={18} />
                                    WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </Modal>

            <MissingDataModal
                isOpen={showMissingDataModal}
                onClose={() => setShowMissingDataModal(false)}
                missingFields={missingData?.missingFields}
                clienteId={missingData?.clienteId}
                onSuccess={() => handleDownloadPDF(missingData.vendaId)}
            />
        </div>
    );
}

export default Vendas;
