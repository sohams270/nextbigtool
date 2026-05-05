import nodemailer from "nodemailer";

/**
 * Shared Resend SMTP transporter.
 * Resend SMTP: host=smtp.resend.com, port=465, user="resend", pass=API_KEY
 */
export function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.resend.com",
    port: 465,
    secure: true,
    auth: {
      user: "resend",
      pass: process.env.RESEND_API_KEY,
    },
  });
}

/** The verified sending address */
export const EMAIL_FROM = `"NextBigTool" <${process.env.EMAIL_FROM ?? "soham@nextbigtool.com"}>`;
