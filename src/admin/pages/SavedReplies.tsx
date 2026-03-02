import { useState, useEffect } from 'react';
import { savedRepliesApi } from '@shared/api/endpoints';
import type { SavedReply } from '@shared/api/types';
import { t } from '@shared/i18n';

export function SavedRepliesPage() {
    const [replies, setReplies] = useState<SavedReply[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<SavedReply | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [category, setCategory] = useState('');

    const fetchReplies = async () => {
        setLoading(true);
        try {
            const data = await savedRepliesApi.list();
            setReplies(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReplies();
    }, []);

    const resetForm = () => {
        setTitle('');
        setBody('');
        setCategory('');
        setEditing(null);
        setShowForm(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editing) {
            await savedRepliesApi.update(editing.id, { title, body, category: category || undefined });
        } else {
            await savedRepliesApi.create({ title, body, category: category || undefined });
        }
        resetForm();
        fetchReplies();
    };

    const handleEdit = (reply: SavedReply) => {
        setTitle(reply.title);
        setBody(reply.body);
        setCategory(reply.category || '');
        setEditing(reply);
        setShowForm(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm(t('Delete this saved reply?'))) return;
        await savedRepliesApi.delete(id);
        fetchReplies();
    };

    return (
        <div>
            <div className="tf-flex tf-justify-between tf-items-center tf-mb-6">
                <h2 className="tf-text-2xl tf-font-bold tf-text-gray-900">{t('Saved Replies')}</h2>
                <button
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="tf-bg-primary-600 tf-text-white tf-px-4 tf-py-2 tf-rounded-lg tf-text-sm tf-font-medium hover:tf-bg-primary-700"
                >
                    {t('New Reply')}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSave} className="tf-bg-white tf-rounded-lg tf-border tf-border-gray-200 tf-p-4 tf-mb-4 tf-space-y-3">
                    <input
                        type="text"
                        placeholder={t('Title')}
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="tf-input tf-w-full"
                        required
                    />
                    <textarea
                        placeholder={t('Reply body...')}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={4}
                        className="tf-input tf-w-full tf-resize-y"
                        required
                    />
                    <input
                        type="text"
                        placeholder={t('Category (optional)')}
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="tf-input tf-w-64"
                    />
                    <div className="tf-flex tf-gap-2">
                        <button type="submit" className="tf-bg-primary-600 tf-text-white tf-px-4 tf-py-2 tf-rounded-lg tf-text-sm tf-font-medium hover:tf-bg-primary-700">
                            {editing ? t('Update') : t('Create')}
                        </button>
                        <button type="button" onClick={resetForm} className="tf-px-4 tf-py-2 tf-text-sm tf-text-gray-600 hover:tf-text-gray-900">
                            {t('Cancel')}
                        </button>
                    </div>
                </form>
            )}

            <div className="tf-bg-white tf-rounded-lg tf-shadow-sm tf-border tf-border-gray-200">
                {loading ? (
                    <div className="tf-flex tf-justify-center tf-py-12"><div className="tf-animate-spin tf-rounded-full tf-h-8 tf-w-8 tf-border-b-2 tf-border-primary-600"></div></div>
                ) : replies.length === 0 ? (
                    <p className="tf-py-12 tf-text-center tf-text-gray-500">{t('No saved replies yet.')}</p>
                ) : (
                    <div className="tf-divide-y tf-divide-gray-100">
                        {replies.map((reply) => (
                            <div key={reply.id} className="tf-px-4 tf-py-3">
                                <div className="tf-flex tf-justify-between tf-items-start">
                                    <div>
                                        <h4 className="tf-text-sm tf-font-medium tf-text-gray-900">{reply.title}</h4>
                                        {reply.category && <span className="tf-text-xs tf-text-gray-500">{reply.category}</span>}
                                    </div>
                                    <div className="tf-flex tf-gap-2">
                                        <button onClick={() => handleEdit(reply)} className="tf-text-xs tf-text-primary-600 hover:tf-text-primary-700">{t('Edit')}</button>
                                        <button onClick={() => handleDelete(reply.id)} className="tf-text-xs tf-text-red-600 hover:tf-text-red-700">{t('Delete')}</button>
                                    </div>
                                </div>
                                <p className="tf-text-sm tf-text-gray-600 tf-mt-1 tf-line-clamp-2">{reply.body}</p>
                                <p className="tf-text-xs tf-text-gray-400 tf-mt-1">{t('Used {count} times', { count: reply.use_count })}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
