import { api, paginatedRequest } from './client';
import type {
    Ticket, Reply, Attachment, ActivityEntry, SavedReply,
    DashboardStats, User, Settings,
} from './types';

// Auth
export const authApi = {
    requestMagicLink: (email: string) =>
        api.publicPost<{ message: string }>('/auth/magic-link', { email }),
    verify: (token: string) =>
        api.get<User>(`/auth/verify?token=${encodeURIComponent(token)}`),
    me: () => api.get<User>('/auth/me'),
    logout: () => api.post<{ message: string }>('/auth/logout'),
};

// Tickets
export const ticketsApi = {
    list: (params: Record<string, string | number> = {}) => {
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== '' && v !== null) qs.set(k, String(v));
        });
        return paginatedRequest<Ticket>(`/tickets?${qs}`);
    },
    get: (id: number) => api.get<Ticket>(`/tickets/${id}`),
    create: (data: {
        subject: string;
        description: string;
        priority?: string;
        category?: string;
        client_id?: number;
        agent_id?: number;
    }) => api.post<Ticket>('/tickets', data),
    update: (id: number, data: Partial<Ticket>) =>
        api.patch<Ticket>(`/tickets/${id}`, data),
    delete: (id: number) => api.delete(`/tickets/${id}`),
    assign: (id: number, agent_id: number) =>
        api.post<Ticket>(`/tickets/${id}/assign`, { agent_id }),
    close: (id: number) => api.post<Ticket>(`/tickets/${id}/close`),
    reopen: (id: number) => api.post<Ticket>(`/tickets/${id}/reopen`),
};

// Replies
export const repliesApi = {
    list: (ticketId: number) =>
        api.get<Reply[]>(`/tickets/${ticketId}/replies`),
    create: (ticketId: number, data: { body: string; is_internal?: boolean }) =>
        api.post<Reply>(`/tickets/${ticketId}/replies`, data),
    update: (id: number, data: { body: string }) =>
        api.patch<Reply>(`/replies/${id}`, data),
    delete: (id: number) => api.delete(`/replies/${id}`),
};

// Attachments
export const attachmentsApi = {
    upload: (ticketId: number, file: File, replyId?: number) => {
        const fd = new FormData();
        fd.append('file', file);
        if (replyId) fd.append('reply_id', String(replyId));
        return api.upload<Attachment>(`/tickets/${ticketId}/attachments`, fd);
    },
    delete: (id: number) => api.delete(`/attachments/${id}`),
};

// Activity
export const activityApi = {
    list: (ticketId: number) =>
        api.get<ActivityEntry[]>(`/tickets/${ticketId}/activity`),
};

// Dashboard
export const dashboardApi = {
    stats: () => api.get<DashboardStats>('/dashboard/stats'),
    myQueue: (params: Record<string, string | number> = {}) => {
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== '' && v !== null) qs.set(k, String(v));
        });
        return paginatedRequest<Ticket>(`/dashboard/my-queue?${qs}`);
    },
};

// Users
export const usersApi = {
    listClients: (params: Record<string, string | number> = {}) => {
        const qs = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => {
            if (v !== undefined && v !== '' && v !== null) qs.set(k, String(v));
        });
        return paginatedRequest<User>(`/clients?${qs}`);
    },
    getClient: (id: number) => api.get<User>(`/clients/${id}`),
    listByCompany: (company: string) => {
        const qs = new URLSearchParams({ company, per_page: '100' });
        return paginatedRequest<User>(`/clients?${qs}`);
    },
    createClient: (data: { email: string; name?: string; company?: string }) =>
        api.post<User>('/clients', data),
    listAgents: () => api.get<User[]>('/agents'),
};

// Saved Replies
export const savedRepliesApi = {
    list: (params: Record<string, string> = {}) => {
        const qs = new URLSearchParams(params);
        return api.get<SavedReply[]>(`/saved-replies?${qs}`);
    },
    create: (data: { title: string; body: string; category?: string; is_shared?: boolean }) =>
        api.post<SavedReply>('/saved-replies', data),
    update: (id: number, data: Partial<SavedReply>) =>
        api.patch<SavedReply>(`/saved-replies/${id}`, data),
    delete: (id: number) => api.delete(`/saved-replies/${id}`),
};

// Settings
export const settingsApi = {
    get: () => api.get<Settings>('/settings'),
    update: (data: Partial<Settings>) => api.patch<Settings>('/settings', data),
};
