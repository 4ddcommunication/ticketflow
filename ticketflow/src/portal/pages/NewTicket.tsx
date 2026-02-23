import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsApi, settingsApi } from '@shared/api/endpoints';

interface Props {
    accentColor: string;
}

export function NewTicket({ accentColor }: Props) {
    const navigate = useNavigate();
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('normal');
    const [categories, setCategories] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        settingsApi.get().then((s) => setCategories(s.categories)).catch(() => {});
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const ticket = await ticketsApi.create({
                subject,
                description,
                category: category || undefined,
                priority,
            });
            navigate(`/tickets/${ticket.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create ticket');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <button onClick={() => navigate('/')} className="tf-text-sm tf-text-gray-500 hover:tf-text-gray-700 tf-mb-4">
                &larr; Back to tickets
            </button>

            <h2 className="tf-text-xl tf-font-bold tf-text-gray-900 tf-mb-6">New Ticket</h2>

            <form onSubmit={handleSubmit} className="tf-bg-white tf-rounded-lg tf-border tf-border-gray-200 tf-p-6 tf-space-y-4">
                <div>
                    <label className="tf-block tf-text-sm tf-font-medium tf-text-gray-700 tf-mb-1">Subject</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="tf-w-full tf-px-3 tf-py-2 tf-border tf-border-gray-300 tf-rounded-lg tf-text-sm focus:tf-ring-2 focus:tf-outline-none"
                        placeholder="Brief summary of your issue"
                    />
                </div>

                <div className="tf-grid tf-grid-cols-2 tf-gap-4">
                    {categories.length > 0 && (
                        <div>
                            <label className="tf-block tf-text-sm tf-font-medium tf-text-gray-700 tf-mb-1">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="tf-w-full tf-px-3 tf-py-2 tf-border tf-border-gray-300 tf-rounded-lg tf-text-sm"
                            >
                                <option value="">Select...</option>
                                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="tf-block tf-text-sm tf-font-medium tf-text-gray-700 tf-mb-1">Priority</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="tf-w-full tf-px-3 tf-py-2 tf-border tf-border-gray-300 tf-rounded-lg tf-text-sm"
                        >
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="tf-block tf-text-sm tf-font-medium tf-text-gray-700 tf-mb-1">Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        rows={6}
                        className="tf-w-full tf-px-3 tf-py-2 tf-border tf-border-gray-300 tf-rounded-lg tf-text-sm tf-resize-y focus:tf-ring-2 focus:tf-outline-none"
                        placeholder="Describe your issue in detail..."
                    />
                </div>

                {error && <p className="tf-text-red-600 tf-text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={submitting}
                    className="tf-py-2 tf-px-6 tf-rounded-lg tf-text-sm tf-font-medium tf-text-white disabled:tf-opacity-50"
                    style={{ backgroundColor: accentColor }}
                >
                    {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
            </form>
        </div>
    );
}
