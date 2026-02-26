import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@shared/hooks/useAuth';
import { PortalHeader } from './components/PortalHeader';
import { Login } from './pages/Login';
import { TicketList } from './pages/TicketList';
import { NewTicket } from './pages/NewTicket';
import { TicketDetail } from './pages/TicketDetail';

export function App() {
    const { user, loading, logout, refetch } = useAuth();

    // Read config from data attribute
    const el = document.getElementById('ticketflow-portal');
    const configStr = el?.dataset.config;
    const config = configStr ? JSON.parse(configStr) : {};
    const accentColor = config.accentColor || '#4f46e5';
    const companyName = config.companyName || 'Support';

    if (loading) {
        return (
            <div className="tf-flex tf-items-center tf-justify-center tf-h-64">
                <div className="tf-animate-spin tf-rounded-full tf-h-8 tf-w-8 tf-border-b-2" style={{ borderColor: accentColor }}></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="tf-max-w-md tf-mx-auto tf-py-12">
                <Login accentColor={accentColor} companyName={companyName} onLogin={refetch} />
            </div>
        );
    }

    return (
        <HashRouter>
            <div className="tf-max-w-4xl tf-mx-auto tf-py-6 tf-px-4">
                <PortalHeader user={user} companyName={companyName} accentColor={accentColor} onLogout={logout} />
                <Routes>
                    <Route path="/" element={<TicketList />} />
                    <Route path="/new" element={<NewTicket accentColor={accentColor} />} />
                    <Route path="/tickets/:id" element={<TicketDetail accentColor={accentColor} />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                <footer className="tf-mt-12 tf-py-4 tf-border-t tf-border-gray-200 tf-text-center tf-text-xs tf-text-gray-400">
                    <a href="https://kleinbooks.de/datenschutz" target="_blank" rel="noopener noreferrer" className="tf-text-gray-400 hover:tf-text-gray-600 tf-transition-colors">Datenschutz</a>
                </footer>
            </div>
        </HashRouter>
    );
}
