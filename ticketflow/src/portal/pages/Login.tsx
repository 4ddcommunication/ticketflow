import { useState } from 'react';
import { authApi } from '@shared/api/endpoints';

interface Props {
    accentColor: string;
    companyName: string;
    onLogin: () => void;
}

export function Login({ accentColor, companyName, onLogin }: Props) {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authApi.requestMagicLink(email);
            setSent(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="tf-text-center">
            <h1 className="tf-text-2xl tf-font-bold tf-mb-2" style={{ color: accentColor }}>
                {companyName}
            </h1>
            <p className="tf-text-gray-500 tf-mb-8">Support Portal</p>

            {sent ? (
                <div className="tf-bg-green-50 tf-border tf-border-green-200 tf-rounded-lg tf-p-6">
                    <svg className="tf-w-12 tf-h-12 tf-text-green-500 tf-mx-auto tf-mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                    </svg>
                    <h2 className="tf-text-lg tf-font-semibold tf-text-green-800 tf-mb-2">Check your email</h2>
                    <p className="tf-text-sm tf-text-green-700">
                        We sent a login link to <strong>{email}</strong>. It expires in 15 minutes.
                    </p>
                    <button
                        onClick={() => setSent(false)}
                        className="tf-mt-4 tf-text-sm tf-text-green-600 hover:tf-text-green-800"
                    >
                        Use a different email
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="tf-bg-white tf-border tf-border-gray-200 tf-rounded-lg tf-p-6">
                    <p className="tf-text-sm tf-text-gray-600 tf-mb-4">
                        Enter your email to receive a login link.
                    </p>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="tf-w-full tf-px-3 tf-py-2 tf-border tf-border-gray-300 tf-rounded-lg tf-text-sm tf-mb-3 focus:tf-ring-2 focus:tf-outline-none"
                        style={{ '--tw-ring-color': accentColor } as React.CSSProperties}
                    />
                    {error && <p className="tf-text-red-600 tf-text-sm tf-mb-3">{error}</p>}
                    <button
                        type="submit"
                        disabled={loading}
                        className="tf-w-full tf-py-2 tf-rounded-lg tf-text-sm tf-font-medium tf-text-white disabled:tf-opacity-50"
                        style={{ backgroundColor: accentColor }}
                    >
                        {loading ? 'Sending...' : 'Send Login Link'}
                    </button>
                </form>
            )}
        </div>
    );
}
