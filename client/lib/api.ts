const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
    throw new Error(
        "NEXT_PUBLIC_API_URL is not configured."
    );
}

interface ApiOptions
    extends RequestInit {
    auth?: boolean;
}

export async function apiFetch<T>(
    endpoint: string,
    options: ApiOptions = {}
): Promise<T> {
    const {
        auth = true,
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