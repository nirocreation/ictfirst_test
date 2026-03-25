'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({ studentId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    console.log("Login Debug Data:", data); // 👈 Check your F12 console for this!

    if (data.success) {
      // We check both data.role AND data.user.role just to be safe
      const userRole = data.role || data.user?.role;

      if (userRole === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/student/dashboard';
      }
    } else {
      setError(data.message || 'Invalid Student ID or Password');
    }
  } catch (err) {
    setError('Connection failed. Please ensure your database is running.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans antialiased">
      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12">
        <div className="max-w-5xl w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px]">
          
          {/* Left Side: Branding Area */}
          <div className="md:w-1/2 bg-[#1A5683] p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/10 rounded-full"></div>
            
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-12">Dinushika Kalugampitiya</h3>
              <h1 className="text-5xl font-extrabold leading-[1.1] mb-6 italic tracking-tighter">
                Welcome Back to Your Academic Atelier.
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed max-w-md">
                Continue your journey of intellectual clarity and professional mastery with our curated educational resources.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-3 mt-8">
              <div className="flex -space-x-3">
                {[11, 12, 13].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1A5683] bg-gray-300 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-medium text-blue-100 uppercase tracking-widest text-[10px]">Joined by 2,000+ active learners</p>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="md:w-1/2 p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase italic tracking-tighter">Portal Login</h2>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-10">Access your courses and schedule</p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] font-black uppercase tracking-widest">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student ID Input */}
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Student ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. STU-12345"
                    className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#1A5683] transition-all outline-none text-gray-900 font-bold"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                  />
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest">Password</label>
                    <Link href="/forgot-password" className="text-[9px] font-black text-[#1A5683] uppercase tracking-widest hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full p-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-[#1A5683] transition-all outline-none text-gray-900 font-bold"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? "🔒" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#1A5683] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#15466A] transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Verifying Credentials..." : "Enter Atelier →"}
                </button>
              </form>

              <div className="relative my-10 flex items-center justify-center">
                <div className="absolute w-full h-[1px] bg-gray-100"></div>
                <span className="relative bg-white px-4 text-[9px] font-black text-gray-300 tracking-widest uppercase">OR</span>
              </div>

              <div className="text-center">
                <p className="text-[10px] text-gray-400 mb-2 font-black uppercase">New to the platform?</p>
                <Link href="/register" className="text-[10px] font-black text-[#1A5683] hover:underline uppercase tracking-widest">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-6 py-10 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <div className="text-[#1A5683] mb-1">Dinushika Kalugampitiya</div>
          <p>© 2024 Atelier Registry. All rights reserved.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="/contact" className="hover:text-[#1A5683]">Support</Link>
          <Link href="/privacy" className="hover:text-[#1A5683]">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}