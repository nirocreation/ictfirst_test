import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { RowDataPacket } from 'mysql2/promise';

// GET: Fetch all payments with student names
export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT p.*, s.full_name, s.student_id 
      FROM payments p 
      JOIN students s ON p.student_id = s.id 
      ORDER BY p.created_at DESC
    `);
    return NextResponse.json({ success: true, payments: rows });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// PATCH: Approve or Reject a payment
export async function PATCH(req: Request) {
  try {
    const { id, status, remarks } = await req.json();
    await pool.query(
      'UPDATE payments SET status = ?, remarks = ?, verified_at = NOW() WHERE id = ?',
      [status, remarks, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}