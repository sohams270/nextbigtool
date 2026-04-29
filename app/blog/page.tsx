import TopNav from "../components/TopNav";
import Pill from "../components/Pill";
import { BLOG_POSTS as POSTS } from "../lib/blog-posts";

const CATEGORY_COLORS: Record<string, "orange" | "blue" | "green" | "gray"> = {
  Growth: "orange", Strategy: "blue", "AI Tools": "green", Comparison: "gray", Sales: "orange",
};

export default function BlogPage() {
  const [featured, ...rest] = POSTS;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F5F5F5" }}>
      <TopNav />

      <div style={{ background: "#0A0B1A", color: "#fff", padding: "44px 32px 36px", textAlign: "center" }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px" }}>The NBT Blog</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0 }}>
          Guides, stories, and insights for founders who ship.
        </p>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 32px", width: "100%" }}>
        {/* Featured post */}
        <div style={{ background: "#fff", border: "1px solid #CFCFD4", borderRadius: 12, padding: 28, marginBottom: 20, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Pill color={CATEGORY_COLORS[featured.category] ?? "gray"} size="xs">{featured.category}</Pill>
            <span style={{ fontSize: 10, color: "#6B6B70" }}>Featured Post</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.01em", margin: "0 0 10px" }}>{featured.title}</h2>
          <p style={{ fontSize: 12, color: "#6B6B70", margin: "0 0 14px", lineHeight: 1.6 }}>{featured.excerpt}</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 10, color: "#A8A8AD" }}>{featured.author} · {featured.date} · {featured.readTime} read</div>
            <span style={{ fontSize: 11, color: "#FF6B35", fontWeight: 700 }}>Read article →</span>
          </div>
        </div>

        {/* Rest of posts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {rest.map((post) => (
            <div key={post.slug} style={{ background: "#fff", border: "1px solid #CFCFD4", borderRadius: 10, padding: 18, cursor: "pointer" }}>
              <Pill color={CATEGORY_COLORS[post.category] ?? "gray"} size="xs" style={{ marginBottom: 10 }}>{post.category}</Pill>
              <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px", lineHeight: 1.4 }}>{post.title}</h3>
              <p style={{ fontSize: 11, color: "#6B6B70", margin: "0 0 14px", lineHeight: 1.5 }}>{post.excerpt}</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 10, color: "#A8A8AD" }}>{post.date} · {post.readTime}</span>
                <span style={{ fontSize: 11, color: "#FF6B35", fontWeight: 600 }}>Read →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
