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
      const { data } = await client
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", userId)
        .single();
      if (data && data.onboarding_completed === false) {
        setUserId(userId);
        setUserEmail(email);
        setShow(true);
      }
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
