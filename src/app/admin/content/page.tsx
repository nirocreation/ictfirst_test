'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CombinedLesson {
  id: number;
  title: string;
  grade: number;
  video_url: string | null;
  description: string | null;
  notes: string | null;
  material_id: number | null;
  reset_token?: number; // Added to support reset logic
}

export default function ContentManagement() {
  const [lessons, setLessons] = useState<CombinedLesson[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [preview, setPreview] = useState<{ type: 'video' | 'pdf', url: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: '',
    grade: '12',
    videoUrl: '',
    description: '',
    notes: '',
    file: null as File | null,
    hasExistingFile: false
  });

  // --- DATA FETCHING ---
  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      if (data.success) setLessons(data.videos || []);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  // --- HANDLERS ---
  const handleResetViews = async (id: number) => {
    if (!confirm("Reset all student view counts for this lesson? This cannot be undone.")) return;
    
    try {
      const res = await fetch('/api/admin/lessons/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: id }),
      });
      
      if (res.ok) {
        alert("View counts reset successfully!");
        fetchLessons(); // Refresh list to sync tokens
      } else {
        alert("Failed to reset views.");
      }
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setForm({ title: '', grade: '12', videoUrl: '', description: '', notes: '', file: null, hasExistingFile: false });
    setIsFormOpen(true);
  };

  const openEditModal = (lesson: CombinedLesson) => {
    setEditingId(lesson.id);
    setForm({
      title: lesson.title,
      grade: lesson.grade.toString(),
      videoUrl: lesson.video_url || '',
      description: lesson.description || '',
      notes: lesson.notes || '',
      file: null,
      hasExistingFile: !!lesson.material_id
    });
    setIsFormOpen(true);
  };

  const handlePreview = (lesson: CombinedLesson) => {
    if (lesson.material_id) {
      setPreview({ type: 'pdf', url: `/api/admin/content?fileId=${lesson.material_id}` });
    } else if (lesson.video_url) {
      let embedUrl = lesson.video_url;
      if (embedUrl.includes('watch?v=')) {
        embedUrl = embedUrl.replace('watch?v=', 'embed/');
      } else if (embedUrl.includes('youtu.be/')) {
        embedUrl = `https://www.youtube.com/embed/${embedUrl.split('youtu.be/')[1]}`;
      }
      setPreview({ type: 'video', url: embedUrl });
    } else {
      alert("No preview available for this lesson.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (editingId) formData.append('id', editingId.toString());
    formData.append('title', form.title);
    formData.append('grade', form.grade);
    formData.append('videoUrl', form.videoUrl);
    formData.append('description', form.description);
    formData.append('notes', form.notes);
    if (form.file) formData.append('file', form.file);

    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/content', { method, body: formData });
    
    if (res.ok) {
      setIsFormOpen(false);
      fetchLessons();
      alert(editingId ? "Updated!" : "Published!");
    }
  };

  const deleteLesson = async (id: number) => {
    if (!confirm("Are you sure? This deletes the lesson and the PDF forever.")) return;
    const res = await fetch(`/api/admin/content?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchLessons();
  };

  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen bg-slate-50/30 font-sans">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-6xl font-black italic uppercase tracking-tighter text-slate-900">Content</h1>
          <p className="text-slate-400 font-bold text-xs tracking-[0.4em] uppercase mt-2">Admin Management</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1A5683] transition-all shadow-xl shadow-blue-900/10"
        >
          + Add New Lesson
        </button>
      </header>

      {/* LIST SECTION */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center font-black text-slate-200 text-4xl animate-pulse italic uppercase tracking-widest">Loading...</div>
        ) : (
          lessons.map((lesson) => (
            <div key={lesson.id} className="flex flex-col md:flex-row items-center justify-between p-6 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group gap-4">
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">🎬</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#1A5683] text-white text-[8px] font-black px-2 py-0.5 rounded-md">G{lesson.grade}</span>
                    <h3 className="font-black text-slate-800 uppercase italic text-lg tracking-tight">{lesson.title}</h3>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                    {lesson.video_url ? '📹 Video' : ''} {lesson.material_id ? ' • 📄 PDF' : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                {/* Reset Button */}
                <button 
                  onClick={() => handleResetViews(lesson.id)}
                  title="Reset Student View Counts"
                  className="px-4 py-3 rounded-2xl bg-orange-50 text-orange-600 text-[9px] font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all border border-orange-100"
                >
                  Reset Views
                </button>
                <button onClick={() => handlePreview(lesson)} className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">👁️</button>
                <button onClick={() => openEditModal(lesson)} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-200 hover:text-slate-800 transition-all">✏️</button>
                <button onClick={() => deleteLesson(lesson.id)} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* EDIT/CREATE MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-12">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black italic uppercase text-slate-900">{editingId ? 'Edit Lesson' : 'New Lesson'}</h2>
                <button onClick={() => setIsFormOpen(false)} className="text-slate-300 hover:text-red-500 text-3xl">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <input type="text" placeholder="Lesson Title" className="w-full bg-slate-50 rounded-2xl p-5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-100"
                    value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                  <div className="grid grid-cols-2 gap-4">
                    <select className="w-full bg-slate-50 rounded-2xl p-5 text-sm font-bold" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}>
                      {[10,11,12,13].map(g => <option key={g} value={g.toString()}>Grade {g}</option>)}
                    </select>
                    <input type="text" placeholder="Video Link" className="w-full bg-slate-50 rounded-2xl p-5 text-sm font-bold"
                      value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} />
                  </div>
                  <textarea rows={4} placeholder="Description" className="w-full bg-slate-50 rounded-2xl p-5 text-sm font-bold resize-none"
                    value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                </div>

                <div className="space-y-6 flex flex-col">
                  <div onClick={() => fileInputRef.current?.click()} className={`flex-1 border-4 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${form.hasExistingFile && !form.file ? 'border-green-100 bg-green-50/30' : 'border-slate-50 bg-slate-50 hover:bg-slate-100'}`}>
                    <span className="text-4xl mb-2">📄</span>
                    <p className="font-black text-slate-800 text-[10px] uppercase tracking-widest text-center">
                      {form.file ? form.file.name : form.hasExistingFile ? "PDF Attached (Click to Change)" : "Upload PDF Material"}
                    </p>
                    <input type="file" accept=".pdf" className="hidden" ref={fileInputRef} onChange={e => setForm({...form, file: e.target.files?.[0] || null})} />
                  </div>
                  <textarea rows={2} placeholder="Private Notes" className="w-full bg-slate-50 rounded-2xl p-5 text-sm font-bold resize-none"
                    value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                  <button className="w-full bg-[#1A5683] text-white py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] transition-transform">
                    {editingId ? 'Save Changes' : 'Publish Lesson'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PREVIEW MODAL */}
      {preview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-6xl h-[85vh] rounded-[4rem] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 flex justify-between items-center bg-white border-b">
              <span className="font-black text-slate-400 text-[10px] uppercase tracking-[0.5em]">Preview Mode</span>
              <button onClick={() => setPreview(null)} className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">✕</button>
            </div>
            <div className="flex-1 bg-slate-800">
              <iframe src={preview.url} className="w-full h-full border-none" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}