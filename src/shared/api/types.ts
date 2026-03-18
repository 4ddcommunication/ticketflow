export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'agent' | 'client';
    company?: string;
    caps?: string[];
    registered?: string;
}

export interface Ticket {
    id: number;
    ticket_uid: string;
    subject: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: string | null;
    client: Pick<User, 'id' | 'name' | 'email' | 'company'> | null;
    agent: Pick<User, 'id' | 'name'> | null;
    sla_deadline: string | null;
    reply_count: number;
    created_at: string;
    updated_at: string;
    closed_at: string | null;
}

export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Reply {
    id: number;
    ticket_id: number;
    author: {
        id: number;
        name: string;
        role: string;
    } | null;
    body: string;
    is_internal: boolean;
    reply_type: 'reply' | 'note' | 'system';
    attachments: AttachmentInfo[];
    created_at: string;
    updated_at: string;
}

export interface AttachmentInfo {
    id: number;
    file_name: string;
    file_size: number;
    mime_type: string;
    download_url: string;
}

export interface Attachment extends AttachmentInfo {
    ticket_id: number;
    reply_id: number | null;
    created_at: string;
}

export interface ActivityEntry {
    id: number;
    ticket_id: number;
    user: Pick<User, 'id' | 'name'> | null;
    action: string;
    old_value: string | null;
    new_value: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
}

export interface SavedReply {
    id: number;
    title: string;
    body: string;
    category: string | null;
    is_shared: boolean;
    use_count: number;
    created_at: string;
    updated_at: string;
}

export interface DashboardStats {
    total: number;
    open: number;
    by_status: Record<string, number>;
    my_open?: number;
    unassigned?: number;
    my_total?: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    pages: number;
}

export interface Settings {
    company_name: string;
    company_logo: string;
    categories: string[];
    statuses: string[];
    priorities: string[];
    sla_response_hours: number;
    sla_resolve_hours: number;
    auto_close_days: number;
    allowed_file_types: string[];
    max_file_size_mb: number;
    portal_accent_color: string;
    email_from_name: string;
    email_from_address: string;
    email_notifications: boolean;
}
