declare global {
    interface Window {
        ticketflowAdmin?: {
            apiUrl: string;
            nonce: string;
            adminUrl: string;
            userId: number;
        };
    }
}

interface ApiConfig {
    apiUrl: string;
    nonce: string;
}

function getConfig(): ApiConfig {
    // Admin app
    if (window.ticketflowAdmin) {
        return {
            apiUrl: window.ticketflowAdmin.apiUrl,
            nonce: window.ticketflowAdmin.nonce,
        };
    }

    // Portal app — reads from data attribute
    const el = document.getElementById('ticketflow-portal');
    if (el?.dataset.config) {
        const cfg = JSON.parse(el.dataset.config);
        return { apiUrl: cfg.apiUrl, nonce: cfg.nonce };
    }

    return { apiUrl: '/wp-json/ticketflow/v1', nonce: '' };
}

let config: ApiConfig | null = null;

function cfg(): ApiConfig {
    if (!config) config = getConfig();
    return config;
}

export function updateNonce(nonce: string): void {
    if (!config) config = getConfig();
    config.nonce = nonce;
}

async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const { apiUrl, nonce } = cfg();
    const url = `${apiUrl}${path}`;

    const headers: Record<string, string> = {
        'X-WP-Nonce': nonce,
        ...(options.headers as Record<string, string> || {}),
    };

    if (options.body && typeof options.body === 'string') {
        headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(url, { ...options, headers, credentials: 'same-origin' });

    if (res.status === 204) {
        return null as T;
    }

    const data = await res.json();

    if (!res.ok) {
        const msg = data?.message || `Request failed (${res.status})`;
        throw new Error(msg);
    }

    return data as T;
}

export async function paginatedRequest<T>(
    path: string,
    options: RequestInit = {}
): Promise<{ items: T[]; total: number; pages: number }> {
    const { apiUrl, nonce } = cfg();
    const url = `${apiUrl}${path}`;

    const headers: Record<string, string> = {
        'X-WP-Nonce': nonce,
        ...(options.headers as Record<string, string> || {}),
    };

    const res = await fetch(url, { ...options, headers, credentials: 'same-origin' });
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data?.message || 'Request failed');
    }

    return {
        items: data as T[],
        total: parseInt(res.headers.get('X-WP-Total') || '0', 10),
        pages: parseInt(res.headers.get('X-WP-TotalPages') || '0', 10),
    };
}

export const api = {
    get: <T>(path: string) => request<T>(path, { method: 'GET' }),
    post: <T>(path: string, body?: unknown) =>
        request<T>(path, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        }),
    patch: <T>(path: string, body?: unknown) =>
        request<T>(path, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
        }),
    delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
    upload: <T>(path: string, formData: FormData) =>
        request<T>(path, { method: 'POST', body: formData }),
};
