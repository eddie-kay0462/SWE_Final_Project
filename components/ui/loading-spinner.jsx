/**
 * Loading Spinner Component
 * 
 * A CSOFT-themed loading spinner for indicating loading states
 * Can be used as a full-page overlay or inline within components
 */

"use client"

import { GraduationCap } from "lucide-react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function LoadingSpinner({ 
  fullPage = false, 
  size = "default", 
  text = "Loading...",
  showText = true,
  className = ""
}) {
  const [dots, setDots] = useState(".")
  
  // Animated dots for the loading text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "." : prev + ".")
    }, 400)
    
    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-6 w-6",
    large: "h-10 w-10",
    xl: "h-16 w-16"
  }
  
  const spinnerContent = (
    <div className={cn(
      "flex flex-col items-center justify-center gap-3",
      className
    )}>
      <div className="relative animate-spin">
        <div className="absolute inset-0 rounded-full border-2 border-solid border-[#A91827] border-r-transparent"></div>
        <GraduationCap className={cn("text-[#A91827]", sizeClasses[size] || sizeClasses.default)} />
      </div>
      
      {showText && (
        <p className={cn(
          "text-[#A91827] font-medium",
          size === "small" ? "text-xs" : size === "large" ? "text-lg" : size === "xl" ? "text-xl" : "text-sm"
        )}>
          {text}{dots}
        </p>
      )}
    </div>
  )
  
  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 bg-[#f3f1ea]/80 backdrop-blur-sm flex items-center justify-center">
        {spinnerContent}
      </div>
    )
  }
  
  return spinnerContent
} 