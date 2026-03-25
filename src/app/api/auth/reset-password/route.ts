import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2/promise'; // 👈 Import this!

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ success: false, message: "Missing data" }, { status: 400 });
    }

    // 1. Explicitly type the query result using RowDataPacket
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id FROM students WHERE reset_token = ? AND reset_expiry > NOW()',
      [token]
    );

    // 2. Now 'rows' is recognized as an array, and you can check length safely
    if (rows.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "The reset link is invalid or has expired." 
      }, { status: 400 });
    }

    const studentId = rows[0].id;

    // 3. Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Update the record and clear tokens
    await pool.query(
      'UPDATE students SET password_hash = ?, reset_token = NULL, reset_expiry = NULL WHERE id = ?',
      [hashedPassword, studentId]
    );

    return NextResponse.json({ success: true, message: "Password updated successfully" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}