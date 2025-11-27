export default function Pagination({ pagination, onPageChange }) {
    if (!pagination || pagination.pages <= 1) return null;

    const { page, pages } = pagination;

    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (let i = 1; i <= pages; i++) {
            if (i === 1 || i === pages || (i >= page - delta && i <= page + delta)) {
                range.push(i);
            }
        }

        let prev = 0;
        for (const i of range) {
            if (i - prev === 2) {
                rangeWithDots.push(prev + 1);
            } else if (i - prev !== 1) {
                rangeWithDots.push('...');
            }
            rangeWithDots.push(i);
            prev = i;
        }

        return rangeWithDots;
    };

    return (
        <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-neutral-600">
                Mostrando página {page} de {pages} ({pagination.total} itens)
            </div>

            <div className="flex gap-2">
                <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                >
                    ← Anterior
                </button>

                {getPageNumbers().map((pageNum, idx) => (
                    pageNum === '...' ? (
                        <span key={`dots-${idx}`} className="px-3 py-2">...</span>
                    ) : (
                        <button
                            key={pageNum}
                            className={`btn btn-sm ${pageNum === page ? 'btn-primary' : 'btn-ghost'}`}
                            onClick={() => onPageChange(pageNum)}
                        >
                            {pageNum}
                        </button>
                    )
                ))}

                <button
                    className="btn btn-sm btn-ghost"
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === pages}
                >
                    Próxima →
                </button>
            </div>
        </div>
    );
}
