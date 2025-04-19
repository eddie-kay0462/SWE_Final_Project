"use client"

import React, { useState, useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// Simple Dialog component without context
const Dialog = ({ children, open = false, onOpenChange }) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevent body scrolling when dialog is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!isMounted) {
    return null
  }

  // If dialog is open, render it, otherwise return null
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange && onOpenChange(false)}
        aria-hidden="true"
      />
      <div
        className="z-50 grid w-full max-w-lg scale-100 gap-4 bg-background p-6 opacity-100 shadow-lg rounded-lg border"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

// Simple trigger that just calls the provided onClick
const DialogTrigger = ({ children, onClick, asChild, ...props }) => {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick,
      ...props,
    })
  }

  return (
    <button type="button" onClick={onClick} {...props}>
      {children}
    </button>
  )
}

const DialogContent = ({ children, className = "", ...props }) => {
  return (
    <div className={`relative ${className}`} {...props}>
      {children}
    </div>
  )
}

const DialogHeader = ({ children, className = "", ...props }) => {
  return (
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left mb-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

const DialogTitle = ({ children, className = "", ...props }) => {
  return (
    <h2 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h2>
  )
}

const DialogDescription = ({ children, className = "", ...props }) => {
  return (
    <p className={`text-sm text-muted-foreground mt-1 ${className}`} {...props}>
      {children}
    </p>
  )
}

const DialogFooter = ({ children, className = "", ...props }) => {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

const DialogClose = ({ className = "", onClick, onOpenChange, ...props }) => {
  return (
    <button
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
        className,
      )}
      onClick={(e) => {
        e.stopPropagation()
        if (onClick) onClick(e)
        if (onOpenChange) onOpenChange(false)
      }}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  )
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose }
