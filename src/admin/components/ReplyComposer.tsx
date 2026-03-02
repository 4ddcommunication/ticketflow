import { useState } from 'react';
import { FileUploader } from '@shared/components/FileUploader';

interface Props {
    onSubmit: (body: string, isInternal: boolean) => Promise<void>;
    onUpload: (file: File) => Promise<void>;
    ticketId: number;
}

export function ReplyComposer({ onSubmit, onUpload }: Props) {
    const [body, setBody] = useState('');
    const [isInternal, setIsInternal] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!body.trim()) return;

        setSubmitting(true);
        try {
            await onSubmit(body, isInternal);
            setBody('');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="tf-bg-white tf-rounded-lg tf-border tf-border-gray-200 tf-p-4">
            <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder={isInternal ? 'Add internal note...' : 'Write a reply...'}
                rows={4}
                className={`tf-w-full tf-text-sm tf-border tf-rounded-lg tf-p-3 tf-resize-y focus:tf-ring-2 focus:tf-outline-none ${
                    isInternal
                        ? 'tf-border-yellow-300 tf-bg-yellow-50 focus:tf-ring-yellow-400'
                        : 'tf-border-gray-300 focus:tf-ring-primary-500'
                }`}
            />

            <div className="tf-flex tf-items-center tf-justify-between tf-mt-3">
                <div className="tf-flex tf-items-center tf-gap-3">
                    <label className="tf-flex tf-items-center tf-gap-2 tf-cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isInternal}
                            onChange={(e) => setIsInternal(e.target.checked)}
                            className="tf-rounded tf-border-gray-300 tf-text-yellow-500 focus:tf-ring-yellow-500"
                        />
                        <span className="tf-text-sm tf-text-gray-600">Internal note</span>
                    </label>
                    <FileUploader onUpload={onUpload} />
                </div>

                <button
                    type="submit"
                    disabled={!body.trim() || submitting}
                    className={`tf-px-4 tf-py-2 tf-rounded-lg tf-text-sm tf-font-medium tf-text-white tf-transition-colors disabled:tf-opacity-50 ${
                        isInternal
                            ? 'tf-bg-yellow-500 hover:tf-bg-yellow-600'
                            : 'tf-bg-primary-600 hover:tf-bg-primary-700'
                    }`}
                >
                    {submitting ? 'Sending...' : isInternal ? 'Add Note' : 'Reply'}
                </button>
            </div>
        </form>
    );
}
