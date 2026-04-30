import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import BlogGrid from "../components/BlogGrid";
import BlogHero from "../components/BlogHero";
import type { BlogPost } from "../lib/blog-posts";

export const metadata: Metadata = {
  title: "Blog — Next Big Tool",
  description: "Launch strategies, growth playbooks, and founder lessons — no fluff, just signal.",
};

export const revalidate = 60; // ISR: revalidate every 60s

async function getPublishedPosts(): Promise<BlogPost[]> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase
      .from("cms_blog_posts")
      .select(`
        id, title, slug, excerpt, author, featured,
        read_time, publish_date, created_at, featured_image_url,
        cms_blog_categories(name)
      `)
      .eq("status", "published")
      .order("publish_date", { ascending: false });

    if (error || !data) return [];

    return data.map((p) => ({
      slug: p.slug ?? p.id,
      category: (p.cms_blog_categories as unknown as { name: string } | null)?.name ?? "Uncategorized",
      title: p.title,
      excerpt: p.excerpt ?? "",
      author: p.author ?? "The NBT Team",
      date: new Date(p.publish_date ?? p.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      readTime: p.read_time ?? "5 min",
      featured: p.featured ?? false,
      coverEmoji: "✍️",
      featured_image_url: p.featured_image_url ?? null,
    }));
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />
      <BlogHero />
      <BlogGrid posts={posts} />
      <Footer />
    </div>
  );
}
