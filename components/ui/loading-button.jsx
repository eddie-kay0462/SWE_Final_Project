/**
 * Loading Button Component
 * 
 * A button with loading state that shows a spinner when loading is true
 * Extends the base Button component with loading functionality
 */

"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { getRandomMessage } from "@/lib/loading-messages"

export function LoadingButton({
  children,
  loading = false,
  disabled,
  className,
  showLoadingText = false,
  variant = "default",
  ...props
}) {
  const [loadingMessage, setLoadingMessage] = useState("")

  useEffect(() => {
    if (loading && showLoadingText) {
      setLoadingMessage(getRandomMessage())
      const interval = setInterval(() => {
        setLoadingMessage(getRandomMessage())
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [loading, showLoadingText])

  return (
    <Button
      disabled={loading || disabled}
      className={cn(
        "relative",
        loading && "cursor-not-allowed",
        className
      )}
      {...props}
    >
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute left-3 flex items-center"
          >
            <motion.div
              animate={{ 
                rotate: 360,
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <Loader2 className="h-4 w-4" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.span
        animate={loading ? { x: 8 } : { x: 0 }}
        className="flex items-center gap-2"
      >
        {showLoadingText && loading ? loadingMessage : children}
        
        {!loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
          >
            <Sparkles className="h-4 w-4" />
          </motion.div>
        )}
      </motion.span>
    </Button>
  )
} 