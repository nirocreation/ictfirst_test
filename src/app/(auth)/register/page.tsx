'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    // Modified: Stores the numerical grade
    grade: null as number | null, 
    // Modified: Whatsapp mapped to our 'phone' logic
    whatsapp: '' 
  });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // New: State to show the generated ID
  const [generatedId, setGeneratedId] = useState<string | null>(null); 
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Ensure they selected a grade
    if (!formData.grade) {
      setError('Please select your class grade.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: formData.whatsapp // Map 'whatsapp' UI to 'phone' DB
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Success: Store and display the ID
        setGeneratedId(data.data.studentId);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Connection to server failed. Is XAMPP running?');
    } finally {
      setLoading(false);
    }
  };

  // 1. New: SUCCESS VIEW (Shows the generated ID - not in the image but required for your logic)
  if (generatedId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F3F5] px-4 font-sans text-gray-800">
        <div className="max-w-md w-full p-10 border rounded-3xl shadow-xl bg-white text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-[#1A5683]">Done!</h2>
          <p className="text-gray-600 mt-2 font-medium">Your Student ID has been generated:</p>
          
          <div className="mt-8 p-5 bg-blue-50 border-2 border-dashed border-blue-200 rounded-xl">
            <span className="text-4xl font-mono font-bold text-[#1A5683] tracking-[0.2em]">
              {generatedId}
            </span>
          </div>

          <p className="text-sm text-gray-500 mt-5 leading-relaxed">
            Please share this ID with your Admin via WhatsApp if needed. You cannot log in without this.
          </p>

          <button 
            onClick={() => router.push('/login')}
            className="w-full mt-10 py-4 bg-[#1A5683] text-white rounded-xl font-bold hover:bg-[#15466A] transition active:scale-[0.98]"
          >
            Go to Login Portal
          </button>
        </div>
      </div>
    );
  }

  // 2. Exact UI: Standard "Form" View
  return (
    <div className="min-h-screen bg-[#F1F3F5] font-sans text-gray-800 antialiased">
      {/* Exact Header */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="text-xl font-extrabold text-[#1A5683]">ICT FIRST.lk</div>
        <button 
          onClick={() => router.push('/login')}
          className="px-6 py-2.5 bg-[#1A5683] text-white rounded-lg font-semibold hover:bg-[#15466A] text-sm transition"
        >
          Login
        </button>
      </nav>

      {/* Exact Layout Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center px-6 py-16 md:py-24">
        
        {/* Exact Left Column: The "Journey" */}
        <div className="md:pr-12">
          <span className="text-[#1A5683] uppercase font-bold text-xs tracking-[0.15em]">Academic Atelier</span>
          <h1 className="text-6xl font-extrabold text-[#1A5683] mt-3 leading-[1.15]">
            Begin Your<br /> Intellectual<br /> Journey.
          </h1>
          <p className="text-gray-600 mt-10 leading-relaxed text-base max-w-xl">
            Join a community dedicated to rigorous academic excellence and personalized mentorship. Your digital workspace is ready for your growth.
          </p>
        </div>

        {/* Exact Right Column: The "Form Card" */}
        <div className="flex justify-center md:justify-end">
          <div className="w-full max-w-xl p-10 bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Student Account</h2>
            <p className="text-sm text-gray-500 mb-10">Welcome to the LMS Learning Portal.</p>
            
            {error && (
              <div className="p-4 mb-8 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Row 1: Full Name / Email Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alexander Pierce"
                    className="w-full p-4 border border-gray-200 bg-[#E8EBF0] rounded-xl focus:ring-2 focus:ring-[#1A5683] focus:border-[#1A5683] focus:bg-white outline-none text-gray-900 transition-all placeholder:text-gray-500"
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="alex@academy.com"
                    className="w-full p-4 border border-gray-200 bg-[#E8EBF0] rounded-xl focus:ring-2 focus:ring-[#1A5683] focus:border-[#1A5683] focus:bg-white outline-none text-gray-900 transition-all placeholder:text-gray-500"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 2: Select Your Class (MODIFIED TO DROPDOWN) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Your Class (Grade)</label>
                <select 
                  required
                  className="w-full p-4 border border-gray-200 bg-[#E8EBF0] rounded-xl focus:ring-2 focus:ring-[#1A5683] focus:border-[#1A5683] focus:bg-white outline-none text-gray-900 transition-all cursor-pointer appearance-none"
                  defaultValue="" // Empty default
                  onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}
                >
                  <option value="" disabled className="text-gray-400">--- Choose Your Class ---</option>
                  <option value="10">Class 10 (GD10)</option>
                  <option value="11">Class 11 (GD11)</option>
                </select>
              </div>

              {/* Row 3: Phone / Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Whatsapp Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+1 (555) 000-0000"
                    className="w-full p-4 border border-gray-200 bg-[#E8EBF0] rounded-xl focus:ring-2 focus:ring-[#1A5683] focus:border-[#1A5683] focus:bg-white outline-none text-gray-900 transition-all placeholder:text-gray-500"
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full p-4 border border-gray-200 bg-[#E8EBF0] rounded-xl focus:ring-2 focus:ring-[#1A5683] focus:border-[#1A5683] focus:bg-white outline-none text-gray-900 transition-all placeholder:text-gray-500"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              </div>

              {/* Exact Terms Checkbox */}
              <div className="flex items-start mt-6 pt-2">
                <input 
                    id="terms" 
                    type="checkbox" 
                    required 
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1A5683] focus:ring-[#1A5683] cursor-pointer" 
                />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-600 leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <Link href="/terms" className="text-[#1A5683] hover:underline font-medium">Terms of Service</Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-[#1A5683] hover:underline font-medium">Privacy Policy</Link>{' '}
                    regarding academic data usage.
                </label>
                </div>

              {/* Exact Create Account Button */}
              <button
                type="submit"
                // Button is disabled if: currently loading OR terms not agreed
                disabled={loading || !agreed}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition mt-4 ${
                    (loading || !agreed)
                    ? 'bg-gray-400 cursor-not-allowed opacity-70' 
                    : 'bg-[#1A5683] hover:bg-[#15466A] active:scale-[0.98]'
                }`}
                >
                {loading ? 'Processing...' : 'Create Account'}
                </button>
            </form>

            {/* Exact Footer Link */}
            <div className="mt-10 pt-8 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-[#1A5683] hover:underline font-bold">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      
      {/* Exact Footer Section */}
      <footer className="bg-white border-t border-gray-100 mt-20 px-6 py-10 text-center md:text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
          <div>
            <div className="font-bold text-[#1A5683] text-base">Dinushika Kalugampitiya</div>
            <div className="text-gray-500 mt-1">© 2024 Mrs. Dinushika Kalugampitiya. All rights reserved.</div>
          </div>
          <div className="flex gap-x-6 text-gray-500 mt-6 md:mt-0">
            <Link href="/contact" className="hover:text-[#1A5683]">Contact Us</Link>
            <Link href="/privacy" className="hover:text-[#1A5683]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#1A5683]">Terms of Service</Link>
            <Link href="/faq" className="hover:text-[#1A5683]">FAQ</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}