import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

function checkAuth(request: NextRequest): boolean {
  const session = request.cookies.get("cms_session");
  return !!session && session.value.trim() !== "";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("cms_authors")
    .select("id, name, bio, linkedin_url, avatar_url, created_at")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json({ author: data });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const supabase = createAdminClient();

  const updates: Record<string, string> = { updated_at: new Date().toISOString() };
  if (body.name !== undefined) updates.name = (body.name ?? "").trim();
  if (body.bio !== undefined) updates.bio = body.bio ?? "";
  if (body.linkedin_url !== undefined) updates.linkedin_url = body.linkedin_url ?? "";
  if (body.avatar_url !== undefined) updates.avatar_url = body.avatar_url ?? "";

  if (updates.name === "") {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("cms_authors")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ author: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("cms_authors")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
