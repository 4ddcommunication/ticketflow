import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicket } from '@shared/hooks/useTickets';
import { repliesApi, activityApi, ticketsApi, usersApi, attachmentsApi } from '@shared/api/endpoints';
import type { Reply, ActivityEntry, User, TicketStatus, TicketPriority } from '@shared/api/types';
import { StatusBadge } from '@shared/components/StatusBadge';
import { PriorityBadge } from '@shared/components/PriorityBadge';
import { Avatar } from '@shared/components/Avatar';
import { ReplyComposer } from '../components/ReplyComposer';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { t } from '@shared/i18n';

export function TicketDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { ticket, loading, refetch, setTicket } = useTicket(id ? parseInt(id) : null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [activity, setActivity] = useState<ActivityEntry[]>([]);
    const [agents, setAgents] = useState<User[]>([]);

    useEffect(() => {
        if (!id) return;
        const tid = parseInt(id);
        repliesApi.list(tid).then(setReplies);
        activityApi.list(tid).then(setActivity);
        usersApi.listAgents().then(setAgents);
    }, [id]);

    const handleReply = async (body: string, isInternal: boolean) => {
        if (!ticket) return;
        await repliesApi.create(ticket.id, { body, is_internal: isInternal });
        const updated = await repliesApi.list(ticket.id);
        setReplies(updated);
        activityApi.list(ticket.id).then(setActivity);
        refetch();
    };

    const handleStatusChange = async (status: TicketStatus) => {
        if (!ticket) return;
        const updated = await ticketsApi.update(ticket.id, { status });
        setTicket(updated);
        activityApi.list(ticket.id).then(setActivity);
    };

    const handlePriorityChange = async (priority: TicketPriority) => {
        if (!ticket) return;
        const updated = await ticketsApi.update(ticket.id, { priority });
        setTicket(updated);
        activityApi.list(ticket.id).then(setActivity);
    };

    const handleAssign = async (agentId: number) => {
        if (!ticket) return;
        const updated = await ticketsApi.assign(ticket.id, agentId);
        setTicket(updated);
        activityApi.list(ticket.id).then(setActivity);
    };

    const handleUpload = async (file: File) => {
        if (!ticket) return;
        await attachmentsApi.upload(ticket.id, file);
        refetch();
    };

    if (loading) {
        return <div className="tf-flex tf-justify-center tf-py-12"><div className="tf-animate-spin tf-rounded-full tf-h-8 tf-w-8 tf-border-b-2 tf-border-primary-600"></div></div>;
    }

    if (!ticket) {
        return <div className="tf-text-center tf-py-12 tf-text-gray-500">{t('Ticket not found.')}</div>;
    }

    return (
        <div className="tf-max-w-6xl">
            <button onClick={() => navigate('/tickets')} className="tf-text-sm tf-text-gray-500 hover:tf-text-gray-700 tf-mb-4">
                &larr; {t('Back to tickets')}
            </button>

            <div className="tf-flex tf-gap-6">
                {/* Main content — ticket + replies */}
                <div className="tf-flex-1 tf-min-w-0">
                    <div className="tf-bg-white tf-rounded-lg tf-shadow-sm tf-border tf-border-gray-200 tf-mb-4">
                        <div className="tf-p-4 tf-border-b tf-border-gray-200">
                            <div className="tf-flex tf-items-start tf-justify-between">
                                <div>
                                    <span className="tf-text-xs tf-text-gray-400 tf-font-mono">{ticket.ticket_uid}</span>
                                    <h2 className="tf-text-xl tf-font-semibold tf-text-gray-900 tf-mt-1">{ticket.subject}</h2>
                                </div>
                                <div className="tf-flex tf-gap-2">
                                    <StatusBadge status={ticket.status} />
                                    <PriorityBadge priority={ticket.priority} />
                                </div>
                            </div>
                        </div>
                        <div className="tf-p-4 tf-prose tf-prose-sm tf-max-w-none" dangerouslySetInnerHTML={{ __html: ticket.description }} />
                    </div>

                    <div className="tf-space-y-4">
                        {replies.map((reply) => (
                            <div
                                key={reply.id}
                                className={`tf-bg-white tf-rounded-lg tf-border tf-p-4 ${reply.is_internal ? 'tf-border-yellow-200 tf-bg-yellow-50' : 'tf-border-gray-200'}`}
                            >
                                <div className="tf-flex tf-items-center tf-gap-2 tf-mb-2">
                                    {reply.author && <Avatar name={reply.author.name} size="sm" />}
                                    <span className="tf-text-sm tf-font-medium">{reply.author?.name || t('System')}</span>
                                    {reply.is_internal && <span className="tf-text-xs tf-bg-yellow-200 tf-text-yellow-800 tf-px-2 tf-py-0.5 tf-rounded">{t('Internal')}</span>}
                                    <span className="tf-text-xs tf-text-gray-400 tf-ml-auto">{new Date(reply.created_at).toLocaleString()}</span>
                                </div>
                                <div className="tf-prose tf-prose-sm tf-max-w-none" dangerouslySetInnerHTML={{ __html: reply.body }} />
                                {reply.attachments.length > 0 && (
                                    <div className="tf-mt-2 tf-flex tf-flex-wrap tf-gap-2">
                                        {reply.attachments.map((att) => (
                                            <a
                                                key={att.id}
                                                href={att.download_url}
                                                className="tf-flex tf-items-center tf-gap-1 tf-text-xs tf-text-primary-600 tf-bg-primary-50 tf-px-2 tf-py-1 tf-rounded hover:tf-bg-primary-100"
                                            >
                                                <svg className="tf-w-3 tf-h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                                {att.file_name}
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <ReplyComposer
                            onSubmit={handleReply}
                            onUpload={handleUpload}
                            ticketId={ticket.id}
                        />
                    </div>
                </div>

                {/* Sidebar — ticket info + activity */}
                <div className="tf-w-64 tf-shrink-0 tf-space-y-4">
                    <div className="tf-bg-white tf-rounded-lg tf-shadow-sm tf-border tf-border-gray-200 tf-p-4 tf-space-y-4">
                        <div>
                            <label className="tf-text-xs tf-font-medium tf-text-gray-500 tf-uppercase">{t('Status')}</label>
                            <select
                                value={ticket.status}
                                onChange={(e) => handleStatusChange(e.target.value as TicketStatus)}
                                className="tf-mt-1 tf-w-full tf-text-sm tf-border tf-border-gray-300 tf-rounded tf-px-2 tf-py-1.5"
                            >
                                <option value="open">{t('Open')}</option>
                                <option value="in_progress">{t('In Progress')}</option>
                                <option value="waiting">{t('Waiting')}</option>
                                <option value="resolved">{t('Resolved')}</option>
                                <option value="closed">{t('Closed')}</option>
                            </select>
                        </div>

                        <div>
                            <label className="tf-text-xs tf-font-medium tf-text-gray-500 tf-uppercase">{t('Priority')}</label>
                            <select
                                value={ticket.priority}
                                onChange={(e) => handlePriorityChange(e.target.value as TicketPriority)}
                                className="tf-mt-1 tf-w-full tf-text-sm tf-border tf-border-gray-300 tf-rounded tf-px-2 tf-py-1.5"
                            >
                                <option value="low">{t('Low')}</option>
                                <option value="normal">{t('Normal')}</option>
                                <option value="high">{t('High')}</option>
                                <option value="urgent">{t('Urgent')}</option>
                            </select>
                        </div>

                        <div>
                            <label className="tf-text-xs tf-font-medium tf-text-gray-500 tf-uppercase">{t('Assigned To')}</label>
                            <select
                                value={ticket.agent?.id || ''}
                                onChange={(e) => handleAssign(parseInt(e.target.value))}
                                className="tf-mt-1 tf-w-full tf-text-sm tf-border tf-border-gray-300 tf-rounded tf-px-2 tf-py-1.5"
                            >
                                <option value="">{t('Unassigned')}</option>
                                {agents.map((a) => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                        </div>

                        <hr className="tf-border-gray-200" />

                        <div>
                            <label className="tf-text-xs tf-font-medium tf-text-gray-500 tf-uppercase">{t('Client')}</label>
                            <p className="tf-text-sm tf-text-gray-900 tf-mt-1">{ticket.client?.name || '-'}</p>
                            {ticket.client?.company && <p className="tf-text-xs tf-text-gray-500 tf-font-medium">{ticket.client.company}</p>}
                            {ticket.client?.email && <p className="tf-text-xs tf-text-gray-500">{ticket.client.email}</p>}
                        </div>

                        {ticket.category && (
                            <div>
                                <label className="tf-text-xs tf-font-medium tf-text-gray-500 tf-uppercase">{t('Category')}</label>
                                <p className="tf-text-sm tf-text-gray-900 tf-mt-1">{ticket.category}</p>
                            </div>
                        )}

                        <div>
                            <label className="tf-text-xs tf-font-medium tf-text-gray-500 tf-uppercase">{t('Created')}</label>
                            <p className="tf-text-sm tf-text-gray-900 tf-mt-1">{new Date(ticket.created_at).toLocaleString()}</p>
                        </div>

                        {ticket.sla_deadline && (
                            <div>
                                <label className="tf-text-xs tf-font-medium tf-text-gray-500 tf-uppercase">{t('SLA Deadline')}</label>
                                <p className="tf-text-sm tf-text-gray-900 tf-mt-1">{new Date(ticket.sla_deadline).toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    {/* Activity log */}
                    <div className="tf-bg-white tf-rounded-lg tf-shadow-sm tf-border tf-border-gray-200 tf-p-4">
                        <h3 className="tf-text-xs tf-font-medium tf-text-gray-500 tf-uppercase tf-mb-3">{t('Activity')}</h3>
                        <ActivityTimeline activity={activity} />
                    </div>
                </div>
            </div>
        </div>
    );
}
