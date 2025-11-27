import { useState } from 'react';

export default function LazyImage({ src, alt, className, placeholder = '/placeholder.png' }) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    return (
        <div className="relative">
            {!loaded && !error && (
                <div className={`${className} bg-neutral-200 animate-pulse flex items-center justify-center`}>
                    <span className="text-neutral-400">📷</span>
                </div>
            )}

            <img
                src={error ? placeholder : src}
                alt={alt}
                className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
            />
        </div>
    );
}

export function ProductImage({ src, nome, size = 'md' }) {
    const sizes = {
        sm: 'w-12 h-12',
        md: 'w-20 h-20',
        lg: 'w-32 h-32',
        xl: 'w-48 h-48'
    };

    return (
        <LazyImage
            src={src || '/no-image.png'}
            alt={nome}
            className={`${sizes[size]} object-cover rounded`}
        />
    );
}
