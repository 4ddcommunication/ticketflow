import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicket } from '@shared/hooks/useTickets';
import { repliesApi, activityApi, ticketsApi, usersApi, attachmentsApi } from '@shared/api/endpoints';
import type { Reply, ActivityEntry, User, TicketStatus, TicketPriority, Ticket, AttachmentInfo } from '@shared/api/types';
import { StatusBadge } from '@shared/components/StatusBadge';
import { PriorityBadge } from '@shared/components/PriorityBadge';
import { Avatar } from '@shared/components/Avatar';
import { ReplyComposer } from '../components/ReplyComposer';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { AttachmentLink } from '@shared/components/AttachmentLink';
import { t } from '@shared/i18n';
import JSZip from 'jszip';

function stripHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

function buildExportText(ticket: Ticket, replies: Reply[]): string {
    const lines: string[] = [];
    const sep = '─'.repeat(60);

    lines.push(`TICKET EXPORT — ${ticket.ticket_uid}`);
    lines.push(sep);
    lines.push(`Betreff: ${ticket.subject}`);
    lines.push(`Status: ${ticket.status} | Priorität: ${ticket.priority}`);
    lines.push(`Kategorie: ${ticket.category || '-'}`);
    lines.push(`Kunde: ${ticket.client?.name || '-'} (${ticket.client?.email || '-'})`);
    lines.push(`Firma: ${ticket.client?.company || '-'}`);
    lines.push(`Agent: ${ticket.agent?.name || 'Nicht zugewiesen'}`);
    lines.push(`Erstellt: ${new Date(ticket.created_at).toLocaleString()}`);
    lines.push(`Aktualisiert: ${new Date(ticket.updated_at).toLocaleString()}`);
    lines.push('');
    lines.push(sep);
    lines.push('BESCHREIBUNG');
    lines.push(sep);
    lines.push(stripHtml(ticket.description));
    lines.push('');

    replies.forEach((r) => {
        lines.push(sep);
        const tag = r.is_internal ? ' [INTERN]' : '';
        lines.push(`${r.author?.name || 'System'}${tag} — ${new Date(r.created_at).toLocaleString()}`);
        lines.push(sep);
        lines.push(stripHtml(r.body));
        if (r.attachments.length > 0) {
            lines.push('');
            lines.push('Anhänge:');
            r.attachments.forEach((a) => {
                lines.push(`  • ${a.file_name} (${(a.file_size / 1024).toFixed(1)} KB) → siehe /attachments/${a.file_name}`);
            });
        }
        lines.push('');
    });

    return lines.join('\n');
}

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
        refetch(true);
    };

    const [exporting, setExporting] = useState(false);

    const handleExport = useCallback(async () => {
        if (!ticket) return;
        setExporting(true);
        try {
            const zip = new JSZip();

            // Add conversation text
            const text = buildExportText(ticket, replies);
            zip.file(`${ticket.ticket_uid}-conversation.txt`, text);

            // Collect all attachments from replies
            const allAttachments: AttachmentInfo[] = [];
            replies.forEach((r) => {
                r.attachments.forEach((a) => allAttachments.push(a));
            });

            // Fetch and add each attachment
            const nonce = (window as any).ticketflowAdmin?.nonce || '';
            const headers: Record<string, string> = {};
            if (nonce) headers['X-WP-Nonce'] = nonce;

            const usedNames = new Set<string>();
            for (const att of allAttachments) {
                try {
                    const res = await fetch(att.download_url, { credentials: 'same-origin', headers });
                    if (!res.ok) continue;
                    const blob = await res.blob();
                    // Deduplicate filenames
                    let name = att.file_name;
                    if (usedNames.has(name)) {
                        const dot = name.lastIndexOf('.');
                        const base = dot > 0 ? name.slice(0, dot) : name;
                        const ext = dot > 0 ? name.slice(dot) : '';
                        let i = 2;
                        while (usedNames.has(`${base}-${i}${ext}`)) i++;
                        name = `${base}-${i}${ext}`;
                    }
                    usedNames.add(name);
                    zip.file(`attachments/${name}`, blob);
                } catch {
                    // skip failed downloads
                }
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(zipBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${ticket.ticket_uid}-export.zip`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } finally {
            setExporting(false);
        }
    }, [ticket, replies]);

    if (loading) {
        return <div className="tf-flex tf-justify-center tf-py-12"><div className="tf-animate-spin tf-rounded-full tf-h-8 tf-w-8 tf-border-b-2 tf-border-primary-600"></div></div>;
    }

    if (!ticket) {
        return <div className="tf-text-center tf-py-12 tf-text-gray-500">{t('Ticket not found.')}</div>;
    }

    return (
        <div>
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
                                            <AttachmentLink
                                                key={att.id}
                                                fileName={att.file_name}
                                                downloadUrl={att.download_url}
                                            />
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
                            {ticket.client ? (
                                <>
                                    <p className="tf-text-sm tf-mt-1">
                                        <span
                                            onClick={() => navigate(`/clients/${ticket.client!.id}`)}
                                            className="tf-text-primary-600 hover:tf-text-primary-700 tf-cursor-pointer hover:tf-underline"
                                        >
                                            {ticket.client.name}
                                        </span>
                                    </p>
                                    {ticket.client.company && <p className="tf-text-xs tf-text-gray-500 tf-font-medium">{ticket.client.company}</p>}
                                    <p className="tf-text-xs tf-text-gray-500">{ticket.client.email}</p>
                                </>
                            ) : (
                                <p className="tf-text-sm tf-text-gray-900 tf-mt-1">-</p>
                            )}
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

                    {/* Export */}
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={exporting}
                        className="tf-w-full tf-text-sm tf-text-white tf-bg-gray-900 tf-rounded-lg tf-px-4 tf-py-2 hover:tf-bg-gray-800 tf-flex tf-items-center tf-justify-center tf-gap-2 disabled:tf-opacity-50"
                    >
                        {exporting ? (
                            <span className="tf-animate-spin">&#9696;</span>
                        ) : (
                            <svg className="tf-w-4 tf-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        )}
                        {exporting ? t('Exporting...') : t('Export Ticket')}
                    </button>
                </div>
            </div>
        </div>
    );
}
