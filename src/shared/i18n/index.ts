import de from './de';

type Translations = Record<string, string>;

const locales: Record<string, Translations> = { de };

let currentLocale: string | null = null;

function getLocale(): string {
    if (currentLocale !== null) return currentLocale;

    // Admin SPA
    const adminConfig = (window as any).ticketflowAdmin;
    if (adminConfig?.locale) {
        currentLocale = adminConfig.locale;
        return currentLocale;
    }

    // Portal SPA (reads from data-config on mount element)
    const portalEl = document.getElementById('ticketflow-portal');
    if (portalEl) {
        try {
            const config = JSON.parse(portalEl.getAttribute('data-config') || '{}');
            if (config.locale) {
                currentLocale = config.locale;
                return currentLocale;
            }
        } catch { /* ignore */ }
    }

    currentLocale = 'en';
    return currentLocale;
}

function getTranslations(): Translations | null {
    const locale = getLocale();
    // Match "de", "de_DE", "de_DE_formal", etc.
    const lang = locale.split('_')[0];
    return locales[lang] || null;
}

export function t(key: string, replacements?: Record<string, string | number>): string {
    const translations = getTranslations();
    let text = translations?.[key] ?? key;

    if (replacements) {
        for (const [placeholder, value] of Object.entries(replacements)) {
            text = text.replace(new RegExp(`\\{${placeholder}\\}`, 'g'), String(value));
        }
    }

    return text;
}
