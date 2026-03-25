'use client';

import { useEffect, useState } from 'react';

interface Student {
  id: number;
  student_id: string;
  full_name: string;
  email: string;
  grade: number;
  phone: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStudents(data.students);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-[#1A5683]">Admin Management</h1>
            <p className="text-gray-500 mt-1">Review and manage student registrations</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Total Students</span>
            <div className="text-2xl font-black text-[#1A5683]">{students.length}</div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A5683] text-white">
                <th className="p-6 font-semibold uppercase text-xs tracking-wider">Student ID</th>
                <th className="p-6 font-semibold uppercase text-xs tracking-wider">Full Name</th>
                <th className="p-6 font-semibold uppercase text-xs tracking-wider">Grade</th>
                <th className="p-6 font-semibold uppercase text-xs tracking-wider">WhatsApp</th>
                <th className="p-6 font-semibold uppercase text-xs tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={5} className="p-20 text-center text-gray-400 animate-pulse">Loading records...</td></tr>
              ) : students.map((student) => (
                <tr key={student.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-6">
                    <span className="font-mono font-bold text-[#1A5683] bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                      {student.student_id}
                    </span>
                  </td>
                  <td className="p-6 font-medium text-gray-800">{student.full_name}</td>
                  <td className="p-6 text-gray-600">Grade {student.grade}</td>
                  <td className="p-6 text-gray-600">{student.phone || 'N/A'}</td>
                  <td className="p-6">
                    <button 
                      onClick={() => window.open(`https://wa.me/${student.phone?.replace(/\D/g,'')}`, '_blank')}
                      className="text-xs font-bold text-green-600 hover:text-green-700 uppercase tracking-tighter"
                    >
                      Send ID via WhatsApp
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}