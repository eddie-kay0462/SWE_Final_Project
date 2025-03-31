"use client"

/**
 * Loading Components Demo Page
 * 
 * Demonstrates how to use the loading components in different scenarios
 */

import { useState } from "react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { LoadingButton } from "@/components/ui/loading-button"
import { GraduationCap } from "lucide-react"
import Link from "next/link"

export default function LoadingDemoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isButtonLoading, setIsButtonLoading] = useState(false)
  const [showFullPage, setShowFullPage] = useState(false)
  
  // Simulate an API call
  const simulateApiCall = () => {
    setIsButtonLoading(true)
    setTimeout(() => {
      setIsButtonLoading(false)
    }, 2000)
  }
  
  // Simulate a full page load
  const simulateFullPageLoad = () => {
    setShowFullPage(true)
    setTimeout(() => {
      setShowFullPage(false)
    }, 3000)
  }
  
  // Simulate loading with different states
  const toggleLoading = () => {
    setIsLoading(prev => !prev)
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-[#f3f1ea]">
      {showFullPage && <LoadingSpinner fullPage size="large" text="Loading page" />}
      
      {/* Header */}
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-[#A91827]" />
            <span className="text-xl font-bold">CSOFT</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Loading Components Demo</h1>
          
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-xl font-medium mb-4">LoadingSpinner Component</h2>
            <p className="mb-4">Use this component to indicate loading states.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-6">
              <div className="flex flex-col items-center">
                <p className="mb-2">Small</p>
                <LoadingSpinner size="small" />
              </div>
              <div className="flex flex-col items-center">
                <p className="mb-2">Default</p>
                <LoadingSpinner size="default" />
              </div>
              <div className="flex flex-col items-center">
                <p className="mb-2">Large</p>
                <LoadingSpinner size="large" />
              </div>
              <div className="flex flex-col items-center">
                <p className="mb-2">Extra Large</p>
                <LoadingSpinner size="xl" />
              </div>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={toggleLoading}
                className="bg-[#A91827] text-white px-4 py-2 rounded-lg hover:bg-[#A91827]/90 transition-colors"
              >
                {isLoading ? "Hide" : "Show"} Custom Spinner
              </button>
            </div>
            
            {isLoading && (
              <div className="mt-6 p-8 border rounded-lg flex justify-center">
                <LoadingSpinner text="Custom loading text" size="large" />
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <h2 className="text-xl font-medium mb-4">LoadingButton Component</h2>
            <p className="mb-4">Use this component for buttons that trigger asynchronous actions.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col items-center">
                <p className="mb-2">With Text</p>
                <LoadingButton 
                  isLoading={isButtonLoading}
                  onClick={simulateApiCall}
                  loadingText="Processing..."
                  className="w-full bg-[#A91827] text-white"
                >
                  Submit Form
                </LoadingButton>
              </div>
              <div className="flex flex-col items-center">
                <p className="mb-2">Spinner Only</p>
                <LoadingButton 
                  isLoading={isButtonLoading}
                  onClick={simulateApiCall}
                  loadingText="Processing..."
                  spinnerOnly={true}
                  className="w-full bg-[#A91827] text-white"
                >
                  Submit Form
                </LoadingButton>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-medium mb-4">Full Page Loading</h2>
            <p className="mb-4">Use this for page transitions or initial data loading.</p>
            
            <div className="flex justify-center">
              <button 
                onClick={simulateFullPageLoad}
                className="bg-[#A91827] text-white px-4 py-2 rounded-lg hover:bg-[#A91827]/90 transition-colors"
              >
                Show Full Page Spinner (3 seconds)
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-[#f3f1ea]">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#A91827]" />
              <span className="text-lg font-bold">CSOFT</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-xs text-gray-500">
                &copy; {new Date().getFullYear()} CSOFT. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 