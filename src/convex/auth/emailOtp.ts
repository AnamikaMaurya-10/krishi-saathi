import { Email } from "@convex-dev/auth/providers/Email";
import { RandomReader, generateRandomString } from "@oslojs/crypto/random";

/**
 * Email OTP provider for Convex Auth.
 *
 * This implementation is self-contained and does NOT depend on any
 * third-party Freebuff/VLY infrastructure.
 *
 * In development: OTP is logged to the Convex function console.
 * In production: extend sendVerificationRequest with your own
 * email service (Resend, SendGrid, Nodemailer, etc.).
 *
 * The OTP verification itself is handled entirely by Convex Auth —
 * this file only controls how the OTP is generated and delivered.
 */
export const emailOtp = Email({
  id: "email-otp",
  maxAge: 60 * 15, // 15 minutes

  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes: Uint8Array) {
        crypto.getRandomValues(bytes);
      },
    };
    const alphabet = "0123456789";
    return generateRandomString(random, alphabet, 6);
  },

  async sendVerificationRequest({ identifier: email, token }) {
    // Log the OTP to Convex function console for development/demo purposes.
    // In production, replace this with your email service of choice:
    //
    // Example with Resend:
    //   import { Resend } from "resend";
    //   const resend = new Resend(process.env.RESEND_API_KEY);
    //   await resend.emails.send({
    //     from: "auth@yourdomain.com",
    //     to: email,
    //     subject: "Your verification code",
    //     text: `Your code is: ${token}`,
    //   });
    //
    // Example with SendGrid:
    //   import sgMail from "@sendgrid/mail";
    //   sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    //   await sgMail.send({
    //     to: email,
    //     from: "auth@yourdomain.com",
    //     subject: "Your verification code",
    //     text: `Your code is: ${token}`,
    //   });

    console.log(`[Auth] OTP for ${email}: ${token}`);
  },
});
