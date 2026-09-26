import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return NextResponse.json({ success: true });
    }

    // Generate secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour

    // Save token to database
    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      },
    });

    // Check if email provider is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn("Email provider not configured. Would send token:", token);
      return NextResponse.json({ success: true });
    }

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || "https://first-client-ai.vercel.app"}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"First Client AI" <noreply@first-client-ai.vercel.app>',
      to: email,
      subject: "Reset your password",
      html: `
        <div>
          <h2>Reset Your Password</h2>
          <p>Click the link below to reset your password. This link will expire in 1 hour.</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
