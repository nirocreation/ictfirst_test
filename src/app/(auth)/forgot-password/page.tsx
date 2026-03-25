'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setMessage(data.message);
    } catch (err) {
      setMessage('Failed to send reset link. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] p-12 shadow-xl border border-slate-100">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 text-[#1A5683] rounded-2xl text-2xl mb-4 shadow-inner">🔑</div>
          <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Reset Access</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Enter your registered email</p>
        </div>

        {message ? (
          <div className="text-center">
            <p className="bg-blue-50 text-[#1A5683] p-4 rounded-2xl text-xs font-black uppercase tracking-wider mb-6 leading-relaxed">
              {message}
            </p>
            <Link href="/login" className="text-[#1A5683] font-black uppercase text-[10px] tracking-widest hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">Email Address</label>
              <input 
                type="email" 
                required
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#1A5683] transition-all font-bold text-sm"
                placeholder="mrs.k@atelier.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-[#1A5683] text-white py-4 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-lg hover:bg-[#15466A] transition-all active:scale-[0.98] disabled:bg-slate-300"
            >
              {loading ? 'Processing...' : 'Send Reset Link'}
            </button>
            <div className="text-center mt-6">
               <Link href="/login" className="text-slate-400 font-black uppercase text-[9px] tracking-widest hover:text-[#1A5683]">
                Cancel and return
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}