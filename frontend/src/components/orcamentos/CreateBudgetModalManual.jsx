import { useState, useCallback, useEffect } from 'react';
import {
    X, FileText, Plus, Trash2, User, Calendar, Package,
    DollarSign, Percent, Info
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../Toast';
import {
    CREDIARIO_CONFIG,
    gerarTabelaSimulacao,
    formatarTaxa,
    TEXTO_AMORTIZACAO_CURTO
} from '../../utils/crediarioUtils';
import './CreateBudgetModalManual.css';

const CreateBudgetModalManual = ({ isOpen, onClose, onSuccess, lojaId }) => {
    const { showToast } = useToast();

    // Form state
    const [clienteId, setClienteId] = useState('');
    const [clientes, setClientes] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [itens, setItens] = useState([]);
    const [desconto, setDesconto] = useState(0);
    const [observacoes, setObservacoes] = useState('');
    const [observacoesInternas, setObservacoesInternas] = useState('');
    const [validadeAte, setValidadeAte] = useState('');
    const [saving, setSaving] = useState(false);

    // Crediário
    const [incluirSimulacao, setIncluirSimulacao] = useState(false);
    const [taxaMensal, setTaxaMensal] = useState(CREDIARIO_CONFIG.baseMonthlyRate);

    // New item form
    const [newItem, setNewItem] = useState({
        produtoId: '',
        descricao: '',
        quantidade: 1,
        precoUnit: ''
    });

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Load clientes and produtos
    useEffect(() => {
        if (isOpen) {
            api.get('/clientes').then(r => setClientes(Array.isArray(r.data) ? r.data : r.data.data || [])).catch(() => { });
            api.get('/produtos').then(r => setProdutos(Array.isArray(r.data) ? r.data : r.data.data || [])).catch(() => { });

            // Set default validity (7 days)
            const date = new Date();
            date.setDate(date.getDate() + 7);
            setValidadeAte(date.toISOString().split('T')[0]);
        }
    }, [isOpen]);

    // Calculate totals
    const subtotal = itens.reduce((sum, item) => sum + item.subtotal, 0);
    const total = Math.max(0, subtotal - desconto);

    // Simulation
    const simulacao = incluirSimulacao && total > 0
        ? gerarTabelaSimulacao(total, taxaMensal)
        : [];

    const handleProductSelect = (produtoId) => {
        const produto = produtos.find(p => p.id === produtoId);
        if (produto) {
            setNewItem({
                produtoId: produto.id,
                descricao: produto.nome,
                quantidade: 1,
                precoUnit: parseFloat(produto.precoVenda)
            });
        }
    };

    const handleAddItem = () => {
        if (!newItem.descricao || !newItem.precoUnit || newItem.quantidade <= 0) {
            showToast('Preencha todos os campos do item', 'error');
            return;
        }

        const precoUnit = parseFloat(newItem.precoUnit);
        const quantidade = parseInt(newItem.quantidade);

        setItens(prev => [...prev, {
            ...newItem,
            precoUnit,
            quantidade,
            subtotal: precoUnit * quantidade
        }]);

        setNewItem({ produtoId: '', descricao: '', quantidade: 1, precoUnit: '' });
    };

    const handleRemoveItem = (index) => {
        setItens(prev => prev.filter((_, i) => i !== index));
    };

    const handleClose = useCallback(() => {
        setClienteId('');
        setItens([]);
        setDesconto(0);
        setObservacoes('');
        setObservacoesInternas('');
        setIncluirSimulacao(false);
        setTaxaMensal(CREDIARIO_CONFIG.baseMonthlyRate);
        setNewItem({ produtoId: '', descricao: '', quantidade: 1, precoUnit: '' });
        onClose();
    }, [onClose]);

    const handleSubmit = async () => {
        if (itens.length === 0) {
            showToast('Adicione pelo menos um item', 'error');
            return;
        }

        setSaving(true);
        try {
            const crediarioData = incluirSimulacao ? {
                incluirSimulacao: true,
                taxaMensal,
                simulacoes: simulacao
            } : null;

            await api.post('/orcamentos', {
                clienteId: clienteId || null,
                lojaId,
                itens: itens.map(item => ({
                    produtoId: item.produtoId || null,
                    descricao: item.descricao,
                    quantidade: item.quantidade,
                    precoUnit: item.precoUnit
                })),
                desconto,
                observacoes: observacoes.trim() || null,
                observacoesInternas: observacoesInternas.trim() || null,
                validadeAte: validadeAte ? new Date(validadeAte).toISOString() : null,
                origem: 'manual',
                crediario: crediarioData
            });

            showToast('Orçamento criado com sucesso!', 'success');
            onSuccess?.();
            handleClose();
        } catch (error) {
            showToast(error.response?.data?.error || 'Erro ao criar orçamento', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="create-budget-manual-overlay" onClick={handleClose}>
            <div className="create-budget-manual-modal" onClick={e => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={handleClose}>
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="modal-header">
                    <div className="header-icon">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h2>Novo Orçamento</h2>
                        <p>Crie um orçamento manualmente</p>
                    </div>
                </div>

                {/* Content */}
                <div className="modal-content">
                    {/* Client Selection */}
                    <div className="form-section">
                        <label><User size={16} /> Cliente</label>
                        <select
                            value={clienteId}
                            onChange={e => setClienteId(e.target.value)}
                        >
                            <option value="">Cliente Balcão</option>
                            {clientes.map(c => (
                                <option key={c.id} value={c.id}>{c.nome}</option>
                            ))}
                        </select>
                    </div>

                    {/* Validity */}
                    <div className="form-section">
                        <label><Calendar size={16} /> Válido até</label>
                        <input
                            type="date"
                            value={validadeAte}
                            onChange={e => setValidadeAte(e.target.value)}
                        />
                    </div>

                    {/* Add Item Section */}
                    <div className="add-item-section">
                        <h4><Package size={16} /> Adicionar Item</h4>
                        <div className="add-item-form">
                            <select
                                value={newItem.produtoId}
                                onChange={e => handleProductSelect(e.target.value)}
                            >
                                <option value="">Selecionar produto...</option>
                                {produtos.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.nome} - {formatCurrency(p.precoVenda)}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Descrição"
                                value={newItem.descricao}
                                onChange={e => setNewItem(prev => ({ ...prev, descricao: e.target.value }))}
                            />
                            <input
                                type="number"
                                placeholder="Qtd"
                                min="1"
                                value={newItem.quantidade}
                                onChange={e => setNewItem(prev => ({ ...prev, quantidade: e.target.value }))}
                                style={{ width: '70px' }}
                            />
                            <input
                                type="number"
                                placeholder="Preço"
                                step="0.01"
                                value={newItem.precoUnit}
                                onChange={e => setNewItem(prev => ({ ...prev, precoUnit: e.target.value }))}
                                style={{ width: '100px' }}
                            />
                            <button className="btn-add-item" onClick={handleAddItem}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Items List */}
                    {itens.length > 0 && (
                        <div className="items-list-section">
                            <h4>Itens ({itens.length})</h4>
                            <div className="items-list">
                                {itens.map((item, idx) => (
                                    <div key={idx} className="item-row">
                                        <span className="item-qty">{item.quantidade}x</span>
                                        <span className="item-desc">{item.descricao}</span>
                                        <span className="item-price">{formatCurrency(item.subtotal)}</span>
                                        <button
                                            className="btn-remove-item"
                                            onClick={() => handleRemoveItem(idx)}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Discount */}
                    <div className="form-section">
                        <label><DollarSign size={16} /> Desconto (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={desconto}
                            onChange={e => setDesconto(parseFloat(e.target.value) || 0)}
                        />
                    </div>

                    {/* Totals */}
                    {itens.length > 0 && (
                        <div className="totals-section">
                            {desconto > 0 && (
                                <>
                                    <div className="total-row">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(subtotal)}</span>
                                    </div>
                                    <div className="total-row discount">
                                        <span>Desconto</span>
                                        <span>- {formatCurrency(desconto)}</span>
                                    </div>
                                </>
                            )}
                            <div className="total-row final">
                                <span>Total</span>
                                <span>{formatCurrency(total)}</span>
                            </div>
                        </div>
                    )}

                    {/* Crediário Section */}
                    <div className="crediario-section">
                        <label className="crediario-toggle">
                            <input
                                type="checkbox"
                                checked={incluirSimulacao}
                                onChange={e => setIncluirSimulacao(e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                            <Percent size={16} />
                            Incluir simulação de crediário
                        </label>

                        {incluirSimulacao && total > 0 && (
                            <div className="crediario-content">
                                <div className="rate-selector">
                                    <span>Taxa:</span>
                                    {CREDIARIO_CONFIG.allowedRates.map(rate => (
                                        <button
                                            key={rate.value}
                                            className={`rate-btn ${taxaMensal === rate.value ? 'active' : ''}`}
                                            onClick={() => setTaxaMensal(rate.value)}
                                        >
                                            {rate.label}
                                        </button>
                                    ))}
                                </div>

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
                                        {simulacao.slice(0, 4).map(sim => (
                                            <tr key={sim.parcelas}>
                                                <td><strong>{sim.parcelas}x</strong></td>
                                                <td>{formatCurrency(sim.valorParcela)}</td>
                                                <td>{formatCurrency(sim.totalFinanciado)}</td>
                                                <td className="juros">{formatCurrency(sim.jurosTotais)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                <div className="amortization-info">
                                    <Info size={14} />
                                    <span>{TEXTO_AMORTIZACAO_CURTO}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Observations */}
                    <div className="form-section">
                        <label>Observações (visíveis ao cliente)</label>
                        <textarea
                            value={observacoes}
                            onChange={e => setObservacoes(e.target.value)}
                            placeholder="Observações para o cliente..."
                            rows={2}
                        />
                    </div>

                    <div className="form-section internal">
                        <label>🔒 Observações internas</label>
                        <textarea
                            value={observacoesInternas}
                            onChange={e => setObservacoesInternas(e.target.value)}
                            placeholder="Notas internas (não aparece no PDF)..."
                            rows={2}
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={handleClose} disabled={saving}>
                        Cancelar
                    </button>
                    <button
                        className="btn-confirm"
                        onClick={handleSubmit}
                        disabled={saving || itens.length === 0}
                    >
                        {saving ? <span className="spinner"></span> : <FileText size={18} />}
                        Criar Orçamento
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateBudgetModalManual;
