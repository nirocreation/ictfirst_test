import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';

export async function GET() {
  try {
    // Fetch all lessons. We don't fetch the BLOB here to keep it fast.
    const [rows] = await pool.query(
      `SELECT id, title, grade, video_url, description, notes, material_id 
       FROM recorded_lessons 
       ORDER BY created_at DESC`
    );

    return NextResponse.json({ success: true, lessons: rows });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}