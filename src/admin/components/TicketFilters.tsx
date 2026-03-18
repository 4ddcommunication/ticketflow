import { t } from '@shared/i18n';

interface Filters {
    status: string;
    priority: string;
    search: string;
}

interface Props {
    filters: Filters;
    onChange: (filters: Filters) => void;
}

export function TicketFilters({ filters, onChange }: Props) {
    const update = (key: keyof Filters, value: string) => {
        onChange({ ...filters, [key]: value });
    };

    return (
        <div className="tf-flex tf-flex-wrap tf-gap-3 tf-mb-4">
            <input
                type="text"
                placeholder={t('Search tickets...')}
                value={filters.search}
                onChange={(e) => update('search', e.target.value)}
                className="tf-px-3 tf-py-2 tf-text-sm tf-border tf-border-gray-300 tf-rounded-lg tf-w-64 focus:tf-ring-2 focus:tf-ring-primary-500 focus:tf-border-primary-500 tf-outline-none"
            />
            <select
                value={filters.status}
                onChange={(e) => update('status', e.target.value)}
                className="tf-px-3 tf-py-2 tf-text-sm tf-border tf-border-gray-300 tf-rounded-lg focus:tf-ring-2 focus:tf-ring-primary-500 tf-outline-none"
            >
                <option value="active">{t('Active')}</option>
                <option value="">{t('All Statuses')}</option>
                <option value="open">{t('Open')}</option>
                <option value="in_progress">{t('In Progress')}</option>
                <option value="waiting">{t('Waiting')}</option>
                <option value="resolved">{t('Resolved')}</option>
                <option value="closed">{t('Closed')}</option>
            </select>
            <select
                value={filters.priority}
                onChange={(e) => update('priority', e.target.value)}
                className="tf-px-3 tf-py-2 tf-text-sm tf-border tf-border-gray-300 tf-rounded-lg focus:tf-ring-2 focus:tf-ring-primary-500 tf-outline-none"
            >
                <option value="">{t('All Priorities')}</option>
                <option value="low">{t('Low')}</option>
                <option value="normal">{t('Normal')}</option>
                <option value="high">{t('High')}</option>
                <option value="urgent">{t('Urgent')}</option>
            </select>
            {(filters.status !== 'active' || filters.priority || filters.search) && (
                <button
                    onClick={() => onChange({ status: 'active', priority: '', search: '' })}
                    className="tf-px-3 tf-py-2 tf-text-sm tf-text-gray-500 hover:tf-text-gray-700"
                >
                    {t('Clear filters')}
                </button>
            )}
        </div>
    );
}
