import { useState } from 'react';
import { Line, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { TrendingUp, CreditCard } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import Tabs from './Tabs';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function MainChart({ revenueData, paymentMethodsData }) {
    const { isDark } = useTheme();
    const [activeTab, setActiveTab] = useState(0);

    const textColor = isDark ? '#cbd5e1' : '#6b7280';
    const gridColor = isDark ? '#334155' : '#e5e7eb';

    const lineChartData = {
        labels: revenueData?.labels || ['01', '02', '03', '04', '05', '06', '07'],
        datasets: [
            {
                label: 'Faturamento',
                data: revenueData?.values || [12000, 15000, 13500, 18000, 16500, 19000, 21000],
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#8b5cf6',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2
            }
        ]
    };

    const pieChartData = {
        labels: paymentMethodsData?.labels || ['Dinheiro', 'Crédito', 'Débito', 'PIX'],
        datasets: [
            {
                data: paymentMethodsData?.values || [30, 40, 15, 15],
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
                borderWidth: 2,
                borderColor: isDark ? '#1e293b' : '#ffffff'
            }
        ]
    };

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                titleColor: isDark ? '#f1f5f9' : '#1f2937',
                bodyColor: isDark ? '#cbd5e1' : '#6b7280',
                borderColor: isDark ? '#334155' : '#e5e7eb',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: {
                    color: gridColor,
                    drawBorder: false
                },
                ticks: {
                    color: textColor
                }
            },
            y: {
                grid: {
                    color: gridColor,
                    drawBorder: false
                },
                ticks: {
                    color: textColor,
                    callback: (value) => `R$ ${value.toLocaleString('pt-BR')}`
                }
            }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: textColor,
                    padding: 15,
                    font: {
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                titleColor: isDark ? '#f1f5f9' : '#1f2937',
                bodyColor: isDark ? '#cbd5e1' : '#6b7280',
                borderColor: isDark ? '#334155' : '#e5e7eb',
                borderWidth: 1,
                callbacks: {
                    label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: ${value}%`;
                    }
                }
            }
        }
    };

    const tabs = [
        {
            label: 'Faturamento',
            icon: TrendingUp,
            content: (
                <div style={{ height: '300px' }}>
                    <Line data={lineChartData} options={lineOptions} />
                </div>
            )
        },
        {
            label: 'Formas de Pagamento',
            icon: CreditCard,
            content: (
                <div style={{ height: '300px' }}>
                    <Pie data={pieChartData} options={pieOptions} />
                </div>
            )
        }
    ];

    return (
        <div style={{ padding: '1.5rem', backgroundColor: isDark ? '#1e293b' : '#ffffff', borderRadius: '12px', border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}` }}>
            <Tabs tabs={tabs} defaultTab={activeTab} onChange={setActiveTab} />
        </div>
    );
}

export default MainChart;
