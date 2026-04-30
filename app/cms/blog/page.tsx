"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured: boolean;
  author: string;
  created_at: string;
  publish_date: string | null;
  cms_blog_categories: { id: string; name: string; slug: string } | null;
};

function StatusBadge({ status }: { status: string }) {
  const published = status === "published";
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 9px",
      borderRadius: 99,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.05em",
      background: published ? "rgba(0,184,117,0.12)" : "rgba(255,255,255,0.07)",
      color: published ? "#00B875" : "rgba(255,255,255,0.4)",
      border: `1px solid ${published ? "rgba(0,184,117,0.25)" : "rgba(255,255,255,0.1)"}`,
      textTransform: "uppercase",
    }}>
      {published ? "Published" : "Draft"}
    </span>
  );
}

export default function CmsBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function loadPosts() {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/blog");
      const data = await res.json();
      setPosts(data.posts ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPosts(); }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await fetch(`/api/cms/blog/${id}`, { method: "DELETE" });
      setPosts((p) => p.filter((x) => x.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#FF6B35", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
            Publishing
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            Blog Posts
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Write and publish articles that appear on the public blog page.
          </p>
        </div>
        <Link href="/cms/blog/new" style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "9px 18px", borderRadius: 8,
          background: "#FF6B35", border: "none",
          color: "#fff", fontSize: 12, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
          textDecoration: "none",
        }}>
          + New Post
        </Link>
      </div>

      {loading ? (
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: "48px 32px",
          textAlign: "center",
          color: "rgba(255,255,255,0.3)",
          fontSize: 13,
        }}>
          Loading posts…
        </div>
      ) : posts.length === 0 ? (
        /* Empty state */
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          padding: "64px 32px",
          textAlign: "center",
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: "rgba(255,107,53,0.12)",
            border: "1px solid rgba(255,107,53,0.22)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, margin: "0 auto 16px",
          }}>✍️</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
            No blog posts yet
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 320, margin: "0 auto" }}>
            Click "New Post" above to write your first article.
          </div>
        </div>
      ) : (
        /* Posts table */
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          overflow: "hidden",
        }}>
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 140px 100px 120px 100px",
            padding: "10px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
          }}>
            <div>Title</div>
            <div>Category</div>
            <div>Status</div>
            <div>Date</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>

          {/* Rows */}
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 140px 100px 120px 100px",
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                alignItems: "center",
              }}
            >
              {/* Title */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
                  {post.title || <span style={{ color: "rgba(255,255,255,0.25)" }}>Untitled</span>}
                </div>
                {post.featured && (
                  <span style={{ fontSize: 9, background: "rgba(255,107,53,0.12)", color: "#FF6B35", padding: "1px 6px", borderRadius: 99, fontWeight: 700 }}>
                    FEATURED
                  </span>
                )}
              </div>

              {/* Category */}
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                {post.cms_blog_categories?.name ?? "—"}
              </div>

              {/* Status */}
              <div>
                <StatusBadge status={post.status} />
              </div>

              {/* Date */}
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {formatDate(post.publish_date ?? post.created_at)}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <Link
                  href={`/cms/blog/edit/${post.id}`}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 11,
                    fontWeight: 600,
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(post.id, post.title)}
                  disabled={deleting === post.id}
                  style={{
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: "rgba(255,80,80,0.08)",
                    border: "1px solid rgba(255,80,80,0.15)",
                    color: "#FF6B6B",
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    opacity: deleting === post.id ? 0.5 : 1,
                  }}
                >
                  {deleting === post.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
