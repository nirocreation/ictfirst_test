import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';

export async function POST(req: Request) {
  try {
    const { lessonId } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ success: false, message: "Lesson ID is required" }, { status: 400 });
    }

    // COALESCE ensures that if reset_token is NULL, it starts at 0 and becomes 1
    await pool.query(
      'UPDATE recorded_lessons SET reset_token = COALESCE(reset_token, 0) + 1 WHERE id = ?',
      [lessonId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}