"use client";

import { useState } from "react";
import AuthModal from "./AuthModal";

export default function AuthTriggerButton({
  children,
  title = "Launch your product",
  subtitle = "Sign up in seconds and submit your tool to thousands of early adopters.",
  style,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowAuth(true)}
        style={style}
        className={className}
      >
        {children}
      </button>
      {showAuth && (
        <AuthModal
          title={title}
          subtitle={subtitle}
          onClose={() => setShowAuth(false)}
        />
      )}
    </>
  );
}
