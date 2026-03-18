import { useState, useRef, useCallback } from 'react';
import { FileUploader } from '@shared/components/FileUploader';
import { t } from '@shared/i18n';

interface UploadedFile {
    name: string;
    previewUrl?: string;
    file: File;
}

interface Props {
    onSubmit: (body: string) => Promise<void>;
    onUpload: (file: File) => Promise<void>;
    accentColor: string;
}

export function ReplyBox({ onSubmit, onUpload, accentColor }: Props) {
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [dragging, setDragging] = useState(false);
    const dragCounter = useRef(0);

    const addFile = useCallback((file: File) => {
        const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined;
        setFiles((prev) => [...prev, { name: file.name, previewUrl: preview, file }]);
    }, []);

    const removeFile = (index: number) => {
        setFiles((prev) => {
            const f = prev[index];
            if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    };

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
                addFile(new File([file], name, { type: file.type }));
                break;
            }
        }
    }, [addFile]);

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.types.includes('Files')) setDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) setDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); e.stopPropagation();
        dragCounter.current = 0;
        setDragging(false);
        if (e.dataTransfer.files?.length) {
            Array.from(e.dataTransfer.files).forEach(addFile);
        }
    }, [addFile]);

    const handleSubmit = async () => {
        if (!body.trim() && files.length === 0) return;
        setSubmitting(true);
        try {
            // Upload files first
            for (const f of files) {
                await onUpload(f.file);
            }
            if (body.trim()) {
                await onSubmit(body);
            }
            setBody('');
            setFiles([]);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="tf-bg-white tf-rounded-lg tf-border tf-border-gray-200 tf-p-4">
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`tf-relative tf-rounded-lg tf-border ${dragging ? 'tf-border-primary-400 tf-bg-primary-50' : 'tf-border-gray-300'}`}
            >
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    onPaste={handlePaste}
                    placeholder={t('Write a reply...')}
                    rows={4}
                    className="tf-w-full tf-text-sm tf-border-0 tf-rounded-lg tf-p-3 tf-resize-y focus:tf-ring-2 focus:tf-outline-none tf-bg-transparent"
                />
                {dragging && (
                    <div className="tf-absolute tf-inset-0 tf-flex tf-items-center tf-justify-center tf-bg-primary-50/80 tf-rounded-lg tf-pointer-events-none">
                        <span className="tf-text-sm tf-text-primary-600 tf-font-medium">{t('Drop files here')}</span>
                    </div>
                )}
            </div>

            {files.length > 0 && (
                <div className="tf-mt-2 tf-flex tf-flex-wrap tf-gap-2">
                    {files.map((f, i) => (
                        <div key={i} className="tf-relative tf-group">
                            {f.previewUrl ? (
                                <img src={f.previewUrl} alt={f.name} className="tf-w-14 tf-h-14 tf-object-cover tf-rounded-lg tf-border tf-border-gray-200" />
                            ) : (
                                <div className="tf-w-14 tf-h-14 tf-rounded-lg tf-border tf-border-gray-200 tf-bg-gray-50 tf-flex tf-items-center tf-justify-center">
                                    <span className="tf-text-xs tf-text-gray-500">{f.name.split('.').pop()?.toUpperCase()}</span>
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="tf-absolute -tf-top-1.5 -tf-right-1.5 tf-w-5 tf-h-5 tf-bg-red-500 tf-text-white tf-rounded-full tf-text-xs tf-flex tf-items-center tf-justify-center tf-opacity-0 group-hover:tf-opacity-100 tf-transition-opacity"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="tf-flex tf-items-center tf-justify-between tf-mt-3">
                <FileUploader onUpload={(file) => { addFile(file); return Promise.resolve(); }} />
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={(!body.trim() && files.length === 0) || submitting}
                    className="tf-px-4 tf-py-2 tf-rounded-lg tf-text-sm tf-font-medium tf-text-white disabled:tf-opacity-50"
                    style={{ backgroundColor: accentColor }}
                >
                    {submitting ? t('Sending...') : t('Reply')}
                </button>
            </div>
        </div>
    );
}
