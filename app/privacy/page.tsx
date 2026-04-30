import type { Metadata } from "next";
import Link from "next/link";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import { BLOG_POSTS } from "@/app/lib/blog-posts";

export const metadata: Metadata = {
  title: "Privacy Policy — Next Big Tool",
  description: "Read the Next Big Tool privacy policy to understand how we collect, use, and protect your personal data.",
};

const SECTIONS = [
  { id: "information-we-collect",   label: "1. Information We Collect" },
  { id: "how-we-use",               label: "2. How We Use Your Information" },
  { id: "emails-notifications",     label: "3. Emails and Notifications" },
  { id: "data-storage",             label: "4. Data Storage and Security" },
  { id: "data-retention",           label: "5. Data Retention" },
  { id: "third-party",              label: "6. Third-Party Services" },
  { id: "cookies",                  label: "7. Cookies" },
  { id: "your-rights",              label: "8. Your Rights" },
  { id: "childrens-privacy",        label: "9. Children's Privacy" },
  { id: "changes",                  label: "10. Changes to This Policy" },
  { id: "contact",                  label: "11. Contact" },
];

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      style={{
        fontSize: 17, fontWeight: 800, color: "var(--ink)",
        margin: "36px 0 10px", letterSpacing: "-0.01em",
        scrollMarginTop: 80,
      }}
    >
      {children}
    </h2>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, margin: "0 0 16px" }}>
      {children}
    </p>
  );
}

