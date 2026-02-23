import type { ActivityEntry } from '@shared/api/types';

interface Props {
    activity: ActivityEntry[];
}

const actionLabels: Record<string, string> = {
    ticket_created: 'Created the ticket',
    reply_added: 'Added a reply',
    internal_note_added: 'Added an internal note',
    status_changed: 'Changed status',
    priority_changed: 'Changed priority',
    agent_changed: 'Changed assignment',
};

export function ActivityTimeline({ activity }: Props) {
    if (activity.length === 0) {
        return <p className="tf-text-center tf-text-gray-500 tf-py-8">No activity yet.</p>;
    }

    return (
        <div className="tf-space-y-3">
            {activity.map((entry) => (
                <div key={entry.id} className="tf-flex tf-gap-3 tf-text-sm">
                    <div className="tf-w-2 tf-h-2 tf-rounded-full tf-bg-gray-300 tf-mt-2 tf-shrink-0"></div>
                    <div className="tf-flex-1">
                        <p className="tf-text-gray-700">
                            <span className="tf-font-medium">{entry.user?.name || 'System'}</span>
                            {' '}
                            {actionLabels[entry.action] || entry.action}
                            {entry.old_value && entry.new_value && (
                                <span className="tf-text-gray-500">
                                    {' '}from <span className="tf-line-through">{entry.old_value}</span> to <span className="tf-font-medium">{entry.new_value}</span>
                                </span>
                            )}
                        </p>
                        <p className="tf-text-xs tf-text-gray-400 tf-mt-0.5">{new Date(entry.created_at).toLocaleString()}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
