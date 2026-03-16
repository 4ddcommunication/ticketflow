import { Link } from 'react-router-dom';
import type { User } from '@shared/api/types';
import { BrandLogo } from '@shared/components/BrandLogo';
import { t } from '@shared/i18n';

interface Props {
    user: User;
    companyName: string;
    companyLogo: string;
    accentColor: string;
    onLogout: () => void;
}

export function PortalHeader({ user, companyName, companyLogo, accentColor, onLogout }: Props) {
    return (
        <header className="tf-flex tf-items-center tf-justify-between tf-mb-8 tf-pb-4 tf-border-b tf-border-gray-200">
            <Link to="/" className="tf-flex tf-items-center tf-gap-2 tf-no-underline">
                {companyLogo === 'kleinbooks' ? (
                    <BrandLogo />
                ) : companyLogo ? (
                    <img src={companyLogo} alt={companyName} className="tf-h-9 tf-w-auto" />
                ) : (
                    <span className="tf-text-xl tf-font-bold" style={{ color: accentColor }}>{companyName}</span>
                )}
            </Link>
            <div className="tf-flex tf-flex-col tf-items-end">
                <span className="tf-text-sm tf-text-gray-600">{user.name}</span>
                <button
                    onClick={onLogout}
                    className="tf-text-xs tf-text-gray-400 hover:tf-text-gray-600"
                >
                    {t('Log out')}
                </button>
            </div>
        </header>
    );
}
