import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function PATCH(req: Request) {
  try {
    const { id, student_id, status } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, message: "Missing ID" }, { status: 400 });
    }

    // 1. Check if the new Student ID is already taken by someone else
    if (student_id) {
      const [existing] = await pool.query<RowDataPacket[]>(
        'SELECT id FROM students WHERE student_id = ? AND id != ?',
        [student_id, id]
      );
      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, message: 'This Student ID is already assigned to another student' }, 
          { status: 400 }
        );
      }
    }

    // 2. Update both ID and Status in one go
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE students SET student_id = ?, status = ? WHERE id = ?',
      [student_id, status, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "No student found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Database Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}