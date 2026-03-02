import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, ticketsApi } from '@shared/api/endpoints';
import type { DashboardStats, Ticket } from '@shared/api/types';
import { StatusBadge } from '@shared/components/StatusBadge';
import { PriorityBadge } from '@shared/components/PriorityBadge';

export function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recent, setRecent] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            dashboardApi.stats(),
            ticketsApi.list({ per_page: 5, orderby: 'updated_at', order: 'DESC' }),
        ]).then(([s, r]) => {
            setStats(s);
            setRecent(r.items);
        }).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="tf-flex tf-justify-center tf-py-12"><div className="tf-animate-spin tf-rounded-full tf-h-8 tf-w-8 tf-border-b-2 tf-border-primary-600"></div></div>;
    }

    return (
        <div>
            <h2 className="tf-text-sm tf-font-semibold tf-uppercase tf-tracking-wide tf-text-gray-500 tf-mb-6">Dashboard</h2>

            {stats && (
                <div className="tf-grid tf-grid-cols-2 lg:tf-grid-cols-4 tf-gap-4 tf-mb-8">
                    <StatCard label="Total Tickets" value={stats.total} />
                    <StatCard label="Open" value={stats.open} color="blue" />
                    {stats.my_open !== undefined && <StatCard label="My Queue" value={stats.my_open} color="purple" />}
                    {stats.unassigned !== undefined && <StatCard label="Unassigned" value={stats.unassigned} color="orange" />}
                </div>
            )}

            <div className="tf-bg-white tf-rounded-lg tf-shadow-sm tf-border tf-border-gray-200">
                <div className="tf-px-4 tf-py-3 tf-border-b tf-border-gray-200 tf-flex tf-justify-between tf-items-center">
                    <h3 className="tf-font-semibold tf-text-gray-900">Recent Tickets</h3>
                    <Link to="/tickets" className="tf-text-sm tf-text-primary-600 hover:tf-text-primary-700">View all</Link>
                </div>
                <div className="tf-divide-y tf-divide-gray-100">
                    {recent.map((ticket) => (
                        <Link
                            key={ticket.id}
                            to={`/tickets/${ticket.id}`}
                            className="tf-flex tf-items-center tf-justify-between tf-px-4 tf-py-3 hover:tf-bg-gray-50 tf-transition-colors"
                        >
                            <div className="tf-flex tf-items-center tf-gap-3 tf-min-w-0">
                                <span className="tf-text-xs tf-text-gray-400 tf-font-mono">{ticket.ticket_uid}</span>
                                <span className="tf-text-sm tf-text-gray-900 tf-truncate">{ticket.subject}</span>
                            </div>
                            <div className="tf-flex tf-items-center tf-gap-2 tf-shrink-0 tf-ml-4">
                                <PriorityBadge priority={ticket.priority} />
                                <StatusBadge status={ticket.status} />
                            </div>
                        </Link>
                    ))}
                    {recent.length === 0 && (
                        <p className="tf-px-4 tf-py-8 tf-text-center tf-text-gray-500">No tickets yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, color = 'gray' }: { label: string; value: number; color?: string }) {
    return (
        <div className="tf-rounded-lg tf-p-4 tf-bg-white tf-border tf-border-gray-200 tf-text-gray-900">
            <p className="tf-text-3xl tf-font-bold">{value}</p>
            <p className="tf-text-sm tf-font-medium tf-text-gray-500 tf-mt-1">{label}</p>
        </div>
    );
}
