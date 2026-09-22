"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SearchBar from "@/components/search/SearchBar";
import NotificationBell from "@/components/notifications/NotificationBell";

interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    const profileRef = useRef<HTMLDivElement>(null);

    /* --------------------------------
       Fetch authenticated user
    --------------------------------- */

    useEffect(() => {
        async function getCurrentUser() {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL;

                if (!apiUrl) {
                    throw new Error(
                        "NEXT_PUBLIC_API_URL is not configured"
                    );
                }

                const response = await fetch(
                    `${apiUrl}/auth/me`,
                    {
                        method: "GET",
                        credentials: "include",
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    setUser(null);
                    return;
                }

                const data = await response.json();

                setUser(data.user ?? data);
            } catch {
                setUser(null);
            } finally {
                setLoadingUser(false);
            }
        }

        getCurrentUser();
    }, []);

    /* --------------------------------
       Close profile dropdown
    --------------------------------- */

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                profileRef.current &&
                !profileRef.current.contains(
                    event.target as Node
                )
            ) {
                setProfileOpen(false);
            }
        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    /* --------------------------------
       Logout
    --------------------------------- */

    async function handleLogout() {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;

            if (!apiUrl) {
                throw new Error(
                    "NEXT_PUBLIC_API_URL is not configured"
                );
            }

            await fetch(`${apiUrl}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setUser(null);
            setProfileOpen(false);
            setMobileOpen(false);

            window.location.href = "/";
        }
    }

    return (
        <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

                {/* --------------------------------
            Logo
        --------------------------------- */}

                <Link
                    href="/"
                    className="flex shrink-0 items-center gap-2"
                    aria-label="MarketX home"
                >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
                        M
                    </div>

                    <span className="text-xl font-bold tracking-tight">
                        MarketX
                    </span>
                </Link>

                {/* --------------------------------
            Search
        --------------------------------- */}

                <div className="hidden flex-1 px-8 md:block max-w-xl mx-auto">
                    <SearchBar />
                </div>

                {/* --------------------------------
            Desktop Navigation
        --------------------------------- */}

                <nav
                    className="hidden items-center gap-1 md:flex"
                    aria-label="Main navigation"
                >
                    <Link
                        href="/listings"
                        className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
                    >
                        Browse
                    </Link>

                    <Link
                        href="/categories"
                        className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
                    >
                        Categories
                    </Link>

                    {!loadingUser && user && (
                        <>
                            <Link
                                href="/chat"
                                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
                            >
                                Messages
                            </Link>
                            <NotificationBell />
                        </>
                    )}

                    {/* User */}
                    {!loadingUser && user ? (
                        <div
                            ref={profileRef}
                            className="relative ml-2"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setProfileOpen((open) => !open)
                                }
                                aria-expanded={profileOpen}
                                aria-haspopup="menu"
                                className="flex items-center gap-2 rounded-lg border border-neutral-200 px-2 py-1.5 transition hover:border-black"
                            >
                                <Avatar user={user} />

                                <span className="hidden max-w-24 truncate text-sm font-medium lg:block">
                                    {user.name}
                                </span>

                                <ChevronDownIcon />
                            </button>

                            {profileOpen && (
                                <ProfileDropdown
                                    user={user}
                                    onLogout={handleLogout}
                                />
                            )}
                        </div>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
                            >
                                Login
                            </Link>

                            <Link
                                href="/register"
                                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
                            >
                                Register
                            </Link>
                        </>
                    )}

                    <Link
                        href="/sell"
                        className="ml-2 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800 active:scale-[0.98]"
                    >
                        Sell
                    </Link>
                </nav>

                {/* --------------------------------
            Mobile Menu Button
        --------------------------------- */}

                <button
                    type="button"
                    aria-label={
                        mobileOpen
                            ? "Close menu"
                            : "Open menu"
                    }
                    aria-expanded={mobileOpen}
                    onClick={() =>
                        setMobileOpen((open) => !open)
                    }
                    className="rounded-lg p-2 transition hover:bg-neutral-100 md:hidden"
                >
                    {mobileOpen ? (
                        <CloseIcon />
                    ) : (
                        <MenuIcon />
                    )}
                </button>
            </div>

            {/* --------------------------------
          Mobile Navigation
      --------------------------------- */}

            {mobileOpen && (
                <div className="border-t border-neutral-200 bg-white md:hidden">
                    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">

                        {/* Mobile Search */}
                        <form
                            action="/listings"
                            method="GET"
                            className="mb-4"
                        >
                            <div className="flex h-11 items-center rounded-lg border border-neutral-300 bg-neutral-50 px-3">
                                <SearchIcon />

                                <input
                                    type="search"
                                    name="q"
                                    placeholder="Search products..."
                                    aria-label="Search products"
                                    className="ml-2 w-full bg-transparent text-sm outline-none"
                                />
                            </div>
                        </form>

                        {/* Navigation */}
                        <div className="space-y-1">
                            <MobileLink
                                href="/listings"
                                onClick={() => setMobileOpen(false)}
                            >
                                Browse
                            </MobileLink>

                            {user && (
                                <>
                                    <MobileLink
                                        href="/chat"
                                        onClick={() =>
                                            setMobileOpen(false)
                                        }
                                    >
                                        Messages
                                    </MobileLink>

                                    <MobileLink
                                        href="/profile"
                                        onClick={() =>
                                            setMobileOpen(false)
                                        }
                                    >
                                        Profile
                                    </MobileLink>

                                    <MobileLink
                                        href="/dashboard"
                                        onClick={() =>
                                            setMobileOpen(false)
                                        }
                                    >
                                        Dashboard
                                    </MobileLink>

                                    <MobileLink
                                        href="/listings/saved"
                                        onClick={() =>
                                            setMobileOpen(false)
                                        }
                                    >
                                        Saved listings
                                    </MobileLink>

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="block w-full rounded-lg px-3 py-3 text-left text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}

                            {!user && !loadingUser && (
                                <>
                                    <MobileLink
                                        href="/login"
                                        onClick={() =>
                                            setMobileOpen(false)
                                        }
                                    >
                                        Login
                                    </MobileLink>

                                    <MobileLink
                                        href="/register"
                                        onClick={() =>
                                            setMobileOpen(false)
                                        }
                                    >
                                        Register
                                    </MobileLink>
                                </>
                            )}

                            <Link
                                href="/sell"
                                onClick={() => setMobileOpen(false)}
                                className="mt-3 block rounded-lg bg-black px-4 py-3 text-center text-sm font-semibold text-white"
                            >
                                Sell something
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}

/* --------------------------------
   Profile Dropdown
--------------------------------- */

function ProfileDropdown({
    user,
    onLogout,
}: {
    user: User;
    onLogout: () => void;
}) {
    return (
        <div
            role="menu"
            className="absolute right-0 top-12 w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
        >
            {/* User */}
            <div className="border-b border-neutral-200 p-4">
                <div className="flex items-center gap-3">
                    <Avatar user={user} size="large" />

                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                            {user.name}
                        </p>

                        <p className="truncate text-xs text-neutral-500">
                            {user.email}
                        </p>
                    </div>
                </div>
            </div>

            {/* Links */}
            <div className="p-2">
                <DropdownLink
                    href="/dashboard"
                    icon={<DashboardIcon />}
                >
                    Dashboard
                </DropdownLink>

                <DropdownLink
                    href="/profile"
                    icon={<UserIcon />}
                >
                    Profile
                </DropdownLink>

                <DropdownLink
                    href="/listings/my"
                    icon={<ListingIcon />}
                >
                    My listings
                </DropdownLink>

                <DropdownLink
                    href="/listings/saved"
                    icon={<HeartIcon />}
                >
                    Saved listings
                </DropdownLink>

                <DropdownLink
                    href="/chat"
                    icon={<MessageIcon />}
                >
                    Messages
                </DropdownLink>
            </div>

            {/* Logout */}
            <div className="border-t border-neutral-200 p-2">
                <button
                    type="button"
                    onClick={onLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
                >
                    <LogoutIcon />
                    Logout
                </button>
            </div>
        </div>
    );
}

/* --------------------------------
   Avatar
--------------------------------- */

function Avatar({
    user,
    size = "small",
}: {
    user: User;
    size?: "small" | "large";
}) {
    const dimensions =
        size === "large"
            ? "h-10 w-10"
            : "h-7 w-7";

    if (user.avatar) {
        return (
            <img
                src={user.avatar}
                alt={user.name}
                className={`${dimensions} rounded-full object-cover`}
            />
        );
    }

    return (
        <div
            className={`flex ${dimensions} shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white`}
        >
            {user.name.charAt(0).toUpperCase()}
        </div>
    );
}

/* --------------------------------
   Mobile Link
--------------------------------- */

function MobileLink({
    href,
    children,
    onClick,
}: {
    href: string;
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className="block rounded-lg px-3 py-3 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
        >
            {children}
        </Link>
    );
}

/* --------------------------------
   Dropdown Link
--------------------------------- */

function DropdownLink({
    href,
    icon,
    children,
}: {
    href: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <Link
            href={href}
            role="menuitem"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-neutral-600 transition hover:bg-neutral-100 hover:text-black"
        >
            {icon}
            {children}
        </Link>
    );
}

/* --------------------------------
   Icons
--------------------------------- */

function SearchIcon() {
    return (
        <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="shrink-0 text-neutral-500"
            aria-hidden="true"
        >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
        </svg>
    );
}

function MenuIcon() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
        </svg>
    );
}

function CloseIcon() {
    return (
        <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
        </svg>
    );
}

function ChevronDownIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

function HeartIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z" />
        </svg>
    );
}

function DashboardIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
    );
}

function UserIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
    );
}

function ListingIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <path d="M8 9h8" />
            <path d="M8 13h8" />
            <path d="M8 17h5" />
        </svg>
    );
}

function MessageIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.4 8.4 0 0 1-3.5-.8L4 20l1.2-3.5A7.4 7.4 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7Z" />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <path d="M10 17l5-5-5-5" />
            <path d="M15 12H3" />
            <path d="M21 19V5a2 2 0 0 0-2-2h-6" />
        </svg>
    );
}
