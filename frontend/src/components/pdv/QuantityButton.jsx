import { Minus, Plus } from 'lucide-react';

/**
 * 🪷 QuantityButton - Botão circular de quantidade (+/-)
 * Reutilizável para qualquer contexto
 */
function QuantityButton({ type = 'plus', onClick, disabled = false, size = 32, color = '#8b5cf6' }) {
    const Icon = type === 'plus' ? Plus : Minus;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                border: `2px solid ${disabled ? '#e5e7eb' : color}`,
                backgroundColor: 'transparent',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 150ms',
                opacity: disabled ? 0.4 : 1
            }}
            onMouseEnter={(e) => {
                if (!disabled) {
                    e.currentTarget.style.backgroundColor = `${color}15`;
                }
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
            }}
        >
            <Icon size={size * 0.5} color={disabled ? '#94a3b8' : color} />
        </button>
    );
}

export default QuantityButton;
