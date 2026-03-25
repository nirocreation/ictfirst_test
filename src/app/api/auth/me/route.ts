import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { StudentService } from '@/services/studentService';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'No token found' }, { status: 401 });
    }

    // 1. Verify Token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_for_dev');
    const { payload } = await jwtVerify(token, secret);

    // 2. Fetch user using studentId from the JWT payload
    // Note: Use studentId (matches what we put in the Login JWT)
    const user = await StudentService.findByStudentId(payload.studentId as string);

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // 3. Return sanitized data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        studentId: user.student_id,
        grade: user.grade,
        role: user.role
      }
    });

  } catch (error) {
    console.error("ME Route Error:", error);
    return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
  }
}