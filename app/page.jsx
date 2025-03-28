"use client"

import { Hero } from "@/components/hero"
import { useRouter } from "next/navigation"
import { Features } from "@/components/features"
import Link from "next/link"
import { GraduationCap, MoveRight } from "lucide-react" 
// import { Navbar } from "@/components/navbar"

export default function LandingPage() {
  return (

    
    <main className="min-h-screen flex flex-col bg-[#f3f1ea]">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#A91827]" />
            <span className="text-xl font-bold">CSOFT</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium hover:text-[#A91827] transition-colors">
              Home
            </Link>
            <Link href="#features" className="text-sm font-medium hover:text-[#A91827] transition-colors">
              Services
            </Link>
            <Link href="#benefits" className="text-sm font-medium hover:text-[#A91827] transition-colors">
              About Us
            </Link>
          </nav>
        </div>
      </header>


      <Hero
        eyebrow="INTRODUCING CSOFT"
        title={
          <>
            <div className="whitespace-nowrap">
              <span className="font-serif font-normal">Career services, </span>
              <span className="font-serif font-normal italic">seamlessly </span>
              <span className="font-serif font-normal">connected</span>
            </div>
            <div className="font-serif font-normal">on your fingertips</div>
          </>
        }
        subtitle="CSOFT brings your career development, internship requests, and attendance tracking together in one place"
        // ctaText="Get Started"
        ctaLink="/auth/signup"
        mockupImage={{
          // src: "https://miro.medium.com/v2/resize:fit:2000/format:webp/1*8LkGdFNtXDE-owr2-U0I8Q.jpeg", 
          // src: "https://miro.medium.com/v2/resize:fit:2000/format:webp/1*9YRpoHnULRoFmkBgcGqsfg.jpeg",
          // src: "https://miro.medium.com/v2/resize:fit:4800/format:webp/1*gW65ZcT2quoQJ1NC_ZLIug.jpeg",
          // src: "https://miro.medium.com/v2/resize:fit:2000/format:webp/1*CDNPcCGiLVyXhajKu7_yzA.jpeg",
          // src: "https://miro.medium.com/v2/resize:fit:1000/format:webp/1*sBh-ibNZCPuDPaNVjl5Ukw.jpeg",
          // src: "https://miro.medium.com/v2/resize:fit:4800/format:webp/1*NXn3uB-5YbDKabhQnJ-Kbg.jpeg",
          src: "https://miro.medium.com/v2/resize:fit:2000/format:webp/1*rlPoTCOCoM3I--FouRCmsg.jpeg",
          // src: "https://miro.medium.com/v2/resize:fit:1000/format:webp/1*zPz-Pr3mF1fOY_PIFYZuwg.jpeg",
          // src: "https://miro.medium.com/v2/resize:fit:2000/format:webp/1*K3-xpZ3GbvHUTibpbGcWug.jpeg",
          // src: "https://miro.medium.com/v2/resize:fit:1000/format:webp/1*Gr0HGtYaOLY40DZ8XtJJ0g.jpeg",
          // src: "https://miro.medium.com/v2/resize:fit:1000/format:webp/1*zy1ioePWRsTeyk7-wJW8dw.jpeg",
          // src: "https://miro.medium.com/v2/resize:fit:668/format:webp/1*veQ90fttmMfHURt0sZkxXw.jpeg",
          // src: "https://miro.medium.com/v2/resize:fit:1000/format:webp/1*kEnzLIASEPaiwz3FWLVWBw.jpeg",
          // src: "https://miro.medium.com/v2/resize:fit:4800/format:webp/1*b2MHkiDNJgAwB_c0vKZTog.jpeg",
          alt: "CSOFT Dashboard Interface",
          width: 1200,
          height: 800,
        }}
      />

      <Features 
        id="features"
        title="Everything you need for career success"
        subtitle="Streamline your career development journey with powerful tools designed for students and career advisors"
      />

      <section id="benefits" className="py-32 bg-[#f3f1ea]">
        <div className="container px-4 max-w-7xl">
          <h2 className="text-[40px] md:text-[52px] text-center font-medium mb-6 animate-appear opacity-0">
            Why choose CSOFT?
          </h2>
          <p className="text-xl md:text-2xl text-center text-[#000000]/70 max-w-3xl mx-auto mb-20 animate-appear opacity-0 delay-100">
            Designed to enhance your career services experience
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-16">
            <div className="bg-white p-10 rounded-xl shadow-sm animate-appear opacity-0 delay-200">
              <h3 className="text-2xl font-medium mb-6">For Students</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Easy access to career resources and events</span>
                </li>
                <li className="flex items-start gap-3 text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Streamlined internship letter requests</span>
                </li>
                <li className="flex items-start gap-3 text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Track your career development progress</span>
                </li>
                <li className="flex items-start gap-3 text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Receive timely notifications about opportunities</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-10 rounded-xl shadow-sm animate-appear opacity-0 delay-300">
              <h3 className="text-2xl font-medium mb-6">For Career Advisors</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Efficient attendance tracking for events</span>
                </li>
                <li className="flex items-start gap-3 text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Streamlined approval process for internship letters</span>
                </li>
                <li className="flex items-start gap-3 text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Comprehensive analytics and reporting</span>
                </li>
                <li className="flex items-start gap-3 text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Improved communication with students</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="container px-4 max-w-7xl text-center">
          <h2 className="text-[40px] md:text-[52px] font-medium mb-6 animate-appear opacity-0">
            Ready to transform your career services?
          </h2>
          <p className="text-xl md:text-2xl text-[#000000]/70 max-w-3xl mx-auto mb-10 animate-appear opacity-0 delay-100">
            Join CSOFT today and experience the future of career development management
          </p>
          <Link href="/auth/signup">
            <div className="inline-flex items-center bg-[#A91827] text-[#ffffff] rounded-[10px] hover:bg-[#A91827]/90 transition-colors w-[227px] h-[49px] animate-appear opacity-0 delay-200 mx-auto">
              <div className="flex items-center justify-between w-full pl-[22px] pr-[17px]">
                <span className="text-[19px] whitespace-nowrap">Get Started</span>
                <MoveRight className="h-6 w-6 text-[#ffffff]" />
                <div className="flex items-center gap-[14px]">
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

    <footer className="border-t bg-[#f3f1ea]">
      <div className="container py-8 md:py-12 px-4 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#A91827]" />
            <span className="text-xl font-bold">CSOFT</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-[#000000]/70">&copy; {new Date().getFullYear()} CSOFT. All rights reserved.</p>
            <p className="text-xs text-[#000000]/70 mt-1">Career Services On Finger Tips</p>
          </div>
        </div>
      </div>
    </footer>
  </main>
  )
}