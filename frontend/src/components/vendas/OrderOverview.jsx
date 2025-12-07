import { useState } from 'react';
// CSS imported globally

export default function OrderOverview({ statusBreakdown, onStatusFilter, loading }) {
    // Colors matching the new CSS variables for consistency
    // Light mode defaults are used here for the chart segments. 
    // Ideally we'd use CSS variables, but inline styles need values.
    // We can use the "text color" of the badge for the chart segment to make it pop, 
    // or the background color. The user asked for "Barra horizontal premium showing proportions".
    // Let's use the "Text" color of the status for the bar segments as they are more vibrant 
    // and match the "dot" color usually used in legends.

    const colors = {
        pago: '#2ECC71',      // Green (Success Text)
        pendente: '#F1C40F',  // Yellow (Pending Text)
        crediario: '#A78BFA', // Purple (Credit Text)
        cancelada: '#E74C3C', // Red (Cancel Text)
        orcamento: '#3B82F6'  // Blue
    };

    // If dark mode is active, these might look different? 
    // The user didn't specify dynamic chart colors for dark mode, but usually charts use the vibrant color.
    // The text colors provided (#2ECC71, #F1C40F, #E74C3C) are vibrant enough for both.

    const labels = {
        pago: 'Concluídas',
        pendente: 'Pendentes',
        crediario: 'Crediário',
        cancelada: 'Canceladas',
        orcamento: 'Orçamentos'
    };

    const total = statusBreakdown
        ? Object.values(statusBreakdown).reduce((sum, val) => sum + val, 0)
        : 0;

    const getPercentage = (value) => {
        return total > 0 ? (value / total) * 100 : 0;
    };

    const keysToShow = ['pago', 'pendente', 'crediario', 'cancelada'];

    if (loading) {
        return (
            <div className="order-overview-container animate-pulse">
                <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded-full mb-4"></div>
            </div>
        );
    }

    return (
        <div className="order-overview-container">
            <h3 className="overview-title">Visão Geral das Vendas</h3>

            {/* Segmented Bar */}
            <div className="status-bar-container">
                {keysToShow.map(key => {
                    const count = statusBreakdown?.[key] || 0;
                    const percentage = getPercentage(count);

                    if (percentage === 0) return null;

                    return (
                        <div
                            key={key}
                            className="status-bar-segment"
                            style={{
                                width: `${percentage}%`,
                                backgroundColor: colors[key]
                            }}
                            onClick={() => onStatusFilter(key)}
                            title={`${labels[key]}: ${count}`}
                        />
                    );
                })}
            </div>

            {/* Legend / Labels */}
            <div className="overview-legend">
                {keysToShow.map(key => {
                    const count = statusBreakdown?.[key] || 0;
                    const percentage = getPercentage(count);

                    return (
                        <div
                            key={key}
                            className="legend-item"
                            onClick={() => onStatusFilter(key)}
                        >
                            <div
                                className="legend-dot"
                                style={{ backgroundColor: colors[key] }}
                            ></div>
                            <span>
                                {labels[key]}: <strong>{count}</strong> ({Math.round(percentage)}%)
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
