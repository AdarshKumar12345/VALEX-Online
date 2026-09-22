"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

interface LoginResponse {
    message?: string;
    user?: {
        id: string;
        email: string;
        name: string;
    };
}

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!apiUrl) {
                throw new Error(
                    "NEXT_PUBLIC_API_URL is not configured."
                );
            }

            const response = await fetch(
                `${apiUrl}/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                        password,
                    }),
                }
            );

            const data: LoginResponse = await response
                .json()
                .catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Invalid email or password."
                );
            }

            /*
             * IMPORTANT
             *
             * The backend should set the authentication token
             * using a secure HTTP-only cookie.
             *
             * Do NOT store access tokens in localStorage.
             */

            window.location.href = "/";
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-black text-lg font-bold text-white">
                    M
                </div>

                <h1 className="mt-6 text-2xl font-bold tracking-tight">
                    Welcome back
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                    Sign in to continue to MarketX.
                </p>
            </div>

            {/* Form Card */}
            <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">
                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700"
                    >
                        <div className="flex gap-2">
                            <ErrorIcon />

                            <p>{error}</p>
                        </div>
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium"
                        >
                            Email address
                        </label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            inputMode="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(event) =>
                                setEmail(event.target.value)
                            }
                            disabled={loading}
                            required
                            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-neutral-50"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <label
                                htmlFor="password"
                                className="text-sm font-medium"
                            >
                                Password
                            </label>

                            <Link
                                href="/forgot-password"
                                className="text-xs font-medium text-neutral-500 underline underline-offset-4 transition hover:text-black"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            disabled={loading}
                            required
                            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-neutral-50"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex h-11 w-full items-center justify-center rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Spinner />
                                Signing in...
                            </>
                        ) : (
                            "Sign in"
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center gap-4">
                    <div className="h-px flex-1 bg-neutral-200" />

                    <span className="text-xs text-neutral-400">
                        OR
                    </span>

                    <div className="h-px flex-1 bg-neutral-200" />
                </div>

                {/* Google */}
                <button
                    type="button"
                    disabled={loading}
                    className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-neutral-300 bg-white px-4 text-sm font-medium transition hover:border-black hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <GoogleIcon />

                    Continue with Google
                </button>
            </div>

            {/* Register */}
            <p className="mt-6 text-center text-sm text-neutral-500">
                Don&apos;t have an account?{" "}
                <Link
                    href="/register"
                    className="font-semibold text-black underline underline-offset-4"
                >
                    Create one
                </Link>
            </p>

            {/* Security */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-400">
                <LockIcon />

                <span>
                    Your connection is secured.
                </span>
            </div>
        </div>
    );
}

/* --------------------------------
   Spinner
--------------------------------- */

function Spinner() {
    return (
        <span
            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden="true"
        />
    );
}

/* --------------------------------
   Icons
--------------------------------- */

function ErrorIcon() {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="mt-0.5 shrink-0"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    );
}

function LockIcon() {
    return (
        <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <rect x="5" y="10" width="14" height="10" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
        </svg>
    );
}

function GoogleIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                fill="currentColor"
                d="M21.35 12.27c0-.71-.06-1.4-.18-2.05H12v3.88h5.22a4.46 4.46 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.93-4.18 2.93-7.19Z"
            />

            <path
                fill="currentColor"
                d="M12 21.5c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.5A9.75 9.75 0 0 0 12 21.5Z"
            />

            <path
                fill="currentColor"
                d="M6.54 13.61a5.86 5.86 0 0 1 0-3.72V7.39H3.3a9.5 9.5 0 0 0 0 8.72l3.24-2.5Z"
            />

            <path
                fill="currentColor"
                d="M12 5.86c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.83 2.96 14.63 2 12 2a9.75 9.75 0 0 0-8.7 5.39l3.24 2.5C7.31 7.58 9.46 5.86 12 5.86Z"
            />
        </svg>
    );
}