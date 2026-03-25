'use client';

import { useEffect, useState } from 'react';

interface AdminPayment {
  id: number;
  full_name: string;
  student_id: string;
  amount: number;
  status: string;
  proof_url: string;
  created_at: string;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/payments')
      .then(res => res.json())
      .then(data => setPayments(data.payments));
  }, []);

  const updateStatus = async (id: number, status: 'approved' | 'rejected') => {
    const res = await fetch('/api/admin/payments', {
      method: 'PATCH',
      body: JSON.stringify({ id, status, remarks: 'Processed by Admin' }),
    });
    if (res.ok) {
      setPayments(payments.map(p => p.id === id ? { ...p, status } : p));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-black uppercase italic mb-8">Payment Approvals</h1>
      
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Student</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Amount</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Slip</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Status</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition">
                <td className="p-6">
                  <p className="font-bold text-slate-900">{p.full_name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{p.student_id}</p>
                </td>
                <td className="p-6 font-mono font-bold text-blue-600">LKR {p.amount}</td>
                <td className="p-6">
                  <button 
                    onClick={() => setSelectedImage(p.proof_url)}
                    className="text-[10px] font-black uppercase text-blue-500 underline"
                  >
                    View Image
                  </button>
                </td>
                <td className="p-6">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    p.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {p.status}
                  </span>
                </td>
                <td className="p-6 space-x-2">
                  {p.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(p.id, 'approved')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase">Approve</button>
                      <button onClick={() => updateStatus(p.id, 'rejected')} className="bg-red-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lightbox for Image */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-10" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} className="max-w-full max-h-full rounded-xl shadow-2xl" alt="Slip" />
          <p className="absolute bottom-10 text-white font-black uppercase tracking-widest cursor-pointer">Click anywhere to close</p>
        </div>
      )}
    </div>
  );
}