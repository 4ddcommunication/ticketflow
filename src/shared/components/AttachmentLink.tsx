import { useState, useCallback, useEffect } from 'react';
import { t } from '@shared/i18n';

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];

function isImage(fileName: string): boolean {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return IMAGE_EXTS.includes(ext);
}

function getNonce(): string {
    if (window.ticketflowAdmin?.nonce) return window.ticketflowAdmin.nonce;
    const el = document.getElementById('ticketflow-portal');
    if (el?.dataset.config) {
        try { return JSON.parse(el.dataset.config).nonce || ''; } catch { return ''; }
    }
    return '';
}

async function fetchBlob(url: string): Promise<string> {
    const nonce = getNonce();
    const headers: Record<string, string> = {};
    if (nonce) headers['X-WP-Nonce'] = nonce;
    const res = await fetch(url, { credentials: 'same-origin', headers });
    if (!res.ok) throw new Error('Failed to load');
    const blob = await res.blob();
    return URL.createObjectURL(blob);
}

function triggerDownload(blobUrl: string, fileName: string) {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

interface Props {
    fileName: string;
    downloadUrl: string;
    showIcon?: boolean;
}

export function AttachmentLink({ fileName, downloadUrl, showIcon = true }: Props) {
    const [lightbox, setLightbox] = useState(false);
    const [blobUrl, setBlobUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const image = isImage(fileName);

    const handleClick = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (image) {
            if (blobUrl) {
                setLightbox(true);
                return;
            }
            setLoading(true);
            try {
                const url = await fetchBlob(downloadUrl);
                setBlobUrl(url);
                setLightbox(true);
            } catch {
                // fallback: nothing we can do
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(true);
            try {
                const url = await fetchBlob(downloadUrl);
                triggerDownload(url, fileName);
                URL.revokeObjectURL(url);
            } catch {
                // fallback: nothing we can do
            } finally {
                setLoading(false);
            }
        }
    }, [downloadUrl, blobUrl, image, fileName]);

    const handleDownload = useCallback(async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (blobUrl) {
            triggerDownload(blobUrl, fileName);
        } else {
            try {
                const url = await fetchBlob(downloadUrl);
                triggerDownload(url, fileName);
                URL.revokeObjectURL(url);
            } catch {
                // fallback
            }
        }
    }, [blobUrl, downloadUrl, fileName]);

    useEffect(() => {
        if (!lightbox) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setLightbox(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [lightbox]);

    const icon = showIcon && (
        <svg className="tf-w-3 tf-h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
    );

    return (
        <>
            <button
                type="button"
                onClick={handleClick}
                className="tf-flex tf-items-center tf-gap-1 tf-text-xs tf-text-primary-600 tf-bg-primary-50 tf-px-2 tf-py-1 tf-rounded hover:tf-bg-primary-100 tf-cursor-pointer"
            >
                {loading ? <span className="tf-animate-spin">&#9696;</span> : icon}
                {fileName}
            </button>

            {lightbox && blobUrl && (
                <div
                    className="tf-fixed tf-inset-0 tf-z-50 tf-flex tf-items-center tf-justify-center tf-bg-black/70"
                    onClick={() => setLightbox(false)}
                >
                    <div className="tf-relative tf-max-w-[90vw] tf-max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setLightbox(false)}
                            className="tf-absolute tf-top-2 tf-right-2 tf-w-8 tf-h-8 tf-bg-black/50 tf-text-white tf-rounded-full tf-flex tf-items-center tf-justify-center hover:tf-bg-black/70 tf-text-lg"
                        >
                            ×
                        </button>
                        <img
                            src={blobUrl}
                            alt={fileName}
                            className="tf-max-w-full tf-max-h-[85vh] tf-rounded-lg tf-shadow-2xl"
                        />
                        <div className="tf-flex tf-items-center tf-justify-between tf-mt-2">
                            <span className="tf-text-white tf-text-sm">{fileName}</span>
                            <button
                                type="button"
                                onClick={handleDownload}
                                className="tf-text-white/80 hover:tf-text-white tf-text-sm tf-underline"
                            >
                                {t('Download')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
