'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

// --- TYPES ---
interface Lesson {
  id: number;
  title: string;
  grade: number;
  video_url: string | null;
  description: string | null;
  notes: string | null;
  material_id: number | null;
  created_at: string;
}

type SortOption = 'newest' | 'oldest' | 'az' | 'favorites';

export default function LessonsPage() {
  // State
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGrade, setSelectedGrade] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<string>('no_history');

  // 1. Fetch Lessons, Payments & Sync Bookmarks
  const initData = useCallback(async () => {
    try {
      const [lessonsRes, payRes] = await Promise.all([
        fetch('/api/student/lessons'),
        fetch('/api/student/payments')
      ]);

      const lessonsData = await lessonsRes.json();
      const payData = await payRes.json();

      if (lessonsData.success) setLessons(lessonsData.lessons as Lesson[]);
      
      // Update payment status from the most recent record
      if (payData.success && payData.payments?.length > 0) {
        setPaymentStatus(payData.payments[0].status);
      }
    } catch (err) {
      console.error("Data fetch failed:", err);
    } finally {
      setLoading(false);
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ict_bookmarks');
      if (saved) setBookmarks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

  // Master Access Check
  const hasAccess = paymentStatus === 'approved';

  // 2. Bookmark Logic
  const toggleBookmark = (id: number) => {
    setBookmarks((prev) => {
      const updated = prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id];
      localStorage.setItem('ict_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  // 3. Filter & Sort Logic
  const filteredAndSorted = useMemo(() => {
    const filtered = lessons.filter((l) => {
      const matchesGrade = l.grade === selectedGrade;
      const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (sortBy === 'favorites') return matchesGrade && matchesSearch && bookmarks.includes(l.id);
      return matchesGrade && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'az') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [lessons, selectedGrade, searchQuery, sortBy, bookmarks]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-black text-[#1A5683] italic text-2xl uppercase tracking-tighter">
      ICTFIRST.lk
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* HERO SECTION */}
        <div className="pt-10 mb-16">
          <div className="bg-gradient-to-br from-[#1A5683] to-[#2C7CB3] rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter uppercase italic leading-none">
                GRADE {selectedGrade} <br/> Online Class
              </h1>
              <p className="text-blue-100 font-bold opacity-70 mb-10 text-[11px] uppercase tracking-[0.3em]">
                With Mrs. Dinushika Kalugampitiya
              </p>
              
              <div className="flex flex-wrap gap-3">
                {[10, 11, 12, 13].map((g) => (
                  <button
                    key={g}
                    onClick={() => { setSelectedGrade(g); setSearchQuery(''); }}
                    className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                      selectedGrade === g ? 'bg-white text-[#1A5683] border-white shadow-xl scale-105' : 'bg-transparent text-white border-white/20 hover:border-white'
                    }`}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 px-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
                {sortBy === 'favorites' ? '❤️ My Bookmarks' : `Grade ${selectedGrade} Modules`}
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                {filteredAndSorted.length} modules available
            </p>
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
            <input 
              type="text" 
              placeholder="Find a module..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm outline-none focus:ring-4 focus:ring-[#1A5683]/5 font-bold text-sm"
            />
            <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-white border border-slate-100 px-6 py-4 rounded-[1.5rem] shadow-sm outline-none font-black text-[10px] uppercase tracking-widest text-[#1A5683] cursor-pointer hover:bg-slate-50 transition-colors"
            >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">A - Z</option>
                <option value="favorites">❤️ Bookmarks</option>
            </select>
          </div>
        </div>

        {/* MODULE GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredAndSorted.length > 0 ? (
            filteredAndSorted.map((lesson) => (
              <div key={lesson.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl transition-all group flex flex-col relative overflow-hidden">
                
                <button 
                  onClick={() => toggleBookmark(lesson.id)}
                  className={`absolute top-8 right-8 text-xl transition-transform active:scale-125 ${bookmarks.includes(lesson.id) ? 'text-red-500' : 'text-slate-200 hover:text-red-200'}`}
                >
                  {bookmarks.includes(lesson.id) ? '❤️' : '🤍'}
                </button>

                <div className="w-14 h-14 bg-[#F8FAFC] text-[#1A5683] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#1A5683] group-hover:text-white transition-colors text-2xl">
                  {hasAccess ? '🎬' : '🔒'}
                </div>
                
                <h3 className="font-black text-slate-800 mb-2 leading-tight flex-grow uppercase text-[15px] tracking-tight italic">
                  {lesson.title}
                </h3>
                
                <p className={`text-[10px] font-bold uppercase tracking-[0.1em] mb-10 ${!hasAccess ? 'text-orange-500' : 'text-slate-400'}`}>
                  {hasAccess ? 'Session Recording' : 'Access Restricted'}
                </p>

                <div className="flex flex-col gap-3">
                  {hasAccess ? (
                    <Link 
                      href={`/student/lessons/${lesson.id}`}
                      className="w-full py-4 bg-[#1A5683] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest text-center shadow-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                    >
                      View Lesson <span>⦿</span>
                    </Link>
                  ) : (
                    <Link 
                      href="/student/payments"
                      className="w-full py-4 bg-orange-100 text-orange-600 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      {paymentStatus === 'pending' ? 'Verifying Slip...' : 'Unlock Lesson 🔒'}
                    </Link>
                  )}
                  
                  {lesson.material_id && hasAccess && (
                    <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      PDF Notes Included
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs">Vault Empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}