import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/profile",
        "/chat",
        "/checkout",
        "/listings/my",
        "/listings/saved",
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
