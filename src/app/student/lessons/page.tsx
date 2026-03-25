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

  // 1. Fetch Lessons & Sync Bookmarks
  const initData = useCallback(async () => {
    try {
      const res = await fetch('/api/student/lessons');
      const data = await res.json();
      if (data.success) {
        setLessons(data.lessons as Lesson[]);
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
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* HERO SECTION: Dynamic Grade Card */}
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

            {/* Avatars Decoration */}
            <div className="hidden lg:flex absolute bottom-12 right-12 items-center -space-x-4">
               {[1,2,3].map(i => (
                 <div key={i} className="w-12 h-12 rounded-full border-[3px] border-[#1A5683] bg-slate-200 flex items-center justify-center text-xs text-slate-500 font-black italic">ICT</div>
               ))}
               <div className="w-12 h-12 rounded-full border-[3px] border-[#1A5683] bg-blue-400 flex items-center justify-center text-[10px] font-black text-white">+24</div>
            </div>
          </div>
        </div>

        {/* CONTROLS: Search & Sort */}
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
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">🔍</span>
              <input 
                type="text" 
                placeholder="Find a module..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-72 pl-12 pr-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm outline-none focus:ring-4 focus:ring-[#1A5683]/5 font-bold text-sm"
              />
            </div>

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
              <div key={lesson.id} className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all group flex flex-col relative">
                
                {/* Bookmark Icon */}
                <button 
                  onClick={() => toggleBookmark(lesson.id)}
                  className={`absolute top-8 right-8 text-xl transition-transform active:scale-125 ${bookmarks.includes(lesson.id) ? 'text-red-500' : 'text-slate-200 hover:text-red-200'}`}
                >
                  {bookmarks.includes(lesson.id) ? '❤️' : '🤍'}
                </button>

                {/* Icon Box */}
                <div className="w-14 h-14 bg-[#F8FAFC] text-[#1A5683] rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#1A5683] group-hover:text-white transition-colors text-2xl shadow-inner">
                  🎬
                </div>
                
                <h3 className="font-black text-slate-800 mb-2 leading-tight flex-grow uppercase text-[15px] tracking-tight italic">
                  {lesson.title}
                </h3>
                
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.1em] mb-10">
                  Session Recording • 128 MB
                </p>

                <div className="flex flex-col gap-3">
                  <Link 
                    href={`/student/lessons/${lesson.id}`}
                    className="w-full py-4 bg-[#1A5683] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest text-center shadow-lg shadow-blue-900/20 hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                  >
                    View Lesson <span>⦿</span>
                  </Link>
                  
                  {lesson.material_id && (
                    <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-widest">
                      PDF Notes Included
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs">
                Vault Empty for this filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}