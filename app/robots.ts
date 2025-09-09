import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const host = "https://portal.theclearpath.ae";
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "*", disallow: ["/login", "/signup", "/portal", "/api/"] },
    ],
    sitemap: `${host}/sitemap.xml`,
    host,
  };
}

