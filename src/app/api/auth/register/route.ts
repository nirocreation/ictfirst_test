import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { StudentService } from '@/services/studentService';
import { registerSchema } from '@/lib/validators/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // 1. Validation (Ensure your schema includes 'grade')
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ 
        success: false, 
        message: 'Validation failed', 
        errors: validation.error.flatten().fieldErrors 
      }, { status: 400 });
    }

    const { fullName, email, password, grade, phone } = validation.data;

    // 2. Check if email already exists
    const existingUser = await StudentService.findByEmail(email);
    if (existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'This email is already registered.' 
      }, { status: 400 });
    }

    // 3. Generate Unique Student ID (Logic: GD + Grade + "-" + 5 Random Digits)
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const generatedStudentId = `GD${grade}-${randomDigits}`;

    // 4. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Save to Database via Service
    await StudentService.create({
      studentId: generatedStudentId,
      fullName,
      email,
      passwordHash: hashedPassword,
      grade,
      phone: phone || null
    });

    // 6. Return success with the NEW Student ID
    return NextResponse.json({ 
      success: true, 
      message: 'Registration successful!',
      data: {
        studentId: generatedStudentId,
        fullName: fullName
      }
    }, { status: 201 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ REGISTRATION FAILURE:', errorMessage);
    
    return NextResponse.json({ 
      success: false, 
      message: 'Database error. Please try again later.',
      debug: process.env.NODE_ENV === 'development' ? errorMessage : undefined
    }, { status: 500 });
  }
}