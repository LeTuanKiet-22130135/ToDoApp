import { Resend } from 'resend';

// Load from environment variables
const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendOtpEmail(toEmail: string, otpCode: string) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set in environment variables. Simulating email dispatch.");
    console.log(`[Simulated Email] To: ${toEmail} | OTP: ${otpCode}`);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      subject: 'Your TaskFlow Verification Code',
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #0f172a;">TaskFlow Verification</h2>
          <p style="color: #475569;">Your one-time password (OTP) for account verification is:</p>
          <h1 style="letter-spacing: 6px; background: #f0f3ff; padding: 16px; text-align: center; border-radius: 8px; color: #2d259c; font-size: 32px;">
            ${otpCode}
          </h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 24px;">
            This code is valid for a short time. If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });

    if (data.error) {
      throw new Error(data.error.message);
    }
    
    return { success: true, data };
  } catch (error: any) {
    console.error("Failed to send OTP email:", error);
    throw new Error(error.message || "Failed to send OTP email");
  }
}
