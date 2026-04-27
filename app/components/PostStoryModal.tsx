"use client";

import Link from "next/link";
import Btn from "./Btn";
import NMark from "./NMark";

export default function PostStoryModal({ onClose }: { onClose: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(10,11,26,0.55)",
          zIndex: 1000,
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1001,
          background: "var(--surface)",
          borderRadius: 14,
          padding: "36px 40px",
          width: 400,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          textAlign: "center",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14, right: 16,
            background: "none", border: "none",
            fontSize: 18, color: "var(--ink-muted)",
            cursor: "pointer", lineHeight: 1, padding: 4,
          }}
        >
          ✕
        </button>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <NMark size={34} />
        </div>

        {/* Step indicators */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 24 }}>
          {["Sign Up", "Submit Tool", "Post on Wall"].map((step, i) => (
            <div key={step} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: 28, height: 28,
                    borderRadius: "50%",
                    background: i === 0 ? "#FF6B35" : "var(--surface-alt)",
                    border: `2px solid ${i === 0 ? "#FF6B35" : "var(--border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                    color: i === 0 ? "#fff" : "#A8A8AD",
                    margin: "0 auto 4px",
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: 9, fontWeight: 600, color: i === 0 ? "#FF6B35" : "#A8A8AD", whiteSpace: "nowrap" }}>
                  {step}
                </div>
              </div>
              {i < 2 && (
                <div style={{ width: 32, height: 1, background: "var(--border)", margin: "0 4px", marginBottom: 16 }} />
              )}
            </div>
          ))}
        </div>

        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>
          Share Your Build in Public Story
        </div>

        <div
          style={{
            background: "rgba(255,107,53,0.08)",
            border: "1px solid rgba(255,107,53,0.2)",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontSize: 12,
            color: "var(--ink)",
            lineHeight: 1.6,
            textAlign: "left",
          }}
        >
          <strong>You'll be eligible to post on this wall once you submit your product.</strong>
          {" "}Sign up, then submit your tool — after that you can share milestones, funding news, and updates directly with 8,400+ builders and buyers.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Link href="/auth/login?next=/dashboard/submit" onClick={onClose}>
            <Btn variant="primary" size="md" full>Create Account & Submit Tool</Btn>
          </Link>
          <Link href="/auth/login" onClick={onClose}>
            <Btn variant="ghost" size="md" full>Already have an account? Sign In</Btn>
          </Link>
        </div>

        <div style={{ fontSize: 10, color: "var(--ink-muted)", marginTop: 16 }}>
          Like and comment on posts — free for all signed-in members.
        </div>
      </div>
    </>
  );
}
