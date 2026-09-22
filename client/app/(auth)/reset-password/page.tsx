"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
    FormEvent,
    Suspense,
    useMemo,
    useState,
} from "react";

function ResetPasswordForm() {
    const searchParams = useSearchParams();

    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const passwordChecks = useMemo(
        () => ({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[^A-Za-z0-9]/.test(password),
        }),
        [password]
    );

    const passwordScore =
        Object.values(passwordChecks).filter(Boolean).length;

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");

        if (!token) {
            setError(
                "This password reset link is invalid or incomplete."
            );
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
                `${apiUrl}/auth/reset-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                        password,
                    }),
                }
            );

            const data = await response
                .json()
                .catch(() => ({}));

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    "Unable to reset your password."
                );
            }

            setSuccess(true);
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

    /* --------------------------------
       Success
    --------------------------------- */

    if (success) {
        return (
            <div>
                <div className="text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                        <CheckIcon />
                    </div>

                    <h1 className="mt-6 text-2xl font-bold tracking-tight">
                        Password updated
                    </h1>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                        Your password has been successfully changed.
                        You can now sign in using your new password.
                    </p>
                </div>

                <div className="mt-8 rounded-2xl border border-neutral-200 p-6">
                    <Link
                        href="/login"
                        className="flex h-11 w-full items-center justify-center rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    >
                        Continue to sign in
                    </Link>
                </div>
            </div>
        );
    }

    /* --------------------------------
       Form
    --------------------------------- */

    return (
        <div>
            {/* Header */}
            <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
                    <LockIcon />
                </div>

                <h1 className="mt-6 text-2xl font-bold tracking-tight">
                    Set a new password
                </h1>

                <p className="mt-2 text-sm leading-6 text-neutral-500">
                    Create a strong password for your MarketX account.
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

                {!token ? (
                    <InvalidToken />
                ) : (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                    >
                        {/* New password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium"
                            >
                                New password
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                placeholder="Enter new password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(event.target.value)
                                }
                                disabled={loading}
                                required
                                minLength={8}
                                className="h-11 w-full rounded-lg border border-neutral-300 px-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black disabled:bg-neutral-50"
                            />

                            {/* Password strength */}
                            {password.length > 0 && (
                                <div className="mt-3">
                                    <div className="flex gap-1">
                                        {Array.from({ length: 5 }).map(
                                            (_, index) => (
                                                <div
                                                    key={index}
                                                    className={`h-1 flex-1 rounded-full ${index < passwordScore
                                                            ? "bg-black"
                                                            : "bg-neutral-200"
                                                        }`}
                                                />
                                            )
                                        )}
                                    </div>

                                    <p className="mt-2 text-xs text-neutral-400">
                                        {getPasswordStrength(passwordScore)}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
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
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(event.target.value)
                                }
                                disabled={loading}
                                required
                                className="h-11 w-full rounded-lg border border-neutral-300 px-3.5 text-sm outline-none transition placeholder:text-neutral-400 focus:border-black focus:ring-1 focus:ring-black disabled:bg-neutral-50"
                            />

                            {confirmPassword.length > 0 && (
                                <p
                                    className={`mt-2 text-xs ${password === confirmPassword
                                            ? "text-neutral-500"
                                            : "text-neutral-400"
                                        }`}
                                >
                                    {password === confirmPassword
                                        ? "Passwords match."
                                        : "Passwords do not match."}
                                </p>
                            )}
                        </div>

                        {/* Requirements */}
                        <PasswordRequirements
                            checks={passwordChecks}
                        />

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex h-11 w-full items-center justify-center rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Spinner />
                                    Updating password...
                                </>
                            ) : (
                                "Update password"
                            )}
                        </button>
                    </form>
                )}
            </div>

            {/* Login */}
            <p className="mt-6 text-center text-sm text-neutral-500">
                Remember your password?{" "}
                <Link
                    href="/login"
                    className="font-semibold text-black underline underline-offset-4"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}

/* --------------------------------
   Password Requirements
--------------------------------- */

function PasswordRequirements({
    checks,
}: {
    checks: {
        length: boolean;
        uppercase: boolean;
        lowercase: boolean;
        number: boolean;
        special: boolean;
    };
}) {
    const requirements = [
        ["8+ characters", checks.length],
        ["One uppercase letter", checks.uppercase],
        ["One lowercase letter", checks.lowercase],
        ["One number", checks.number],
        ["One special character", checks.special],
    ] as const;

    return (
        <div className="rounded-xl bg-neutral-50 p-4">
            <p className="text-xs font-semibold text-neutral-700">
                Password requirements
            </p>

            <ul className="mt-3 space-y-2">
                {requirements.map(([label, valid]) => (
                    <li
                        key={label}
                        className="flex items-center gap-2 text-xs text-neutral-500"
                    >
                        <span
                            className={`flex h-4 w-4 items-center justify-center rounded-full ${valid
                                    ? "bg-black text-white"
                                    : "border border-neutral-300"
                                }`}
                        >
                            {valid && <CheckIcon size={10} />}
                        </span>

                        {label}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* --------------------------------
   Invalid Token
--------------------------------- */

function InvalidToken() {
    return (
        <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100">
                <ErrorIcon />
            </div>

            <h2 className="mt-4 text-sm font-semibold">
                Invalid reset link
            </h2>

            <p className="mt-2 text-xs leading-5 text-neutral-500">
                This password reset link is invalid or has expired.
                Please request a new one.
            </p>

            <Link
                href="/forgot-password"
                className="mt-5 inline-flex rounded-lg bg-black px-5 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800"
            >
                Request a new link
            </Link>
        </div>
    );
}

/* --------------------------------
   Helpers
--------------------------------- */

function getPasswordStrength(score: number) {
    if (score <= 2) return "Weak password";
    if (score <= 4) return "Good password";
    return "Strong password";
}

/* --------------------------------
   Icons
--------------------------------- */

function Spinner() {
    return (
        <span
            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden="true"
        />
    );
}

function LockIcon() {
    return (
        <svg
            width="21"
            height="21"
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

function CheckIcon({
    size = 20,
}: {
    size?: number;
}) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <path d="m5 12 4 4L19 6" />
        </svg>
    );
}

function ErrorIcon() {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4" />
            <path d="M12 16h.01" />
        </svg>
    );
}

/* --------------------------------
   Suspense
--------------------------------- */

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <div className="flex justify-center py-20">
                    <Spinner />
                </div>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}