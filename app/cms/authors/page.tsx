"use client";

import { useEffect, useRef, useState } from "react";

type Author = {
  id: string;
  name: string;
  bio: string;
  linkedin_url: string;
  avatar_url: string;
  created_at: string;
};

type ModalState = null | "new" | Author;

/* ── Avatar ─────────────────────────────────────────────────────────────── */
function AuthorAvatar({ author, size = 48 }: { author: { name: string; avatar_url: string }; size?: number }) {
  if (author.avatar_url) {
    return (
      <img
        src={author.avatar_url}
        alt={author.name}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: "linear-gradient(135deg,#FF6B35,#FF4500)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: Math.round(size * 0.38),
      fontWeight: 700,
      color: "#fff",
      flexShrink: 0,
    }}>
      {author.name[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

/* ── Author Modal ────────────────────────────────────────────────────────── */
function AuthorModal({
  modal,
  onClose,
  onSaved,
}: {
  modal: ModalState;
  onClose: () => void;
  onSaved: (author: Author) => void;
}) {
  const isEdit = modal !== null && modal !== "new";
  const initial = isEdit ? (modal as Author) : null;

  const [name, setName] = useState(initial?.name ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [linkedinUrl, setLinkedinUrl] = useState(initial?.linkedin_url ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial?.avatar_url ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  async function handleAvatarFile(file: File) {
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cms/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setAvatarUrl(data.url);
    } catch {
      // ignore
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function handleSave() {
    setError(null);
    if (!name.trim()) { setError("Name is required"); return; }
    setSaving(true);
    try {
      const url = isEdit ? `/api/cms/authors/${(modal as Author).id}` : "/api/cms/authors";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), bio, linkedin_url: linkedinUrl, avatar_url: avatarUrl }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save"); return; }
      onSaved(data.author);
      onClose();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 7,
    padding: "8px 10px",
    color: "#fff",
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.6)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%",
        maxWidth: 480,
        background: "#13142A",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: 28,
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>
            {isEdit ? "Edit Author" : "New Author"}
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 20, cursor: "pointer", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Avatar preview + upload */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>Avatar</div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <AuthorAvatar author={{ name: name || "?", avatar_url: avatarUrl }} size={52} />
            <div style={{ flex: 1 }}>
              <input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://... or upload below"
                style={{ ...inputStyle, marginBottom: 6 }}
              />
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAvatarFile(file);
                }}
              />
              <button
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                disabled={uploadingAvatar}
                style={{
                  padding: "5px 12px",
                  borderRadius: 6,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {uploadingAvatar ? "Uploading…" : "Upload image"}
              </button>
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
            Name <span style={{ color: "#FF6B35" }}>*</span>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            style={inputStyle}
            autoFocus
          />
        </div>

        {/* Bio */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Bio</div>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short bio about the author…"
            rows={3}
            style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
          />
        </div>

        {/* LinkedIn URL */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>LinkedIn URL</div>
          <input
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/..."
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{ fontSize: 12, color: "#FF6B6B", background: "rgba(255,80,80,0.08)", border: "1px solid rgba(255,80,80,0.2)", borderRadius: 7, padding: "8px 12px" }}>
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "8px 18px", borderRadius: 8,
              background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
              color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "8px 20px", borderRadius: 8,
              background: "#FF6B35", border: "none",
              color: "#fff", fontSize: 13, fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Author Card ──────────────────────────────────────────────────────────── */
function AuthorCard({
  author,
  onEdit,
  onDelete,
}: {
  author: Author;
  onEdit: (a: Author) => void;
  onDelete: (a: Author) => void;
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 14,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 14,
    }}>
      {/* Top */}
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <AuthorAvatar author={author} size={48} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 2 }}>
            {author.name}
          </div>
          {author.bio && (
            <div style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {author.bio}
            </div>
          )}
          {author.linkedin_url && (
            <a
              href={author.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                marginTop: 6,
                fontSize: 11,
                fontWeight: 600,
                color: "#0A66C2",
                textDecoration: "none",
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </a>
          )}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => onEdit(author)}
          style={{
            flex: 1,
            padding: "6px 10px",
            borderRadius: 7,
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.7)",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(author)}
          style={{
            flex: 1,
            padding: "6px 10px",
            borderRadius: 7,
            background: "rgba(255,80,80,0.08)",
            border: "1px solid rgba(255,80,80,0.15)",
            color: "#FF6B6B",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────────── */
export default function CmsAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);

  async function loadAuthors() {
    setLoading(true);
    try {
      const res = await fetch("/api/cms/authors");
      const data = await res.json();
      setAuthors(data.authors ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAuthors(); }, []);

  function handleSaved(author: Author) {
    setAuthors((prev) => {
      const idx = prev.findIndex((a) => a.id === author.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = author;
        return next.sort((a, b) => a.name.localeCompare(b.name));
      }
      return [...prev, author].sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  async function handleDelete(author: Author) {
    if (!confirm(`Delete "${author.name}"? This cannot be undone.`)) return;
    try {
      await fetch(`/api/cms/authors/${author.id}`, { method: "DELETE" });
      setAuthors((prev) => prev.filter((a) => a.id !== author.id));
    } catch {
      // ignore
    }
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
            Authors
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0 }}>
            Manage author profiles that can be linked to blog posts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal("new")}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 18px", borderRadius: 8,
            background: "#FF6B35", border: "none",
            color: "#fff", fontSize: 12, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          + New Author
        </button>
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
          Loading authors…
        </div>
      ) : authors.length === 0 ? (
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
          }}>
            👤
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
            No authors yet
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", maxWidth: 320, margin: "0 auto" }}>
            Click &quot;+ New Author&quot; to create your first author profile.
          </div>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {authors.map((author) => (
            <AuthorCard
              key={author.id}
              author={author}
              onEdit={(a) => setModal(a)}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {modal !== null && (
        <AuthorModal
          modal={modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
