import { useState, useEffect } from 'react';
import { usersApi } from '@shared/api/endpoints';
import type { User } from '@shared/api/types';
import { Avatar } from '@shared/components/Avatar';

export function ClientsPage() {
    const [clients, setClients] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    const fetchClients = async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = {};
            if (search) params.search = search;
            const result = await usersApi.listClients(params);
            setClients(result.items);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [search]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError('');
        try {
            await usersApi.createClient({ email: newEmail, name: newName });
            setNewEmail('');
            setNewName('');
            setShowNew(false);
            fetchClients();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create client');
        } finally {
            setCreating(false);
        }
    };

    return (
        <div>
            <div className="tf-flex tf-justify-between tf-items-center tf-mb-6">
                <h2 className="tf-text-2xl tf-font-bold tf-text-gray-900">Clients</h2>
                <button
                    onClick={() => setShowNew(!showNew)}
                    className="tf-bg-primary-600 tf-text-white tf-px-4 tf-py-2 tf-rounded-lg tf-text-sm tf-font-medium hover:tf-bg-primary-700"
                >
                    Add Client
                </button>
            </div>

            {showNew && (
                <form onSubmit={handleCreate} className="tf-bg-white tf-rounded-lg tf-border tf-border-gray-200 tf-p-4 tf-mb-4">
                    <div className="tf-flex tf-gap-3">
                        <input
                            type="text"
                            placeholder="Name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="tf-input tf-flex-1"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="tf-input tf-flex-1"
                            required
                        />
                        <button
                            type="submit"
                            disabled={creating}
                            className="tf-bg-primary-600 tf-text-white tf-px-4 tf-py-2 tf-rounded-lg tf-text-sm tf-font-medium hover:tf-bg-primary-700 disabled:tf-opacity-50"
                        >
                            {creating ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                    {error && <p className="tf-text-red-600 tf-text-sm tf-mt-2">{error}</p>}
                </form>
            )}

            <div className="tf-mb-4 tf-flex tf-flex-wrap tf-gap-x-5 tf-gap-y-1 tf-text-xs tf-text-gray-400">
                <span><strong className="tf-text-gray-500">Add Client</strong> — creates a WP account with <code className="tf-bg-gray-100 tf-px-1 tf-rounded tf-text-gray-600">subscriber</code> or <code className="tf-bg-gray-100 tf-px-1 tf-rounded tf-text-gray-600">ticketflow_client</code> role</span>
                <span><strong className="tf-text-gray-500">Login</strong> — clients receive a magic link via email, no password needed</span>
                <span><strong className="tf-text-gray-500">Staff roles</strong> — <code className="tf-bg-gray-100 tf-px-1 tf-rounded tf-text-gray-600">ticketflow_agent</code> or <code className="tf-bg-gray-100 tf-px-1 tf-rounded tf-text-gray-600">ticketflow_admin</code> in WP Users</span>
                <span><strong className="tf-text-gray-500">Permissions</strong> — clients only see their own tickets, agents and admins see all</span>
            </div>

            <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="tf-input tf-w-64 tf-mb-4"
            />

            <div className="tf-bg-white tf-rounded-lg tf-shadow-sm tf-border tf-border-gray-200">
                {loading ? (
                    <div className="tf-flex tf-justify-center tf-py-12"><div className="tf-animate-spin tf-rounded-full tf-h-8 tf-w-8 tf-border-b-2 tf-border-primary-600"></div></div>
                ) : clients.length === 0 ? (
                    <p className="tf-py-12 tf-text-center tf-text-gray-500">No clients found.</p>
                ) : (
                    <div className="tf-divide-y tf-divide-gray-100">
                        {clients.map((client) => (
                            <div key={client.id} className="tf-flex tf-items-center tf-gap-3 tf-px-4 tf-py-3">
                                <Avatar name={client.name} />
                                <div className="tf-min-w-0">
                                    <p className="tf-text-sm tf-font-medium tf-text-gray-900">{client.name}</p>
                                    <p className="tf-text-xs tf-text-gray-500">{client.email}</p>
                                </div>
                                <span className="tf-text-xs tf-text-gray-400 tf-ml-auto">
                                    Joined {new Date(client.registered || '').toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
