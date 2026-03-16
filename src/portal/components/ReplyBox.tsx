import { useState } from 'react';
import { FileUploader } from '@shared/components/FileUploader';
import { t } from '@shared/i18n';

interface Props {
    onSubmit: (body: string) => Promise<void>;
    onUpload: (file: File) => Promise<void>;
    accentColor: string;
}

export function ReplyBox({ onSubmit, onUpload, accentColor }: Props) {
    const [body, setBody] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!body.trim()) return;
        setSubmitting(true);
        try {
            await onSubmit(body);
            setBody('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="tf-bg-white tf-rounded-lg tf-border tf-border-gray-200 tf-p-4">
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={t('Write a reply...')}
                rows={4}
                className="tf-w-full tf-text-sm tf-border tf-border-gray-300 tf-rounded-lg tf-p-3 tf-resize-y focus:tf-ring-2 focus:tf-outline-none"
            />
            <div className="tf-flex tf-items-center tf-justify-between tf-mt-3">
                <FileUploader onUpload={onUpload} />
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!body.trim() || submitting}
                    className="tf-px-4 tf-py-2 tf-rounded-lg tf-text-sm tf-font-medium tf-text-white disabled:tf-opacity-50"
                    style={{ backgroundColor: accentColor }}
                >
                    {submitting ? t('Sending...') : t('Reply')}
                </button>
            </div>
        </div>
    );
}
