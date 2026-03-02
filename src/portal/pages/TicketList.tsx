import { Link } from 'react-router-dom';
import { useTickets } from '@shared/hooks/useTickets';
import { StatusBadge } from '@shared/components/StatusBadge';
import { PriorityBadge } from '@shared/components/PriorityBadge';
import { t } from '@shared/i18n';

export function TicketList() {
    const { tickets, loading } = useTickets({ per_page: 50 });

    return (
        <div>
            <div className="tf-flex tf-justify-between tf-items-center tf-mb-6">
                <h2 className="tf-text-xl tf-font-bold tf-text-gray-900">{t('My Tickets')}</h2>
                <Link
                    to="/new"
                    className="tf-bg-primary-600 tf-text-white tf-px-4 tf-py-2 tf-rounded-lg tf-text-sm tf-font-medium hover:tf-bg-primary-700"
                >
                    {t('New Ticket')}
                </Link>
            </div>

            {loading ? (
                <div className="tf-flex tf-justify-center tf-py-12">
                    <div className="tf-animate-spin tf-rounded-full tf-h-8 tf-w-8 tf-border-b-2 tf-border-primary-600"></div>
                </div>
            ) : tickets.length === 0 ? (
                <div className="tf-text-center tf-py-12 tf-bg-white tf-rounded-lg tf-border tf-border-gray-200">
                    <p className="tf-text-gray-500 tf-mb-4">{t("You haven't submitted any tickets yet.")}</p>
                    <Link
                        to="/new"
                        className="tf-text-primary-600 hover:tf-text-primary-700 tf-font-medium tf-text-sm"
                    >
                        {t('Create your first ticket')}
                    </Link>
                </div>
            ) : (
                <div className="tf-bg-white tf-rounded-lg tf-border tf-border-gray-200 tf-divide-y tf-divide-gray-100">
                    {tickets.map((ticket) => (
                        <Link
                            key={ticket.id}
                            to={`/tickets/${ticket.id}`}
                            className="tf-block tf-px-4 tf-py-3 hover:tf-bg-gray-50 tf-transition-colors"
                        >
                            <div className="tf-flex tf-items-center tf-justify-between">
                                <div className="tf-min-w-0">
                                    <div className="tf-flex tf-items-center tf-gap-2">
                                        <span className="tf-text-xs tf-text-gray-400 tf-font-mono">{ticket.ticket_uid}</span>
                                        <StatusBadge status={ticket.status} />
                                        <PriorityBadge priority={ticket.priority} />
                                    </div>
                                    <p className="tf-text-sm tf-font-medium tf-text-gray-900 tf-mt-1 tf-truncate">{ticket.subject}</p>
                                </div>
                                <div className="tf-text-right tf-shrink-0 tf-ml-4">
                                    <p className="tf-text-xs tf-text-gray-400">{new Date(ticket.updated_at).toLocaleDateString()}</p>
                                    {ticket.reply_count > 0 && (
                                        <p className="tf-text-xs tf-text-gray-500">{t('{count} replies', { count: ticket.reply_count })}</p>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
