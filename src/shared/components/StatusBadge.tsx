import type { TicketStatus } from '../api/types';

const statusConfig: Record<TicketStatus, { label: string; classes: string }> = {
    open: { label: 'Open', classes: 'tf-bg-blue-100 tf-text-blue-800' },
    in_progress: { label: 'In Progress', classes: 'tf-bg-yellow-100 tf-text-yellow-800' },
    waiting: { label: 'Waiting', classes: 'tf-bg-orange-100 tf-text-orange-800' },
    resolved: { label: 'Resolved', classes: 'tf-bg-green-100 tf-text-green-800' },
    closed: { label: 'Closed', classes: 'tf-bg-gray-100 tf-text-gray-800' },
};

interface Props {
    status: TicketStatus;
}

export function StatusBadge({ status }: Props) {
    const config = statusConfig[status] || statusConfig.open;
    return (
        <span className={`tf-inline-flex tf-items-center tf-px-2.5 tf-py-0.5 tf-rounded-full tf-text-xs tf-font-medium ${config.classes}`}>
            {config.label}
        </span>
    );
}
