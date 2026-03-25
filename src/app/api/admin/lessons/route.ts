import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return NextResponse.json({ success: false }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');
    const { payload } = await jwtVerify(token, secret);

    const { title, type, url, grade } = await req.json();

    if (type === 'document') {
      await pool.query(
        'INSERT INTO materials (title, file_url, file_type, created_by) VALUES (?, ?, ?, ?)',
        [title, url, 'PDF', payload.id]
      );
    } else {
      await pool.query(
        'INSERT INTO recorded_lessons (title, video_url, status, created_by) VALUES (?, ?, "active", ?)',
        [title, url, payload.id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}