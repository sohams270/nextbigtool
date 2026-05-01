"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import nodemailer from "nodemailer";

/* ─── Server-side admin email notification ──────────────────────────────── */
export async function sendAdminNotification(payload: {
  type: "tool_submission" | "hof_nomination";
  toolName: string;
  tagline?: string;
  plan?: string;
  website?: string;
  contactEmail?: string;
  founderName?: string;
  pitch?: string;
}) {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.zoho.in",
      port: 465,
      secure: true,
      auth: { user: process.env.ZOHO_EMAIL, pass: process.env.ZOHO_PASSWORD },
    });

    const isToolSubmission = payload.type === "tool_submission";
    const emoji   = isToolSubmission ? "🛠️" : "🏆";
    const label   = isToolSubmission ? "New Tool Submission" : "Hall of Fame Nomination";
    const color   = isToolSubmission ? "#FF6B35" : "#F59E0B";
    const subject = isToolSubmission
      ? `🛠️ New tool submitted: ${payload.toolName}`
      : `🏆 HoF nomination: ${payload.toolName}`;

    const rows = isToolSubmission ? `
      <tr><td style="padding:10px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;width:36%">Tool</td><td style="padding:10px 16px;font-size:13px;color:#fff">${payload.toolName}</td></tr>
      <tr><td style="padding:10px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase">Tagline</td><td style="padding:10px 16px;font-size:13px;color:#fff">${payload.tagline ?? "—"}</td></tr>
      <tr><td style="padding:10px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase">Plan</td><td style="padding:10px 16px;font-size:13px;color:#fff">${payload.plan ?? "free"}</td></tr>
      <tr><td style="padding:10px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase">Website</td><td style="padding:10px 16px;font-size:13px;color:#fff"><a href="${payload.website}" style="color:${color}">${payload.website}</a></td></tr>
      <tr><td style="padding:10px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase">Contact</td><td style="padding:10px 16px;font-size:13px;color:#fff">${payload.contactEmail ?? "—"}</td></tr>
      <tr><td style="padding:10px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase">Founder</td><td style="padding:10px 16px;font-size:13px;color:#fff">${payload.founderName ?? "—"}</td></tr>
    ` : `
      <tr><td style="padding:10px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase;width:36%">Tool</td><td style="padding:10px 16px;font-size:13px;color:#fff">${payload.toolName}</td></tr>
      <tr><td style="padding:10px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase">Founder</td><td style="padding:10px 16px;font-size:13px;color:#fff">${payload.founderName ?? "—"}</td></tr>
      <tr><td style="padding:10px 16px;font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);text-transform:uppercase">Pitch</td><td style="padding:10px 16px;font-size:13px;color:#fff">${payload.pitch ?? "—"}</td></tr>
    `;

    const html = `
      <div style="font-family:sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;background:#0A0B1A;color:#fff;border-radius:12px;">
        <div style="margin-bottom:20px;">
          <div style="display:inline-block;background:${color}22;border:1px solid ${color}66;border-radius:99px;padding:4px 12px;font-size:11px;font-weight:700;color:${color};letter-spacing:0.06em;text-transform:uppercase;">
            ${emoji} ${label}
          </div>
        </div>
        <h1 style="font-size:20px;font-weight:800;margin:0 0 6px;letter-spacing:-0.02em;">Action required in your admin panel</h1>
        <p style="font-size:13px;color:rgba(255,255,255,0.45);margin:0 0 24px;">
          ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" })} IST
        </p>
        <table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.05);border-radius:10px;overflow:hidden;margin-bottom:24px;">${rows}</table>
        <a href="https://www.nextbigtool.com/admin" style="display:inline-block;padding:10px 24px;background:${color};color:#fff;border-radius:99px;font-size:12px;font-weight:700;text-decoration:none;">
          Review in Admin Panel →
        </a>
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.07);font-size:11px;color:rgba(255,255,255,0.25);">
          Automated alert from Next Big Tool.
        </div>
      </div>`;

    await transporter.sendMail({
      from: `"NBT Alerts" <${process.env.ZOHO_EMAIL}>`,
      to: "soham@nextbigtool.com",
      subject,
      html,
    });
  } catch (err) {
    // Never block the user flow — just log
    console.error("[sendAdminNotification] failed:", err);
  }
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "sohams270@gmail.com";

async function getAdminUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== ADMIN_EMAIL) throw new Error("Unauthorized");
  // Return admin client for writes — bypasses RLS so updates always land
  return { user, supabase: createAdminClient() };
}

export async function approveTool(toolId: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("tools").update({ status: "approved" }).eq("id", toolId);
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function rejectTool(toolId: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("tools").update({ status: "rejected" }).eq("id", toolId);
  revalidatePath("/admin");
}

export async function approveSubmission(submissionId: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("newsletter_submissions").update({ status: "approved" }).eq("id", submissionId);
  revalidatePath("/admin");
}

export async function rejectSubmission(submissionId: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("newsletter_submissions").update({ status: "rejected" }).eq("id", submissionId);
  revalidatePath("/admin");
}

export async function approveBlogRequest(requestId: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("blog_post_requests").update({ status: "approved" }).eq("id", requestId);
  revalidatePath("/admin");
}

export async function rejectBlogRequest(requestId: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("blog_post_requests").update({ status: "rejected" }).eq("id", requestId);
  revalidatePath("/admin");
}

export async function inductHofNomination(nominationId: string) {
  const { supabase } = await getAdminUser();

  // 1. Mark nomination as approved
  const { data: hofRow, error } = await supabase
    .from("hall_of_fame")
    .update({ status: "approved", inducted_at: new Date().toISOString() })
    .eq("id", nominationId)
    .select("tool_id")
    .single();

  if (error) {
    console.error("[inductHofNomination] hof error:", JSON.stringify(error));
    throw new Error(error.message);
  }

  // 2. Also mark the tool as featured so it surfaces in the featured strip
  if (hofRow?.tool_id) {
    const { error: toolError } = await supabase
      .from("tools")
      .update({ featured: true })
      .eq("id", hofRow.tool_id);
    if (toolError) console.error("[inductHofNomination] tool featured error:", JSON.stringify(toolError));
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function rejectHofNomination(nominationId: string) {
  const { supabase } = await getAdminUser();
  const { error } = await supabase.from("hall_of_fame")
    .update({ status: "rejected" })
    .eq("id", nominationId);
  if (error) {
    console.error("[rejectHofNomination] error:", JSON.stringify(error));
    throw new Error(error.message);
  }
  revalidatePath("/admin");
}

export async function removeFromHof(nominationId: string, toolId: string) {
  const { supabase } = await getAdminUser();

  // 1. Mark nomination as removed (keeps the record, just hides from HoF)
  const { error: hofError } = await supabase
    .from("hall_of_fame")
    .update({ status: "removed" })
    .eq("id", nominationId);
  if (hofError) {
    console.error("[removeFromHof] hof error:", JSON.stringify(hofError));
    throw new Error(hofError.message);
  }

  // 2. Keep tools.featured = true so it stays in the featured strip
  // (no change needed — just leaving it as-is)
  console.log(`[removeFromHof] Removed nomination ${nominationId}, tool ${toolId} stays featured`);

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function publishBlogRequest(requestId: string, blogUrl: string) {
  const { supabase } = await getAdminUser();
  await supabase.from("blog_post_requests").update({ status: "published", blog_url: blogUrl }).eq("id", requestId);
  revalidatePath("/admin");
}
