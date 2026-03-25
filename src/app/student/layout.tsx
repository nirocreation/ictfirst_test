'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState('Student');

  useEffect(() => {
    fetch('/api/student/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success) setName(data.student.full_name.split(' ')[0]);
      });
  }, []);

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
      // Use window.location to ensure all state is wiped clean
      window.location.href = '/login';
    }
  };

  const menu = [
    { name: 'Dashboard', path: '/student/dashboard' },
    { name: 'Lessons', path: '/student/lessons' },
    { name: 'Profile', path: '/student/profile' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-gray-100 px-12 py-5 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="text-[#1A5683] font-black text-xl italic tracking-tighter uppercase">
          ICTFIRST.lk
        </div>

        <div className="flex items-center gap-8">
          {/* Navigation Links */}
          <div className="hidden md:flex gap-6">
            {menu.map(item => (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`text-[10px] font-black uppercase tracking-widest transition ${
                  pathname === item.path ? 'text-[#1A5683]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="h-6 w-[1px] bg-gray-200"></div>

          {/* Logout & Profile Section */}
          <div className="flex items-center gap-4">
             <button 
                onClick={handleLogout}
                className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition"
              >
                Logout 🚪
              </button>
              
              <Link href="/student/profile">
                <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-100 text-[#1A5683] font-bold text-[10px] uppercase cursor-pointer hover:bg-blue-100 transition">
                   👤 {name}
                </div>
              </Link>
          </div>
        </div>
      </nav>

      <main>{children}</main>
    </div>
  );
}