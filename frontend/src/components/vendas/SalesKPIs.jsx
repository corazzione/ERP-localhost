import { ShoppingBag, DollarSign, TrendingUp, CreditCard } from 'lucide-react';
// CSS imported globally

export default function SalesKPIs({ kpis, loading }) {
    // Helper to render a simple SVG sparkline
    const renderSparkline = (color) => (
        <svg className="kpi-sparkline" viewBox="0 0 80 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 25 L10 20 L20 22 L30 15 L40 18 L50 10 L60 12 L70 5 L80 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M0 25 L10 20 L20 22 L30 15 L40 18 L50 10 L60 12 L70 5 L80 8 V 30 H 0 Z" fill={color} fillOpacity="0.1" />
        </svg>
    );

    const cards = [
        {
            title: 'Total de Vendas',
            value: kpis?.totalVendas || 0,
            icon: ShoppingBag,
            // No sparkline requested for this one, but maybe badge? User said "badge lateral: +10.5% verde" in previous prompt, 
            // but in this one "Mini gráfico sparklines no canto inferior direito" for general cards.
            // I'll add a subtle sparkline for consistency or just the badge if it fits. 
            // User request: "Cards: Total de Vendas... badge lateral...". 
            // Let's stick to the specific list: 
            // 1) Total Vendas (ShoppingBag)
            // 2) Total Recebido (DollarSign + Sparkline)
            // 3) Ticket Médio (TrendingUp)
            // 4) Crediário Gerado (CreditCard + Sparkline)
            sparklineColor: null,
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
            sparklineColor: null,
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
                    <div key={i} className="sales-kpi-card animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
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
                        <div className="kpi-header">
                            <span className="kpi-title">{card.title}</span>
                            <div className="kpi-icon-wrapper">
                                <Icon size={22} strokeWidth={1.5} />
                            </div>
                        </div>
                        <div className="kpi-content">
                            <span className="kpi-value">
                                {formatValue(card.value, card.isCurrency)}
                            </span>

                            {card.sparklineColor && (
                                <div className="absolute bottom-4 right-4">
                                    {renderSparkline(card.sparklineColor)}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
