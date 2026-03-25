'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: 'Privacy', href: '/privacy' },
    { name: 'Terms', href: '/terms' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="flex justify-between items-center h-20">
          
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-black text-2xl text-[#1A5683] italic tracking-[0.2em] transition-transform group-hover:scale-105">
              ICTFIRST<span className="text-slate-900">.LK</span>
            </span>
          </Link>

          {/* DESKTOP LINKS */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors hover:text-[#1A5683] ${
                  isActive(link.href) ? 'text-[#1A5683]' : 'text-slate-400'
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            <Link 
              href="/login" 
              className="ml-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1A5683] transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              Login
            </Link>
          </div>

          {/* MOBILE TOGGLE */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-slate-900 p-2"
          >
            <div className="w-6 h-0.5 bg-current mb-1.5" />
            <div className="w-6 h-0.5 bg-current mb-1.5" />
            <div className="w-4 h-0.5 bg-current ml-auto" />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 animate-in slide-in-from-top duration-300">
          <div className="flex flex-col p-6 gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-black uppercase tracking-widest text-slate-600 border-b border-slate-50 pb-2"
              >
                {link.name}
              </Link>
            ))}
            <Link 
              href="/login"
              className="w-full py-4 bg-slate-900 text-white text-center rounded-2xl font-black uppercase tracking-widest text-[11px]"
            >
              Student Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}