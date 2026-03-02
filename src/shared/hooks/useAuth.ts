import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/endpoints';
import type { User } from '../api/types';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const data = await authApi.me();
            setUser(data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const logout = useCallback(async () => {
        await authApi.logout();
        setUser(null);
    }, []);

    return { user, loading, logout, refetch: fetchUser };
}
