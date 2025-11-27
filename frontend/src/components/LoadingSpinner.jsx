import { useState } from 'react';

export default function LoadingSpinner({ size = 'md', fullscreen = false }) {
    const sizes = {
        sm: 'w-4 h-4 border-2',
        md: 'w-8 h-8 border-3',
        lg: 'w-12 h-12 border-4'
    };

    const spinner = (
        <div className={`spinner ${sizes[size]}`}></div>
    );

    if (fullscreen) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-8">
                    {spinner}
                    <p className="mt-4 text-neutral-600">Carregando...</p>
                </div>
            </div>
        );
    }

    return spinner;
}

export function LoadingButton({ loading, children, disabled, ...props }) {
    return (
        <button {...props} disabled={disabled || loading} className={props.className}>
            {loading ? (
                <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" />
                    <span>Carregando...</span>
                </div>
            ) : children}
        </button>
    );
}

export function LoadingOverlay({ show, message = 'Carregando...' }) {
    if (!show) return null;

    return (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
            <div className="text-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-neutral-600">{message}</p>
            </div>
        </div>
    );
}
