function Relatorios() {
    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Relatórios</h1>
                <p style={{ color: 'var(--color-neutral-500)' }}>Análises e relatórios do sistema</p>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="card" style={{ cursor: 'pointer' }}>
                    <h3>📈 Vendas</h3>
                    <p className="text-sm" style={{ color: 'var(--color-neutral-500)', marginTop: '0.5rem' }}>
                        Relatório de vendas por período
                    </p>
                </div>
                <div className="card" style={{ cursor: 'pointer' }}>
                    <h3>💰 Financeiro</h3>
                    <p className="text-sm" style={{ color: 'var(--color-neutral-500)', marginTop: '0.5rem' }}>
                        DRE e fluxo de caixa
                    </p>
                </div>
                <div className="card" style={{ cursor: 'pointer' }}>
                    <h3>📦 Estoque</h3>
                    <p className="text-sm" style={{ color: 'var(--color-neutral-500)', marginTop: '0.5rem' }}>
                        Movimentações de estoque
                    </p>
                </div>
                <div className="card" style={{ cursor: 'pointer' }}>
                    <h3>💳 Crediário</h3>
                    <p className="text-sm" style={{ color: 'var(--color-neutral-500)', marginTop: '0.5rem' }}>
                        Carnês e inadimplência
                    </p>
                </div>
                <div className="card" style={{ cursor: 'pointer' }}>
                    <h3>👥 Clientes</h3>
                    <p className="text-sm" style={{ color: 'var(--color-neutral-500)', marginTop: '0.5rem' }}>
                        Análise de clientes
                    </p>
                </div>
                <div className="card" style={{ cursor: 'pointer' }}>
                    <h3>📊 Geral</h3>
                    <p className="text-sm" style={{ color: 'var(--color-neutral-500)', marginTop: '0.5rem' }}>
                        Visão geral do negócio
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Relatorios;
