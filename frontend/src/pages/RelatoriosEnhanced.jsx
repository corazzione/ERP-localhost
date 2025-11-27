import { useState } from 'react';
import { BarChart3, Download, FileText, TrendingUp, Package, Users, DollarSign } from 'lucide-react';
import Tabs from '../components/Tabs';
import Card from '../components/Card';
import Badge from '../components/Badge';
import { useTheme } from '../contexts/ThemeContext';

function RelatoriosEnhanced() {
    const { isDark } = useTheme();
    const [exportLoading, setExportLoading] = useState(false);

    const handleExport = (format) => {
        setExportLoading(true);
        setTimeout(() => {
            alert(`Exportando relatório em ${format.toUpperCase()}...`);
            setExportLoading(false);
        }, 1000);
    };

    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#cbd5e1' : '#6b7280';

    const tabs = [
        {
            label: 'Vendas',
            icon: TrendingUp,
            content: (
                <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, marginBottom: '1rem' }}>
                        Relatórios de Vendas
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <ReportItem
                            title="Vendas por Período"
                            description="Análise de vendas agrupadas por dia, semana ou mês"
                            onExport={handleExport}
                        />
                        <ReportItem
                            title="Vendas por Produto"
                            description="Produtos mais vendidos e performance individual"
                            onExport={handleExport}
                        />
                        <ReportItem
                            title="Vendas por Cliente"
                            description="Ranking de clientes e ticket médio"
                            onExport={handleExport}
                        />
                        <ReportItem
                            title="Vendas por Forma de Pagamento"
                            description="Distribuição das vendas por método de pagamento"
                            onExport={handleExport}
                        />
                    </div>
                </div>
            )
        },
        {
            label: 'Financeiro',
            icon: DollarSign,
            content: (
                <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, marginBottom: '1rem' }}>
                        Relatórios Financeiros
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <ReportItem
                            title="Receitas vs Despesas"
                            description="Comparativo mensal de entradas e saídas"
                            onExport={handleExport}
                        />
                        <ReportItem
                            title="DRE Simplificado"
                            description="Demonstrativo de Resultado do Exercício"
                            onExport={handleExport}
                        />
                        <ReportItem
                            title="Fluxo de Caixa Realizado"
                            description="Movimentações efetivas de caixa"
                            onExport={handleExport}
                        />
                    </div>
                </div>
            )
        },
        {
            label: 'Estoque',
            icon: Package,
            content: (
                <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, marginBottom: '1rem' }}>
                        Relatórios de Estoque
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <ReportItem
                            title="Giro de Estoque"
                            description="Análise de rotatividade de produtos"
                            onExport={handleExport}
                        />
                        <ReportItem
                            title="Produtos Parados"
                            description="Itens sem movimentação no período"
                            onExport={handleExport}
                        />
                        <ReportItem
                            title="Curva ABC"
                            description="Classificação de produtos por importância"
                            onExport={handleExport}
                        />
                    </div>
                </div>
            )
        },
        {
            label: 'Crediário',
            icon: Users,
            content: (
                <div style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: textPrimary, marginBottom: '1rem' }}>
                        Relatórios de Crediário
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <ReportItem
                            title="Inadimplência"
                            description="Análise de parcelas atrasadas e taxa de inadimplência"
                            onExport={handleExport}
                        />
                        <ReportItem
                            title="Aging de Recebíveis"
                            description="Classificação por tempo de atraso (0-30, 31-60, 61-90, 90+)"
                            onExport={handleExport}
                        />
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <BarChart3 size={32} color="#3b82f6" />
                    <div>
                        <h1 className="page-title">Central de Relatórios</h1>
                        <p className="page-subtitle">Business Intelligence e exportações</p>
                    </div>
                </div>
            </div>

            <Card>
                <Tabs tabs={tabs} />
            </Card>
        </div>
    );
}

function ReportItem({ title, description, onExport }) {
    const { isDark } = useTheme();
    const bgColor = isDark ? '#334155' : '#f9fafb';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#cbd5e1' : '#6b7280';

    return (
        <div style={{
            padding: '1.25rem',
            backgroundColor: bgColor,
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: textPrimary, marginBottom: '0.25rem' }}>
                    {title}
                </div>
                <div style={{ fontSize: '14px', color: textSecondary }}>
                    {description}
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={() => onExport('csv')}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    title="Exportar CSV"
                >
                    <Download size={16} />
                    CSV
                </button>
                <button
                    onClick={() => onExport('pdf')}
                    className="btn btn-outline"
                    style={{ padding: '0.5rem 1rem', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    title="Exportar PDF"
                >
                    <FileText size={16} />
                    PDF
                </button>
            </div>
        </div>
    );
}

export default RelatoriosEnhanced;
