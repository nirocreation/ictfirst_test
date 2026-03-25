// components/Hero.tsx
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative w-full min-h-[80vh] flex flex-col items-center justify-center bg-[#FDFDFD] px-6 overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-[#EEF2FF] rounded-full blur-[120px] opacity-50 z-0" />

      <div className="relative z-10 max-w-4xl text-center">
        {/* Badge */}
        <div className="inline-block bg-[#D1D5F5] text-[#4F46E5] px-6 py-2 rounded-full text-[10px] font-black uppercase italic tracking-[0.3em] mb-8 animate-fade-in">
          Premium ICT Education
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl font-black text-slate-900 uppercase italic tracking-tighter leading-[0.85] mb-8">
          The Future of <br />
          <span className="text-[#1A5683]">ICT Learning</span>
        </h1>

        {/* Subtext */}
        <p className="text-slate-500 text-sm md:text-base font-bold uppercase tracking-widest max-w-2xl mx-auto leading-relaxed mb-12 opacity-80">
          Secure, high-definition video sessions with 1-on-1 support. 
          Access your library and master the syllabus with ICTFIRST.lk
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <Link 
            href="/login" 
            className="group relative px-10 py-5 bg-slate-900 text-white rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95"
          >
            <span className="relative z-10 font-black uppercase italic tracking-widest text-sm">
              Student Login →
            </span>
            <div className="absolute inset-0 bg-[#1A5683] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </Link>
          
          <Link 
            href="/faq" 
            className="px-10 py-5 bg-white text-slate-400 border border-slate-200 rounded-2xl font-black uppercase italic tracking-widest text-sm hover:bg-slate-50 transition-colors"
          >
            How it works
          </Link>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-24 pt-10 border-t border-slate-100 w-full max-w-2xl flex justify-around opacity-30">
        <span className="font-black italic text-[12px] uppercase tracking-[0.4em]">Secure Streaming</span>
        <span className="font-black italic text-[12px] uppercase tracking-[0.4em]">HD Content</span>
        <span className="font-black italic text-[12px] uppercase tracking-[0.4em]">Expert Support</span>
      </div>
    </section>
  );
}