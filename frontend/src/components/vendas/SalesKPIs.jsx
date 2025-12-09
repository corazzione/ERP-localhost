import { ShoppingBag, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
// CSS imported globally

export default function SalesKPIs({ kpis, loading }) {
    // Helper to render a simple SVG sparkline
    const renderSparkline = (color) => (
        <svg className="kpi-sparkline" viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 25 L10 20 L20 22 L30 15 L40 18 L50 10 L60 12 L70 5 L80 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M0 25 L10 20 L20 22 L30 15 L40 18 L50 10 L60 12 L70 5 L80 8 V 30 H 0 Z" fill={color} fillOpacity="0.15" />
        </svg>
    );

    const cards = [
        {
            title: 'Total de Vendas',
            value: kpis?.totalVendas || 0,
            icon: ShoppingBag,
            sparklineColor: '#3B82F6', // Blue
            isCurrency: false
        },
        {
            title: 'Total Recebido',
            value: kpis?.totalRecebido || 0,
            icon: DollarSign,
            sparklineColor: '#62C554', // Green Premium
            isCurrency: true
        },
        {
            title: 'Ticket Médio',
            value: kpis?.ticketMedio || 0,
            icon: TrendingUp,
            sparklineColor: '#F59E0B', // Amber
            isCurrency: true
        },
        {
            title: 'Crediário Gerado',
            value: kpis?.crediarioGerado || 0,
            icon: CreditCard,
            sparklineColor: '#A78BFA', // Purple Soft
            isCurrency: true
        }
    ];

    const formatValue = (value, isCurrency) => {
        if (isCurrency) {
            return `R$ ${parseFloat(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        return value.toLocaleString('pt-BR');
    };

    if (loading) {
        return (
            <div className="kpi-grid">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="sales-kpi-card skeleton">
                        <div className="kpi-header">
                            <div className="skeleton-text" style={{ width: '60%', height: '14px' }}></div>
                            <div className="skeleton-circle" style={{ width: '24px', height: '24px' }}></div>
                        </div>
                        <div className="kpi-content">
                            <div className="skeleton-text" style={{ width: '70%', height: '28px' }}></div>
                            <div className="skeleton-chart" style={{ width: '80px', height: '30px' }}></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="kpi-grid">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div key={index} className="sales-kpi-card">
                        {/* Row 1: Title left, Icon right */}
                        <div className="kpi-header">
                            <span className="kpi-title">{card.title}</span>
                            <div className="kpi-icon-wrapper">
                                <Icon size={20} strokeWidth={1.5} />
                            </div>
                        </div>

                        {/* Row 2: Value left, Sparkline right */}
                        <div className="kpi-content">
                            <span className="kpi-value">
                                {formatValue(card.value, card.isCurrency)}
                            </span>

                            <div className="kpi-sparkline-wrapper">
                                {renderSparkline(card.sparklineColor)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
