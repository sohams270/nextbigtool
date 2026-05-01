"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import CharacterCount from "@tiptap/extension-character-count";
import Image from "@tiptap/extension-image";

/* ─── Types ─────────────────────────────────────────────────────────────── */
type Category = { id: string; name: string; slug: string };
type Author = { id: string; name: string; bio: string; linkedin_url: string; avatar_url: string };

/* ─── Toolbar ────────────────────────────────────────────────────────────── */
function Toolbar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  const [headingOpen, setHeadingOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imgOpen, setImgOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [imgAlt, setImgAlt] = useState("");
  const [imgUploading, setImgUploading] = useState(false);
  const imgFileRef = useRef<HTMLInputElement>(null);

  async function handleImgUpload(file: File) {
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cms/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setImgUrl(data.url);
    } finally {
      setImgUploading(false);
    }
  }

  function insertImage() {
    if (!imgUrl.trim()) return;
    editor?.chain().focus().setImage({ src: imgUrl.trim(), alt: imgAlt.trim() }).run();
    setImgOpen(false);
    setImgUrl("");
    setImgAlt("");
  }

  if (!editor) return null;

  const btn = (
    label: string,
    action: () => void,
    active?: boolean,
    title?: string
  ) => (
    <button
      type="button"
      title={title ?? label}
      onClick={action}
      style={{
        padding: "4px 8px",
        borderRadius: 5,
        border: "none",
        background: active ? "rgba(255,107,53,0.18)" : "transparent",
        color: active ? "#FF6B35" : "rgba(255,255,255,0.7)",
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        lineHeight: 1.4,
        minWidth: 28,
      }}
    >
      {label}
    </button>
  );

  const sep = (
    <div
      style={{
        width: 1,
        height: 18,
        background: "rgba(255,255,255,0.1)",
        margin: "0 4px",
        flexShrink: 0,
      }}
    />
  );

  const headingLabel = editor.isActive("heading", { level: 1 })
    ? "H1"
    : editor.isActive("heading", { level: 2 })
    ? "H2"
    : editor.isActive("heading", { level: 3 })
    ? "H3"
    : "¶";

  function applyLink() {
    if (linkUrl.trim()) {
      editor
        ?.chain()
        .focus()
        .setLink({ href: linkUrl.trim() })
        .run();
    }
    setLinkOpen(false);
    setLinkUrl("");
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 2,
        padding: "6px 8px",
        background: "#13142A",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: "8px 8px 0 0",
        position: "sticky",
        top: 52,
        zIndex: 10,
      }}
    >
      {btn("B", () => editor.chain().focus().toggleBold().run(), editor.isActive("bold"), "Bold")}
      {btn("I", () => editor.chain().focus().toggleItalic().run(), editor.isActive("italic"), "Italic")}
      {btn("U", () => editor.chain().focus().toggleUnderline().run(), editor.isActive("underline"), "Underline")}
      {sep}

      {/* Heading dropdown */}
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setHeadingOpen((o) => !o)}
          style={{
            padding: "4px 8px",
            borderRadius: 5,
            border: "none",
            background: headingLabel !== "¶" ? "rgba(255,107,53,0.18)" : "transparent",
            color: headingLabel !== "¶" ? "#FF6B35" : "rgba(255,255,255,0.7)",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            gap: 3,
          }}
        >
          {headingLabel} <span style={{ fontSize: 9, opacity: 0.6 }}>▾</span>
        </button>
        {headingOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              background: "#1A1B2E",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              overflow: "hidden",
              zIndex: 100,
              minWidth: 120,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            }}
          >
            {[
              { label: "Paragraph", action: () => editor.chain().focus().setParagraph().run() },
              { label: "Heading 1", action: () => editor.chain().focus().toggleHeading({ level: 1 }).run() },
              { label: "Heading 2", action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
              { label: "Heading 3", action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => { item.action(); setHeadingOpen(false); }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "8px 14px",
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.8)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {sep}

      {/* Link */}
      <div style={{ position: "relative" }}>
        <button
          type="button"
          title="Insert link"
          onClick={() => setLinkOpen((o) => !o)}
          style={{
            padding: "4px 8px",
            borderRadius: 5,
            border: "none",
            background: editor.isActive("link") ? "rgba(255,107,53,0.18)" : "transparent",
            color: editor.isActive("link") ? "#FF6B35" : "rgba(255,255,255,0.7)",
            fontSize: 13,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          🔗
        </button>
        {linkOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 4px)",
              left: 0,
              background: "#1A1B2E",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: 10,
              zIndex: 100,
              display: "flex",
              gap: 6,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              minWidth: 260,
            }}
          >
            <input
              autoFocus
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyLink()}
              placeholder="https://..."
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 6,
                padding: "5px 8px",
                color: "#fff",
                fontSize: 12,
                fontFamily: "inherit",
                outline: "none",
              }}
            />
            <button
              type="button"
              onClick={applyLink}
              style={{
                padding: "5px 10px",
                borderRadius: 6,
                background: "#FF6B35",
                border: "none",
                color: "#fff",
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Set
            </button>
            {editor.isActive("link") && (
              <button
                type="button"
                onClick={() => { editor.chain().focus().unsetLink().run(); setLinkOpen(false); }}
                style={{
                  padding: "5px 8px",
                  borderRadius: 6,
                  background: "rgba(255,80,80,0.15)",
                  border: "none",
                  color: "#FF6B6B",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>

      {sep}

      {btn("≡", () => editor.chain().focus().toggleBulletList().run(), editor.isActive("bulletList"), "Bullet list")}
      {btn("1.", () => editor.chain().focus().toggleOrderedList().run(), editor.isActive("orderedList"), "Ordered list")}

      {sep}

      {btn("←", () => editor.chain().focus().setTextAlign("left").run(), editor.isActive({ textAlign: "left" }), "Align left")}
      {btn("—", () => editor.chain().focus().setTextAlign("center").run(), editor.isActive({ textAlign: "center" }), "Align center")}
      {btn("→", () => editor.chain().focus().setTextAlign("right").run(), editor.isActive({ textAlign: "right" }), "Align right")}

      {sep}

      {btn("❝", () => editor.chain().focus().toggleBlockquote().run(), editor.isActive("blockquote"), "Blockquote")}
      {btn("</>", () => editor.chain().focus().toggleCodeBlock().run(), editor.isActive("codeBlock"), "Code block")}
      {btn("—", () => editor.chain().focus().setHorizontalRule().run(), false, "Horizontal rule")}

      {sep}

      {/* Image insert */}
      <div style={{ position: "relative" }}>
        <input
          ref={imgFileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImgUpload(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          title="Insert image"
          onClick={() => setImgOpen((o) => !o)}
          style={{
            padding: "4px 8px",
            borderRadius: 5,
            border: "none",
            background: imgOpen ? "rgba(255,107,53,0.18)" : "transparent",
            color: imgOpen ? "#FF6B35" : "rgba(255,255,255,0.7)",
            fontSize: 14,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          🖼
        </button>
        {imgOpen && (
          <div style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            background: "#1A1B2E",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10,
            padding: 14,
            zIndex: 100,
            boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
            minWidth: 300,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}>
            {/* Upload button */}
            <button
              type="button"
              onClick={() => imgFileRef.current?.click()}
              style={{
                padding: "7px 12px",
                borderRadius: 7,
                border: "1px dashed rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.6)",
                fontSize: 12,
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "center",
              }}
            >
              {imgUploading ? "Uploading…" : "⬆ Upload image"}
            </button>

            {/* or paste URL */}
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center" }}>— or paste URL —</div>
            <input
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              placeholder="https://..."
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 6,
                padding: "6px 8px",
                color: "#fff",
                fontSize: 12,
                fontFamily: "inherit",
                outline: "none",
              }}
            />

            {/* Alt text */}
            <input
              value={imgAlt}
              onChange={(e) => setImgAlt(e.target.value)}
              placeholder="Alt text (for accessibility & SEO)"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 6,
                padding: "6px 8px",
                color: "#fff",
                fontSize: 12,
                fontFamily: "inherit",
                outline: "none",
              }}
            />

            {/* Preview */}
            {imgUrl && (
              <img
                src={imgUrl}
                alt={imgAlt}
                style={{ width: "100%", maxHeight: 120, objectFit: "cover", borderRadius: 6, border: "1px solid rgba(255,255,255,0.1)" }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={insertImage}
                disabled={!imgUrl.trim()}
                style={{
                  flex: 1,
                  padding: "7px 12px",
                  borderRadius: 7,
                  background: imgUrl.trim() ? "#FF6B35" : "rgba(255,255,255,0.1)",
                  border: "none",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: imgUrl.trim() ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                }}
              >
                Insert Image
              </button>
              <button
                type="button"
                onClick={() => { setImgOpen(false); setImgUrl(""); setImgAlt(""); }}
                style={{
                  padding: "7px 12px",
                  borderRadius: 7,
                  background: "rgba(255,255,255,0.07)",
                  border: "none",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 12,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Toggle switch ──────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", gap: 10 }}>
      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>{label}</span>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          background: checked ? "#FF6B35" : "rgba(255,255,255,0.12)",
          position: "relative",
          transition: "background .2s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 18 : 3,
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: "#fff",
            transition: "left .2s",
          }}
        />
      </div>
    </label>
  );
}

/* ─── Sidebar section heading ───────────────────────────────────────────── */
function SectionHeading({ label }: { label: string }) {
  return (
    <div style={{
      fontSize: 10,
      fontWeight: 700,
      color: "rgba(255,255,255,0.4)",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      padding: "12px 0 8px",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      marginBottom: 12,
    }}>
      {label}
    </div>
  );
}

/* ─── Label ─────────────────────────────────────────────────────────────── */
function FieldLabel({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.5)", marginBottom: 5 }}>
      {label}
    </div>
  );
}

/* ─── Input styles ───────────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 7,
  padding: "7px 10px",
  color: "#fff",
  fontSize: 12,
  fontFamily: "inherit",
  outline: "none",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 72,
};

/* ─── Main page ─────────────────────────────────────────────────────────── */
export default function NewBlogPostPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Post fields
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sidebar - General
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [publishDate, setPublishDate] = useState("");
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorBio, setAuthorBio] = useState("");
  const [authorAvatarUrl, setAuthorAvatarUrl] = useState("");
  const [authorLinkedinUrl, setAuthorLinkedinUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tldrPoints, setTldrPoints] = useState<string[]>([""]);
  const [featured, setFeatured] = useState(false);
  const [allowComments, setAllowComments] = useState(true);

  // Sidebar - Categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "categories" | "tags">("general");

  // Sidebar - Tags
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // SEO
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoSlug, setSeoSlug] = useState("");
  const [seoIndex, setSeoIndex] = useState(true);

  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start writing your post…" }),
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Underline,
      TextStyle,
      Color,
      Highlight,
      CharacterCount,
      Image,
    ],
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
  });

  // Fetch categories and authors
  useEffect(() => {
    fetch("/api/cms/blog/categories")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories ?? []));
    fetch("/api/cms/authors")
      .then((r) => r.json())
      .then((d) => setAuthors(d.authors ?? []));
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 80);
    setSeoSlug(slug);
  }, [title]);

  // Image upload handler
  const handleImageFile = useCallback(async (file: File) => {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/cms/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) {
        setFeaturedImageUrl(data.url);
        setFeaturedImage(data.url);
      }
    } catch {
      // fallback: base64 preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFeaturedImage(result);
        setFeaturedImageUrl(result);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingImage(false);
    }
  }, []);

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) handleImageFile(file);
    },
    [handleImageFile]
  );

  // Add tag
  function addTag(raw: string) {
    const cleaned = raw
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t && !tags.includes(t));
    if (cleaned.length) setTags((prev) => [...prev, ...cleaned]);
    setTagInput("");
  }

  // Save / publish
  async function save(targetStatus: "draft" | "published") {
    setError(null);
    const content = editor?.getHTML() ?? "";
    if (!title.trim()) { setError("Title is required"); return; }
    if (targetStatus === "published" && !content.trim()) {
      setError("Content is required to publish"); return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/cms/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          slug: seoSlug.trim(),
          content,
          excerpt,
          tldr_points: tldrPoints.map(p => p.trim()).filter(Boolean),
          featured_image_url: featuredImageUrl,
          author_id: authorId,
          author: authors.find((x) => x.id === authorId)?.name ?? "The NBT Team",
          author_bio: authorBio,
          author_avatar_url: authorAvatarUrl,
          author_linkedin_url: authorLinkedinUrl,
          category_id: categoryId,
          tags,
          status: targetStatus,
          featured,
          allow_comments: allowComments,
          publish_date: publishDate ? new Date(publishDate).toISOString() : null,
          seo_title: seoTitle,
          seo_description: seoDescription,
          seo_index: seoIndex,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to save"); return; }
      router.push("/cms/blog");
    } catch (e) {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  const googlePreviewTitle = seoTitle || title || "Post Title";
  const googlePreviewDesc = seoDescription || excerpt || "Post description will appear here…";
  const googlePreviewUrl = `https://www.nextbigtool.com/blog/${seoSlug || "post-slug"}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0D0E1F", color: "#fff", fontFamily: "inherit" }}>
      {/* Top bar */}
      <div style={{
        height: 52,
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "#0A0B1A",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}>
        {/* Left */}
        <a
          href="/cms/blog"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "rgba(255,255,255,0.55)",
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          ← Blog Posts
        </a>

        {/* Center status */}
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          padding: "3px 10px",
          borderRadius: 99,
          background: status === "published" ? "rgba(0,184,117,0.15)" : "rgba(255,255,255,0.08)",
          color: status === "published" ? "#00B875" : "rgba(255,255,255,0.45)",
          border: `1px solid ${status === "published" ? "rgba(0,184,117,0.3)" : "rgba(255,255,255,0.12)"}`,
          letterSpacing: "0.05em",
        }}>
          {status === "published" ? "Published" : "Draft"}
        </div>

        {/* Right buttons */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {error && (
            <span style={{ fontSize: 11, color: "#FF6B6B", maxWidth: 200, textAlign: "right" }}>{error}</span>
          )}
          <button
            type="button"
            onClick={() => save("draft")}
            disabled={saving}
            style={{
              padding: "7px 16px",
              borderRadius: 7,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "rgba(255,255,255,0.8)",
              fontSize: 12,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving…" : "Save Draft"}
          </button>
          <button
            type="button"
            onClick={() => save("published")}
            disabled={saving}
            style={{
              padding: "7px 16px",
              borderRadius: 7,
              background: "#FF6B35",
              border: "none",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              opacity: saving ? 0.6 : 1,
            }}
          >
            Publish
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Main editor area */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ maxWidth: 760, margin: "0 auto", width: "100%", padding: "32px 32px 80px" }}>
            {/* Title */}
            <div style={{ position: "relative", marginBottom: 20 }}>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 200))}
                placeholder="Add Title"
                maxLength={200}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "none",
                  borderBottom: "2px solid rgba(255,255,255,0.07)",
                  outline: "none",
                  fontSize: 32,
                  fontWeight: 800,
                  color: "#fff",
                  padding: "8px 0",
                  fontFamily: "inherit",
                  letterSpacing: "-0.02em",
                }}
              />
              <div style={{
                position: "absolute",
                top: 12,
                right: 0,
                fontSize: 10,
                color: "rgba(255,255,255,0.25)",
              }}>
                {title.length}/200
              </div>
            </div>

            {/* Toolbar */}
            <Toolbar editor={editor} />

            {/* Editor */}
            <div style={{
              background: "#13142A",
              border: "1px solid rgba(255,255,255,0.07)",
              borderTop: "none",
              borderRadius: "0 0 8px 8px",
              padding: "16px 20px",
              minHeight: 400,
            }}>
              <EditorContent editor={editor} />
            </div>

            {editor && (
              <div style={{ marginTop: 8, fontSize: 10, color: "rgba(255,255,255,0.25)", textAlign: "right" }}>
                {editor.storage.characterCount?.words?.() ?? 0} words
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{
          width: 340,
          flexShrink: 0,
          background: "#0A0B1A",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Post Settings */}
          <div style={{ padding: "16px 16px 0" }}>
            <SectionHeading label="Post Settings" />

            {/* Tabs */}
            <div style={{ display: "flex", gap: 2, marginBottom: 16, background: "rgba(255,255,255,0.04)", borderRadius: 8, padding: 3 }}>
              {(["general", "categories", "tags"] as const).map((tab) => {
                const count = tab === "categories" ? (categoryId ? 1 : 0) : tab === "tags" ? tags.length : null;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      padding: "5px 6px",
                      borderRadius: 6,
                      border: "none",
                      background: activeTab === tab ? "rgba(255,107,53,0.18)" : "transparent",
                      color: activeTab === tab ? "#FF6B35" : "rgba(255,255,255,0.45)",
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 4,
                      textTransform: "capitalize",
                    }}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {count !== null && count > 0 && (
                      <span style={{
                        fontSize: 9,
                        background: "#FF6B35",
                        color: "#fff",
                        borderRadius: 99,
                        padding: "1px 5px",
                        fontWeight: 700,
                      }}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* General tab */}
            {activeTab === "general" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Featured image */}
                <div>
                  <FieldLabel label="Featured Image" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFile(file);
                    }}
                  />
                  {featuredImage ? (
                    <div style={{ position: "relative" }}>
                      <img
                        src={featuredImage}
                        alt="Featured"
                        style={{
                          width: "100%",
                          height: 140,
                          objectFit: "cover",
                          borderRadius: 8,
                          display: "block",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => { setFeaturedImage(null); setFeaturedImageUrl(null); }}
                        style={{
                          position: "absolute",
                          top: 6,
                          right: 6,
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.6)",
                          border: "none",
                          color: "#fff",
                          fontSize: 12,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                      style={{
                        border: "2px dashed rgba(255,255,255,0.12)",
                        borderRadius: 8,
                        padding: "24px 16px",
                        textAlign: "center",
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.3)",
                        fontSize: 12,
                        transition: "border-color .15s",
                      }}
                    >
                      {uploadingImage ? (
                        <span>Uploading…</span>
                      ) : (
                        <>
                          <div style={{ fontSize: 22, marginBottom: 6 }}>+</div>
                          <div>Click or drag image here</div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Publish date */}
                <div>
                  <FieldLabel label="Publish Date" />
                  <input
                    type="datetime-local"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    style={{ ...inputStyle, colorScheme: "dark" }}
                  />
                  {!publishDate && (
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                      Defaults to now when published
                    </div>
                  )}
                </div>

                {/* Author */}
                <div>
                  <FieldLabel label="Writer" />
                  {authors.length === 0 ? (
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", padding: "6px 0" }}>
                      <a href="/cms/authors" style={{ color: "#FF6B35", textDecoration: "none", fontWeight: 600 }}>
                        Add an author first →
                      </a>
                    </div>
                  ) : (
                    <>
                      <select
                        value={authorId ?? ""}
                        onChange={(e) => setAuthorId(e.target.value || null)}
                        style={{ ...inputStyle, cursor: "pointer" }}
                      >
                        <option value="">— Select author —</option>
                        {authors.map((a) => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                      {authorId && (() => {
                        const a = authors.find((x) => x.id === authorId);
                        if (!a) return null;
                        return (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", background: "rgba(255,255,255,0.04)", borderRadius: 8, marginTop: 6 }}>
                            {a.avatar_url ? (
                              <img src={a.avatar_url} style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} alt={a.name} />
                            ) : (
                              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#FF6B35,#FF4500)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff" }}>
                                {a.name[0].toUpperCase()}
                              </div>
                            )}
                            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{a.name}</span>
                          </div>
                        );
                      })()}
                    </>
                  )}
                </div>

                {/* Excerpt */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
                    <FieldLabel label="Excerpt" />
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{excerpt.length}/500</span>
                  </div>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value.slice(0, 500))}
                    style={textareaStyle}
                    placeholder="Brief summary of this post…"
                  />
                </div>

                {/* TL;DR Points */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <FieldLabel label="TL;DR Points" />
                    <button
                      onClick={() => setTldrPoints(p => [...p, ""])}
                      style={{
                        fontSize: 11, fontWeight: 700, color: "#FF6B35",
                        background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.25)",
                        borderRadius: 6, padding: "3px 9px", cursor: "pointer", fontFamily: "inherit",
                      }}
                    >+ Add point</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {tldrPoints.map((pt, i) => (
                      <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#FF6B35", flexShrink: 0 }}>•</span>
                        <input
                          value={pt}
                          onChange={e => setTldrPoints(p => p.map((x, j) => j === i ? e.target.value : x))}
                          placeholder={`Point ${i + 1}…`}
                          style={{
                            flex: 1, padding: "6px 10px", borderRadius: 7,
                            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
                            color: "#fff", fontSize: 12, fontFamily: "inherit", outline: "none",
                          }}
                        />
                        {tldrPoints.length > 1 && (
                          <button
                            onClick={() => setTldrPoints(p => p.filter((_, j) => j !== i))}
                            style={{
                              background: "none", border: "none", color: "rgba(255,255,255,0.3)",
                              cursor: "pointer", fontSize: 14, padding: "0 4px", lineHeight: 1,
                            }}
                          >✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 6 }}>
                    Shown as a highlighted box at the top of the article.
                  </div>
                </div>

                {/* Toggles */}
                <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 4 }}>
                  <Toggle checked={featured} onChange={setFeatured} label="Feature this post" />
                  <Toggle checked={allowComments} onChange={setAllowComments} label="Allow commenting" />
                </div>
              </div>
            )}

            {/* Categories tab */}
            {activeTab === "categories" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {categories.length === 0 ? (
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", padding: "8px 0" }}>
                    Loading categories…
                  </div>
                ) : (
                  categories.map((cat) => (
                    <label
                      key={cat.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        padding: "6px 8px",
                        borderRadius: 6,
                        background: categoryId === cat.id ? "rgba(255,107,53,0.08)" : "transparent",
                        border: `1px solid ${categoryId === cat.id ? "rgba(255,107,53,0.2)" : "transparent"}`,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={categoryId === cat.id}
                        onChange={() => setCategoryId(categoryId === cat.id ? null : cat.id)}
                        style={{ accentColor: "#FF6B35" }}
                      />
                      <span style={{ fontSize: 12, color: categoryId === cat.id ? "#FF6B35" : "rgba(255,255,255,0.65)", fontWeight: 500 }}>
                        {cat.name}
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}

            {/* Tags tab */}
            {activeTab === "tags" && (
              <div>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === ",") {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    placeholder="Type tag, press Enter"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => addTag(tagInput)}
                    style={{
                      padding: "7px 10px",
                      borderRadius: 7,
                      background: "#FF6B35",
                      border: "none",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      fontFamily: "inherit",
                    }}
                  >
                    Add
                  </button>
                </div>
                {tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "3px 8px",
                          borderRadius: 99,
                          background: "rgba(255,107,53,0.12)",
                          border: "1px solid rgba(255,107,53,0.25)",
                          color: "#FF6B35",
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setTags((t) => t.filter((x) => x !== tag))}
                          style={{
                            background: "none",
                            border: "none",
                            color: "rgba(255,107,53,0.7)",
                            cursor: "pointer",
                            padding: 0,
                            fontSize: 12,
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {tags.length === 0 && (
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", padding: "4px 0" }}>
                    No tags yet. Add some above.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SEO Settings */}
          <div style={{ padding: "16px", marginTop: 8, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <SectionHeading label="SEO Settings" />

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <FieldLabel label="SEO Title" />
                <input
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || "Enter SEO title"}
                  style={inputStyle}
                />
              </div>

              <div>
                <FieldLabel label="Meta Description" />
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value.slice(0, 160))}
                  placeholder="Brief description for search engines…"
                  style={{ ...textareaStyle, minHeight: 60 }}
                />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", marginTop: 3, textAlign: "right" }}>
                  {seoDescription.length}/160
                </div>
              </div>

              <div>
                <FieldLabel label="URL Slug" />
                <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 7 }}>
                  <span style={{ padding: "7px 8px", color: "rgba(255,255,255,0.3)", fontSize: 11, whiteSpace: "nowrap", flexShrink: 0 }}>
                    /blog/
                  </span>
                  <input
                    value={seoSlug}
                    onChange={(e) => setSeoSlug(e.target.value)}
                    style={{
                      flex: 1,
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      color: "#fff",
                      fontSize: 12,
                      fontFamily: "inherit",
                      padding: "7px 8px 7px 0",
                    }}
                  />
                </div>
              </div>

              <Toggle checked={seoIndex} onChange={setSeoIndex} label="Index this post in search engines" />

              {/* Google preview */}
              <div>
                <FieldLabel label="Google Preview" />
                <div style={{
                  background: "#fff",
                  borderRadius: 8,
                  padding: "12px 14px",
                  fontSize: 12,
                }}>
                  <div style={{ color: "#1a0dab", fontSize: 16, fontWeight: 400, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {googlePreviewTitle.slice(0, 60)}
                  </div>
                  <div style={{ color: "#006621", fontSize: 12, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {googlePreviewUrl}
                  </div>
                  <div style={{ color: "#545454", fontSize: 13, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {googlePreviewDesc.slice(0, 160)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
