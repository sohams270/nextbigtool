import type { Metadata } from "next";
import Link from "next/link";
import TopNav from "@/app/components/TopNav";
import Footer from "@/app/components/Footer";
import { BLOG_POSTS } from "@/app/lib/blog-posts";

export const metadata: Metadata = {
  title: "Terms of Service | NextBigTool",
  description: "Review the terms of service for using NextBigTool, the indie product launch and discovery platform.",
};

const SECTIONS = [
  { id: "eligibility",        label: "1. Eligibility" },
  { id: "accounts",           label: "2. Accounts" },
  { id: "product-submissions",label: "3. Product Submissions" },
  { id: "acceptable-use",     label: "4. Acceptable Use" },
  { id: "founder-crm",        label: "5. Founder CRM and Messaging" },
  { id: "payments",           label: "6. Payments and Refunds" },
  { id: "press-release",      label: "7. Press Release" },
  { id: "intellectual-property", label: "8. Intellectual Property" },
  { id: "disclaimers",        label: "9. Disclaimers" },
  { id: "liability",          label: "10. Limitation of Liability" },
  { id: "termination",        label: "11. Termination" },
  { id: "changes",            label: "12. Changes to These Terms" },
  { id: "governing-law",      label: "13. Governing Law" },
  { id: "contact",            label: "14. Contact" },
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

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ margin: "0 0 16px", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map((item, i) => (
        <li key={i} style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.7 }}>{item}</li>
      ))}
    </ul>
  );
}

