'use client';

import { useState, ChangeEvent, FormEvent } from 'react';

export default function UploadLesson() {
  const [title, setTitle] = useState<string>('');
  const [type, setType] = useState<'document' | 'recorded'>('document');
  const [url, setUrl] = useState<string>('');
  const [grade, setGrade] = useState<string>('10');
  const [loading, setLoading] = useState<boolean>(false);

  // Use FormEvent for the form submission
  const handleUpload = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type, url, grade }),
      });

      if (res.ok) {
        alert("Lesson added to Curriculum!");
        setTitle(''); 
        setUrl('');
      } else {
        alert("Failed to upload lesson.");
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to handle type selection without 'any'
  const handleTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as 'document' | 'recorded';
    setType(value);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-black uppercase italic mb-8">Deploy Material</h1>
      
      <form onSubmit={handleUpload} className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Lesson Title</label>
            <input 
              value={title} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)} 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" 
              placeholder="e.g. Introduction to HTML" 
              required 
            />
          </div>
          
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Material Type</label>
            <select 
              value={type} 
              onChange={handleTypeChange} 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold"
            >
              <option value="document">PDF / Note</option>
              <option value="recorded">Video Lesson</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Target Grade</label>
            <select 
              value={grade} 
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setGrade(e.target.value)} 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold"
            >
              <option value="10">Grade 10</option>
              <option value="11">Grade 11</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">Resource URL (Drive or YouTube)</label>
            <input 
              value={url} 
              onChange={(e: ChangeEvent<HTMLInputElement>) => setUrl(e.target.value)} 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none font-bold" 
              placeholder="https://..." 
              required 
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading} 
          className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Publishing...' : 'Publish to Students'}
        </button>
      </form>
    </div>
  );
}