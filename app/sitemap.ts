import { MetadataRoute } from "next";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

const BASE_URL = "https://www.nextbigtool.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // ── Static pages ──────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`,                          priority: 1.0,  changeFrequency: "daily"   },
    { url: `${BASE_URL}/discover`,                  priority: 0.9,  changeFrequency: "daily"   },
    { url: `${BASE_URL}/discover/categories`,       priority: 0.8,  changeFrequency: "weekly"  },
    { url: `${BASE_URL}/discover/use-cases`,        priority: 0.8,  changeFrequency: "weekly"  },
    { url: `${BASE_URL}/discover/free-tools`,       priority: 0.8,  changeFrequency: "daily"   },
    { url: `${BASE_URL}/discover/hall-of-fame`,     priority: 0.7,  changeFrequency: "weekly"  },
    { url: `${BASE_URL}/compare`,                   priority: 0.8,  changeFrequency: "monthly" },
    { url: `${BASE_URL}/compare/nextbigtool-vs-product-hunt`,   priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/compare/nextbigtool-vs-peerpush`,       priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/compare/nextbigtool-vs-find-your-saas`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/compare/nextbigtool-vs-g2`,             priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/compare/nextbigtool-vs-saashub`,        priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/compare/nextbigtool-vs-appsumo`,        priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/compare/nextbigtool-vs-alternativeto`,  priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/compare/nextbigtool-vs-capterra`,       priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/compare/nextbigtool-vs-betalist`,       priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/compare/nextbigtool-vs-toolfinder`,     priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/blog`,                      priority: 0.8,  changeFrequency: "weekly"  },
    { url: `${BASE_URL}/press-release`,             priority: 0.6,  changeFrequency: "weekly"  },
    { url: `${BASE_URL}/pricing`,                   priority: 0.7,  changeFrequency: "monthly" },
    { url: `${BASE_URL}/about`,                     priority: 0.6,  changeFrequency: "monthly" },
    { url: `${BASE_URL}/contact`,                   priority: 0.5,  changeFrequency: "yearly"  },
    { url: `${BASE_URL}/faq`,                       priority: 0.6,  changeFrequency: "monthly" },
    { url: `${BASE_URL}/rules`,                     priority: 0.5,  changeFrequency: "yearly"  },
    { url: `${BASE_URL}/privacy`,                   priority: 0.4,  changeFrequency: "yearly"  },
    { url: `${BASE_URL}/terms`,                     priority: 0.4,  changeFrequency: "yearly"  },
    { url: `${BASE_URL}/newsletter`,                priority: 0.5,  changeFrequency: "monthly" },
  ];

  // ── Tool pages ────────────────────────────────────────────────────────────
  const { data: tools } = await supabase
    .from("tools")
    .select("slug, updated_at")
    .eq("status", "approved")
    .order("updated_at", { ascending: false });

  const toolRoutes: MetadataRoute.Sitemap = (tools ?? []).map((t) => ({
    url: `${BASE_URL}/tools/${t.slug}`,
    lastModified: t.updated_at ? new Date(t.updated_at) : undefined,
    priority: 0.8,
    changeFrequency: "weekly" as const,
  }));

  // ── Blog posts ────────────────────────────────────────────────────────────
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  const blogRoutes: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
    priority: 0.7,
    changeFrequency: "monthly" as const,
  }));

  return [...staticRoutes, ...toolRoutes, ...blogRoutes];
}
