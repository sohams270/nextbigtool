import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Verify the caller is authenticated
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const {
      full_name, username, company, role,
      bio, website_url, twitter_url, linkedin_url,
    } = body;

    // Basic server-side validation
    if (!full_name?.trim())  return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    if (!username?.trim())   return NextResponse.json({ error: "Username is required." }, { status: 400 });
    if (!company?.trim())    return NextResponse.json({ error: "Company is required." }, { status: 400 });
    if (!role?.trim())       return NextResponse.json({ error: "Role is required." }, { status: 400 });
    if (!/^[a-z0-9_]{2,30}$/.test(username.trim())) {
      return NextResponse.json({ error: "Username: 2–30 chars, lowercase letters, numbers, underscores only." }, { status: 400 });
    }

    // Check username uniqueness (ignore current user's own row)
    const { data: taken } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username.trim().toLowerCase())
      .neq("id", user.id)
      .maybeSingle();

    if (taken) {
      return NextResponse.json({ error: "That username is already taken. Please go back and choose another." }, { status: 409 });
    }

    const payload = {
      full_name:    full_name.trim(),
      username:     username.trim().toLowerCase(),
      company:      company.trim(),
      role:         role.trim(),
      bio:          bio?.trim() || null,
      website_url:  website_url?.trim() || null,
      twitter_url:  twitter_url?.trim() || null,
      linkedin_url: linkedin_url?.trim() || null,
    };

    // Try UPDATE first (guaranteed by RLS — same as the profile page)
    const { data: updated, error: updateErr } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", user.id)
      .select("id");

    if (updateErr) {
      console.error("[profile/save] update error:", updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    // If no row existed, create one via INSERT
    if (!updated || updated.length === 0) {
      const { error: insertErr } = await supabase
        .from("profiles")
        .insert({ id: user.id, ...payload });

      if (insertErr) {
        console.error("[profile/save] insert error:", insertErr);
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[profile/save] unexpected error:", err);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
