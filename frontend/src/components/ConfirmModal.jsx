import { X, AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Modal de Confirmação Profissional
 * Substitui window.confirm()
 */
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, type = 'warning' }) {
    const { isDark } = useTheme();

    if (!isOpen) return null;

    const bgOverlay = 'rgba(0, 0, 0, 0.5)';
    const bgModal = isDark ? '#1e293b' : '#ffffff';
    const textPrimary = isDark ? '#f1f5f9' : '#1f2937';
    const textSecondary = isDark ? '#94a3b8' : '#6b7280';
    const borderColor = isDark ? '#334155' : '#e5e7eb';

    const colors = {
        warning: { bg: '#f59e0b', bgLight: isDark ? '#78350f' : '#fef3c7', text: '#f59e0b' },
        danger: { bg: '#ef4444', bgLight: isDark ? '#7f1d1d' : '#fee2e2', text: '#ef4444' },
        info: { bg: '#3b82f6', bgLight: isDark ? '#1e3a8a' : '#dbeafe', text: '#3b82f6' }
    };

    const color = colors[type] || colors.warning;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: bgOverlay,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: bgModal,
                borderRadius: '12px',
                width: '90%',
                maxWidth: '400px',
                overflow: 'hidden',
                boxShadow: isDark
                    ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                    : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                border: `1px solid ${borderColor}`
            }}>
                {/* Header com Ícone */}
                <div style={{
                    padding: '1.5rem',
                    backgroundColor: color.bgLight,
                    borderBottom: `1px solid ${borderColor}`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: bgModal,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        <AlertCircle size={24} color={color.text} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h3 style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: textPrimary,
                            margin: 0,
                            marginBottom: '8px'
                        }}>
                            {title}
                        </h3>
                        <p style={{
                            fontSize: '14px',
                            color: textSecondary,
                            margin: 0,
                            lineHeight: '1.5'
                        }}>
                            {message}
                        </p>
                    </div>
                </div>

                {/* Botões */}
                <div style={{
                    padding: '1.5rem',
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            border: `2px solid ${borderColor}`,
                            borderRadius: '8px',
                            background: 'transparent',
                            color: textSecondary,
                            cursor: 'pointer',
                            transition: 'all 150ms'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        style={{
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: '700',
                            border: 'none',
                            borderRadius: '8px',
                            background: color.bg,
                            color: '#ffffff',
                            cursor: 'pointer',
                            transition: 'all 150ms'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.filter = 'brightness(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.filter = 'brightness(1)';
                        }}
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
