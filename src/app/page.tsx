// app/page.tsx
import Navbar from '@/app/components/navbar';
import Hero from '@/app/components/hero';
//import Footer from '@/components/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navbar /> {/* This contains your Privacy, Terms, Contact links */}
      
      <Hero />   {/* The section we just created */}

      {/* Optional: Add a small section here about Mrs. Dinushika or Course Grades */}
      
      {/* <Footer /> */}
    </main>
  );
}