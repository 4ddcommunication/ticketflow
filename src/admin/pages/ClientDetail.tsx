import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersApi, ticketsApi } from '@shared/api/endpoints';
import type { User, Ticket } from '@shared/api/types';
import { Avatar } from '@shared/components/Avatar';
import { StatusBadge } from '@shared/components/StatusBadge';
import { PriorityBadge } from '@shared/components/PriorityBadge';
import { t } from '@shared/i18n';

export function ClientDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [client, setClient] = useState<User | null>(null);
    const [companyMembers, setCompanyMembers] = useState<User[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const cid = parseInt(id);

        usersApi.getClient(cid).then(async (user) => {
            setClient(user);

            if (user.company) {
                // Company view: fetch all members + all their tickets
                const membersResult = await usersApi.listByCompany(user.company);
                const members = membersResult.items;
                setCompanyMembers(members);

                const allTickets = await Promise.all(
                    members.map((m) => ticketsApi.list({ client_id: m.id, per_page: 100 }))
                );
                setTickets(allTickets.flatMap((r) => r.items));
            } else {
                // Individual view
                setCompanyMembers([]);
                const ticketResult = await ticketsApi.list({ client_id: cid, per_page: 100 });
                setTickets(ticketResult.items);
            }
        }).finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return <div className="tf-flex tf-justify-center tf-py-12"><div className="tf-animate-spin tf-rounded-full tf-h-8 tf-w-8 tf-border-b-2 tf-border-primary-600"></div></div>;
    }

    if (!client) {
        return <div className="tf-text-center tf-py-12 tf-text-gray-500">{t('Client not found.')}</div>;
    }

    const isCompanyView = !!client.company && companyMembers.length > 0;

    const statusCounts: Record<string, number> = {};
    tickets.forEach((tk) => {
        statusCounts[tk.status] = (statusCounts[tk.status] || 0) + 1;
    });

    return (
        <div>
            <button onClick={() => navigate('/clients')} className="tf-text-sm tf-text-gray-500 hover:tf-text-gray-700 tf-mb-4">
                &larr; {t('Back to clients')}
            </button>

            {/* Header card */}
            <div className="tf-bg-white tf-rounded-lg tf-shadow-sm tf-border tf-border-gray-200 tf-p-6 tf-mb-6">
                {isCompanyView ? (
                    <div>
                        <h2 className="tf-text-xl tf-font-semibold tf-text-gray-900">{client.company}</h2>
                        <p className="tf-text-sm tf-text-gray-500 tf-mt-1">
                            {companyMembers.length} {companyMembers.length === 1 ? t('Contact') : t('Contacts')}
                        </p>
                        <div className="tf-mt-4 tf-flex tf-flex-wrap tf-gap-3">
                            {companyMembers.map((m) => (
                                <div
                                    key={m.id}
                                    className="tf-flex tf-items-center tf-gap-2 tf-bg-gray-50 tf-rounded-lg tf-px-3 tf-py-2"
                                >
                                    <Avatar name={m.name} size="sm" />
                                    <div>
                                        <p className="tf-text-sm tf-font-medium tf-text-gray-900">{m.name}</p>
                                        <p className="tf-text-xs tf-text-gray-500">{m.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="tf-flex tf-items-center tf-gap-4">
                        <Avatar name={client.name} size="lg" />
                        <div>
                            <h2 className="tf-text-xl tf-font-semibold tf-text-gray-900">{client.name}</h2>
                            <p className="tf-text-sm tf-text-gray-500">{client.email}</p>
                            <p className="tf-text-xs tf-text-gray-400 tf-mt-1">
                                {t('Joined')} {new Date(client.registered || '').toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Stats cards */}
            <div className="tf-grid tf-grid-cols-3 tf-gap-3 tf-mb-6">
                <div className="tf-bg-white tf-rounded-lg tf-border tf-border-gray-200 tf-p-4 tf-text-center">
                    <p className="tf-text-2xl tf-font-bold tf-text-gray-900">{tickets.length}</p>
                    <p className="tf-text-xs tf-text-gray-500 tf-mt-1">{t('Total Tickets')}</p>
                </div>
                <div className="tf-bg-white tf-rounded-lg tf-border tf-border-gray-200 tf-p-4 tf-text-center">
                    <p className="tf-text-2xl tf-font-bold tf-text-gray-900">{(statusCounts['open'] || 0) + (statusCounts['in_progress'] || 0) + (statusCounts['waiting'] || 0)}</p>
                    <p className="tf-text-xs tf-text-gray-500 tf-mt-1">{t('Open')}</p>
                </div>
                <div className="tf-bg-white tf-rounded-lg tf-border tf-border-gray-200 tf-p-4 tf-text-center">
                    <p className="tf-text-2xl tf-font-bold tf-text-gray-900">{(statusCounts['resolved'] || 0) + (statusCounts['closed'] || 0)}</p>
                    <p className="tf-text-xs tf-text-gray-500 tf-mt-1">{t('Closed')}</p>
                </div>
            </div>

            {/* Tickets table */}
            <div className="tf-bg-white tf-rounded-lg tf-shadow-sm tf-border tf-border-gray-200">
                <div className="tf-px-4 tf-py-3 tf-border-b tf-border-gray-200">
                    <h3 className="tf-text-sm tf-font-semibold tf-text-gray-700">{t('Tickets')}</h3>
                </div>
                {tickets.length === 0 ? (
                    <p className="tf-py-8 tf-text-center tf-text-gray-500 tf-text-sm">{t('No tickets found.')}</p>
                ) : (
                    <table className="tf-w-full tf-text-sm">
                        <thead>
                            <tr className="tf-text-left tf-text-xs tf-text-gray-500 tf-uppercase tf-border-b tf-border-gray-100">
                                <th className="tf-px-4 tf-py-2">{t('ID')}</th>
                                <th className="tf-px-4 tf-py-2">{t('Subject')}</th>
                                {isCompanyView && <th className="tf-px-4 tf-py-2">{t('Contact')}</th>}
                                <th className="tf-px-4 tf-py-2">{t('Status')}</th>
                                <th className="tf-px-4 tf-py-2">{t('Priority')}</th>
                                <th className="tf-px-4 tf-py-2">{t('Created')}</th>
                            </tr>
                        </thead>
                        <tbody className="tf-divide-y tf-divide-gray-100">
                            {tickets.map((tk) => (
                                <tr
                                    key={tk.id}
                                    onClick={() => navigate(`/tickets/${tk.id}`)}
                                    className="hover:tf-bg-gray-50 tf-cursor-pointer"
                                >
                                    <td className="tf-px-4 tf-py-3 tf-text-xs tf-text-gray-400 tf-font-mono">{tk.ticket_uid}</td>
                                    <td className="tf-px-4 tf-py-3 tf-font-medium tf-text-gray-900">{tk.subject}</td>
                                    {isCompanyView && <td className="tf-px-4 tf-py-3 tf-text-gray-600">{tk.client?.name || '-'}</td>}
                                    <td className="tf-px-4 tf-py-3"><StatusBadge status={tk.status} /></td>
                                    <td className="tf-px-4 tf-py-3"><PriorityBadge priority={tk.priority} /></td>
                                    <td className="tf-px-4 tf-py-3 tf-text-gray-500">{new Date(tk.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
