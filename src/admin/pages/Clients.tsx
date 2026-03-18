import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '@shared/api/endpoints';
import type { User } from '@shared/api/types';
import { Avatar } from '@shared/components/Avatar';
import { t } from '@shared/i18n';

export function ClientsPage() {
    const [clients, setClients] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [newCompany, setNewCompany] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

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
            await usersApi.createClient({ email: newEmail, name: newName, company: newCompany || undefined });
            setNewEmail('');
            setNewName('');
            setNewCompany('');
            setShowNew(false);
            fetchClients();
        } catch (err) {
            setError(err instanceof Error ? err.message : t('Failed to create client'));
        } finally {
            setCreating(false);
        }
    };

    return (
        <div>
            <div className="tf-flex tf-justify-between tf-items-center tf-mb-6">
                <h2 className="tf-text-sm tf-font-semibold tf-uppercase tf-tracking-wide tf-text-gray-500">{t('Clients')}</h2>
                <button
                    onClick={() => setShowNew(!showNew)}
                    className="tf-bg-primary-600 tf-text-white tf-px-4 tf-py-2 tf-rounded-lg tf-text-sm tf-font-medium hover:tf-bg-primary-700"
                >
                    {t('Add Client')}
                </button>
            </div>

            {showNew && (
                <form onSubmit={handleCreate} className="tf-bg-white tf-rounded-lg tf-border tf-border-gray-200 tf-p-4 tf-mb-4">
                    <div className="tf-flex tf-gap-3">
                        <input
                            type="text"
                            placeholder={t('Name')}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="tf-input tf-flex-1"
                        />
                        <input
                            type="email"
                            placeholder={t('Email')}
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="tf-input tf-flex-1"
                            required
                        />
                        <input
                            type="text"
                            placeholder={t('Company') + ' (' + t('optional') + ')'}
                            value={newCompany}
                            onChange={(e) => setNewCompany(e.target.value)}
                            className="tf-input tf-flex-1"
                        />
                        <button
                            type="submit"
                            disabled={creating}
                            className="tf-bg-primary-600 tf-text-white tf-px-4 tf-py-2 tf-rounded-lg tf-text-sm tf-font-medium hover:tf-bg-primary-700 disabled:tf-opacity-50"
                        >
                            {creating ? t('Creating...') : t('Create')}
                        </button>
                    </div>
                    {error && <p className="tf-text-red-600 tf-text-sm tf-mt-2">{error}</p>}
                </form>
            )}

            <div className="tf-mb-4 tf-flex tf-flex-wrap tf-gap-x-5 tf-gap-y-1 tf-text-xs tf-text-gray-400">
                <span><strong className="tf-text-gray-500">{t('Add Client')}</strong> — {t('Add Client hint').split(' — ')[1]}</span>
                <span><strong className="tf-text-gray-500">Login</strong> — {t('Login hint').split(' — ')[1]}</span>
                <span><strong className="tf-text-gray-500">{t('Staff roles hint').split(' — ')[0]}</strong> — {t('Staff roles hint').split(' — ')[1]}</span>
                <span><strong className="tf-text-gray-500">{t('Permissions hint').split(' — ')[0]}</strong> — {t('Permissions hint').split(' — ')[1]}</span>
            </div>

            <input
                type="text"
                placeholder={t('Search clients...')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="tf-input tf-w-64 tf-mb-4"
            />

            <div className="tf-bg-white tf-rounded-lg tf-shadow-sm tf-border tf-border-gray-200">
                {loading ? (
                    <div className="tf-flex tf-justify-center tf-py-12"><div className="tf-animate-spin tf-rounded-full tf-h-8 tf-w-8 tf-border-b-2 tf-border-primary-600"></div></div>
                ) : clients.length === 0 ? (
                    <p className="tf-py-12 tf-text-center tf-text-gray-500">{t('No clients found.')}</p>
                ) : (
                    <div className="tf-divide-y tf-divide-gray-100">
                        {(() => {
                            // Group clients: company users collapse into one row, others stay individual
                            const companyMap = new Map<string, User[]>();
                            const individuals: User[] = [];
                            clients.forEach((c) => {
                                if (c.company) {
                                    const existing = companyMap.get(c.company) || [];
                                    existing.push(c);
                                    companyMap.set(c.company, existing);
                                } else {
                                    individuals.push(c);
                                }
                            });

                            const rows: React.ReactNode[] = [];

                            // Company rows
                            companyMap.forEach((members, company) => {
                                const first = members[0];
                                rows.push(
                                    <div
                                        key={`company-${company}`}
                                        onClick={() => navigate(`/clients/${first.id}`)}
                                        className="tf-flex tf-items-center tf-gap-3 tf-px-4 tf-py-3 hover:tf-bg-gray-50 tf-cursor-pointer"
                                    >
                                        <div className="tf-w-8 tf-h-8 tf-rounded-full tf-bg-primary-100 tf-text-primary-700 tf-flex tf-items-center tf-justify-center tf-text-xs tf-font-bold tf-shrink-0">
                                            {company.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="tf-min-w-0">
                                            <p className="tf-text-sm tf-font-medium tf-text-gray-900">{company}</p>
                                            <p className="tf-text-xs tf-text-gray-500">
                                                {members.length} {members.length === 1 ? t('Contact') : t('Contacts')}
                                            </p>
                                        </div>
                                        <div className="tf-flex tf-items-center tf-gap-1 tf-ml-auto">
                                            {members.map((m) => (
                                                <Avatar key={m.id} name={m.name} size="sm" />
                                            ))}
                                        </div>
                                    </div>
                                );
                            });

                            // Individual rows
                            individuals.forEach((client) => {
                                rows.push(
                                    <div
                                        key={client.id}
                                        onClick={() => navigate(`/clients/${client.id}`)}
                                        className="tf-flex tf-items-center tf-gap-3 tf-px-4 tf-py-3 hover:tf-bg-gray-50 tf-cursor-pointer"
                                    >
                                        <Avatar name={client.name} />
                                        <div className="tf-min-w-0">
                                            <p className="tf-text-sm tf-font-medium tf-text-gray-900">{client.name}</p>
                                            <p className="tf-text-xs tf-text-gray-500">{client.email}</p>
                                        </div>
                                        <span className="tf-text-xs tf-text-gray-400 tf-ml-auto">
                                            {t('Joined')} {new Date(client.registered || '').toLocaleDateString()}
                                        </span>
                                    </div>
                                );
                            });

                            return rows;
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}
