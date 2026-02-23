interface Props {
    page: number;
    pages: number;
    total: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, total, onPageChange }: Props) {
    if (pages <= 1) return null;

    const range = () => {
        const items: (number | '...')[] = [];
        for (let i = 1; i <= pages; i++) {
            if (i === 1 || i === pages || (i >= page - 1 && i <= page + 1)) {
                items.push(i);
            } else if (items[items.length - 1] !== '...') {
                items.push('...');
            }
        }
        return items;
    };

    return (
        <div className="tf-flex tf-items-center tf-justify-between tf-px-4 tf-py-3">
            <span className="tf-text-sm tf-text-gray-500">
                {total} result{total !== 1 ? 's' : ''}
            </span>
            <div className="tf-flex tf-gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="tf-px-3 tf-py-1 tf-text-sm tf-rounded tf-border tf-border-gray-300 disabled:tf-opacity-50 hover:tf-bg-gray-50"
                >
                    Prev
                </button>
                {range().map((item, i) =>
                    item === '...' ? (
                        <span key={`dots-${i}`} className="tf-px-2 tf-py-1 tf-text-sm tf-text-gray-400">...</span>
                    ) : (
                        <button
                            key={item}
                            onClick={() => onPageChange(item)}
                            className={`tf-px-3 tf-py-1 tf-text-sm tf-rounded tf-border ${
                                item === page
                                    ? 'tf-bg-primary-600 tf-text-white tf-border-primary-600'
                                    : 'tf-border-gray-300 hover:tf-bg-gray-50'
                            }`}
                        >
                            {item}
                        </button>
                    )
                )}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= pages}
                    className="tf-px-3 tf-py-1 tf-text-sm tf-rounded tf-border tf-border-gray-300 disabled:tf-opacity-50 hover:tf-bg-gray-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
