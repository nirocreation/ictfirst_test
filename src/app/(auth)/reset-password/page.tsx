'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setMessage({ text: 'Passwords do not match', isError: true });
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (data.success) {
        setMessage({ text: 'Password updated! Redirecting to login...', isError: false });
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setMessage({ text: data.message, isError: true });
      }
    } catch (err) {
      setMessage({ text: 'Something went wrong.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-50 text-green-600 rounded-2xl text-2xl mb-4 shadow-inner">🛡️</div>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">New Password</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-2">Secure your ICT Atelier account</p>
        </div>

        <form onSubmit={handleReset} className="space-y-5">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">New Password</label>
            <input 
              type="password" 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#1A5683] font-bold text-sm"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Confirm Password</label>
            <input 
              type="password" 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#1A5683] font-bold text-sm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {message.text && (
            <p className={`text-[10px] font-black uppercase text-center p-3 rounded-xl ${message.isError ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
              {message.text}
            </p>
          )}

          <button 
            disabled={loading || !token}
            className="w-full bg-[#1A5683] text-white py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg hover:bg-[#15466A] transition-all disabled:bg-slate-200"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

// Next.js requires Suspense for useSearchParams()
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}