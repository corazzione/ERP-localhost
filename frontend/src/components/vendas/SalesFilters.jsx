import { Filter, X } from 'lucide-react';
// CSS imported globally

export default function SalesFilters({
    filtros,
    onFilterChange,
    onClearFilters,
    clientes = [],
    lojas = [],
    isOpen,
    onToggle
}) {
    // Apply filters handler (could be just closing the panel if filters apply on change, 
    // but user asked for "Aplicar" button. Since logic is currently real-time, 
    // we can make "Aplicar" just close the panel or trigger a refresh if needed.
    // For now, we'll assume real-time updates but the button confirms/closes).
    const handleApply = () => {
        onToggle(); // Close panel
    };

    return (
        <div className="mb-8">
            {/* Toggle Button - Pill Shape */}
            <button onClick={onToggle} className="filter-toggle-btn">
                <Filter size={18} />
                <span>Filtros</span>
            </button>

            {/* Collapsible Panel */}
            {isOpen && (
                <div className="filter-panel">
                    <div className="filter-grid">
                        {/* Número da Venda */}
                        <div>
                            <label className="filter-label">Número da Venda</label>
                            <input
                                type="text"
                                name="numero"
                                value={filtros.numero || ''}
                                onChange={onFilterChange}
                                className="filter-input"
                                placeholder="Ex: 123"
                            />
                        </div>

                        {/* Período */}
                        <div>
                            <label className="filter-label">Período</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    name="dataInicio"
                                    value={filtros.dataInicio || ''}
                                    onChange={onFilterChange}
                                    className="filter-input"
                                />
                                <input
                                    type="date"
                                    name="dataFim"
                                    value={filtros.dataFim || ''}
                                    onChange={onFilterChange}
                                    className="filter-input"
                                />
                            </div>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="filter-label">Status</label>
                            <select
                                name="status"
                                value={filtros.status || ''}
                                onChange={onFilterChange}
                                className="filter-select"
                            >
                                <option value="">Todos</option>
                                <option value="concluida">Concluída</option>
                                <option value="pendente">Pendente</option>
                                <option value="cancelada">Cancelada</option>
                                <option value="orcamento">Orçamento</option>
                            </select>
                        </div>

                        {/* Forma de Pagamento */}
                        <div>
                            <label className="filter-label">Forma de Pagamento</label>
                            <select
                                name="formaPagamento"
                                value={filtros.formaPagamento || ''}
                                onChange={onFilterChange}
                                className="filter-select"
                            >
                                <option value="">Todas</option>
                                <option value="dinheiro">Dinheiro</option>
                                <option value="cartao_credito">Cartão de Crédito</option>
                                <option value="cartao_debito">Cartão de Débito</option>
                                <option value="pix">PIX</option>
                                <option value="crediario">Crediário</option>
                                <option value="credito_loja">Crédito Loja</option>
                            </select>
                        </div>

                        {/* Loja */}
                        <div>
                            <label className="filter-label">Loja</label>
                            <select
                                name="lojaId"
                                value={filtros.lojaId || ''}
                                onChange={onFilterChange}
                                className="filter-select"
                            >
                                <option value="">Todas as lojas</option>
                                {lojas.map(loja => (
                                    <option key={loja.id} value={loja.id}>
                                        {loja.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Cliente */}
                        <div>
                            <label className="filter-label">Cliente</label>
                            <select
                                name="clienteId"
                                value={filtros.clienteId || ''}
                                onChange={onFilterChange}
                                className="filter-select"
                            >
                                <option value="">Todos os clientes</option>
                                {clientes.map(cliente => (
                                    <option key={cliente.id} value={cliente.id}>
                                        {cliente.nome}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="filter-actions">
                        <button onClick={onClearFilters} className="btn-clear">
                            Limpar filtros
                        </button>
                        <button onClick={handleApply} className="btn-apply">
                            Aplicar filtros
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
