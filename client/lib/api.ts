const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error(
        "NEXT_PUBLIC_API_URL is not configured."
    );
}

interface ApiOptions extends RequestInit {
    auth?: boolean;
    _retry?: boolean;
}

let refreshPromise: Promise<boolean> | null = null;

async function executeTokenRefresh(): Promise<boolean> {
    try {
        const response = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.ok;
    } catch {
        return false;
    } finally {
        refreshPromise = null;
    }
}

export async function apiFetch<T>(
    endpoint: string,
    options: ApiOptions = {}
): Promise<T> {
    const {
        auth = true,
        _retry = false,
        headers,
        ...fetchOptions
    } = options;

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...fetchOptions,
            credentials: auth
                ? "include"
                : "same-origin",
            headers: {
                ...headers,
            },
        }
    );

    // Auto-refresh token on 401 Unauthorized for authenticated endpoints
    if (
        response.status === 401 &&
        auth &&
        !_retry &&
        !endpoint.startsWith("/auth/login") &&
        !endpoint.startsWith("/auth/register") &&
        !endpoint.startsWith("/auth/refresh") &&
        !endpoint.startsWith("/auth/logout")
    ) {
        if (!refreshPromise) {
            refreshPromise = executeTokenRefresh();
        }

        const refreshed = await refreshPromise;

        if (refreshed) {
            return apiFetch<T>(endpoint, {
                ...options,
                _retry: true,
            });
        }
    }

    const contentType =
        response.headers.get("content-type");

    const data =
        contentType?.includes("application/json")
            ? await response.json()
            : null;

    if (!response.ok) {
        const message =
            data?.message ||
            data?.error ||
            "Something went wrong.";

        throw new ApiError(
            message,
            response.status,
            data
        );
    }

    return data as T;
}

export class ApiError extends Error {
    status: number;
    data: unknown;

    constructor(
        message: string,
        status: number,
        data?: unknown
    ) {
        super(message);

        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}