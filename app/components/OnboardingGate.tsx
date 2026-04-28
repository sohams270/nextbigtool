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
      // ── Fast-path: once the user completes onboarding we store a flag in
      //    localStorage so auth-state re-fires never re-show the modal.
      if (localStorage.getItem(`nbt_ob_done_${userId}`) === "1") return;

      const { data, error } = await client
        .from("profiles")
        .select("full_name, username, company, role")
        .eq("id", userId)
        .single();

      // Query error (e.g. no row yet) → treat as new user, show modal
      if (error || !data) {
        setUserId(userId);
        setUserEmail(email);
        setShow(true);
        return;
      }

      // All mandatory fields filled → profile already complete, skip
      const fullName = (data.full_name ?? "").trim();
      const [first, ...rest] = fullName.split(" ");
      const lastName = rest.join(" ").trim();
      if (first && lastName && data.username && data.company && data.role) {
        // Mark done so we never query again for this user on this device
        localStorage.setItem(`nbt_ob_done_${userId}`, "1");
        return;
      }

      // Incomplete profile → show onboarding
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
        // Lock out re-shows for this user on this device
        localStorage.setItem(`nbt_ob_done_${userId}`, "1");
        setShow(false);
      }}
    />
  );
}
