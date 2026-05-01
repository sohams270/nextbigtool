"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type PressRelease = {
  id: string;
  title: string;
  slug: string;
  status: string;
  featured: boolean;
  author: string;
  company_name: string;
  created_at: string;
  publish_date: string | null;
};

function StatusBadge({ status }: { status: string }) {
  const cfg =
    status === "published"
      ? { bg: "rgba(0,184,117,0.12)", color: "#00B875", border: "rgba(0,184,117,0.25)", label: "Published" }
      : status === "pending_review"
      ? { bg: "rgba(245,158,11,0.12)", color: "#F59E0B", border: "rgba(245,158,11,0.25)", label: "Pending Review" }
      : { bg: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.4)", border: "rgba(255,255,255,0.1)", label: "Draft" };

  return (
    <span style={{
      display: "inline-block",
      padding: "2px 9px",
      borderRadius: 99,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.05em",
      background: cfg.bg,
      color: cfg.color,
      border: `1px solid ${cfg.border}`,
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
}

export default function CmsPressReleasePage() {
  const [releases, setReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  async function loadReleases() {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/press-releases");
      const data = await res.json();
      setReleases(data.pressReleases ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReleases(); }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await fetch(`/api/cms/press-releases/${id}`, { method: "DELETE" });
      setReleases((p) => p.filter((x) => x.id !== id));
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
            Press Releases
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Publish press releases that appear on the public Press Release page.
          </p>
        </div>
        <Link href="/cms/press-release/new" style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "9px 18px", borderRadius: 8,
          background: "#FF6B35", border: "none",
          color: "#fff", fontSize: 12, fontWeight: 700,
          cursor: "pointer", fontFamily: "inherit",
          textDecoration: "none",
        }}>
          + New Press Release
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
          Loading press releases…
        </div>
      ) : releases.length === 0 ? (
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
          }}>📣</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
            No press releases yet
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 320, margin: "0 auto" }}>
            Click &quot;New Press Release&quot; above to publish your first announcement.
          </div>
        </div>
      ) : (
        <div style={{
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 14,
          overflow: "hidden",
        }}>
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 160px 130px 120px 110px",
            padding: "10px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            fontSize: 10,
            fontWeight: 700,
            color: "rgba(255,255,255,0.3)",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
          }}>
            <div>Title</div>
            <div>Company</div>
            <div>Status</div>
            <div>Date</div>
            <div style={{ textAlign: "right" }}>Actions</div>
          </div>

          {/* Rows */}
          {releases.map((release) => (
            <div
              key={release.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 160px 130px 120px 110px",
                padding: "12px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
                alignItems: "center",
              }}
            >
              {/* Title */}
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
                  {release.title || <span style={{ color: "rgba(255,255,255,0.25)" }}>Untitled</span>}
                </div>
                {release.featured && (
                  <span style={{ fontSize: 9, background: "rgba(255,107,53,0.12)", color: "#FF6B35", padding: "1px 6px", borderRadius: 99, fontWeight: 700 }}>
                    FEATURED
                  </span>
                )}
              </div>

              {/* Company */}
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                {release.company_name || "—"}
              </div>

              {/* Status */}
              <div>
                <StatusBadge status={release.status} />
              </div>

              {/* Date */}
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                {formatDate(release.publish_date ?? release.created_at)}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <Link
                  href={`/cms/press-release/edit/${release.id}`}
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
                  onClick={() => handleDelete(release.id, release.title)}
                  disabled={deleting === release.id}
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
                    opacity: deleting === release.id ? 0.5 : 1,
                  }}
                >
                  {deleting === release.id ? "…" : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
