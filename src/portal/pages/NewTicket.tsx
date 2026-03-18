import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketsApi, attachmentsApi, settingsApi } from '@shared/api/endpoints';
import { t } from '@shared/i18n';

const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip', 'text/plain', 'text/csv',
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface Props {
    accentColor: string;
}

export function NewTicket({ accentColor }: Props) {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('normal');
    const [categories, setCategories] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [error, setError] = useState('');
    const [dragging, setDragging] = useState(false);
    const dragCounter = useRef(0);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (!file) continue;
                const ext = file.type.split('/')[1] === 'jpeg' ? 'jpg' : file.type.split('/')[1];
                const now = new Date();
                const name = `screenshot-${now.toISOString().slice(0, 10)}-${now.toTimeString().slice(0, 8).replace(/:/g, '')}.${ext}`;
                const renamed = new File([file], name, { type: file.type });
                addFiles([renamed]);
                break;
            }
        }
    }, []);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.types.includes('Files')) setDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) setDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current = 0;
        setDragging(false);
        if (e.dataTransfer.files?.length) {
            addFiles(e.dataTransfer.files);
        }
    }, []);

    useEffect(() => {
        settingsApi.get().then((s) => setCategories(s.categories)).catch(() => {});
    }, []);

    const addFiles = (newFiles: FileList | File[] | null) => {
        if (!newFiles) return;
        const valid: File[] = [];
        for (const file of Array.from(newFiles)) {
            if (!ALLOWED_TYPES.includes(file.type)) {
                setError(t('"{name}" is not an allowed file type.', { name: file.name }));
                return;
            }
            if (file.size > MAX_FILE_SIZE) {
                setError(t('"{name}" exceeds the 10MB limit.', { name: file.name }));
                return;
            }
            valid.push(file);
        }
        setError('');
        setFiles((prev) => [...prev, ...valid]);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

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

            // Upload attachments
            if (files.length > 0) {
                for (let i = 0; i < files.length; i++) {
                    setUploadProgress(t('Uploading file {current} of {total}...', { current: i + 1, total: files.length }));
                    await attachmentsApi.upload(ticket.id, files[i]);
                }
            }

            navigate(`/tickets/${ticket.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : t('Failed to create ticket'));
        } finally {
            setSubmitting(false);
            setUploadProgress('');
        }
    };

    return (
        <div>
            <button onClick={() => navigate('/')} className="tf-text-sm tf-text-gray-500 hover:tf-text-gray-700 tf-mb-4">
                &larr; {t('Back to tickets')}
            </button>

            <h2 className="tf-text-xl tf-font-bold tf-text-gray-900 tf-mb-6">{t('New Ticket')}</h2>

            <form onSubmit={handleSubmit} className="tf-bg-white tf-rounded-lg tf-border tf-border-gray-200 tf-p-6 tf-space-y-4">
                <div>
                    <label className="tf-block tf-text-sm tf-font-medium tf-text-gray-700 tf-mb-1">{t('Subject')}</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        required
                        className="tf-w-full tf-px-3 tf-py-2 tf-border tf-border-gray-300 tf-rounded-lg tf-text-sm focus:tf-ring-2 focus:tf-outline-none"
                        placeholder={t('Brief summary of your issue')}
                    />
                </div>

                <div className="tf-grid tf-grid-cols-2 tf-gap-4">
                    {categories.length > 0 && (
                        <div>
                            <label className="tf-block tf-text-sm tf-font-medium tf-text-gray-700 tf-mb-1">{t('Category')}</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="tf-w-full tf-px-3 tf-py-2 tf-border tf-border-gray-300 tf-rounded-lg tf-text-sm"
                            >
                                <option value="">{t('Select...')}</option>
                                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="tf-block tf-text-sm tf-font-medium tf-text-gray-700 tf-mb-1">{t('Priority')}</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="tf-w-full tf-px-3 tf-py-2 tf-border tf-border-gray-300 tf-rounded-lg tf-text-sm"
                        >
                            <option value="low">{t('Low')}</option>
                            <option value="normal">{t('Normal')}</option>
                            <option value="high">{t('High')}</option>
                            <option value="urgent">{t('Urgent')}</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="tf-block tf-text-sm tf-font-medium tf-text-gray-700 tf-mb-1">{t('Description')}</label>
                    <div
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        className={`tf-relative tf-rounded-lg tf-border ${dragging ? 'tf-border-primary-400 tf-bg-primary-50' : 'tf-border-gray-300'}`}
                    >
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onPaste={handlePaste}
                            required
                            rows={6}
                            className="tf-w-full tf-px-3 tf-py-2 tf-border-0 tf-rounded-lg tf-text-sm tf-resize-y focus:tf-ring-2 focus:tf-outline-none tf-bg-transparent"
                            placeholder={t('Describe your issue in detail...')}
                        />
                        {dragging && (
                            <div className="tf-absolute tf-inset-0 tf-flex tf-items-center tf-justify-center tf-bg-primary-50/80 tf-rounded-lg tf-pointer-events-none">
                                <span className="tf-text-sm tf-text-primary-600 tf-font-medium">{t('Drop files here')}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* File attachments */}
                <div>
                    <label className="tf-block tf-text-sm tf-font-medium tf-text-gray-700 tf-mb-1">{t('Attachments')}</label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt,.csv"
                        onChange={(e) => addFiles(e.target.files)}
                        className="tf-hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="tf-inline-flex tf-items-center tf-gap-2 tf-px-3 tf-py-2 tf-border tf-border-gray-300 tf-border-dashed tf-rounded-lg tf-text-sm tf-text-gray-600 hover:tf-border-gray-400 hover:tf-text-gray-700"
                    >
                        <svg className="tf-w-4 tf-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        {t('Attach files')}
                        <span className="tf-text-xs tf-text-gray-400">{t('(PNG, JPEG, PDF, up to 10MB)')}</span>
                    </button>

                    {files.length > 0 && (
                        <div className="tf-mt-2 tf-flex tf-flex-wrap tf-gap-2">
                            {files.map((file, i) => (
                                <div key={i} className="tf-relative tf-group">
                                    {file.type.startsWith('image/') ? (
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={file.name}
                                            className="tf-w-16 tf-h-16 tf-object-cover tf-rounded-lg tf-border tf-border-gray-200"
                                        />
                                    ) : (
                                        <div className="tf-w-16 tf-h-16 tf-rounded-lg tf-border tf-border-gray-200 tf-bg-gray-50 tf-flex tf-items-center tf-justify-center">
                                            <span className="tf-text-xs tf-text-gray-500 tf-text-center tf-px-1 tf-truncate">{file.name.split('.').pop()?.toUpperCase()}</span>
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeFile(i)}
                                        className="tf-absolute -tf-top-1.5 -tf-right-1.5 tf-w-5 tf-h-5 tf-bg-red-500 tf-text-white tf-rounded-full tf-text-xs tf-flex tf-items-center tf-justify-center tf-opacity-0 group-hover:tf-opacity-100 tf-transition-opacity"
                                    >
                                        ×
                                    </button>
                                    <p className="tf-text-xs tf-text-gray-500 tf-mt-0.5 tf-w-16 tf-truncate">{file.name}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {error && <p className="tf-text-red-600 tf-text-sm">{error}</p>}

                <button
                    type="submit"
                    disabled={submitting}
                    className="tf-py-2 tf-px-6 tf-rounded-lg tf-text-sm tf-font-medium tf-text-white disabled:tf-opacity-50"
                    style={{ backgroundColor: accentColor }}
                >
                    {submitting ? (uploadProgress || t('Submitting...')) : t('Submit Ticket')}
                </button>
            </form>
        </div>
    );
}
