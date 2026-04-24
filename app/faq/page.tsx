"use client";

import { useState } from "react";
import TopNav from "../components/TopNav";

const FAQS = [
  {
    section: "Submitting a Tool",
    items: [
      {
        q: "Who can submit a tool?",
        a: "Anyone can submit a tool — founders, makers, developers, or product teams. You need a free account to submit.",
      },
      {
        q: "How long does the review process take?",
        a: "Most tools are reviewed within 24–48 hours. We check for quality, relevance, and that the tool is live and functional. You'll get an email once approved.",
      },
      {
        q: "Can I submit a tool that's not yet launched?",
        a: "Yes! You can submit as a 'coming soon' or early-access tool. Just be upfront in your description about the current stage.",
      },
      {
        q: "What categories can my tool be listed under?",
        a: "AI Tools, Developer, Marketing, Design, Productivity, Finance, No-code, Analytics, and more. You can select multiple relevant categories.",
      },
    ],
  },
  {
    section: "Pricing & Plans",
    items: [
      {
        q: "What's included in the free plan?",
        a: "The free plan lets you list 1 product, get basic analytics (upvotes + views), a public profile, and newsletter distribution.",
      },
      {
        q: "What does the Basic plan include?",
        a: "Basic ($29 one-time per product) adds a 48h featured placement on launch, build-in-public posts, re-launch option, Hall of Fame eligibility, and priority review.",
      },
      {
        q: "What is the Core plan?",
        a: "Core ($79/month) gives you everything in Basic plus unlimited products, the Founder CRM (see who upvoted), one follow-up per interested user, and weekly digest placement.",
      },
      {
        q: "Do you offer refunds?",
        a: "Yes. We offer a 7-day refund for Basic purchases. Core is month-to-month and you can cancel anytime.",
      },
    ],
  },
  {
    section: "Build in Public Wall",
    items: [
      {
        q: "Who can post on the Build in Public Wall?",
        a: "Only founders with at least one approved tool on the platform can post to the wall. This keeps the content high-signal.",
      },
      {
        q: "What can I post about?",
        a: "Milestones (MRR, users, downloads), product updates, funding announcements, and launch news. Keep it relevant to your product.",
      },
      {
        q: "Can anyone comment or like posts?",
        a: "Yes — any signed-in user can like and comment on posts, even if they haven't submitted a tool.",
      },
    ],
  },
  {
    section: "Upvoting",
    items: [
      {
        q: "Do I need an account to upvote?",
        a: "Yes, you need a free account to upvote. This prevents gaming and keeps rankings meaningful.",
      },
      {
        q: "Can I upvote my own tool?",
        a: "No. Self-upvoting is blocked to keep the rankings honest.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{ borderBottom: "1px solid #F5F5F5", cursor: "pointer" }}
      onClick={() => setOpen((v) => !v)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0" }}>
        <span style={{ fontSize: 12, fontWeight: 600 }}>{q}</span>
        <span style={{ fontSize: 16, color: "#6B6B70", flexShrink: 0, marginLeft: 16 }}>{open ? "−" : "+"}</span>
      </div>
      {open && (
        <p style={{ fontSize: 11.5, color: "#6B6B70", lineHeight: 1.65, margin: "0 0 14px", paddingRight: 24 }}>
          {a}
        </p>
      )}
    </div>
  );
}

export default function FaqPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", background: "#F5F5F5" }}>
      <TopNav />

      <div style={{ background: "#0A0B1A", color: "#fff", padding: "44px 32px 36px", textAlign: "center" }}>
        <h1 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 8px" }}>Frequently Asked Questions</h1>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", margin: 0 }}>
          Everything you need to know about Next Big Tool.
        </p>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px 32px", width: "100%" }}>
        {FAQS.map((section) => (
          <div key={section.section} style={{ background: "#fff", border: "1px solid #CFCFD4", borderRadius: 10, padding: "4px 20px 4px", marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "#FF6B35", padding: "16px 0 4px" }}>
              {section.section}
            </div>
            {section.items.map((item) => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        ))}

        <div style={{ background: "#0A0B1A", borderRadius: 10, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Still have questions?</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>We're happy to help. Reach out anytime.</div>
          </div>
          <button style={{ background: "#FF6B35", color: "#fff", border: "none", borderRadius: 7, padding: "9px 18px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
            Contact Us →
          </button>
        </div>
      </div>
    </div>
  );
}
