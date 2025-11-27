import { useState } from 'react';
import Modal from './Modal';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', type = 'warning' }) {
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        setLoading(true);
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const icons = {
        warning: '⚠️',
        danger: '🚨',
        info: 'ℹ️',
        success: '✅'
    };

    const colors = {
        warning: 'text-warning-600',
        danger: 'text-negative-600',
        info: 'text-primary-600',
        success: 'text-positive-600'
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="text-center py-4">
                <div className={`text-6xl mb-4 ${colors[type]}`}>
                    {icons[type]}
                </div>
                <p className="text-lg mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                    <button
                        className="btn btn-ghost"
                        onClick={onClose}
                        disabled={loading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn ${type === 'danger' ? 'btn-negative' : 'btn-primary'}`}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Processando...' : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

// Hook para usar o dialog
export function useConfirmDialog() {
    const [config, setConfig] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'warning'
    });

    const confirm = ({ title, message, onConfirm, type = 'warning' }) => {
        return new Promise((resolve) => {
            setConfig({
                isOpen: true,
                title,
                message,
                type,
                onConfirm: async () => {
                    await onConfirm();
                    resolve(true);
                }
            });
        });
    };

    const close = () => {
        setConfig({ ...config, isOpen: false });
    };

    return {
        ConfirmDialog: () => <ConfirmDialog {...config} onClose={close} />,
        confirm
    };
}
