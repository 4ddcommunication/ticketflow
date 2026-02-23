import { useRef, useState } from 'react';

interface Props {
    onUpload: (file: File) => Promise<void>;
    accept?: string;
    maxSizeMb?: number;
}

export function FileUploader({ onUpload, accept, maxSizeMb = 10 }: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > maxSizeMb * 1024 * 1024) {
            setError(`File exceeds ${maxSizeMb}MB limit`);
            return;
        }

        setError('');
        setUploading(true);
        try {
            await onUpload(file);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <div>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                className="tf-hidden"
                id="tf-file-upload"
            />
            <label
                htmlFor="tf-file-upload"
                className="tf-inline-flex tf-items-center tf-gap-1.5 tf-px-3 tf-py-1.5 tf-text-sm tf-border tf-border-gray-300 tf-rounded tf-cursor-pointer hover:tf-bg-gray-50"
            >
                {uploading ? (
                    <span className="tf-animate-spin">&#9696;</span>
                ) : (
                    <svg className="tf-w-4 tf-h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                )}
                Attach file
            </label>
            {error && <p className="tf-text-red-600 tf-text-xs tf-mt-1">{error}</p>}
        </div>
    );
}
