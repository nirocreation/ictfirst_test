'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // 1. Added useRouter

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter(); // 2. Initialize router

  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/admin/dashboard' },
    { name: 'Students', icon: '👥', path: '/admin/students' },
    { name: 'Payments', icon: '💳', path: '/admin/payments' },
    { name: 'Content', icon: '📝', path: '/admin/content' },
    { name: 'Live Classes', icon: '🎥', path: '/admin/live' },
  ];

  // 3. Logout Logic
  const handleLogout = async () => {
    try {
      // If using NextAuth.js, use: signOut({ callbackUrl: '/login' });
      // For custom session handling:
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      
      // Redirect to login page
      router.push('/login');
      router.refresh(); 
    } catch (error) {
      console.error("Logout failed:", error);
      // Fallback redirect if API fails
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col p-6 fixed h-full">
        <div className="mb-10 px-2">
          <h2 className="text-xl font-black text-[#1A5683] tracking-tighter">ICTFIRST.lk</h2>
        </div>

        <div className="bg-slate-50 rounded-3xl p-4 mb-8 flex items-center gap-3 border border-slate-100">
          <div className="w-10 h-10 bg-[#1A5683] rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">🎓</div>
          <div>
            <p className="text-sm font-bold text-slate-900 leading-none">Admin Portal</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Mrs. Kalugampitiya</p>
          </div>
        </div>

        <nav className="flex-grow space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                pathname === item.path 
                ? 'bg-[#1A5683] text-white shadow-xl shadow-blue-900/10' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-bold uppercase tracking-widest text-[10px]">{item.name}</span>
              {pathname === item.path && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
            </Link>
          ))}
        </nav>

        <div className="mt-auto space-y-4">
          <button className="w-full bg-[#1A5683] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
            <span className="text-base">+</span> Schedule Class
          </button>
          <div className="pt-6 border-t border-slate-100 space-y-1">
             <button className="w-full flex items-center gap-3 px-4 py-2 text-slate-400 text-[10px] font-black uppercase hover:text-slate-600">❓ Support</button>
             {/* 4. Added onClick handler below */}
             <button 
               onClick={handleLogout} 
               className="w-full flex items-center gap-3 px-4 py-2 text-red-400 text-[10px] font-black uppercase hover:text-red-600 transition-colors"
             >
               🚪 Logout
             </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow ml-72">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40">
           <div className="relative w-96 group">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
             <input 
              type="text" 
              placeholder="Search for students..." 
              className="w-full bg-slate-100/50 border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium outline-none"
             />
           </div>
           <div className="flex items-center gap-6">
              <button className="text-slate-400 hover:text-slate-600 relative">🔔 <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white" /></button>
              <button className="text-slate-400 hover:text-slate-600">⚙️</button>
              <div className="w-10 h-10 bg-orange-100 rounded-xl border border-orange-200" />
           </div>
        </header>

        <div className="p-10">{children}</div>
      </main>
    </div>
  );
}