export default function TermsPage() {
  const latestPosts = BLOG_POSTS.slice(0, 3);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "var(--bg)" }}>
      <TopNav />

      {/* ── HERO ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f0f10 0%, #12101a 50%, #0f1318 100%)",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 60% 70% at 70% 50%, rgba(59,127,255,0.10) 0%, transparent 70%)" }} />
        <div style={{ maxWidth: 1160, margin: "0 auto", padding: "40px 24px 44px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: "rgba(59,127,255,0.15)", color: "#3B7FFF", border: "1px solid rgba(59,127,255,0.3)", letterSpacing: "0.05em" }}>
              LEGAL
            </span>
          </div>
          <h1 style={{ fontSize: 38, fontWeight: 900, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Terms of Service
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
              <div style={{ height: 3, background: "linear-gradient(90deg,#3B7FFF,#8B5CF6)" }} />
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
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Contact Us",     href: "/contact" },
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
              These Terms of Service ("Terms") govern your access to and use of{" "}
              <a href="https://nextbigtool.com" style={{ color: "#3B7FFF", textDecoration: "none", fontWeight: 500 }}>nextbigtool.com</a>
              {" "}("Platform"), operated by Next Big Tool ("we", "us", "our"). By creating an account or using the Platform, you agree to these Terms.
            </p>

            <SectionHeading id="eligibility">1. Eligibility</SectionHeading>
            <Body>
              You must be at least 16 years old to use the Platform. By creating an account, you confirm that the information you provide is accurate and that you have the authority to agree to these Terms on behalf of yourself or any organisation you represent.
            </Body>

            <SectionHeading id="accounts">2. Accounts</SectionHeading>
            <Body>
              You are responsible for maintaining the security of your account credentials. You must not share your account with others or allow others to access the Platform through your credentials. We reserve the right to suspend or terminate accounts that violate these Terms.
            </Body>

            <SectionHeading id="product-submissions">3. Product Submissions</SectionHeading>
            <Body>
              When you submit a product to the Platform, you confirm that you are the founder, owner, or an authorised representative of that product. You agree not to submit products you do not own or have permission to represent. Submitting a product you are not affiliated with will result in permanent account suspension.
            </Body>
            <Body>
              You grant us a non-exclusive, royalty-free licence to display your product name, description, logo, screenshots, and other submitted materials on the Platform for the purpose of operating the discovery feed.
            </Body>
            <Body>
              We reserve the right to review, approve, reject, or remove any listing at our discretion. We are not obligated to publish every submission.
            </Body>

            <SectionHeading id="acceptable-use">4. Acceptable Use</SectionHeading>
            <Body>You agree not to use the Platform to:</Body>
            <BulletList items={[
              "Submit spam, misleading, or fraudulent product listings.",
              "Attempt to manipulate the upvote system, including through the use of bots, fake accounts, or vote-exchange schemes.",
              "Harass or abuse other users through any Platform feature, including the Founder CRM messaging function.",
              "Scrape or systematically extract data from the Platform without prior written permission.",
            ]} />

            <SectionHeading id="founder-crm">5. Founder CRM and Messaging</SectionHeading>
            <Body>
              The Founder CRM feature available to Core plan subscribers allows you to see the profile information of users who have engaged with your product, and to send one follow-up message to each. This feature is intended for legitimate founder-to-potential-customer outreach only.
            </Body>
            <Body>
              Sending spam, unsolicited promotional content unrelated to your listed product, or abusive messages is a violation of these Terms and will result in immediate account suspension.
            </Body>
            <Body>
              Users consent to sharing their profile information with founders when they upvote or follow a product on the Platform. Users can withdraw this consent at any time through their account settings.
            </Body>

            <SectionHeading id="payments">6. Payments and Refunds</SectionHeading>
            <Body>
              The Core plan is a recurring subscription billed monthly or yearly via Dodo Payments. You can cancel your subscription at any time from your account dashboard. Cancellation takes effect at the end of the current billing period.
            </Body>
            <Body>
              We offer a 7-day money-back guarantee on Core plan payments. To request a refund within 7 days of payment, email{" "}
              <a href="mailto:contact@nextbigtool.com" style={{ color: "#3B7FFF", textDecoration: "none", fontWeight: 500 }}>contact@nextbigtool.com</a>.
            </Body>
            <Body>
              We reserve the right to change pricing at any time. Existing subscribers will be given at least 30 days notice before any price change takes effect.
            </Body>

            <SectionHeading id="press-release">7. Press Release</SectionHeading>
            <Body>
              Core plan subscribers receive one professionally written and distributed press release. This press release will be written based on information you provide about your product. You are responsible for ensuring the accuracy of the information you provide. We reserve the right to decline to publish press releases that contain false, misleading, or harmful content.
            </Body>

            <SectionHeading id="intellectual-property">8. Intellectual Property</SectionHeading>
            <Body>
              All content on the Platform created by us — including design, copy, code, and branding — is owned by Next Big Tool and may not be copied or reproduced without written permission. You retain ownership of all content you submit to the Platform.
            </Body>

            <SectionHeading id="disclaimers">9. Disclaimers</SectionHeading>
            <Body>
              The Platform is provided "as is" without warranties of any kind. We do not guarantee that the Platform will be available at all times, free of errors, or that any particular result will be achieved from using it. We are not responsible for the accuracy of product listings submitted by third parties.
            </Body>

            <SectionHeading id="liability">10. Limitation of Liability</SectionHeading>
            <Body>
              To the maximum extent permitted by law, Next Big Tool shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform, even if we have been advised of the possibility of such damages.
            </Body>

            <SectionHeading id="termination">11. Termination</SectionHeading>
            <Body>
              We reserve the right to suspend or terminate your account at any time, with or without notice, for violations of these Terms or for any other reason at our discretion. Upon termination, your access to the Platform and your dashboard will be revoked.
            </Body>

            <SectionHeading id="changes">12. Changes to These Terms</SectionHeading>
            <Body>
              We may update these Terms from time to time. We will notify registered users by email of material changes. Continued use of the Platform after changes are posted constitutes acceptance of the updated Terms.
            </Body>

            <SectionHeading id="governing-law">13. Governing Law</SectionHeading>
            <Body>
              These Terms are governed by the laws of India. Any disputes arising from these Terms shall be subject to the jurisdiction of the courts of Bangalore, India.
            </Body>

            <SectionHeading id="contact">14. Contact</SectionHeading>
            <Body>
              For questions about these Terms, email{" "}
              <a href="mailto:contact@nextbigtool.com" style={{ color: "#3B7FFF", textDecoration: "none", fontWeight: 500 }}>contact@nextbigtool.com</a>.
            </Body>
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <div className="legal-right-sidebar" style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 80 }}>

            {/* Quick info */}
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, overflow: "hidden" }}>
              <div style={{ padding: "14px 16px 0" }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "var(--ink-muted)", marginBottom: 12 }}>Quick Info</div>
              </div>
              <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Last Updated",  value: "April 2026" },
                  { label: "Governing Law", value: "India" },
                  { label: "Min. Age",      value: "16 years" },
                  { label: "Refund Window", value: "7 days" },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: "var(--ink-muted)", fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--ink)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact CTA */}
            <a href="mailto:contact@nextbigtool.com" style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              padding: "11px 0", borderRadius: 12, background: "#3B7FFF", color: "#fff",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 16px rgba(59,127,255,0.3)",
            }}>
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              Contact Us
            </a>

            {/* Share / cross-link */}
            <div style={{
              background: "linear-gradient(135deg, #0f0f10 0%, #101220 100%)",
              border: "1.5px solid rgba(59,127,255,0.3)",
              borderRadius: 16, padding: "16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="#3B7FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
                <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" as const, color: "rgba(255,255,255,0.5)" }}>Also Read</span>
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "0 0 10px", lineHeight: 1.5 }}>
                Review our privacy practices and how we protect your data.
              </p>
              <Link href="/privacy" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "9px 0", borderRadius: 9,
                background: "rgba(59,127,255,0.15)", border: "1px solid rgba(59,127,255,0.3)",
                color: "#3B7FFF", fontSize: 12, fontWeight: 700, textDecoration: "none",
              }}>
                View Privacy Policy →
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
