import { useState, useEffect } from 'react';
import { settingsApi } from '@shared/api/endpoints';
import type { Settings } from '@shared/api/types';
import { t } from '@shared/i18n';

export function SettingsPage() {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        settingsApi.get().then(setSettings).finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        setSaved(false);
        try {
            const updated = await settingsApi.update(settings);
            setSettings(updated);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } finally {
            setSaving(false);
        }
    };

    const update = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        if (!settings) return;
        setSettings({ ...settings, [key]: value });
    };

    if (loading || !settings) {
        return <div className="tf-flex tf-justify-center tf-py-12"><div className="tf-animate-spin tf-rounded-full tf-h-8 tf-w-8 tf-border-b-2 tf-border-primary-600"></div></div>;
    }

    return (
        <div className="tf-max-w-4xl">
            <h2 className="tf-text-sm tf-font-semibold tf-uppercase tf-tracking-wide tf-text-gray-500 tf-mb-6">{t('Settings')}</h2>

            <div className="tf-bg-white tf-rounded-lg tf-shadow-sm tf-border tf-border-gray-200 tf-divide-y tf-divide-gray-200">
                <Section title={t('General')}>
                    <Field label={t('Company Name')}>
                        <input
                            type="text"
                            value={settings.company_name}
                            onChange={(e) => update('company_name', e.target.value)}
                            className="tf-input"
                        />
                    </Field>
                    <Field label={t('Portal Accent Color')} hint={t('Accent color hint')}>
                        <div className="tf-flex tf-items-center tf-gap-2">
                            <input
                                type="color"
                                value={settings.portal_accent_color}
                                onChange={(e) => update('portal_accent_color', e.target.value)}
                                className="tf-w-10 tf-h-10 tf-rounded tf-cursor-pointer"
                            />
                            <input
                                type="text"
                                value={settings.portal_accent_color}
                                onChange={(e) => update('portal_accent_color', e.target.value)}
                                className="tf-input tf-w-32"
                            />
                        </div>
                    </Field>
                </Section>

                <Section title={t('Ticket Categories')}>
                    <p className="tf-text-sm tf-text-gray-500 tf-mb-3">
                        {t('Categories description')}
                    </p>
                    <Field label={t('Categories')}>
                        <input
                            type="text"
                            value={settings.categories.join(', ')}
                            onChange={(e) => update('categories', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            className="tf-input tf-w-full"
                        />
                    </Field>
                    <p className="tf-text-xs tf-text-gray-400">
                        {t('Categories example')}
                    </p>
                </Section>

                <Section title={t('Service Level Agreement (SLA)')}>
                    <p className="tf-text-sm tf-text-gray-500 tf-mb-3">
                        {t('SLA description')}
                    </p>
                    <div className="tf-grid tf-grid-cols-3 tf-gap-4">
                        <Field label={t('Response Time (hours)')}>
                            <input
                                type="number"
                                value={settings.sla_response_hours}
                                onChange={(e) => update('sla_response_hours', parseInt(e.target.value))}
                                className="tf-input"
                            />
                        </Field>
                        <Field label={t('Resolve Time (hours)')}>
                            <input
                                type="number"
                                value={settings.sla_resolve_hours}
                                onChange={(e) => update('sla_resolve_hours', parseInt(e.target.value))}
                                className="tf-input"
                            />
                        </Field>
                        <Field label={t('Auto-close after (days)')}>
                            <input
                                type="number"
                                value={settings.auto_close_days}
                                onChange={(e) => update('auto_close_days', parseInt(e.target.value))}
                                className="tf-input"
                            />
                        </Field>
                    </div>
                </Section>

                <Section title={t('Email')}>
                    <Field label={t('From Name')}>
                        <input
                            type="text"
                            value={settings.email_from_name}
                            onChange={(e) => update('email_from_name', e.target.value)}
                            className="tf-input"
                        />
                    </Field>
                    <Field label={t('From Email')}>
                        <input
                            type="email"
                            value={settings.email_from_address}
                            onChange={(e) => update('email_from_address', e.target.value)}
                            className="tf-input"
                        />
                    </Field>
                    <label className="tf-flex tf-items-center tf-gap-2 tf-cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.email_notifications}
                            onChange={(e) => update('email_notifications', e.target.checked)}
                            className="tf-rounded tf-border-gray-300"
                        />
                        <span className="tf-text-sm tf-text-gray-700">{t('Enable email notifications')}</span>
                    </label>
                </Section>

                <Section title={t('Files')}>
                    <Field label={t('Max File Size (MB)')}>
                        <input
                            type="number"
                            value={settings.max_file_size_mb}
                            onChange={(e) => update('max_file_size_mb', parseInt(e.target.value))}
                            className="tf-input tf-w-32"
                        />
                    </Field>
                    <Field label={t('Allowed File Types (comma-separated)')}>
                        <input
                            type="text"
                            value={settings.allowed_file_types.join(', ')}
                            onChange={(e) => update('allowed_file_types', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                            className="tf-input"
                        />
                    </Field>
                </Section>
            </div>

            <div className="tf-mt-4 tf-flex tf-items-center tf-gap-3">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="tf-bg-primary-600 tf-text-white tf-px-6 tf-py-2 tf-rounded-lg tf-text-sm tf-font-medium hover:tf-bg-primary-700 disabled:tf-opacity-50"
                >
                    {saving ? t('Saving...') : t('Save Settings')}
                </button>
                {saved && <span className="tf-text-sm tf-text-green-600">{t('Settings saved!')}</span>}
            </div>
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="tf-p-4">
            <h3 className="tf-text-sm tf-font-semibold tf-text-gray-900 tf-mb-4">{title}</h3>
            <div className="tf-space-y-4">{children}</div>
        </div>
    );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="tf-block tf-text-sm tf-text-gray-600 tf-mb-1">{label}</label>
            {hint && <p className="tf-text-xs tf-text-gray-400 tf-mb-1">{hint}</p>}
            {children}
        </div>
    );
}
