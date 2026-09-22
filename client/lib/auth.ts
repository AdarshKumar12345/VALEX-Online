import { apiFetch } from "./api";

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role?: "user" | "admin";
    createdAt?: string;
}

interface AuthResponse {
    user: AuthUser;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
    try {
        const response =
            await apiFetch<AuthResponse>("/auth/me");

        return response.user ?? null;
    } catch {
        return null;
    }
}

export async function logout(): Promise<void> {
    try {
        await apiFetch("/auth/logout", {
            method: "POST",
        });
    } catch {
        // Logout locally even if the server request fails.
    }
}