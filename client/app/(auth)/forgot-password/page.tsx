"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setSuccess(false);

        if (!email.trim()) {
            setError("Please enter your email address.");
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
                `${apiUrl}/auth/forgot-password`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                    }),
                }
            );

            /*
             * Don't reveal whether an account exists.
             *
             * Your backend should return a generic successful
             * response even when the email doesn't exist.
             */

            if (!response.ok && response.status !== 404) {
                const data = await response
                    .json()
                    .catch(() => null);

                throw new Error(
                    data?.message ||
                    "Unable to process your request."
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

    return (
        <div>
            {/* Header */}
            <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-black text-white">
                    <LockIcon />
                </div>

                <h1 className="mt-6 text-2xl font-bold tracking-tight">
                    Forgot your password?
                </h1>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-neutral-500">
                    Enter your email and we&apos;ll send you instructions
                    to reset your password.
                </p>
            </div>

            {/* Card */}
            <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:p-8">

                {/* Success */}
                {success ? (
                    <SuccessState email={email} />
                ) : (
                    <>
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

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex h-11 w-full items-center justify-center rounded-lg bg-black px-4 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <Spinner />
                                        Sending instructions...
                                    </>
                                ) : (
                                    "Send reset instructions"
                                )}
                            </button>
                        </form>
                    </>
                )}
            </div>

            {/* Back to Login */}
            <div className="mt-6 text-center">
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition hover:text-black"
                >
                    <ArrowLeftIcon />
                    Back to sign in
                </Link>
            </div>

            {/* Security */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-400">
                <ShieldIcon />
                <span>Your account information stays private.</span>
            </div>
        </div>
    );
}

/* --------------------------------
   Success
--------------------------------- */

function SuccessState({
    email,
}: {
    email: string;
}) {
    return (
        <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                <CheckIcon />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
                Check your inbox
            </h2>

            <p className="mt-2 text-sm leading-6 text-neutral-500">
                If an account exists for{" "}
                <span className="font-medium text-black">
                    {email}
                </span>
                , you&apos;ll receive password reset instructions
                shortly.
            </p>

            <p className="mt-4 text-xs leading-5 text-neutral-400">
                Don&apos;t forget to check your spam or junk folder.
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

function CheckIcon() {
    return (
        <svg
            width="21"
            height="21"
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

function ArrowLeftIcon() {
    return (
        <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
        </svg>
    );
}

function ShieldIcon() {
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
            <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    );
}