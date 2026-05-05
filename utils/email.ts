import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
export const EMAIL_FROM = `NextBigTool <${process.env.EMAIL_FROM ?? "soham@nextbigtool.com"}>`;

/**
 * Send a single email via Resend HTTP API.
 * Returns the Resend response (id) or throws on failure.
 */
export async function sendEmail({
  to,
  subject,
  html,
  from = EMAIL_FROM,
}: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  const { data, error } = await resend.emails.send({ from, to, subject, html });
  if (error) throw new Error(error.message);
  return data;
}

/**
 * Send the same email to many recipients via Resend's batch API.
 * One HTTP call per 100 recipients — avoids per-request rate limits.
 * Returns { sent, failed, errors }.
 */
export async function sendEmailBlast({
  recipients,
  subject,
  html,
  from = EMAIL_FROM,
}: {
  recipients: string[];
  subject: string;
  html: string;
  from?: string;
}) {
  const BATCH = 100; // Resend batch limit per call
  let sent = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let i = 0; i < recipients.length; i += BATCH) {
    const slice = recipients.slice(i, i + BATCH);
    const messages = slice.map(to => ({ from, to, subject, html }));
    const { data, error } = await resend.batch.send(messages);
    if (error) {
      failed += slice.length;
      errors.push(error.message);
      console.error("[sendEmailBlast] batch error:", error.message);
    } else {
      sent += (data as any[])?.length ?? slice.length;
    }
  }

  return { sent, failed, errors };
}
