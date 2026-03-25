import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();

    await pool.query(
      'UPDATE students SET whatsapp_sent = ? WHERE id = ?',
      [status ? 1 : 0, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'DB Update Failed' }, { status: 500 });
  }
}