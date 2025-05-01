/**
 * Loading Spinner Component
 * 
 * A CSOFT-themed loading spinner with animated elements and rotating messages
 * Features dark mode support and optimized animations
 */

"use client"

import { GraduationCap, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { getRandomMessage } from "@/lib/loading-messages"
import { useTheme } from "next-themes"

export function LoadingSpinner({ 
  fullPage = false, 
  size = "default", 
  showText = true,
  className = "",
  progress
}) {
  const [message, setMessage] = useState(getRandomMessage())
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  // Rotate through messages faster
  useEffect(() => {
    const interval = setInterval(() => {
      setMessage(getRandomMessage())
    }, 2000)
    
    return () => clearInterval(interval)
  }, [])

  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-6 w-6",
    large: "h-10 w-10",
    xl: "h-16 w-16"
  }
  
  const spinnerVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.2
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 0.15,
        ease: "easeOut"
      }
    }
  }

  const messageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.2
      }
    },
    exit: { 
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.15
      }
    }
  }

  const sparkleVariants = {
    initial: { scale: 0, rotate: 0 },
    animate: {
      scale: [0, 1, 0],
      rotate: [0, 180, 360],
      transition: {
        duration: 1.2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }
  
  const spinnerContent = (
    <motion.div 
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        className
      )}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={spinnerVariants}
    >
      <div className="relative">
        <motion.div 
          className="absolute inset-0 -m-4"
          animate={{ 
            rotate: 360,
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className={cn(
            "absolute inset-0 rounded-full border-2 border-solid border-r-transparent",
            isDark ? "border-neutral-100" : "border-[#A91827]"
          )}/>
        </motion.div>
        
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <GraduationCap className={cn(
            sizeClasses[size] || sizeClasses.default,
            isDark ? "text-neutral-100" : "text-[#A91827]"
          )} />
        </motion.div>

        {/* Animated sparkles */}
        <motion.div
          className="absolute -right-2 -top-2"
          variants={sparkleVariants}
        >
          <Sparkles className={cn(
            "h-3 w-3",
            isDark ? "text-yellow-300" : "text-yellow-400"
          )} />
        </motion.div>
      </div>
      
      {showText && (
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            className={cn(
              "font-medium text-center",
              isDark ? "text-neutral-100" : "text-[#A91827]",
              size === "small" ? "text-xs" : 
              size === "large" ? "text-lg" : 
              size === "xl" ? "text-xl" : "text-sm"
            )}
            variants={messageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {message}
          </motion.p>
        </AnimatePresence>
      )}

      {progress !== undefined && (
        <motion.div 
          className={cn(
            "w-48 h-1 rounded-full overflow-hidden",
            isDark ? "bg-neutral-800" : "bg-gray-200"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className={cn(
              "h-full",
              isDark ? "bg-neutral-100" : "bg-[#A91827]"
            )}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      )}
    </motion.div>
  )
  
  if (fullPage) {
    return (
      <motion.div 
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm",
          isDark ? "bg-background/90" : "bg-[#f3f1ea]/90"
        )}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {spinnerContent}
      </motion.div>
    )
  }
  
  return spinnerContent
} 