"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import OnboardingModal from "./OnboardingModal";

export default function OnboardingGate() {
  const [show, setShow] = useState(false);
  const [userId, setUserId] = useState("");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const client = createClient();

    async function check(userId: string, email: string) {
      // Always query the DB — localStorage is only used to avoid
      // re-showing after a confirmed complete profile, but we still
      // verify the DB so stale flags never let incomplete profiles through.
      const { data, error } = await client
        .from("profiles")
        .select("full_name, username, company, role")
        .eq("id", userId)
        .single();

      // Query error (e.g. no row yet) → treat as new user, show modal
      if (error || !data) {
        localStorage.removeItem(`nbt_ob_done_${userId}`);
        setUserId(userId);
        setUserEmail(email);
        setShow(true);
        return;
      }

      // All mandatory fields filled → profile complete
      const fullName = (data.full_name ?? "").trim();
      const [first, ...rest] = fullName.split(" ");
      const lastName = rest.join(" ").trim();
      if (first && lastName && data.username && data.company && data.role) {
        localStorage.setItem(`nbt_ob_done_${userId}`, "1");
        return;
      }

      // Incomplete profile → clear stale flag and show onboarding
      localStorage.removeItem(`nbt_ob_done_${userId}`);
      setUserId(userId);
      setUserEmail(email);
      setShow(true);
    }

    client.auth.getUser().then(({ data: { user } }) => {
      if (user) check(user.id, user.email ?? "");
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (session?.user) check(session.user.id, session.user.email ?? "");
      else setShow(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!show || !userId) return null;

  return (
    <OnboardingModal
      userId={userId}
      userEmail={userEmail}
      onComplete={() => {
        // Only set the flag after a confirmed successful save (handleComplete already verified)
        localStorage.setItem(`nbt_ob_done_${userId}`, "1");
        setShow(false);
      }}
    />
  );
}
