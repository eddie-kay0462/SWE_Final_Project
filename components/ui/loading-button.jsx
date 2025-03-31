/**
 * Loading Button Component
 * 
 * A button with loading state that shows a spinner when isLoading is true
 * Extends the base Button component with loading functionality
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "./button"
import { cn } from "@/lib/utils"
import { LoadingSpinner } from "./loading-spinner"

export function LoadingButton({
  children,
  isLoading = false,
  loadingText = "Loading...",
  disabled = false,
  spinnerSize = "small",
  spinnerOnly = false,
  className = "",
  onClick,
  ...props
}) {
  const [isProcessing, setIsProcessing] = useState(isLoading)
  
  // Update internal state when prop changes
  useEffect(() => {
    setIsProcessing(isLoading)
  }, [isLoading])
  
  // Handle click with optional async processing
  const handleClick = async (e) => {
    if (isProcessing || !onClick) return
    
    if (onClick.constructor.name === 'AsyncFunction') {
      try {
        setIsProcessing(true)
        await onClick(e)
      } finally {
        setIsProcessing(false)
      }
    } else {
      onClick(e)
    }
  }
  
  return (
    <Button
      className={cn(className)}
      disabled={disabled || isProcessing}
      onClick={handleClick}
      {...props}
    >
      {isProcessing ? (
        <span className="flex items-center justify-center gap-2">
          <LoadingSpinner 
            size={spinnerSize} 
            showText={!spinnerOnly} 
            text={loadingText} 
          />
          {!spinnerOnly && (
            <span className="ml-1">{loadingText}</span>
          )}
        </span>
      ) : (
        children
      )}
    </Button>
  )
} 