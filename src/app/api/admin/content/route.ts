import { NextResponse } from 'next/server';
import pool from '@/lib/db/mysql';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise'; // Use promise-based types

// --- GET: Fetch List OR Fetch Specific File for Preview ---
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');

    if (fileId) {
      const [file] = await pool.query<RowDataPacket[]>(
        'SELECT file_data, file_type FROM materials WHERE id = ?', 
        [fileId]
      );

      if (!file || file.length === 0) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      return new Response(file[0].file_data, {
        headers: { 
          'Content-Type': file[0].file_type || 'application/pdf',
          'Content-Disposition': 'inline' 
        },
      });
    }

    const [videos] = await pool.query<RowDataPacket[]>(
      `SELECT id, title, grade, video_url, description, notes, material_id, created_at 
       FROM recorded_lessons 
       ORDER BY created_at DESC`
    );
    
    return NextResponse.json({ 
      success: true, 
      videos: videos || [] 
    });

  } catch (error) {
    console.error("GET_ERROR:", error);
    return NextResponse.json({ success: false, message: "Fetch failed" }, { status: 500 });
  }
}

// --- POST: Create New Lesson + Upload PDF ---
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const grade = formData.get('grade') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const description = (formData.get('description') as string) || null;
    const notes = (formData.get('notes') as string) || null;
    const file = formData.get('file') as File | null;
    const created_by = 1; 

    let materialId: number | null = null;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const [matResult] = await pool.query<ResultSetHeader>(
        'INSERT INTO materials (title, file_data, file_type, file_size, created_by) VALUES (?, ?, ?, ?, ?)',
        [title, buffer, file.type, file.size, created_by]
      );
      materialId = matResult.insertId;
    }

    await pool.query<ResultSetHeader>(
      'INSERT INTO recorded_lessons (title, grade, video_url, description, notes, material_id, created_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, grade, videoUrl, description, notes, materialId, created_by]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST_ERROR:", error);
    return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
  }
}

// --- PUT: Update Existing Lesson + Replace PDF ---
export async function PUT(req: Request) {
  try {
    const formData = await req.formData();
    const id = formData.get('id');
    const title = formData.get('title') as string;
    const grade = formData.get('grade') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const description = (formData.get('description') as string) || null;
    const notes = (formData.get('notes') as string) || null;
    const file = formData.get('file') as File | null;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const [lesson] = await pool.query<RowDataPacket[]>(
        "SELECT material_id FROM recorded_lessons WHERE id = ?", [id]
      );
      
      if (lesson[0]?.material_id) {
        await pool.query(
          "UPDATE materials SET title = ?, file_data = ?, file_type = ?, file_size = ? WHERE id = ?", 
          [title, buffer, file.type, file.size, lesson[0].material_id]
        );
      } else {
        const [matResult] = await pool.query<ResultSetHeader>(
          "INSERT INTO materials (title, file_data, file_type, file_size, created_by) VALUES (?, ?, ?, ?, 1)",
          [title, buffer, file.type, file.size]
        );
        await pool.query("UPDATE recorded_lessons SET material_id = ? WHERE id = ?", [matResult.insertId, id]);
      }
    }

    await pool.query(
      "UPDATE recorded_lessons SET title = ?, grade = ?, video_url = ?, description = ?, notes = ? WHERE id = ?",
      [title, grade, videoUrl, description, notes, id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT_ERROR:", error);
    return NextResponse.json({ success: false, message: "Update failed" }, { status: 500 });
  }
}

// --- DELETE: Remove Lesson and its PDF ---
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ success: false, message: "ID required" }, { status: 400 });

    const [lesson] = await pool.query<RowDataPacket[]>(
      "SELECT material_id FROM recorded_lessons WHERE id = ?", [id]
    );
    
    if (lesson[0]?.material_id) {
      await pool.query("DELETE FROM materials WHERE id = ?", [lesson[0].material_id]);
    }

    await pool.query("DELETE FROM recorded_lessons WHERE id = ?", [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE_ERROR:", error);
    return NextResponse.json({ success: false, message: "Delete failed" }, { status: 500 });
  }
}