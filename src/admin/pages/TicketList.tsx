import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTickets } from '@shared/hooks/useTickets';
import { StatusBadge } from '@shared/components/StatusBadge';
import { PriorityBadge } from '@shared/components/PriorityBadge';
import { Pagination } from '@shared/components/Pagination';
import { TicketFilters } from '../components/TicketFilters';
import { StatusLegend } from '../components/StatusLegend';
import { t } from '@shared/i18n';

interface Filters {
    status: string;
    priority: string;
    search: string;
}

export function TicketList() {
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState<Filters>({ status: '', priority: '', search: '' });

    const { tickets, total, pages, loading } = useTickets({
        page,
        per_page: 20,
        ...filters,
    });

    const handleFilterChange = (newFilters: Filters) => {
        setFilters(newFilters);
        setPage(1);
    };

    return (
        <div>
            <div className="tf-flex tf-justify-between tf-items-center tf-mb-6">
                <h2 className="tf-text-sm tf-font-semibold tf-uppercase tf-tracking-wide tf-text-gray-500">{t('Tickets')}</h2>
                <Link
                    to="/tickets/new"
                    className="tf-bg-primary-600 tf-text-white tf-px-4 tf-py-2 tf-rounded-lg tf-text-sm tf-font-medium hover:tf-bg-primary-700 tf-transition-colors"
                >
                    {t('New Ticket')}
                </Link>
            </div>

            <TicketFilters filters={filters} onChange={handleFilterChange} />
            <StatusLegend />

            <div className="tf-bg-white tf-rounded-lg tf-shadow-sm tf-border tf-border-gray-200 tf-overflow-hidden">
                {loading ? (
                    <div className="tf-flex tf-justify-center tf-py-12"><div className="tf-animate-spin tf-rounded-full tf-h-8 tf-w-8 tf-border-b-2 tf-border-primary-600"></div></div>
                ) : tickets.length === 0 ? (
                    <p className="tf-px-4 tf-py-12 tf-text-center tf-text-gray-500">{t('No tickets found.')}</p>
                ) : (
                    <>
                        <table className="tf-w-full">
                            <thead>
                                <tr className="tf-bg-gray-50 tf-border-b tf-border-gray-200">
                                    <th className="tf-text-left tf-px-4 tf-py-3 tf-text-xs tf-font-medium tf-text-gray-500 tf-uppercase">{t('Ticket')}</th>
                                    <th className="tf-text-left tf-px-4 tf-py-3 tf-text-xs tf-font-medium tf-text-gray-500 tf-uppercase">{t('Client')}</th>
                                    <th className="tf-text-left tf-px-4 tf-py-3 tf-text-xs tf-font-medium tf-text-gray-500 tf-uppercase">{t('Agent')}</th>
                                    <th className="tf-text-left tf-px-4 tf-py-3 tf-text-xs tf-font-medium tf-text-gray-500 tf-uppercase">{t('Status')}</th>
                                    <th className="tf-text-left tf-px-4 tf-py-3 tf-text-xs tf-font-medium tf-text-gray-500 tf-uppercase">{t('Priority')}</th>
                                    <th className="tf-text-left tf-px-4 tf-py-3 tf-text-xs tf-font-medium tf-text-gray-500 tf-uppercase">{t('Updated')}</th>
                                </tr>
                            </thead>
                            <tbody className="tf-divide-y tf-divide-gray-100">
                                {tickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:tf-bg-gray-50 tf-transition-colors">
                                        <td className="tf-px-4 tf-py-3">
                                            <Link to={`/tickets/${ticket.id}`} className="tf-group">
                                                <span className="tf-text-xs tf-text-gray-400 tf-font-mono tf-block">{ticket.ticket_uid}</span>
                                                <span className="tf-text-sm tf-text-gray-900 group-hover:tf-text-primary-600">{ticket.subject}</span>
                                            </Link>
                                        </td>
                                        <td className="tf-px-4 tf-py-3">
                                            <span className="tf-text-sm tf-text-gray-600 tf-block">{ticket.client?.name || '-'}</span>
                                            {ticket.client?.company && <span className="tf-text-xs tf-text-gray-400">{ticket.client.company}</span>}
                                        </td>
                                        <td className="tf-px-4 tf-py-3 tf-text-sm tf-text-gray-600">{ticket.agent?.name || <span className="tf-text-gray-400">{t('Unassigned')}</span>}</td>
                                        <td className="tf-px-4 tf-py-3"><StatusBadge status={ticket.status} /></td>
                                        <td className="tf-px-4 tf-py-3"><PriorityBadge priority={ticket.priority} /></td>
                                        <td className="tf-px-4 tf-py-3 tf-text-sm tf-text-gray-500">{new Date(ticket.updated_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
                    </>
                )}
            </div>
        </div>
    );
}
