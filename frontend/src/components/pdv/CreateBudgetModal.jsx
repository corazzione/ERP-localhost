import { useState, useCallback, useMemo, memo } from 'react';
import {
    X, Calendar, User, Package, Clock, FileText,
    MessageSquare, AlertCircle, Check, Send, Percent, CreditCard, Info
} from 'lucide-react';
import { formatCurrency, formatDateShort } from '../../utils/formatters';
import {
    CREDIARIO_CONFIG,
    gerarTabelaSimulacao,
    formatarTaxa,
    parseTaxaInput,
    validarTaxa,
    TEXTO_AMORTIZACAO_CURTO
} from '../../utils/crediarioUtils';
import './CreateBudgetModal.css';

const CreateBudgetModal = memo(function CreateBudgetModal({
    isOpen,
    onClose,
    carrinho,
    cliente,
    subtotal,
    descontoGlobal,
    total,
    onConfirm,
    loading
}) {
    // Default validity: 7 days from now
    const defaultValidade = useMemo(() => {
        const date = new Date();
        date.setDate(date.getDate() + 7);
        return date.toISOString().split('T')[0];
    }, []);

    const [validadeAte, setValidadeAte] = useState(defaultValidade);
    const [observacoes, setObservacoes] = useState('');
    const [observacoesInternas, setObservacoesInternas] = useState('');

    // Crediário states
    const [incluirSimulacao, setIncluirSimulacao] = useState(false);
    const [taxaMensal, setTaxaMensal] = useState(CREDIARIO_CONFIG.baseMonthlyRate);
    const [taxaCustom, setTaxaCustom] = useState('');
    const [usarTaxaCustom, setUsarTaxaCustom] = useState(false);

    // Generate credit simulation
    const simulacao = useMemo(() => {
        if (!incluirSimulacao || total <= 0) return [];
        const taxa = usarTaxaCustom && taxaCustom ? parseTaxaInput(taxaCustom) : taxaMensal;
        return gerarTabelaSimulacao(total, taxa);
    }, [incluirSimulacao, total, taxaMensal, usarTaxaCustom, taxaCustom]);

    const taxaAtual = useMemo(() => {
        return usarTaxaCustom && taxaCustom ? parseTaxaInput(taxaCustom) : taxaMensal;
    }, [usarTaxaCustom, taxaCustom, taxaMensal]);

    const handleConfirm = useCallback(() => {
        const crediarioData = incluirSimulacao ? {
            incluirSimulacao: true,
            taxaMensal: taxaAtual,
            simulacoes: simulacao
        } : null;

        onConfirm({
            validadeAte: validadeAte ? new Date(validadeAte).toISOString() : null,
            observacoes: observacoes.trim() || null,
            observacoesInternas: observacoesInternas.trim() || null,
            crediario: crediarioData
        });
    }, [validadeAte, observacoes, observacoesInternas, onConfirm, incluirSimulacao, taxaAtual, simulacao]);

    const handleClose = useCallback(() => {
        setValidadeAte(defaultValidade);
        setObservacoes('');
        setObservacoesInternas('');
        setIncluirSimulacao(false);
        setTaxaMensal(CREDIARIO_CONFIG.baseMonthlyRate);
        setTaxaCustom('');
        setUsarTaxaCustom(false);
        onClose();
    }, [defaultValidade, onClose]);

    const itemCount = useMemo(() =>
        carrinho.reduce((sum, item) => sum + item.quantidade, 0),
        [carrinho]);

    if (!isOpen) return null;

    return (
        <div className="create-budget-overlay" onClick={handleClose}>
            <div className="create-budget-modal" onClick={e => e.stopPropagation()}>
                {/* Close Button */}
                <button className="create-budget-close" onClick={handleClose}>
                    <X size={20} />
                </button>

                {/* Header */}
                <header className="create-budget-header">
                    <div className="header-icon-wrapper">
                        <FileText size={24} />
                    </div>
                    <div className="header-text">
                        <h2>Criar Orçamento</h2>
                        <p>Salve os itens do carrinho como proposta comercial</p>
                    </div>
                </header>

                {/* Content */}
                <div className="create-budget-content">
                    {/* Client Info */}
                    <div className="budget-info-row">
                        <div className="info-label">
                            <User size={16} />
                            <span>Cliente</span>
                        </div>
                        <div className="info-value">
                            {cliente ? (
                                <span className="client-name">{cliente.nome}</span>
                            ) : (
                                <span className="client-balcao">Cliente Balcão</span>
                            )}
                        </div>
                    </div>

                    {/* Items Summary */}
                    <div className="budget-items-summary">
                        <div className="items-header">
                            <Package size={16} />
                            <span>Itens do Orçamento</span>
                            <span className="items-count">{itemCount} {itemCount === 1 ? 'item' : 'itens'}</span>
                        </div>

                        <div className="items-list">
                            {carrinho.slice(0, 5).map((item, i) => (
                                <div key={item.id || i} className="item-row">
                                    <span className="item-qty">{item.quantidade}x</span>
                                    <span className="item-name">{item.nome}</span>
                                    <span className="item-total">{formatCurrency(item.total)}</span>
                                </div>
                            ))}
                            {carrinho.length > 5 && (
                                <div className="items-more">
                                    + {carrinho.length - 5} itens adicionais
                                </div>
                            )}
                        </div>

                        {/* Totals */}
                        <div className="items-totals">
                            {descontoGlobal > 0 && (
                                <>
                                    <div className="total-row subtle">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="total-row discount">
                                        <span>Desconto</span>
                                        <span>- {formatCurrency(descontoGlobal)}</span>
                                    </div>
                                </>
                            )}
                            <div className="total-row final">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Validity Date */}
                    <div className="budget-field">
                        <label>
                            <Calendar size={16} />
                            <span>Validade do Orçamento</span>
                        </label>
                        <input
                            type="date"
                            value={validadeAte}
                            onChange={e => setValidadeAte(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="date-input"
                        />
                        <span className="field-hint">
                            <Clock size={12} />
                            {validadeAte && `Válido por ${Math.ceil((new Date(validadeAte) - new Date()) / (1000 * 60 * 60 * 24))} dias`}
                        </span>
                    </div>

                    {/* ========================================
                        CREDIÁRIO SIMULATION SECTION
                        ======================================== */}
                    <div className="budget-crediario-section">
                        <div className="crediario-header">
                            <label className="crediario-toggle">
                                <input
                                    type="checkbox"
                                    checked={incluirSimulacao}
                                    onChange={e => setIncluirSimulacao(e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                                <CreditCard size={16} />
                                <span>Incluir simulação de crediário</span>
                            </label>
                        </div>

                        {incluirSimulacao && (
                            <div className="crediario-content">
                                {/* Rate Selection */}
                                <div className="crediario-rate-selector">
                                    <label>
                                        <Percent size={14} />
                                        <span>Taxa de juros mensal</span>
                                    </label>

                                    <div className="rate-options">
                                        {CREDIARIO_CONFIG.allowedRates.map(rate => (
                                            <button
                                                key={rate.value}
                                                type="button"
                                                className={`rate-option ${!usarTaxaCustom && taxaMensal === rate.value ? 'active' : ''}`}
                                                onClick={() => {
                                                    setTaxaMensal(rate.value);
                                                    setUsarTaxaCustom(false);
                                                }}
                                            >
                                                {rate.label}
                                            </button>
                                        ))}

                                        {CREDIARIO_CONFIG.allowCustomRate && (
                                            <div className={`rate-custom ${usarTaxaCustom ? 'active' : ''}`}>
                                                <input
                                                    type="text"
                                                    placeholder="Outra"
                                                    value={taxaCustom}
                                                    onChange={e => {
                                                        setTaxaCustom(e.target.value);
                                                        setUsarTaxaCustom(true);
                                                    }}
                                                    onFocus={() => setUsarTaxaCustom(true)}
                                                />
                                                <span>%</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="rate-info">
                                        <Info size={12} />
                                        <span>Taxa aplicada: {formatarTaxa(taxaAtual)} (base Mercado Livre)</span>
                                    </div>
                                </div>

                                {/* Simulation Table */}
                                {simulacao.length > 0 && (
                                    <div className="crediario-simulation">
                                        <table className="simulation-table">
                                            <thead>
                                                <tr>
                                                    <th>Parcelas</th>
                                                    <th>Valor</th>
                                                    <th>Total</th>
                                                    <th>Juros</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {simulacao.map(sim => (
                                                    <tr key={sim.parcelas}>
                                                        <td className="parcelas-cell">{sim.parcelas}x</td>
                                                        <td className="valor-cell">{formatCurrency(sim.valorParcela)}</td>
                                                        <td className="total-cell">{formatCurrency(sim.totalFinanciado)}</td>
                                                        <td className="juros-cell">
                                                            <span className="juros-value">{formatCurrency(sim.jurosTotais)}</span>
                                                            <span className="juros-percent">({sim.percentualJuros}%)</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                {/* Amortization Info */}
                                <div className="crediario-amortization">
                                    <Info size={14} />
                                    <span>{TEXTO_AMORTIZACAO_CURTO}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Client Observations */}
                    <div className="budget-field">
                        <label>
                            <MessageSquare size={16} />
                            <span>Observações para o Cliente</span>
                            <span className="label-optional">(opcional)</span>
                        </label>
                        <textarea
                            value={observacoes}
                            onChange={e => setObservacoes(e.target.value)}
                            placeholder="Ex: Condições especiais, prazos de entrega, garantias..."
                            rows={2}
                            className="textarea-input"
                        />
                    </div>

                    {/* Internal Observations */}
                    <div className="budget-field internal">
                        <label>
                            <AlertCircle size={16} />
                            <span>Observações Internas</span>
                            <span className="label-optional">(não visível ao cliente)</span>
                        </label>
                        <textarea
                            value={observacoesInternas}
                            onChange={e => setObservacoesInternas(e.target.value)}
                            placeholder="Ex: Margem de negociação, lembretes internos..."
                            rows={2}
                            className="textarea-input"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="create-budget-actions">
                    <button
                        className="btn-cancel"
                        onClick={handleClose}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        className="btn-confirm"
                        onClick={handleConfirm}
                        disabled={loading || carrinho.length === 0}
                    >
                        {loading ? (
                            <>
                                <div className="btn-spinner"></div>
                                <span>Criando...</span>
                            </>
                        ) : (
                            <>
                                <Check size={18} />
                                <span>Criar Orçamento</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
});

export default CreateBudgetModal;
