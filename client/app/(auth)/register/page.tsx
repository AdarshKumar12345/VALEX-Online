"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

interface RegisterResponse {
    message?: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");

        if (name.trim().length < 2) {
            setError("Please enter your full name.");
            return;
        }

        if (!email.trim()) {
            setError("Please enter your email address.");
            return;
        }

        if (password.length < 8) {
            setError(
                "Password must contain at least 8 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
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
                `${apiUrl}/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        name: name.trim(),
                        email: email.trim().toLowerCase(),
                        password,
                    }),
                }
            );

            const data: RegisterResponse = await response
                .json()
                .catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to create your account."
                );
            }

            /*
             * If your backend requires email verification,
             * redirect to:
             *
             * /verify?email=...
             *
             * Otherwise go directly to the marketplace.
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
                    Create your account
                </h1>

                <p className="mt-2 text-sm text-neutral-500">
                    Join MarketX and start buying and selling.
                </p>
            </div>

            {/* Card */}
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
                    {/* Name */}
                    <div>
                        <label
                            htmlFor="name"
                            className="mb-2 block text-sm font-medium"
                        >
                            Full name
                        </label>

                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            placeholder="Adarsh Kumar"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            disabled={loading}
                            required
                            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-neutral-50"
                        />
                    </div>

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
                        <label
                            htmlFor="password"
                            className="mb-2 block text-sm font-medium"
                        >
                            Password
                        </label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="At least 8 characters"
                            value={password}
                            onChange={(event) =>
                                setPassword(event.target.value)
                            }
                            disabled={loading}
                            required
                            minLength={8}
                            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-neutral-50"
                        />

                        {/* Password strength */}
                        {password.length > 0 && (
                            <PasswordStrength password={password} />
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label
                            htmlFor="confirmPassword"
                            className="mb-2 block text-sm font-medium"
                        >
                            Confirm password
                        </label>

                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Re-enter your password"
                            value={confirmPassword}
                            onChange={(event) =>
                                setConfirmPassword(event.target.value)
                            }
                            disabled={loading}
                            required
                            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black disabled:cursor-not-allowed disabled:bg-neutral-50"
                        />

                        {confirmPassword.length > 0 &&
                            password === confirmPassword && (
                                <p className="mt-2 text-xs text-neutral-500">
                                    Passwords match.
                                </p>
                            )}
                    </div>

                    {/* Terms */}
                    <label className="flex items-start gap-3 text-xs leading-5 text-neutral-500">
                        <input
                            type="checkbox"
                            required
                            className="mt-0.5 h-4 w-4 rounded border-neutral-300 accent-black"
                        />

                        <span>
                            I agree to the{" "}
                            <Link
                                href="/terms"
                                className="font-medium text-black underline underline-offset-4"
                            >
                                Terms of Service
                            </Link>{" "}
                            and{" "}
                            <Link
                                href="/privacy"
                                className="font-medium text-black underline underline-offset-4"
                            >
                                Privacy Policy
                            </Link>
                            .
                        </span>
                    </label>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex h-11 w-full items-center justify-center rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <Spinner />
                                Creating account...
                            </>
                        ) : (
                            "Create account"
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

            {/* Login */}
            <p className="mt-6 text-center text-sm text-neutral-500">
                Already have an account?{" "}
                <Link
                    href="/login"
                    className="font-semibold text-black underline underline-offset-4"
                >
                    Sign in
                </Link>
            </p>

            {/* Security */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-400">
                <LockIcon />

                <span>Your information is protected.</span>
            </div>
        </div>
    );
}

/* --------------------------------
   Password Strength
--------------------------------- */

function PasswordStrength({
    password,
}: {
    password: string;
}) {
    const checks = [
        password.length >= 8,
        /[A-Z]/.test(password),
        /[a-z]/.test(password),
        /\d/.test(password),
        /[^A-Za-z0-9]/.test(password),
    ];

    const score = checks.filter(Boolean).length;

    const label =
        score <= 2
            ? "Weak password"
            : score <= 4
                ? "Good password"
                : "Strong password";

    return (
        <div className="mt-3">
            <div className="flex gap-1">
                {checks.map((valid, index) => (
                    <div
                        key={index}
                        className={`h-1 flex-1 rounded-full ${valid
                                ? "bg-black"
                                : "bg-neutral-200"
                            }`}
                    />
                ))}
            </div>

            <p className="mt-2 text-xs text-neutral-400">
                {label}
            </p>
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