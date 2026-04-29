import Link from "next/link";
import NMark from "./NMark";

const PRODUCT_LINKS = [
  { label: "Browse Tools",    href: "/" },
  { label: "Submit a Tool",   href: "/dashboard/submit" },
  { label: "Pricing",         href: "/pricing" },
  { label: "Hall of Fame",    href: "/#hall-of-fame" },
  { label: "Weekly Digest",   href: "/#digest" },
];

const COMPANY_LINKS = [
  { label: "About",           href: "/about" },
  { label: "Blog",            href: "/blog" },
  { label: "Contact",         href: "/contact" },
  { label: "Privacy Policy",  href: "/privacy" },
  { label: "Terms of Service",href: "/terms" },
];

const SOCIAL_LINKS = [
  {
    label: "X / Twitter",
    href: "https://twitter.com/nextbigtool",
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/nextbigtool",
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "GitHub",
    href: "https://github.com/sohams270/nextbigtool",
    icon: (
      <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer
      className="site-footer"
      style={{
        background: "#0A0B1A",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        padding: "52px 40px 28px",
        marginTop: 64,
      }}
    >
      <div style={{ maxWidth: 1160, margin: "0 auto" }}>
        {/* Top row */}
        <div
          className="footer-grid"
          style={{
            marginBottom: 48,
          }}
        >
          {/* Brand col */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <NMark size={28} />
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 800,
                  color: "#fff",
                  letterSpacing: "-0.02em",
                }}
              >
                Next Big Tool
              </span>
            </div>
            <p
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.45)",
                lineHeight: 1.65,
                maxWidth: 240,
                margin: "0 0 20px",
              }}
            >
              Where indie founders launch and buyers discover the tools worth knowing about — before they go mainstream.
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: 10 }}>
              {SOCIAL_LINKS.map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "rgba(255,255,255,0.5)",
                    textDecoration: "none",
                    transition: "background 0.15s, color 0.15s",
                  }}
                  className="footer-social-btn"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Product col */}
          <div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                display: "block",
                marginBottom: 14,
              }}
            >
              Product
            </span>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {PRODUCT_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.55)",
                      textDecoration: "none",
                      fontWeight: 500,
                      transition: "color 0.15s",
                    }}
                    className="footer-link"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company col */}
          <div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                display: "block",
                marginBottom: 14,
              }}
            >
              Company
            </span>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {COMPANY_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.55)",
                      textDecoration: "none",
                      fontWeight: 500,
                      transition: "color 0.15s",
                    }}
                    className="footer-link"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter col */}
          <div>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                display: "block",
                marginBottom: 14,
              }}
            >
              Weekly Digest
            </span>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6, marginBottom: 12, marginTop: 0 }}>
              5 tools worth checking this week. No spam.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <input
                type="email"
                placeholder="you@founder.co"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 7,
                  padding: "8px 10px",
                  fontSize: 11,
                  color: "#fff",
                  outline: "none",
                  fontFamily: "inherit",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
              <button
                style={{
                  background: "#FF6B35",
                  border: "none",
                  borderRadius: 7,
                  padding: "8px 0",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#fff",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  width: "100%",
                  transition: "opacity 0.15s",
                }}
                className="footer-subscribe-btn"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 20 }} />

        {/* Bottom row */}
        <div
          className="footer-bottom-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
            © {new Date().getFullYear()} Next Big Tool. All rights reserved.
          </span>
          <div style={{ display: "flex", gap: 20 }}>
            {[
              { label: "Privacy", href: "/privacy" },
              { label: "Terms",   href: "/terms" },
              { label: "Contact", href: "/contact" },
            ].map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.25)",
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                className="footer-link"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .footer-link:hover { color: rgba(255,255,255,0.85) !important; }
        .footer-social-btn:hover { background: rgba(255,107,53,0.2) !important; color: #FF6B35 !important; border-color: rgba(255,107,53,0.4) !important; }
        .footer-subscribe-btn:hover { opacity: 0.88; }
      `}</style>
    </footer>
  );
}