export default function PrivacyPage() {
  const latestPosts = BLOG_POSTS.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      {/* ── HERO ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f0f10 0%, #1a1012 50%, #0f1318 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 70% at 30% 50%, rgba(255,107,53,0.10) 0%, transparent 70%)" }} />
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 24px 44px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(255,107,53,0.15)", color: "#FF6B35", border: "1px solid rgba(255,107,53,0.3)", letterSpacing: "0.05em" }}>
              LEGAL
            </span>
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 900, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>
            Last updated: <strong style={{ color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>April 2026</strong>
          </p>
        </div>
      </div>

      {/* ── 3-COLUMN LAYOUT ── */}
      <div style={{ flex: 1, maxWidth: 1160, margin: "0 auto", width: "100%", padding: "32px 24px 80px", boxSizing: "border-box" }}>
        <div className="legal-page-grid" style={{ display: "grid", gridTemplateColumns: "220px 1fr 260px", gap: 24, alignItems: "start" }}>

          {/* ── LEFT: Table of Contents ── */}
          <div className="legal-left-sidebar" style={{ position: "sticky", top: 80, display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ height: 3, background: "linear-gradient(90deg,#FF6B35,#ff3d88)" }} />
              <div style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--ink-muted)", marginBottom: 12 }}>
                  Table of Contents
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {SECTIONS.map((s) => (
                    <a key={s.id} href={`#${s.id}`} style={{
                      fontSize: 11.5, color: "var(--ink-muted)", textDecoration: "none",
                      padding: "5px 8px", borderRadius: 7,
                      fontWeight: 500, lineHeight: 1.35,
                      transition: "background 0.12s, color 0.12s",
                      display: "block",
                    }}
                      className="toc-link"
                    >
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Related legal */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--ink-muted)", marginBottom: 10 }}>
                Legal Documents
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {[
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Contact Us",        href: "/contact" },
                ].map(({ label, href }) => (
                  <Link key={label} href={href} style={{
                    fontSize: 12, color: "var(--ink-muted)", textDecoration: "none",
                    padding: "6px 8px", borderRadius: 7, fontWeight: 500,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }} className="toc-link">
                    {label}
                    <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── MAIN CONTENT ── */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "28px 32px" }}>
            <p style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.8, margin: "0 0 8px", borderBottom: "1px solid var(--border-faint)", paddingBottom: 20, marginBottom: 4 }}>
              This Privacy Policy explains how Next Big Tool ("we", "us", "our") collects, uses, stores, and protects your personal information when you use{" "}
              <a href="https://nextbigtool.com" style={{ color: "#FF6B35", textDecoration: "none", fontWeight: 500 }}>nextbigtool.com</a>
              {" "}(the "Platform"). By using the Platform, you agree to the practices described in this policy.
            </p>

            <SectionHeading id="information-we-collect">1. Information We Collect</SectionHeading>
            <Body>
              We collect information you provide directly when you create an account, submit a product, fill out a form, or contact us. This includes your name, email address, company name, job title, product details, and any other information you choose to share.
            </Body>
            <Body>
              We also collect information automatically when you use the Platform, including your IP address, browser type, device type, pages visited, time spent on pages, and referring URLs. This is collected through standard server logs and analytics tools.
            </Body>
            <Body>
              If you connect a third-party account such as Google for sign-in, we receive basic profile information from that provider according to their permissions.
            </Body>

            <SectionHeading id="how-we-use">2. How We Use Your Information</SectionHeading>
            <Body>
              We use your information to operate and improve the Platform, process your product submissions, send you account-related emails and notifications, respond to your enquiries, and prevent fraud or abuse.
            </Body>
            <Body>
              If you are a Core plan subscriber, we make certain profile information visible to founders whose products you have upvoted or followed — specifically your name, email address, company name, and designation. This is consent-based. You agree to this when you engage with a product on the Platform. You can withdraw this consent at any time from your account settings.
            </Body>
            <Body>
              We do not sell your personal data to third parties. We do not use your data for advertising purposes.
            </Body>

            <SectionHeading id="emails-notifications">3. Emails and Notifications</SectionHeading>
            <Body>
              When you create an account, you will receive transactional emails related to your account and submissions. You may also receive platform update emails. You can unsubscribe from non-essential emails at any time using the link in any email we send.
            </Body>
            <Body>
              If you subscribe to the Next Big Tool newsletter, your email is used solely for that purpose. You can unsubscribe at any time.
            </Body>

            <SectionHeading id="data-storage">4. Data Storage and Security</SectionHeading>
            <Body>
              Your data is stored using Supabase, a secure cloud database provider. We use industry-standard encryption for data in transit and at rest. We take reasonable technical and organisational measures to protect your data from unauthorised access, loss, or misuse.
            </Body>
            <Body>
              No method of transmission over the internet is 100% secure. While we take data security seriously, we cannot guarantee absolute security.
            </Body>

            <SectionHeading id="data-retention">5. Data Retention</SectionHeading>
            <Body>
              We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are legally required to retain it.
            </Body>

            <SectionHeading id="third-party">6. Third-Party Services</SectionHeading>
            <Body>
              We use the following third-party services to operate the Platform: Supabase (database and authentication), Vercel (hosting), Resend (transactional email), and Dodo Payments (payment processing). Each of these providers has their own privacy policy governing how they handle data.
            </Body>

            <SectionHeading id="cookies">7. Cookies</SectionHeading>
            <Body>
              We use essential cookies to keep you logged in and to maintain your session. We may use analytics cookies to understand how the Platform is used. You can control cookie settings through your browser.
            </Body>

            <SectionHeading id="your-rights">8. Your Rights</SectionHeading>
            <Body>
              You have the right to access the personal data we hold about you, request correction of inaccurate data, request deletion of your data, and withdraw consent for data processing where consent is the legal basis. To exercise any of these rights, email{" "}
              <a href="mailto:contact@nextbigtool.com" style={{ color: "#FF6B35", textDecoration: "none", fontWeight: 500 }}>contact@nextbigtool.com</a>.
            </Body>

            <SectionHeading id="childrens-privacy">9. Children&apos;s Privacy</SectionHeading>
            <Body>
              Next Big Tool is not intended for users under the age of 16. We do not knowingly collect personal data from anyone under 16. If you believe we have collected data from a minor, contact us immediately.
            </Body>

            <SectionHeading id="changes">10. Changes to This Policy</SectionHeading>
            <Body>
              We may update this Privacy Policy from time to time. We will notify registered users by email of any material changes. Continued use of the Platform after changes are posted constitutes acceptance of the updated policy.
            </Body>

            <SectionHeading id="contact">11. Contact</SectionHeading>
            <Body>
              For privacy-related questions, email{" "}
              <a href="mailto:contact@nextbigtool.com" style={{ color: "#FF6B35", textDecoration: "none", fontWeight: 500 }}>contact@nextbigtool.com</a>.
            </Body>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="legal-right-sidebar" style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 80 }}>

            {/* Quick contact */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px 0" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--ink-muted)", marginBottom: 12 }}>Quick Info</div>
              </div>
              <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Last Updated", value: "April 2026" },
                  { label: "Jurisdiction", value: "India" },
                  { label: "Min. Age", value: "16 years" },
                  { label: "Data Deletion", value: "Within 30 days" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <a href="mailto:contact@nextbigtool.com" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 0", borderRadius: 12, background: "#FF6B35", color: "#fff",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 16px rgba(255,107,53,0.3)",
            }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Contact Us
            </a>

            {/* Share */}
            <div style={{
              background: "linear-gradient(135deg, #0f0f10 0%, #1e1210 100%)",
              border: "1.5px solid rgba(255,107,53,0.35)",
              borderRadius: 16, padding: "16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.5)" }}>Share</span>
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "0 0 10px", lineHeight: 1.5 }}>
                Know a founder who should read this? Share the link.
              </p>
              <Link href="/terms" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "9px 0", borderRadius: 9,
                background: "rgba(255,107,53,0.15)", border: "1px solid rgba(255,107,53,0.3)",
                color: "#FF6B35", fontSize: 12, fontWeight: 700, textDecoration: "none",
              }}>
                View Terms of Service →
              </Link>
            </div>

            {/* Latest from Blog */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, background: "#fff7f4", border: "1px solid #ffe4d9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em" }}>Latest from Blog</span>
                </div>
                <Link href="/blog" style={{ fontSize: 10, fontWeight: 700, color: "#FF6B35", textDecoration: "none" }}>View all →</Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {latestPosts.map((post, i) => (
                  <Link key={post.slug} href="/blog" style={{ textDecoration: "none" }}>
                    <div style={{ paddingBottom: i < latestPosts.length - 1 ? 12 : 0, borderBottom: i < latestPosts.length - 1 ? "1px solid var(--border-faint)" : "none" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink)", lineHeight: 1.4, marginBottom: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>
                        {post.title}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--ink-faint)" }}>{post.date} · {post.readTime} read</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        .toc-link:hover { background: var(--surface-alt) !important; color: var(--ink) !important; }
        @media (max-width: 900px) {
          .legal-page-grid { grid-template-columns: 1fr !important; }
          .legal-left-sidebar, .legal-right-sidebar { position: static !important; }
        }
      `}</style>
    </div>
  );
}
