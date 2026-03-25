'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  full_name: string;
  grade: number;
  recentLesson?: string;
  paymentStatus?: string;
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await fetch('/api/student/profile');
        const profile = await res.json();
        
        // Fetch last payment to show status on dashboard
        const payRes = await fetch('/api/student/payments');
        const payments = await payRes.json();
        
        if (profile.success) {
          setData({
            full_name: profile.student.full_name,
            grade: profile.student.grade,
            paymentStatus: payments.payments?.[0]?.status || 'no_history'
          });
        }
      } catch (err) {
        console.error("Dashboard sync error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="p-20 text-[#1A5683] font-black animate-pulse">SYNCHRONIZING ATELIER...</div>;

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">
      {/* Hero Welcome */}
      <div className="bg-[#1A5683] rounded-[3rem] p-12 text-white mb-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="text-blue-200 font-bold uppercase tracking-[0.4em] text-[10px] mb-4">Student Workspace</h4>
          <h1 className="text-5xl font-black italic tracking-tighter mb-4">
            Hello, {data?.full_name.split(' ')[0]}
          </h1>
          <p className="text-blue-100 opacity-70 max-w-md text-sm leading-relaxed">
            You are currently enrolled in the **Grade {data?.grade} ICT Mastery Program**. 
            Check your latest lessons and payment updates below.
          </p>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Card 1: Lessons */}
        <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl mb-6">📚</div>
          <h3 className="font-black uppercase text-gray-900 mb-2">Curriculum</h3>
          <p className="text-gray-400 text-xs mb-8">Access your PDF notes and recorded video sessions.</p>
          <Link href="/student/lessons" className="text-[10px] font-black uppercase text-[#1A5683] tracking-widest border-b-2 border-blue-100 pb-1 hover:border-[#1A5683] transition">
            Open Vault →
          </Link>
        </div>

        {/* Card 2: Payment Status */}
        <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-xl mb-6">💳</div>
          <h3 className="font-black uppercase text-gray-900 mb-2">Fees Status</h3>
          <div className="mb-8">
            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
              data?.paymentStatus === 'approved' ? 'bg-green-50 text-green-600' : 
              data?.paymentStatus === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'
            }`}>
              {data?.paymentStatus?.replace('_', ' ')}
            </span>
          </div>
          <Link href="/student/payments" className="text-[10px] font-black uppercase text-[#1A5683] tracking-widest border-b-2 border-blue-100 pb-1 hover:border-[#1A5683] transition">
            Manage Billing →
          </Link>
        </div>

        {/* Card 3: Support */}
        <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-xl mb-6">💬</div>
          <h3 className="font-black uppercase text-gray-900 mb-2">Assistance</h3>
          <p className="text-gray-400 text-xs mb-8">Need help with a lesson? Message your tutor directly.</p>
          <a href="https://wa.me/your-number" target="_blank" className="text-[10px] font-black uppercase text-[#1A5683] tracking-widest border-b-2 border-blue-100 pb-1 hover:border-[#1A5683] transition">
            WhatsApp Help →
          </a>
        </div>
      </div>
    </div>
  );
}