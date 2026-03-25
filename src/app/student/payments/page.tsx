'use client';

import { useEffect, useState, useCallback } from 'react';

// 1. Define the Payment Interface
interface Payment {
  id: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 2. Wrap fetchPayments in useCallback to prevent re-renders
  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch('/api/student/payments');
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !image) {
      alert("Please enter amount and upload a slip.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/student/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), proof_url: image }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Slip uploaded successfully!");
        setAmount('');
        setImage(null);
        fetchPayments(); // Refresh the list
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center font-black text-[#1A5683] animate-pulse uppercase tracking-widest">
        Verifying Ledger...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
      
      {/* 1. Upload Section */}
      <div className="lg:col-span-1">
        <h2 className="text-3xl font-black text-gray-900 uppercase italic mb-6">Submit Slip</h2>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
          <div className="mb-6">
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Amount (LKR)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-4 bg-gray-50 rounded-2xl border-none font-bold text-[#1A5683] outline-none focus:ring-2 focus:ring-blue-100" 
              placeholder="2500"
              required
            />
          </div>
          
          <div className="mb-8">
            <label className="block text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Bank Receipt</label>
            <div className="relative border-2 border-dashed border-gray-100 rounded-2xl p-4 text-center hover:bg-gray-50 transition">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                {image ? "✅ Image Selected" : "Click to upload slip"}
              </span>
            </div>
          </div>

          <button 
            type="submit"
            disabled={submitting}
            className="w-full py-4 bg-[#1A5683] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-[1.02] transition disabled:opacity-50"
          >
            {submitting ? 'Processing...' : 'Submit Payment'}
          </button>
        </form>
      </div>

      {/* 2. History Section */}
      <div className="lg:col-span-2">
        <h2 className="text-3xl font-black text-gray-900 uppercase italic mb-6">Payment History</h2>
        <div className="space-y-4">
          {payments.length > 0 ? (
            payments.map((p: Payment) => (
              <div key={p.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex justify-between items-center shadow-sm hover:border-blue-100 transition">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {new Date(p.created_at).toLocaleDateString()}
                  </p>
                  <h4 className="text-lg font-black text-gray-800">LKR {p.amount}.00</h4>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    p.status === 'approved' ? 'bg-green-50 text-green-600' : 
                    p.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-gray-50 p-12 rounded-[2.5rem] text-center border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No transaction history found.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}