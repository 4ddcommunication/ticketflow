import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@shared/hooks/useAuth';
import { Avatar } from '@shared/components/Avatar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { TicketList } from './pages/TicketList';
import { TicketDetail } from './pages/TicketDetail';
import { SettingsPage } from './pages/Settings';
import { ClientsPage } from './pages/Clients';

export function App() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="tf-flex tf-items-center tf-justify-center tf-h-64">
                <div className="tf-animate-spin tf-rounded-full tf-h-8 tf-w-8 tf-border-b-2 tf-border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return <div className="tf-p-8 tf-text-center tf-text-gray-500">Not authenticated.</div>;
    }

    return (
        <HashRouter>
            <div className="tf-flex tf-min-h-screen tf-bg-gray-50">
                <Sidebar user={user} />
                <div className="tf-flex-1 tf-flex tf-flex-col tf-overflow-auto">
                    <header className="tf-bg-white tf-border-b tf-border-gray-200 tf-px-6 tf-py-3 tf-flex tf-items-center tf-justify-end">
                        <div className="tf-flex tf-items-center tf-gap-2">
                            <div className="tf-text-right">
                                <p className="tf-text-sm tf-font-medium tf-text-gray-900">{user.name}</p>
                                <p className="tf-text-xs tf-text-gray-500 tf-capitalize">{user.role}</p>
                            </div>
                            <Avatar name={user.name} size="sm" />
                        </div>
                    </header>
                    <main className="tf-flex-1 tf-p-6">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/tickets" element={<TicketList />} />
                            <Route path="/tickets/:id" element={<TicketDetail />} />
                            <Route path="/clients" element={<ClientsPage />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </HashRouter>
    );
}
