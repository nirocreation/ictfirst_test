import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { RowDataPacket } from 'mysql2/promise'; // 👈 1. Import this

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    // 2. Add the <RowDataPacket[]> type to the query
    const [users] = await pool.query<RowDataPacket[]>(
      'SELECT id, full_name FROM students WHERE email = ?', 
      [email]
    );
    
    // 3. Now TypeScript knows 'users' is an array
    if (users.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "If an account exists, a reset link has been sent." 
      });
    }

    // 4. Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 3600000); 

    await pool.query(
      'UPDATE students SET reset_token = ?, reset_expiry = ? WHERE email = ?',
      [resetToken, expiry, email]
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

    await transporter.sendMail({
      from: '"ICT ATELIER" <no-reply@atelier.com>',
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #1A5683;">Hello, ${users[0].full_name}</h2>
          <p>You requested a password reset for your <b>ICT Atelier</b> account.</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" style="background: #1A5683; color: white; padding: 12px 24px; text-decoration: none; border-radius: 12px; font-weight: bold; font-size: 14px;">Reset My Password</a>
          </div>
          <p style="font-size: 12px; color: #64748b;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
        </div>`,
    });

    return NextResponse.json({ success: true, message: "Reset link sent to your email." });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ success: false, message: "Error sending email." }, { status: 500 });
  }
}