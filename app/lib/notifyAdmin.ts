/**
 * Fire-and-forget admin notification.
 * Calls /api/notify-admin — errors are swallowed so they never break the UX.
 */
export function notifyAdmin(payload: Record<string, string>) {
  fetch("/api/notify-admin", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-internal-secret": process.env.NEXT_PUBLIC_NOTIFY_KEY ?? "",
    },
    body: JSON.stringify(payload),
  }).catch(() => {}); // silent — never block the user flow
}
