import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTicket } from '@shared/hooks/useTickets';
import { repliesApi, attachmentsApi } from '@shared/api/endpoints';
import type { Reply } from '@shared/api/types';
import { StatusBadge } from '@shared/components/StatusBadge';
import { PriorityBadge } from '@shared/components/PriorityBadge';
import { Avatar } from '@shared/components/Avatar';
import { FileUploader } from '@shared/components/FileUploader';
import { AttachmentLink } from '@shared/components/AttachmentLink';
import { ReplyBox } from '../components/ReplyBox';
import { t } from '@shared/i18n';

interface Props {
    accentColor: string;
}

export function TicketDetail({ accentColor }: Props) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { ticket, loading, refetch } = useTicket(id ? parseInt(id) : null);
    const [replies, setReplies] = useState<Reply[]>([]);

    useEffect(() => {
        if (!id) return;
        repliesApi.list(parseInt(id)).then(setReplies);
    }, [id]);

    const handleReply = async (body: string) => {
        if (!ticket) return;
        await repliesApi.create(ticket.id, { body });
        const updated = await repliesApi.list(ticket.id);
        setReplies(updated);
        refetch();
    };

    const handleUpload = async (file: File) => {
        if (!ticket) return;
        await attachmentsApi.upload(ticket.id, file);
    };

    if (loading) {
        return <div className="tf-flex tf-justify-center tf-py-12"><div className="tf-animate-spin tf-rounded-full tf-h-8 tf-w-8 tf-border-b-2" style={{ borderColor: accentColor }}></div></div>;
    }

    if (!ticket) {
        return <div className="tf-text-center tf-py-12 tf-text-gray-500">{t('Ticket not found.')}</div>;
    }

    return (
        <div>
            <button onClick={() => navigate('/')} className="tf-text-sm tf-text-gray-500 hover:tf-text-gray-700 tf-mb-4">
                &larr; {t('Back to tickets')}
            </button>

            <div className="tf-bg-white tf-rounded-lg tf-border tf-border-gray-200 tf-mb-4">
                <div className="tf-p-4 tf-border-b tf-border-gray-200">
                    <div className="tf-flex tf-items-start tf-justify-between">
                        <div>
                            <span className="tf-text-xs tf-text-gray-400 tf-font-mono">{ticket.ticket_uid}</span>
                            <h2 className="tf-text-lg tf-font-semibold tf-text-gray-900 tf-mt-1">{ticket.subject}</h2>
                        </div>
                        <div className="tf-flex tf-gap-2">
                            <StatusBadge status={ticket.status} />
                            <PriorityBadge priority={ticket.priority} />
                        </div>
                    </div>
                </div>
                <div className="tf-p-4 tf-text-sm tf-text-gray-700 tf-leading-relaxed" dangerouslySetInnerHTML={{ __html: ticket.description }} />
            </div>

            <div className="tf-space-y-4">
                {replies.map((reply) => (
                    <div key={reply.id} className="tf-bg-white tf-rounded-lg tf-border tf-border-gray-200 tf-p-4">
                        <div className="tf-flex tf-items-center tf-gap-2 tf-mb-2">
                            {reply.author && <Avatar name={reply.author.name} size="sm" />}
                            <span className="tf-text-sm tf-font-medium">{reply.author?.name || t('Support')}</span>
                            {reply.author?.role !== 'client' && (
                                <span className="tf-text-xs tf-bg-primary-100 tf-text-primary-700 tf-px-1.5 tf-py-0.5 tf-rounded">{t('Staff')}</span>
                            )}
                            <span className="tf-text-xs tf-text-gray-400 tf-ml-auto">{new Date(reply.created_at).toLocaleString()}</span>
                        </div>
                        <div className="tf-text-sm tf-text-gray-700 tf-leading-relaxed" dangerouslySetInnerHTML={{ __html: reply.body }} />
                        {reply.attachments.length > 0 && (
                            <div className="tf-mt-2 tf-flex tf-flex-wrap tf-gap-2">
                                {reply.attachments.map((att) => (
                                    <AttachmentLink
                                        key={att.id}
                                        fileName={att.file_name}
                                        downloadUrl={att.download_url}
                                        showIcon={false}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {ticket.status !== 'closed' && (
                    <ReplyBox onSubmit={handleReply} onUpload={handleUpload} accentColor={accentColor} />
                )}
            </div>
        </div>
    );
}
