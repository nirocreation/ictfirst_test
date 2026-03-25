import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2/promise';

export async function GET() {
  try {
    // Fetch all students, newest first
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, student_id, full_name, email, grade, phone, created_at FROM students ORDER BY created_at DESC'
    );

    return NextResponse.json({ success: true, students: rows });
  } catch (error) {
    console.error('Admin Fetch Error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch students' }, { status: 500 });
  }
}