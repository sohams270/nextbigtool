"use client";

import { useEffect } from "react";

export default function ViewTracker({ toolId }: { toolId: string }) {
  useEffect(() => {
    fetch(`/api/view/${toolId}`, { method: "POST" }).catch(() => {/* silently ignore */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
