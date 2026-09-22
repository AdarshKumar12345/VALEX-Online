import Link from "next/link";

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-neutral-200">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2"
                        aria-label="MarketX home"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
                            M
                        </div>

                        <span className="text-xl font-bold tracking-tight">
                            MarketX
                        </span>
                    </Link>

                    <Link
                        href="/"
                        className="text-sm font-medium text-neutral-500 transition hover:text-black"
                    >
                        Back to marketplace
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6">
                <div className="w-full max-w-md">
                    {children}
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="border-t border-neutral-200 py-6 text-center">
                <p className="text-xs text-neutral-400">
                    © {new Date().getFullYear()} MarketX. All rights reserved.
                </p>
            </footer>
        </div>
    );
}