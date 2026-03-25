import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import pool from '@/lib/db/mysql';

// 1. Define what we SEND to the database
interface CreateStudentData {
  studentId: string;
  fullName: string;
  email: string;
  passwordHash: string;
  grade: number;
  phone?: string | null;
}

// 2. Define what we GET BACK from the database (Matches your Table Columns)
interface StudentRow extends RowDataPacket {
  id: number;
  student_id: string;
  full_name: string;
  email: string;
  password_hash: string;
  grade: number;
  phone: string | null;
  role: string;
  created_at: Date;
}

export class StudentService {
  // Create new student
  static async create(data: CreateStudentData): Promise<ResultSetHeader> {
    const query = `
      INSERT INTO students (student_id, full_name, email, password_hash, grade, phone) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.query<ResultSetHeader>(query, [
      data.studentId, 
      data.fullName, 
      data.email, 
      data.passwordHash, 
      data.grade, 
      data.phone || null
    ]);

    return result;
  }

  // Find by Student ID (For Login) - NO MORE ANY
  static async findByStudentId(studentId: string): Promise<StudentRow | null> {
    const [rows] = await pool.query<StudentRow[]>(
      'SELECT * FROM students WHERE student_id = ?',
      [studentId]
    );
    return rows[0] || null;
  }

  // Find by Email (For Registration Check) - NO MORE ANY
  static async findByEmail(email: string): Promise<StudentRow | null> {
    const [rows] = await pool.query<StudentRow[]>(
      'SELECT * FROM students WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }
}