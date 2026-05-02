import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/admin/", "/cms/", "/auth/"],
      },
    ],
    sitemap: "https://www.nextbigtool.com/sitemap.xml",
  };
}
