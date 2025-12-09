import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { useFilters } from '../contexts/FilterContext';
import { devLog } from '../utils/logger';
import { formatCurrency } from '../utils/formatters';

// Premium Components
import BudgetKPIs from '../components/orcamentos/BudgetKPIs';
import BudgetFilters from '../components/orcamentos/BudgetFilters';
import BudgetCard from '../components/orcamentos/BudgetCard';
import BudgetDetailsModal from '../components/orcamentos/BudgetDetailsModal';
import CreateBudgetModalManual from '../components/orcamentos/CreateBudgetModalManual';
import PaymentModal from '../components/PaymentModal';

import './Orcamentos.css';

function Orcamentos() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { store, stores } = useFilters();

    // State
    const [orcamentos, setOrcamentos] = useState([]);
    const [kpis, setKpis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [kpisLoading, setKpisLoading] = useState(true);

    // Filters
    const [statusFilter, setStatusFilter] = useState('todos');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLojaId, setSelectedLojaId] = useState('');

    // Modal
    const [selectedOrcamento, setSelectedOrcamento] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [createModalOpen, setCreateModalOpen] = useState(false);

    // Payment Modal for conversion
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [convertingOrcamentoId, setConvertingOrcamentoId] = useState(null);
    const [convertingOrcamento, setConvertingOrcamento] = useState(null);

    // Load budgets
    const carregarOrcamentos = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter !== 'todos') params.status = statusFilter;
            if (searchQuery) params.busca = searchQuery;
            if (selectedLojaId) params.lojaId = selectedLojaId;
            else if (store && store !== 'all') params.lojaId = store;

            devLog('Carregando orçamentos com params:', params);
            const response = await api.get('/orcamentos', { params });

            // Handle both array and object responses (backend returns { data, kpis })
            if (Array.isArray(response.data)) {
                setOrcamentos(response.data);
            } else if (response.data.data) {
                setOrcamentos(response.data.data);
                if (response.data.kpis) {
                    setKpis(response.data.kpis);
                    setKpisLoading(false);
                }
            }
        } catch (error) {
            devLog('Erro ao carregar orçamentos:', error);
            showToast('Erro ao carregar orçamentos', 'error');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchQuery, selectedLojaId, store, showToast]);

    useEffect(() => {
        carregarOrcamentos();
    }, [carregarOrcamentos]);

    // Load single budget details
    const carregarDetalhes = useCallback(async (id) => {
        setDetailsLoading(true);
        try {
            const response = await api.get(`/orcamentos/${id}`);
            setSelectedOrcamento(response.data);
        } catch (error) {
            devLog('Erro ao carregar detalhes:', error);
            showToast('Erro ao carregar detalhes do orçamento', 'error');
        } finally {
            setDetailsLoading(false);
        }
    }, [showToast]);

    // Handlers
    const handleStatusChange = useCallback((status) => {
        setStatusFilter(status);
    }, []);

    const handleSearchChange = useCallback((query) => {
        setSearchQuery(query);
    }, []);

    const handleLojaChange = useCallback((lojaId) => {
        setSelectedLojaId(lojaId);
    }, []);

    const handleViewDetails = useCallback((orcamento) => {
        setSelectedOrcamento(orcamento);
        setDetailsModalOpen(true);
        carregarDetalhes(orcamento.id);
    }, [carregarDetalhes]);

    const handleCloseDetails = useCallback(() => {
        setDetailsModalOpen(false);
        setSelectedOrcamento(null);
    }, []);

    const handleApprove = useCallback(async (id) => {
        if (!window.confirm('Deseja aprovar este orçamento?')) return;

        try {
            await api.post(`/orcamentos/${id}/aprovar`);
            showToast('Orçamento aprovado com sucesso!', 'success');
            carregarOrcamentos();
            handleCloseDetails();
        } catch (error) {
            devLog('Erro ao aprovar:', error);
            showToast(error.response?.data?.error || 'Erro ao aprovar orçamento', 'error');
        }
    }, [showToast, carregarOrcamentos, handleCloseDetails]);

    const handleReject = useCallback(async (id) => {
        const motivo = window.prompt('Motivo da recusa (opcional):');
        if (motivo === null) return;

        try {
            await api.post(`/orcamentos/${id}/recusar`, { motivoRecusa: motivo || 'Não informado' });
            showToast('Orçamento recusado', 'success');
            carregarOrcamentos();
            handleCloseDetails();
        } catch (error) {
            devLog('Erro ao recusar:', error);
            showToast(error.response?.data?.error || 'Erro ao recusar orçamento', 'error');
        }
    }, [showToast, carregarOrcamentos, handleCloseDetails]);

    const handleConvert = useCallback((id) => {
        // Find the budget to get total and client info
        const orcamento = orcamentos.find(o => o.id === id) || selectedOrcamento;
        if (!orcamento) {
            showToast('Orçamento não encontrado', 'error');
            return;
        }

        // Store the budget info and open payment modal
        setConvertingOrcamentoId(id);
        setConvertingOrcamento(orcamento);
        setPaymentModalOpen(true);
    }, [orcamentos, selectedOrcamento, showToast]);

    const handlePaymentConfirm = useCallback(async (paymentData) => {
        const id = convertingOrcamentoId;
        if (!id) return;

        try {
            const payload = {
                formaPagamento: paymentData.formaPagamento,
                // Pass crediario data if applicable
                ...(paymentData.formaPagamento === 'crediario' && {
                    numParcelas: paymentData.numParcelas,
                    primeiroVencimento: paymentData.primeiroVencimento,
                    modoCrediario: paymentData.modoCrediario,
                    taxaPersonalizadaMensal: paymentData.taxaPersonalizadaMensal,
                    tipoJurosPersonalizado: paymentData.tipoJurosPersonalizado
                }),
                // Pass credit card parcels if applicable
                ...(paymentData.formaPagamento === 'cartao_credito' && {
                    parcelas: paymentData.parcelas
                })
            };

            const response = await api.post(`/orcamentos/${id}/converter-venda`, payload);
            showToast(`Orçamento convertido em venda #${response.data.vendaNumero || response.data.vendaId}!`, 'success');
            setPaymentModalOpen(false);
            setConvertingOrcamentoId(null);
            setConvertingOrcamento(null);
            carregarOrcamentos();
            handleCloseDetails();
        } catch (error) {
            devLog('Erro ao converter:', error);
            showToast(error.response?.data?.error || 'Erro ao converter orçamento', 'error');
        }
    }, [convertingOrcamentoId, showToast, carregarOrcamentos, handleCloseDetails]);

    const handleClosePaymentModal = useCallback(() => {
        setPaymentModalOpen(false);
        setConvertingOrcamentoId(null);
        setConvertingOrcamento(null);
    }, []);

    const handleDownloadPDF = useCallback(async (id) => {
        try {
            showToast('Gerando PDF...', 'info');
            const response = await api.get(`/orcamentos/${id}/pdf`, { responseType: 'blob' });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `orcamento-${id}.pdf`;
            a.click();
            window.URL.revokeObjectURL(url);
            showToast('PDF baixado com sucesso!', 'success');
        } catch (error) {
            devLog('Erro ao gerar PDF:', error);
            showToast('Erro ao gerar PDF do orçamento', 'error');
        }
    }, [showToast]);

    const handleWhatsAppShare = useCallback((id) => {
        const orcamento = orcamentos.find(o => o.id === id) || selectedOrcamento;
        if (!orcamento?.cliente?.telefone) {
            showToast('Cliente sem telefone cadastrado', 'warning');
            return;
        }

        const telefone = orcamento.cliente.telefone.replace(/\D/g, '');
        const mensagem = `Olá ${orcamento.cliente.nome}! Segue seu orçamento ${orcamento.numero} no valor de ${formatCurrency(orcamento.total)}. Aguardamos sua confirmação!`;
        const link = `https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`;
        window.open(link, '_blank');
    }, [orcamentos, selectedOrcamento, showToast]);

    const handleNewBudget = useCallback(() => {
        setCreateModalOpen(true);
    }, []);

    const handleCreateSuccess = useCallback(() => {
        carregarOrcamentos();
    }, [carregarOrcamentos]);

    // Memoized values
    const statusCounts = useMemo(() => {
        if (kpis) {
            return {
                todos: kpis.total || 0,
                pendente: kpis.pendentes || 0,
                aprovado: kpis.aprovados || 0,
                recusado: kpis.recusados || 0,
                vencido: kpis.vencidos || 0,
                convertido: kpis.convertidos || 0
            };
        }

        // Calculate from local data if KPIs not available
        return {
            todos: orcamentos.length,
            pendente: orcamentos.filter(o => (o.statusEfetivo || o.status) === 'pendente').length,
            aprovado: orcamentos.filter(o => o.status === 'aprovado').length,
            recusado: orcamentos.filter(o => o.status === 'recusado').length,
            vencido: orcamentos.filter(o => o.statusEfetivo === 'vencido').length,
            convertido: orcamentos.filter(o => o.status === 'convertido').length
        };
    }, [orcamentos, kpis]);

    const kpisData = useMemo(() => ({
        total: statusCounts.todos,
        pendentes: statusCounts.pendente,
        aprovados: statusCounts.aprovado,
        valorPendente: kpis?.valorPendente || orcamentos
            .filter(o => (o.statusEfetivo || o.status) === 'pendente')
            .reduce((sum, o) => sum + parseFloat(o.total || 0), 0)
    }), [statusCounts, kpis, orcamentos]);

    return (
        <div className="orcamentos-page">
            {/* Page Header */}
            <header className="orcamentos-header">
                <div className="header-content">
                    <div className="header-title-group">
                        <div className="header-icon-wrapper">
                            <FileText size={28} strokeWidth={1.5} />
                        </div>
                        <div>
                            <h1>Orçamentos</h1>
                            <p className="header-subtitle">Gerencie propostas comerciais e converta em vendas</p>
                        </div>
                    </div>
                    <button className="btn-new-budget" onClick={handleNewBudget}>
                        <Plus size={20} strokeWidth={2.5} />
                        <span>Novo Orçamento</span>
                    </button>
                </div>
            </header>

            {/* KPIs */}
            <BudgetKPIs
                kpis={kpisData}
                loading={kpisLoading && loading}
            />

            {/* Filters */}
            <BudgetFilters
                statusFilter={statusFilter}
                onStatusChange={handleStatusChange}
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                selectedLojaId={selectedLojaId}
                onLojaChange={handleLojaChange}
                lojas={stores}
                statusCounts={statusCounts}
            />

            {/* Content */}
            <div className="orcamentos-content">
                {loading ? (
                    <div className="orcamentos-grid">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="budget-card-skeleton">
                                <div className="skeleton-header">
                                    <div className="skeleton-line w-40"></div>
                                    <div className="skeleton-badge"></div>
                                </div>
                                <div className="skeleton-body">
                                    <div className="skeleton-line w-60"></div>
                                    <div className="skeleton-line w-80"></div>
                                    <div className="skeleton-line w-50"></div>
                                </div>
                                <div className="skeleton-footer">
                                    <div className="skeleton-btn"></div>
                                    <div className="skeleton-btn"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : orcamentos.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📋</div>
                        <h3>Nenhum orçamento encontrado</h3>
                        <p>
                            {statusFilter !== 'todos'
                                ? `Não há orçamentos com status "${statusFilter}"`
                                : searchQuery
                                    ? 'Nenhum resultado para sua busca'
                                    : 'Comece criando um novo orçamento'}
                        </p>
                        {statusFilter === 'todos' && !searchQuery && (
                            <button className="btn-primary" onClick={handleNewBudget}>
                                + Criar Primeiro Orçamento
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="orcamentos-grid">
                        {orcamentos.map(orc => (
                            <BudgetCard
                                key={orc.id}
                                orcamento={orc}
                                onView={handleViewDetails}
                                onApprove={handleApprove}
                                onReject={handleReject}
                                onConvert={handleConvert}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Details Modal */}
            <BudgetDetailsModal
                isOpen={detailsModalOpen}
                onClose={handleCloseDetails}
                orcamento={selectedOrcamento}
                onApprove={handleApprove}
                onReject={handleReject}
                onConvert={handleConvert}
                onDownloadPDF={handleDownloadPDF}
                onWhatsAppShare={handleWhatsAppShare}
                loading={detailsLoading}
            />

            {/* Create Budget Modal */}
            <CreateBudgetModalManual
                isOpen={createModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
                lojaId={selectedLojaId || store}
            />

            {/* Payment Modal for Conversion */}
            <PaymentModal
                isOpen={paymentModalOpen}
                onClose={handleClosePaymentModal}
                totalAmount={convertingOrcamento?.total ? parseFloat(convertingOrcamento.total) : 0}
                clienteId={convertingOrcamento?.clienteId || convertingOrcamento?.cliente?.id}
                onConfirm={handlePaymentConfirm}
            />
        </div>
    );
}

export default Orcamentos;
