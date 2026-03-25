import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2/promise';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const studentId = cookieStore.get('student_id')?.value;

    if (!studentId) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, full_name, email, grade, phone, profile_image FROM students WHERE id = ?',
      [studentId]
    );

    if (rows.length === 0) return NextResponse.json({ success: false }, { status: 404 });

    return NextResponse.json({ success: true, student: rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}