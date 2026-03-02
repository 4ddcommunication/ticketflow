import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@shared/hooks/useAuth';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { TicketList } from './pages/TicketList';
import { TicketDetail } from './pages/TicketDetail';
import { SettingsPage } from './pages/Settings';
import { ClientsPage } from './pages/Clients';
import { SavedRepliesPage } from './pages/SavedReplies';

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
                <main className="tf-flex-1 tf-p-6 tf-overflow-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/tickets" element={<TicketList />} />
                        <Route path="/tickets/:id" element={<TicketDetail />} />
                        <Route path="/clients" element={<ClientsPage />} />
                        <Route path="/saved-replies" element={<SavedRepliesPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </HashRouter>
    );
}
