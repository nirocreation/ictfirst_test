'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Lesson {
  id: number;
  title: string;
  grade: number;
  video_url: string | null;
  description: string | null;
  notes: string | null;
  material_id: number | null;
  reset_token: number;
}

interface User {
  full_name: string;
  student_id: string;
}

const getEmbedUrl = (url: string | null) => {
  if (!url) return "";
  if (url.includes("drive.google.com")) return url.replace(/\/view.*|\/edit.*/, "/preview");
  let videoId = "";
  if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
  else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
  else if (url.includes("embed/")) return `${url}?rel=0&modestbranding=1&autoplay=1&controls=1&showinfo=0`;
  return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1&controls=1&showinfo=0&iv_load_policy=3` : url;
};

export default function LessonDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [viewCount, setViewCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  // 1. CORNER-TO-CORNER (5 MINUTE DELAY - NO ANIMATION)
  const [cornerIndex, setCornerIndex] = useState(0);
  const corners = [
    { top: '5%', left: '5%' },   
    { top: '5%', left: '80%' },  
    { top: '82%', left: '80%' }, 
    { top: '82%', left: '5%' },   
  ];

  useEffect(() => {
    if (hasStarted) {
      // 300,000ms = 5 Minutes
      const moveInterval = setInterval(() => {
        setCornerIndex((prev) => (prev + 1) % corners.length);
      }, 300000); 
      return () => clearInterval(moveInterval);
    }
  }, [hasStarted]);

  const wmPos = corners[cornerIndex];

  // 2. ANTI-PIRACY
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const checkAndSyncStatus = useCallback((lessonData: Lesson) => {
    if (typeof window !== 'undefined') {
      const viewKey = `view_count_${lessonData.id}_v${lessonData.reset_token || 0}`;
      const stored = localStorage.getItem(viewKey);
      const current = stored ? parseInt(stored, 10) : 0;
      setViewCount(current);
      setIsBlocked(current >= 3);
    }
  }, []);

  const handleStartVideo = () => {
    if (!lesson || isBlocked) return;
    const viewKey = `view_count_${lesson.id}_v${lesson.reset_token || 0}`;
    const stored = localStorage.getItem(viewKey);
    const newCount = (stored ? parseInt(stored, 10) : 0) + 1;
    localStorage.setItem(viewKey, newCount.toString());
    setViewCount(newCount);
    if (newCount > 3) setIsBlocked(true); else setHasStarted(true);
  };

  const fetchData = useCallback(async () => {
    try {
      const lessonRes = await fetch(`/api/student/lessons?t=${Date.now()}`);
      const lessonData = await lessonRes.json();
      const userRes = await fetch(`/api/student/profile`);
      const userData = await userRes.json();
      
      if (lessonData.success) {
        const found = lessonData.lessons.find((l: Lesson) => l.id === Number(id));
        if (found) { setLesson(found); checkAndSyncStatus(found); }
      }
      if (userData.success) {
        setUser(userData.student); 
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [id, checkAndSyncStatus]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !lesson) return (
    <div className="min-h-screen flex items-center justify-center font-black text-[#1A5683] animate-pulse italic uppercase tracking-[0.3em]">ICTFIRST.lk</div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-10">
        <button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-[#1A5683] transition-colors">
          <span className="text-lg">←</span> Return to Library
        </button>

        <div className="relative w-full aspect-video bg-black rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl mb-12 border-[4px] md:border-[8px] border-white isolate">
          {!isBlocked ? (
            <>
              {hasStarted ? (
                <div className="relative w-full h-full">
                  <iframe 
                    src={getEmbedUrl(lesson.video_url)} 
                    className="w-full h-full border-none z-0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen 
                  />
                  <div className="absolute inset-0 z-10 bg-transparent pointer-events-none" />
                  
                  {/* 🕵️ POPPING WATERMARK (NO ANIMATION) */}
                  <div 
                    className="absolute z-[100] pointer-events-none"
                    style={{ top: wmPos.top, left: wmPos.left }}
                  >
                    <div className="text-white/20 select-none">
                      <p className="font-black text-[10px] md:text-[14px] uppercase tracking-tighter leading-none">
                        {user?.full_name || "SECURE SESSION"}
                      </p>
                      <p className="font-bold text-[8px] md:text-[10px] tracking-[0.3em] mt-1">
                        {user?.student_id || "ID: PROTECTED"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 group z-50">
                    <button onClick={handleStartVideo} className="w-20 h-20 md:w-28 md:h-28 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform">
                        <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-[#1A5683] border-b-[15px] border-b-transparent ml-2"></div>
                    </button>
                    <div className="text-center mt-6">
                        <p className="text-white font-black uppercase italic tracking-widest text-[11px]">Click to Start Session</p>
                        <p className="text-white/40 font-bold uppercase text-[9px] mt-2 tracking-widest">{3 - viewCount} Views Remaining</p>
                    </div>
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center z-50">
              <span className="text-5xl mb-6">🔒</span>
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4">Access Restricted</h2>
              <p className="opacity-60 text-xs md:text-sm max-w-sm mx-auto font-bold uppercase tracking-[0.2em] leading-relaxed">Limit reached. Contact Mrs. Dinushika for a reset.</p>
            </div>
          )}
        </div>

        {/* DETAILS SECTION */}
        <div className="mb-14">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-[#D1D5F5] text-[#4F46E5] px-5 py-2 rounded-full text-[9px] font-black uppercase italic tracking-widest">Recorded Session</span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${viewCount >= 3 ? 'text-red-500' : 'text-slate-400'}`}>Used {viewCount} of 3 Views</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase italic tracking-tighter leading-[0.9]">{lesson.title}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 bg-[#EEF2FF] p-10 md:p-14 rounded-[3rem] border border-[#E0E7FF]">
                <h3 className="font-black text-[#4F46E5] uppercase text-[10px] italic tracking-[0.3em] mb-8">Instructor Note</h3>
                <p className="text-slate-700 text-base md:text-lg leading-relaxed font-bold italic opacity-90">{lesson.notes || "No additional notes provided."}</p>
            </div>
            <div className="lg:col-span-4 bg-[#F8FAFC] p-10 rounded-[3rem] border border-slate-100 flex flex-col">
                <h3 className="font-black text-slate-400 uppercase text-[10px] italic mb-8 tracking-widest">Materials</h3>
                {lesson.material_id ? (
                    <a href={`/api/admin/content?fileId=${lesson.material_id}`} target="_blank" className="mt-auto bg-white p-6 rounded-[2rem] flex items-center justify-between border border-slate-200 hover:shadow-lg transition-all group">
                        <span className="font-black text-slate-800 text-[10px] uppercase italic">Download PDF</span>
                        <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center">⬇</div>
                    </a>
                ) : <p className="my-auto text-slate-300 font-black text-[10px] uppercase text-center italic">No PDF Available</p>}
            </div>
        </div>
      </div>
    </div>
  );
}