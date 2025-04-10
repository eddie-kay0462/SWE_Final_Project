"use client"

import { Hero } from "@/components/hero"
import { useRouter } from "next/navigation"
import { Features } from "@/components/features"
import Link from "next/link"
import { GraduationCap, MoveRight, Menu } from "lucide-react" 
import { useState, useCallback } from "react"
import Image from "next/image"

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <main className="min-h-screen flex flex-col bg-[#f3f1ea]">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#A91827]" />
            <span className="text-xl font-bold">CSOFT</span>
          </Link>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <div className="flex gap-6">
              <Link href="/" className="text-sm font-medium hover:text-[#A91827] transition-colors">
                Home
              </Link>
              <Link href="#features" className="text-sm font-medium hover:text-[#A91827] transition-colors">
                Services
              </Link>
              <Link href="#benefits" className="text-sm font-medium hover:text-[#A91827] transition-colors">
                About Us
              </Link>
            </div>

            <div className="flex items-center gap-3 ml-6">
              <Link href="/auth/login" className="text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="text-sm font-medium px-4 py-2 bg-[#A91827] text-white rounded-lg hover:bg-[#A91827]/90 transition-colors">
                Get Started
              </Link>
            </div>
          </nav>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="absolute top-16 left-0 right-0 bg-white shadow-lg md:hidden">
              <nav className="flex flex-col p-4">
                <Link 
                  href="/" 
                  className="py-2 text-sm font-medium hover:text-[#A91827] transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Home
                </Link>
                <Link 
                  href="#features" 
                  className="py-2 text-sm font-medium hover:text-[#A91827] transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Services
                </Link>
                <Link 
                  href="#benefits" 
                  className="py-2 text-sm font-medium hover:text-[#A91827] transition-colors"
                  onClick={toggleMobileMenu}
                >
                  About Us
                </Link>
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t">
                  <Link 
                    href="/auth/login" 
                    className="py-2 text-sm font-medium text-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/signup" 
                    className="py-2 text-sm font-medium text-center bg-[#A91827] text-white rounded-lg hover:bg-[#A91827]/90 transition-colors"
                    onClick={toggleMobileMenu}
                  >
                    Get Started
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      <Hero
        eyebrow="INTRODUCING CSOFT"
        title={
          <>
            <div className="whitespace-normal md:whitespace-nowrap px-4 md:px-0">
              <span className="font-serif font-normal">Career services, </span>
              <span className="font-serif font-normal italic">seamlessly </span>
              <span className="font-serif font-normal">connected</span>
            </div>
            <div className="font-serif font-normal">on your fingertips</div>
          </>
        }
        subtitle="CSOFT brings your career development, internship requests, and attendance tracking together in one place"
        ctaText="Get Started"
        ctaLink="/auth/signup"
        mockupImage={{
          src: "https://miro.medium.com/v2/resize:fit:2000/format:webp/1*rlPoTCOCoM3I--FouRCmsg.jpeg",
          alt: "Career Services Team",
          width: 1200,
          height: 800,
        }}
      />

      <Features 
        id="features"
        title="Everything you need for career success"
        subtitle="Streamline your career development journey with powerful tools designed for students and career advisors"
      />

      <section id="benefits" className="py-16 md:py-32 bg-[#f3f1ea]">
        <div className="container px-4 max-w-7xl">
          <h2 className="text-3xl md:text-[52px] text-center font-medium mb-6">
            Why choose CSOFT?
          </h2>
          <p className="text-lg md:text-2xl text-center text-[#000000]/70 max-w-3xl mx-auto mb-12 md:mb-20">
            Designed to enhance your career services experience
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mt-8 md:mt-16">
            <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm">
              <h3 className="text-xl md:text-2xl font-medium mb-4 md:mb-6">For Students</h3>
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start gap-3 text-base md:text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Easy access to career resources and events</span>
                </li>
                <li className="flex items-start gap-3 text-base md:text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Streamlined internship letter requests</span>
                </li>
                <li className="flex items-start gap-3 text-base md:text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Track your career development progress</span>
                </li>
                <li className="flex items-start gap-3 text-base md:text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Receive timely notifications about opportunities</span>
                </li>
              </ul>
            </div>

            <div className="bg-white p-6 md:p-10 rounded-xl shadow-sm">
              <h3 className="text-xl md:text-2xl font-medium mb-4 md:mb-6">For Career Advisors</h3>
              <ul className="space-y-3 md:space-y-4">
                <li className="flex items-start gap-3 text-base md:text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Efficient attendance tracking for events</span>
                </li>
                <li className="flex items-start gap-3 text-base md:text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Streamlined approval process for internship letters</span>
                </li>
                <li className="flex items-start gap-3 text-base md:text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Comprehensive analytics and reporting</span>
                </li>
                <li className="flex items-start gap-3 text-base md:text-lg">
                  <span className="text-[#A91827] font-bold">→</span>
                  <span>Improved communication with students</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-32 bg-white">
        <div className="container px-4 max-w-7xl text-center">
          <h2 className="text-3xl md:text-[52px] font-medium mb-4 md:mb-6">
            Ready to transform your career services?
          </h2>
          <p className="text-lg md:text-2xl text-[#000000]/70 max-w-3xl mx-auto mb-8 md:mb-10">
            Join CSOFT today and experience the future of career development management
          </p>
          <Link href="/auth/signup">
            <div className="inline-flex items-center bg-[#A91827] text-[#ffffff] rounded-[10px] hover:bg-[#A91827]/90 transition-colors w-full md:w-[227px] h-[49px] mx-auto">
              <div className="flex items-center justify-between w-full px-4 md:pl-[22px] md:pr-[17px]">
                <span className="text-[17px] md:text-[19px] whitespace-nowrap">Get Started</span>
                <MoveRight className="h-5 w-5 md:h-6 md:w-6 text-[#ffffff]" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      <footer className="border-t bg-[#f3f1ea]">
        <div className="container py-6 md:py-8 px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-[#A91827]" />
              <span className="text-lg md:text-xl font-bold">CSOFT</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs md:text-sm text-[#000000]/70">&copy; {new Date().getFullYear()} CSOFT. All rights reserved.</p>
              <p className="text-xs text-[#000000]/70 mt-1">Career Services On Finger Tips</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}