import type { Metadata } from "next";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer";
import BlogGrid from "../components/BlogGrid";
import BlogHero from "../components/BlogHero";

export const metadata: Metadata = {
  title: "Blog — Next Big Tool",
  description: "Launch strategies, growth playbooks, and founder lessons — no fluff, just signal.",
};

export default function BlogPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />
      <BlogHero />
      <BlogGrid />
      <Footer />
    </div>
  );
}
