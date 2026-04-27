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
      // Only query columns that are guaranteed to exist.
      // We infer "onboarding done" from mandatory fields being filled rather
      // than relying on an onboarding_completed column that may not exist yet.
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
      if (first && lastName && data.username && data.company && data.role) return;

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
      onComplete={() => setShow(false)}
    />
  );
}
