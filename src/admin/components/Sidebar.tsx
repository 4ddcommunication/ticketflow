import { NavLink } from 'react-router-dom';
import type { User } from '@shared/api/types';
import { t } from '@shared/i18n';

interface Props {
    user: User;
}

const navItems = [
    { to: '/', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { to: '/tickets', label: 'Tickets', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { to: '/clients', label: 'Clients', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' },
    { to: '/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', adminOnly: true },
];

export function Sidebar({ user }: Props) {
    return (
        <aside className="tf-w-56 tf-bg-white tf-border-r tf-border-gray-200 tf-flex tf-flex-col">
            <div className="tf-p-4 tf-border-b tf-border-gray-200">
                <h1 className="tf-text-lg tf-font-bold tf-text-primary-600">Ticketflow</h1>
            </div>

            <nav className="tf-flex-1 tf-py-4">
                {navItems
                    .filter((item) => !item.adminOnly || user.role === 'admin')
                    .map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                `tf-flex tf-items-center tf-gap-3 tf-px-4 tf-py-2.5 tf-text-sm tf-font-medium tf-transition-colors ${
                                    isActive
                                        ? 'tf-bg-primary-50 tf-text-primary-700 tf-border-r-2 tf-border-primary-600'
                                        : 'tf-text-gray-600 hover:tf-bg-gray-50 hover:tf-text-gray-900'
                                }`
                            }
                        >
                            <svg className="tf-w-5 tf-h-5 tf-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                            </svg>
                            {t(item.label)}
                        </NavLink>
                    ))}
            </nav>

            <div className="tf-p-4 tf-border-t tf-border-gray-200 tf-space-y-2">
                <a
                    href={(window as any).ticketflowAdmin?.adminUrl || '/wp-admin/'}
                    className="tf-flex tf-items-center tf-gap-2 tf-text-xs tf-text-gray-400 hover:tf-text-gray-600 tf-transition-colors"
                >
                    <svg className="tf-w-3 tf-h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    WP Admin
                </a>
                <a
                    href={(window as any).ticketflowAdmin?.logoutUrl || '/wp-login.php?action=logout'}
                    className="tf-flex tf-items-center tf-gap-2 tf-text-xs tf-text-gray-400 hover:tf-text-gray-600 tf-transition-colors"
                >
                    <svg className="tf-w-3 tf-h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t('Logout')}
                </a>
            </div>
        </aside>
    );
}
