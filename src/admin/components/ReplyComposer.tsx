import { useState, useRef, useCallback } from 'react';
import { FileUploader } from '@shared/components/FileUploader';
import { t } from '@shared/i18n';

interface UploadedFile {
    name: string;
    previewUrl?: string;
    uploading: boolean;
    error?: string;
}

interface Props {
    onSubmit: (body: string, isInternal: boolean) => Promise<void>;
    onUpload: (file: File) => Promise<void>;
    ticketId: number;
}

export function ReplyComposer({ onSubmit, onUpload }: Props) {
    const [body, setBody] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [dragging, setDragging] = useState(false);
    const dragCounter = useRef(0);

    const uploadFile = useCallback(async (file: File) => {
        const isImage = file.type.startsWith('image/');
        const previewUrl = isImage ? URL.createObjectURL(file) : undefined;
        const entry: UploadedFile = { name: file.name, previewUrl, uploading: true };

        setFiles(prev => [...prev, entry]);
        const idx = files.length;

        try {
            await onUpload(file);
            setFiles(prev => prev.map((f, i) => i === idx ? { ...f, uploading: false } : f));
        } catch (err) {
            setFiles(prev => prev.map((f, i) => i === idx ? { ...f, uploading: false, error: err instanceof Error ? err.message : 'Upload failed' } : f));
        }
    }, [files.length, onUpload]);

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of Array.from(items)) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (!file) continue;
                const ext = file.type.split('/')[1] || 'png';
                const now = new Date();
                const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
                const named = new File([file], `screenshot-${ts}.${ext}`, { type: file.type });
                uploadFile(named);
                return;
            }
        }
    }, [uploadFile]);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.types.includes('Files')) {
            setDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) setDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(false);
        dragCounter.current = 0;
        const droppedFiles = e.dataTransfer.files;
        if (droppedFiles.length > 0) {
            for (const file of Array.from(droppedFiles)) {
                uploadFile(file);
            }
        }
    };

    const removeFile = (idx: number) => {
        setFiles(prev => {
            const f = prev[idx];
            if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
            return prev.filter((_, i) => i !== idx);
        });
    };

    const handleSubmit = async () => {
        if (!body.trim()) return;
        setSubmitting(true);
        try {
            await onSubmit(body, isInternal);
            setBody('');
            setFiles([]);
        } finally {
            setSubmitting(false);
        }
    };

    const borderClass = isInternal
        ? 'tf-border-yellow-300' + (dragging ? '' : '')
        : 'tf-border-gray-300';

    return (
        <div className="tf-bg-white tf-rounded-lg tf-border tf-border-gray-200 tf-p-4">
            <div
                className={`tf-border tf-rounded-lg tf-transition-colors ${
                    dragging
                        ? 'tf-border-primary-400 tf-bg-primary-50'
                        : isInternal
                            ? 'tf-border-yellow-300 tf-bg-yellow-50'
                            : 'tf-border-gray-300'
                }`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    onPaste={handlePaste}
                    placeholder={
                        isInternal
                            ? t('Add internal note...')
                            : t('Write a reply... (paste or drop images here)')
                    }
                    rows={4}
                    className={`tf-w-full tf-text-sm tf-p-3 tf-resize-y focus:tf-outline-none tf-bg-transparent tf-border-0 ${
                        isInternal ? 'placeholder:tf-text-yellow-500' : ''
                    }`}
                    style={{ borderRadius: '0.5rem 0.5rem 0 0' }}
                />

                {files.length > 0 && (
                    <div className="tf-flex tf-flex-wrap tf-gap-2 tf-px-3 tf-pb-3">
                        {files.map((f, i) => (
                            <div key={i} className="tf-relative tf-group">
                                {f.previewUrl ? (
                                    <div className="tf-relative tf-w-16 tf-h-16 tf-rounded tf-overflow-hidden tf-border tf-border-gray-200">
                                        <img src={f.previewUrl} alt={f.name} className="tf-w-full tf-h-full tf-object-cover" />
                                        {f.uploading && (
                                            <div className="tf-absolute tf-inset-0 tf-bg-white/70 tf-flex tf-items-center tf-justify-center">
                                                <span className="tf-animate-spin tf-text-primary-600">&#9696;</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="tf-flex tf-items-center tf-gap-1 tf-px-2 tf-py-1 tf-bg-gray-100 tf-rounded tf-text-xs tf-text-gray-600">
                                        <svg className="tf-w-3 tf-h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                        {f.name.length > 20 ? f.name.slice(0, 17) + '...' : f.name}
                                        {f.uploading && <span className="tf-animate-spin">&#9696;</span>}
                                    </div>
                                )}
                                {!f.uploading && (
                                    <button
                                        type="button"
                                        onClick={() => removeFile(i)}
                                        className="tf-absolute -tf-top-1.5 -tf-right-1.5 tf-w-4 tf-h-4 tf-bg-red-500 tf-text-white tf-rounded-full tf-text-xs tf-flex tf-items-center tf-justify-center tf-opacity-0 group-hover:tf-opacity-100 tf-transition-opacity"
                                    >
                                        ×
                                    </button>
                                )}
                                {f.error && <p className="tf-text-red-500 tf-text-xs tf-mt-0.5">{f.error}</p>}
                            </div>
                        ))}
                    </div>
                )}

                {dragging && files.length === 0 && (
                    <div className="tf-px-3 tf-pb-3 tf-text-sm tf-text-primary-500 tf-text-center">
                        {t('Drop files here')}
                    </div>
                )}
            </div>

            <div className="tf-mt-2">
                <FileUploader onUpload={uploadFile} />
            </div>

            <div className="tf-flex tf-items-center tf-justify-between tf-mt-3">
                <label className="tf-flex tf-items-center tf-gap-2 tf-cursor-pointer">
                    <input
                        type="checkbox"
                        checked={isInternal}
                        onChange={(e) => setIsInternal(e.target.checked)}
                        className="tf-rounded tf-border-gray-300 tf-text-yellow-500 focus:tf-ring-yellow-500"
                    />
                    <span className="tf-text-sm tf-text-gray-600">{t('Internal note')}</span>
                </label>

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!body.trim() || submitting}
                    className={`tf-px-4 tf-py-2 tf-rounded-lg tf-text-sm tf-font-medium tf-text-white tf-transition-colors disabled:tf-opacity-50 ${
                        isInternal
                            ? 'tf-bg-yellow-500 hover:tf-bg-yellow-600'
                            : 'tf-bg-primary-600 hover:tf-bg-primary-700'
                    }`}
                >
                    {submitting ? t('Sending...') : isInternal ? t('Add Note') : t('Reply')}
                </button>
            </div>
        </div>
    );
}
