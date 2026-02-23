import { useState, useEffect, useCallback } from 'react';
import { ticketsApi } from '../api/endpoints';
import type { Ticket } from '../api/types';

interface UseTicketsOptions {
    page?: number;
    per_page?: number;
    status?: string;
    priority?: string;
    category?: string;
    search?: string;
    client_id?: number;
    agent_id?: number;
    orderby?: string;
    order?: string;
}

export function useTickets(options: UseTicketsOptions = {}) {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params: Record<string, string | number> = {};
            Object.entries(options).forEach(([k, v]) => {
                if (v !== undefined && v !== '' && v !== null) {
                    params[k] = v;
                }
            });
            const result = await ticketsApi.list(params);
            setTickets(result.items);
            setTotal(result.total);
            setPages(result.pages);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load tickets');
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(options)]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { tickets, total, pages, loading, error, refetch: fetch };
}

export function useTicket(id: number | null) {
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await ticketsApi.get(id);
            setTicket(data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to load ticket');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { ticket, loading, error, refetch: fetch, setTicket };
}
