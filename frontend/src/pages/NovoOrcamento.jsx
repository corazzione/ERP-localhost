import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../components/Toast';
import './NovoOrcamento.css';

function NovoOrcamento() {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [clienteId, setClienteId] = useState('');
    const [itens, setItens] = useState([
        { descricao: '', quantidade: 1, precoUnit: '', especificacoes: '' }
    ]);
    const [desconto, setDesconto] = useState(0);
    const [observacoes, setObservacoes] = useState('');
    const [observacoesInternas, setObservacoesInternas] = useState('');
    const [validadeDias, setValidadeDias] = useState(15);

    useEffect(() => {
        carregarClientes();
    }, []);

    const carregarClientes = async () => {
        try {
            const response = await api.get('/clientes');
            setClientes(response.data.filter(c => c.ativo));
        } catch (error) {
            showToast('Erro ao carregar clientes', 'error');
        }
    };

    const adicionarItem = () => {
        setItens([...itens, { descricao: '', quantidade: 1, precoUnit: '', especificacoes: '' }]);
    };

    const removerItem = (index) => {
        if (itens.length > 1) {
            setItens(itens.filter((_, i) => i !== index));
        }
    };

    const atualizarItem = (index, campo, valor) => {
        const novosItens = [...itens];
        novosItens[index][campo] = valor;
        setItens(novosItens);
    };

    const calcularSubtotal = () => {
        return itens.reduce((sum, item) => {
            const quantidade = parseInt(item.quantidade) || 0;
            const preco = parseFloat(item.precoUnit) || 0;
            return sum + (quantidade * preco);
        }, 0);
    };

    const calcularTotal = () => {
        const subtotal = calcularSubtotal();
        const descontoValor = parseFloat(desconto) || 0;
        return Math.max(0, subtotal - descontoValor);
    };

    const validarFormulario = () => {
        // Validar itens
        for (let item of itens) {
            if (!item.descricao.trim()) {
                showToast('Preencha a descrição de todos os itens', 'error');
                return false;
            }
            if (!item.precoUnit || parseFloat(item.precoUnit) <= 0) {
                showToast('Preencha o preço unitário de todos os itens', 'error');
                return false;
            }
            if (!item.quantidade || parseInt(item.quantidade) <= 0) {
                showToast('Quantidade deve ser maior que zero', 'error');
                return false;
            }
        }

        if (calcularTotal() <= 0) {
            showToast('O total do orçamento deve ser maior que zero', 'error');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        setLoading(true);

        try {
            const payload = {
                clienteId: clienteId || null,
                itens: itens.map(item => ({
                    descricao: item.descricao,
                    quantidade: parseInt(item.quantidade),
                    precoUnit: parseFloat(item.precoUnit),
                    especificacoes: item.especificacoes || null
                })),
                desconto: parseFloat(desconto) || 0,
                observacoes: observacoes || null,
                observacoesInternas: observacoesInternas || null,
                validadeDias: parseInt(validadeDias) || null
            };

            const response = await api.post('/orcamentos', payload);

            showToast(`Orçamento ${response.data.numero} criado com sucesso!`, 'success');
            navigate('/orcamentos');
        } catch (error) {
            console.error(error);
            showToast(error.response?.data?.error || 'Erro ao criar orçamento', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="novo-orcamento-container">
            <div className="page-header">
                <h1>💼 Novo Orçamento</h1>
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate('/orcamentos')}
                >
                    ← Voltar
                </button>
            </div>

            <form onSubmit={handleSubmit} className="orcamento-form">
                {/* Cliente */}
                <div className="form-section">
                    <h3>Cliente</h3>
                    <div className="form-group">
                        <label>Cliente (opcional - deixe em branco para "Balcão")</label>
                        <select
                            value={clienteId}
                            onChange={(e) => setClienteId(e.target.value)}
                            className="form-control"
                        >
                            <option value="">🛒 Balcão / Cliente Avulso</option>
                            {clientes.map(cliente => (
                                <option key={cliente.id} value={cliente.id}>
                                    {cliente.nome} - {cliente.cpfCnpj}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Itens */}
                <div className="form-section">
                    <div className="section-header">
                        <h3>Itens do Orçamento</h3>
                        <button
                            type="button"
                            className="btn-add-item"
                            onClick={adicionarItem}
                        >
                            + Adicionar Item
                        </button>
                    </div>

                    <div className="itens-list">
                        {itens.map((item, index) => (
                            <div key={index} className="item-card">
                                <div className="item-header">
                                    <h4>Item #{index + 1}</h4>
                                    {itens.length > 1 && (
                                        <button
                                            type="button"
                                            className="btn-remove-item"
                                            onClick={() => removerItem(index)}
                                        >
                                            🗑️ Remover
                                        </button>
                                    )}
                                </div>

                                <div className="item-fields">
                                    <div className="form-group">
                                        <label>Descrição *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: Camiseta Preta + Estampa 30x40cm"
                                            value={item.descricao}
                                            onChange={(e) => atualizarItem(index, 'descricao', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Quantidade *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="1"
                                                value={item.quantidade}
                                                onChange={(e) => atualizarItem(index, 'quantidade', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Preço Unitário (R$) *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                step="0.01"
                                                min="0.01"
                                                placeholder="0.00"
                                                value={item.precoUnit}
                                                onChange={(e) => atualizarItem(index, 'precoUnit', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label>Subtotal</label>
                                            <input
                                                type="text"
                                                className="form-control subtotal-readonly"
                                                value={`R$ ${((parseInt(item.quantidade) || 0) * (parseFloat(item.precoUnit) || 0)).toFixed(2)}`}
                                                readOnly
                                            />
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Especificações (opcional)</label>
                                        <textarea
                                            className="form-control"
                                            rows="2"
                                            placeholder="Ex: Arte do cliente em alta resolução, fundo transparente"
                                            value={item.especificacoes}
                                            onChange={(e) => atualizarItem(index, 'especificacoes', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Valores */}
                <div className="form-section valores-section">
                    <h3>Valores</h3>

                    <div className="form-group">
                        <label>Desconto (R$)</label>
                        <input
                            type="number"
                            className="form-control"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={desconto}
                            onChange={(e) => setDesconto(e.target.value)}
                        />
                    </div>

                    <div className="valores-resumo">
                        <div className="valor-linha">
                            <span>Subtotal:</span>
                            <strong>R$ {calcularSubtotal().toFixed(2)}</strong>
                        </div>
                        <div className="valor-linha">
                            <span>Desconto:</span>
                            <strong className="desconto">- R$ {(parseFloat(desconto) || 0).toFixed(2)}</strong>
                        </div>
                        <div className="valor-linha total">
                            <span>Total:</span>
                            <strong>R$ {calcularTotal().toFixed(2)}</strong>
                        </div>
                    </div>
                </div>

                {/* Observações */}
                <div className="form-section">
                    <h3>Observações</h3>

                    <div className="form-group">
                        <label>Observações (visível para o cliente)</label>
                        <textarea
                            className="form-control"
                            rows="3"
                            placeholder="Ex: Cliente solicitou entrega em 5 dias úteis"
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Observações Internas (uso interno)</label>
                        <textarea
                            className="form-control"
                            rows="2"
                            placeholder="Ex: Verificar estoque de filme DTF antes de aprovar"
                            value={observacoesInternas}
                            onChange={(e) => setObservacoesInternas(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Validade do Orçamento (dias)</label>
                        <input
                            type="number"
                            className="form-control"
                            min="1"
                            value={validadeDias}
                            onChange={(e) => setValidadeDias(e.target.value)}
                        />
                        <small className="form-help">
                            {validadeDias && `Válido até: ${new Date(Date.now() + validadeDias * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}`}
                        </small>
                    </div>
                </div>

                {/* Botões */}
                <div className="form-actions">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => navigate('/orcamentos')}
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : '💾 Salvar Orçamento'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default NovoOrcamento;
