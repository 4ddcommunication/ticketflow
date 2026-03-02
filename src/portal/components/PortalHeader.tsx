import { Link } from 'react-router-dom';
import type { User } from '@shared/api/types';
import { t } from '@shared/i18n';

interface Props {
    user: User;
    companyName: string;
    accentColor: string;
    onLogout: () => void;
}

export function PortalHeader({ user, companyName, accentColor, onLogout }: Props) {
    return (
        <header className="tf-flex tf-items-center tf-justify-between tf-mb-8 tf-pb-4 tf-border-b tf-border-gray-200">
            <Link to="/" className="tf-text-xl tf-font-bold" style={{ color: accentColor }}>
                {companyName}
            </Link>
            <div className="tf-flex tf-items-center tf-gap-4">
                <span className="tf-text-sm tf-text-gray-600">{user.name}</span>
                <button
                    onClick={onLogout}
                    className="tf-text-sm tf-text-gray-500 hover:tf-text-gray-700"
                >
                    {t('Log out')}
                </button>
            </div>
        </header>
    );
}
