'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  full_name: string;
  student_id: string;
  grade: number;
  paymentStatus?: string; // 'approved', 'pending', or 'no_history'
}

interface Lesson {
  id: number;
  title: string;
  video_url: string | null;
  material_id: number | null;
  notes: string | null;
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [profileRes, payRes, lessonsRes] = await Promise.all([
          fetch('/api/student/profile'),
          fetch('/api/student/payments'),
          fetch(`/api/student/lessons?t=${Date.now()}`)
        ]);

        const profile = await profileRes.json();
        const payments = await payRes.json();
        const lessonsData = await lessonsRes.json();

        if (profile.success) {
          setData({
            full_name: profile.student.full_name,
            student_id: profile.student.student_id,
            grade: profile.student.grade,
            // Check the status of the most recent payment
            paymentStatus: payments.payments?.[0]?.status || 'no_history'
          });
        }

        if (lessonsData.success) {
          setLessons(lessonsData.lessons.slice(0, 8)); 
        }
      } catch (err) {
        console.error("Dashboard sync error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-black text-[#1A5683] animate-pulse italic uppercase tracking-[0.3em]">
      SYNCHRONIZING ATELIER...
    </div>
  );

  // Helper to check if the user has full access
  const hasAccess = data?.paymentStatus === 'approved';

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 select-none">
      {/* Hero Welcome */}
      <div className="p-4 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="font-bold uppercase tracking-[0.4em] text-[10px] text-slate-400 mb-1">WELCOME BACK</h4>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2 italic uppercase">
            Hello, {data?.full_name}
          </h1>
          <p className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-md text-slate-500 font-bold text-xs tracking-widest uppercase">
            ID: {data?.student_id}
          </p>
        </div>
      </div>

      {/* Live Class & Instructor Note Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 bg-[#1A5683] rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-xl shadow-blue-100/50 min-h-[320px]">
          <div>
            <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic">🔴 Live Session Starting Soon</span>
            <h2 className="text-4xl font-black mt-6 italic uppercase tracking-tighter leading-none">Introduction To <br/>Computer</h2>
            <p className="text-blue-100 font-bold uppercase text-[10px] mt-4 tracking-widest italic opacity-80">with Mrs. Dinushika Kalugampitiya</p>
          </div>
          
          {hasAccess ? (
             <button className="bg-white text-[#1A5683] w-fit px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-black/10">
                Join Live Class
             </button>
          ) : (
            <Link href="/student/payments" className="bg-orange-500 text-white w-fit px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-lg">
                Unlock Live Access →
            </Link>
          )}
        </div>

        <div className="bg-[#EEF2FF] rounded-[2.5rem] p-10 border border-blue-100 flex flex-col justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5] mb-4 italic">Instructor&apos;s Note</h3>
          <p className="text-slate-600 italic font-bold text-sm leading-relaxed opacity-90">
            &quot;Remember to review the Hardware Structure PDF before our next session. We will be deconstructing input processing cycles in the live workshop.&quot;
          </p>
          <div className="mt-6 flex items-center gap-2">
             <div className="w-8 h-8 rounded-full bg-blue-200"></div>
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">G{data?.grade} Theory</span>
          </div>
        </div>
      </div>

      {/* Dynamic Lessons Container */}
      <div className="mb-8 flex items-center justify-between">
         <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Recent Sessions & Materials</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {lessons.length > 0 ? (
          lessons.map((lesson) => (
            <div key={lesson.id} className="bg-white border border-slate-50 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-6 ${lesson.video_url ? 'bg-orange-50' : 'bg-blue-50'}`}>
                  {lesson.video_url ? '📼' : '📚'}
                </div>
                <h3 className="font-black uppercase text-slate-800 text-[13px] leading-tight mb-2 tracking-tight line-clamp-2 italic">
                  {lesson.title}
                </h3>
                <div className="flex items-center gap-2 mb-8">
                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest italic">
                    {lesson.video_url ? 'Video Session' : 'Lecture Note'}
                    </p>
                    {/* Access Indicator Badge */}
                    {!hasAccess && (
                        <span className="text-[8px] bg-red-50 text-red-500 px-2 py-0.5 rounded font-black uppercase tracking-tighter italic">Locked</span>
                    )}
                </div>
              </div>

              {/* DYNAMIC BUTTON LOGIC */}
              {hasAccess ? (
                // IF APPROVED: Show Video or PDF
                lesson.video_url ? (
                  <Link href={`/student/lessons/${lesson.id}`} className="w-full py-3 bg-[#1A5683] text-white rounded-xl text-[9px] font-black uppercase tracking-widest text-center transition-all hover:bg-slate-900">
                    Stream Video →
                  </Link>
                ) : (
                  <a href={`/api/admin/content?fileId=${lesson.material_id}`} target="_blank" className="w-full py-3 bg-[#4F46E5] text-white rounded-xl text-[9px] font-black uppercase tracking-widest text-center transition-all hover:bg-slate-900">
                    Download PDF ↓
                  </a>
                )
              ) : (
                // IF NOT APPROVED (Pending or No History): Show Payment Button
                <Link href="/student/payments" className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-orange-100 hover:text-orange-600 transition-colors">
                  {data?.paymentStatus === 'pending' ? 'Verification Pending...' : 'Unlock Lessons 🔒'}
                </Link>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-4 text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
             <p className="text-slate-300 font-black uppercase italic tracking-widest text-xs">No lessons available for your grade yet</p>
          </div>
        )}
      </div>
    </div>
  );
}