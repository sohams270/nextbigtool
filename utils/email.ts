import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);
export const EMAIL_FROM = `NextBigTool <${process.env.EMAIL_FROM ?? "soham@nextbigtool.com"}>`;

/**
 * Send an email via Resend HTTP API.
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
