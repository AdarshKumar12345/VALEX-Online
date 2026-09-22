import Link from "next/link";

const footerLinks = {
    Marketplace: [
        { label: "Browse Listings", href: "/listings" },
        { label: "Sell Something", href: "/sell" },
        { label: "Categories", href: "/categories" },
    ],
    Company: [
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
        { label: "Careers", href: "/careers" },
    ],
    Support: [
        { label: "Help Center", href: "/help" },
        { label: "Safety", href: "/safety" },
        { label: "Report a Problem", href: "/report" },
    ],
    Legal: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
    ],
};

export default function Footer() {
    return (
        <footer className="border-t border-neutral-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

                {/* Main Footer */}
                <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">

                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2"
                            aria-label="MarketX home"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-sm font-bold text-white">
                                M
                            </div>

                            <span className="text-xl font-bold tracking-tight">
                                MarketX
                            </span>
                        </Link>

                        <p className="mt-4 max-w-xs text-sm leading-6 text-neutral-500">
                            A modern marketplace for buying and selling
                            pre-owned products.
                        </p>

                        {/* Social Links */}
                        <div className="mt-6 flex items-center gap-2">
                            <SocialLink
                                href="#"
                                label="GitHub"
                                icon={<GitHubIcon />}
                            />

                            <SocialLink
                                href="#"
                                label="Twitter"
                                icon={<TwitterIcon />}
                            />

                            <SocialLink
                                href="#"
                                label="LinkedIn"
                                icon={<LinkedInIcon />}
                            />
                        </div>
                    </div>

                    {/* Link Groups */}
                    {Object.entries(footerLinks).map(([title, links]) => (
                        <div key={title}>
                            <h3 className="text-sm font-semibold text-black">
                                {title}
                            </h3>

                            <ul className="mt-4 space-y-3">
                                {links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-sm text-neutral-500 transition hover:text-black"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="mt-12 flex flex-col gap-4 border-t border-neutral-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-neutral-500">
                        © {new Date().getFullYear()} MarketX. All rights reserved.
                    </p>

                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                        <span>Made for local communities</span>

                        <span
                            aria-hidden="true"
                            className="hidden h-1 w-1 rounded-full bg-neutral-300 sm:block"
                        />

                        <span>India</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

/* --------------------------------
   Social Link
--------------------------------- */

interface SocialLinkProps {
    href: string;
    label: string;
    icon: React.ReactNode;
}

function SocialLink({
    href,
    label,
    icon,
}: SocialLinkProps) {
    return (
        <Link
            href={href}
            aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition hover:border-black hover:bg-black hover:text-white"
        >
            {icon}
        </Link>
    );
}

/* --------------------------------
   Icons
--------------------------------- */

function GitHubIcon() {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M12 .5A12 12 0 0 0 8.21 23.4c.6.11.82-.26.82-.58v-2.05c-3.34.73-4.04-1.42-4.04-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.09 1.83 1.23 1.83 1.23 1.07 1.83 2.8 1.3 3.48.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23A11.5 11.5 0 0 1 12 6.18c1.02 0 2.05.14 3.01.42 2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.76.84 1.23 1.91 1.23 3.22 0 4.6-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22v3.3c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z"
            />
        </svg>
    );
}

function TwitterIcon() {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M18.9 2H22l-6.77 7.74L23.2 22h-6.24l-4.89-6.39L6.48 22H3.36l7.24-8.28L2.8 2h6.4l4.42 5.84L18.9 2Zm-1.1 17.96h1.73L8.27 3.9H6.41L17.8 19.96Z" />
        </svg>
    );
}

function LinkedInIcon() {
    return (
        <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
        >
            <path d="M4.98 3.5A2.5 2.5 0 1 1 5 8.5a2.5 2.5 0 0 1-.02-5ZM3 9h4v12H3V9Zm7 0h3.83v1.64h.05c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.66 4.8 6.12V21h-4v-5.59c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94V21h-4V9Z" />
        </svg>
    );
}