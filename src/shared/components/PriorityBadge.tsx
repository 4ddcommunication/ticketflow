import type { TicketPriority } from '../api/types';
import { t } from '@shared/i18n';

const priorityConfig: Record<TicketPriority, { label: string; classes: string }> = {
    low: { label: 'Low', classes: 'tf-bg-gray-100 tf-text-gray-700' },
    normal: { label: 'Normal', classes: 'tf-bg-blue-100 tf-text-blue-700' },
    high: { label: 'High', classes: 'tf-bg-orange-100 tf-text-orange-700' },
    urgent: { label: 'Urgent', classes: 'tf-bg-red-100 tf-text-red-700' },
};

interface Props {
    priority: TicketPriority;
}

export function PriorityBadge({ priority }: Props) {
    const config = priorityConfig[priority] || priorityConfig.normal;
    return (
        <span className={`tf-inline-flex tf-items-center tf-px-2 tf-py-0.5 tf-rounded tf-text-xs tf-font-medium ${config.classes}`}>
            {t(config.label)}
        </span>
    );
}
