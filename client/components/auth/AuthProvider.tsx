"use client";

import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    AuthUser,
    getCurrentUser,
    logout as logoutRequest,
} from "@/lib/auth";

interface AuthContextValue {
    user: AuthUser | null;
    loading: boolean;
    authenticated: boolean;
    refreshUser: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext =
    createContext<AuthContextValue | undefined>(
        undefined
    );

export function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] =
        useState<AuthUser | null>(null);

    const [loading, setLoading] =
        useState(true);

    async function refreshUser() {
        try {
            setLoading(true);

            const currentUser =
                await getCurrentUser();

            setUser(currentUser);
        } finally {
            setLoading(false);
        }
    }

    async function handleLogout() {
        await logoutRequest();

        setUser(null);

        window.location.href = "/";
    }

    useEffect(() => {
        refreshUser();
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            authenticated: Boolean(user),
            refreshUser,
            logout: handleLogout,
        }),
        [user, loading]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}