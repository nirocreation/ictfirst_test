'use client';

import { useState, useEffect } from 'react';

interface Student {
  id: number;
  student_id: string;
  full_name: string;
  email: string;
  grade: number;
  phone: string;
  profile_image: string | null;
}

export default function StudentProfile() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Calling the API route we just created above
    fetch('/api/student/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStudent(data.student);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdate = async () => {
    if (!student) return;
    const res = await fetch('/api/student/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });
    if (res.ok) alert("Profile Updated!");
  };

  if (loading) return <div className="p-20 text-center font-bold text-[#1A5683]">Loading Academic Atelier...</div>;
  if (!student) return <div className="p-20 text-center">Please login to view profile.</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans">
      

      <main className="max-w-6xl mx-auto px-6 pt-12">
        {/* Profile Avatar Area */}
        <div className="flex flex-col items-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative w-32 h-32 mb-4 group">
            <div className="w-full h-full rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-100 ring-4 ring-[#E2EEF9]">
               <img src={student.profile_image || "https://ui-avatars.com/api/?name=" + student.full_name} alt="Profile" className="w-full h-full object-cover" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">{student.full_name}</h1>
          <p className="text-[#1A5683] font-bold text-xs mt-1 uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-full">Student ID: {student.student_id || 'PENDING'}</p>
        </div>

        {/* Input Sections (Personal & Connectivity) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
              <h3 className="font-black text-gray-900 mb-8 flex items-center gap-2">
                <span className="w-2 h-2 bg-[#1A5683] rounded-full"></span> Personal Identity
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={student.full_name}
                    onChange={(e) => setStudent({...student, full_name: e.target.value})}
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#1A5683] font-bold text-gray-700"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Grade Level</label>
                  <select 
                    value={student.grade}
                    onChange={(e) => setStudent({...student, grade: parseInt(e.target.value)})}
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#1A5683] font-bold text-gray-700"
                  >
                    <option value={10}>Grade 10</option>
                    <option value={11}>Grade 11</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          {/* Connectivity Card */}
          <div className="space-y-8">
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100">
              <h3 className="font-black text-gray-900 mb-8 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span> Connectivity
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Email</label>
                  <input type="text" value={student.email} disabled className="w-full p-4 bg-gray-100 rounded-2xl font-bold text-gray-400" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">WhatsApp Number</label>
                  <input 
                    type="text" 
                    value={student.phone}
                    onChange={(e) => setStudent({...student, phone: e.target.value})}
                    className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#1A5683] font-bold text-gray-700"
                  />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Action Footer */}
        <div className="mt-12 flex justify-center gap-6">
          <button className="px-12 py-4 font-bold text-gray-400 hover:text-gray-600 transition">Discard</button>
          <button onClick={handleUpdate} className="px-12 py-4 bg-[#1A5683] text-white rounded-2xl font-bold shadow-xl shadow-blue-900/20 hover:scale-105 transition-all active:scale-95">Save Changes</button>
        </div>
      </main>
    </div>
  );
}