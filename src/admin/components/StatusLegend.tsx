import type { TicketStatus } from '@shared/api/types';
import { t } from '@shared/i18n';

const legend: { status: TicketStatus; label: string; desc: string }[] = [
    { status: 'open', label: 'Open', desc: 'Not yet picked up' },
    { status: 'in_progress', label: 'In Progress', desc: 'Agent working on it' },
    { status: 'waiting', label: 'Waiting', desc: 'Awaiting client response' },
    { status: 'resolved', label: 'Resolved', desc: 'Pending confirmation' },
    { status: 'closed', label: 'Closed', desc: 'No action needed' },
];

const badgeClasses: Record<TicketStatus, string> = {
    open: 'tf-bg-blue-100 tf-text-blue-800',
    in_progress: 'tf-bg-yellow-100 tf-text-yellow-800',
    waiting: 'tf-bg-orange-100 tf-text-orange-800',
    resolved: 'tf-bg-green-100 tf-text-green-800',
    closed: 'tf-bg-gray-100 tf-text-gray-800',
};

export function StatusLegend() {
    return (
        <div className="tf-mb-4 tf-flex tf-flex-wrap tf-gap-x-5 tf-gap-y-1">
            {legend.map((item) => (
                <div key={item.status} className="tf-flex tf-items-center tf-gap-1.5">
                    <span className={`tf-inline-flex tf-items-center tf-px-2 tf-py-0.5 tf-rounded-full tf-text-xs tf-font-medium ${badgeClasses[item.status]}`}>
                        {t(item.label)}
                    </span>
                    <span className="tf-text-xs tf-text-gray-400">{t(item.desc)}</span>
                </div>
            ))}
        </div>
    );
}
