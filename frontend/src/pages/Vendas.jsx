import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import InvoiceService from '../services/InvoiceService';
import { useToast } from '../components/Toast';
import MissingDataModal from '../components/MissingDataModal';
import SalesKPIs from '../components/vendas/SalesKPIs';
import OrderOverview from '../components/vendas/OrderOverview';
import SalesFilters from '../components/vendas/SalesFilters';
import SaleDetailsModal from '../components/vendas/SaleDetailsModal';
import {
    Eye,
    Download,
    Send,
    ChevronLeft,
    ChevronRight,
    Package
} from 'lucide-react';
import '../components/vendas/Sales.css';

import { devLog } from '../utils/logger';
import { getStatusLabel, getStatusClass, getFormaPagamentoLabel, formatCurrency, formatDateShort } from '../utils/formatters';

function Vendas() {
    const navigate = useNavigate();
    const { showToast } = useToast();

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

            devLog('🚀 Enviando para API /vendas com params:', params);

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
        devLog('🎯 Filter Changed:', { name, value, type: typeof value });
        setFiltros(prev => {
            const newFiltros = { ...prev, [name]: value };
            devLog('📦 New Filtros State:', newFiltros);
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

    const handleStatusFilter = useCallback((status) => {
        setFiltros(prev => ({ ...prev, status }));
        setPagination(prev => ({ ...prev, page: 1 }));
    }, []);

    const handlePageChange = useCallback((newPage) => {
        setPagination(prev => {
            if (newPage >= 1 && newPage <= prev.totalPages) {
                return { ...prev, page: newPage };
            }
            return prev;
        });
    }, []);

    const abrirDetalhes = useCallback(async (vendaId) => {
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
    }, [vendas, showToast]);

    const handleDownloadPDF = useCallback(async (vendaId) => {
        try {
            showToast('Gerando PDF...', 'info');
            await InvoiceService.downloadInvoice(vendaId);
            showToast('PDF baixado com sucesso', 'success');
        } catch (error) {
            devLog('Erro ao baixar PDF:', error);
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
    }, [showToast]);

    const handleWhatsAppShare = useCallback((venda) => {
        const telefone = venda.cliente?.telefone?.replace(/\D/g, '');
        if (!telefone) {
            showToast('Cliente sem telefone cadastrado', 'warning');
            return;
        }

        const data = formatDateShort(venda.dataVenda);
        const total = formatCurrency(venda.total);
        const mensagem = `Olá ${venda.cliente.nome}, aqui está o resumo da sua compra #${venda.numero} realizada em ${data}. Total: ${total}.`;

        const link = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
        window.open(link, '_blank');
    }, [showToast]);

    return (
        <div className="sales-page-container">
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

            {/* Sale Details Modal - Premium Design */}
            <SaleDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                venda={selectedVenda}
                onDownloadPDF={handleDownloadPDF}
                onWhatsAppShare={handleWhatsAppShare}
                loading={loadingDetails}
            />

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
