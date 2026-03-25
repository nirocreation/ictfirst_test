import { z } from 'zod';

export const loginSchema = z.object({
  // This must match the 'name' attribute in your login form input
  studentId: z.string().min(5, 'Student ID is required'), 
  password: z.string().min(1, 'Password is required'),
});

// While you are here, let's make sure the Register Schema is ready too
export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name is too short'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  // Add grade here since it's required for your GD10/GD11 logic
  grade: z.coerce.number().refine(n => n === 10 || n === 11, "Grade must be 10 or 11"),
  phone: z.string().optional(),
});