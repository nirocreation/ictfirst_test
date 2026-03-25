import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2/promise';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'No Session' }, { status: 401 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');
    const { payload } = await jwtVerify(token, secret);
    const userId = payload.id;

    // ✅ FIXED: Added the comma between the SQL string and the parameters array
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, student_id, full_name, email, grade, phone FROM students WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, student: rows[0] });

  } catch (error) {
    console.error("Profile API Error:", error);
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
}