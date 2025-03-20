"use client"

import React, { useState, useEffect } from "react"
import { X } from "lucide-react"

const Dialog = ({ children, open = false, onOpenChange }) => {
  const [isOpen, setIsOpen] = useState(open)

  useEffect(() => {
    setIsOpen(open)
  }, [open])

  const handleOpenChange = (open) => {
    setIsOpen(open)
    if (onOpenChange) onOpenChange(open)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => handleOpenChange(false)} />
      <div className="z-50 grid w-full max-w-lg scale-100 gap-4 bg-background p-6 opacity-100 shadow-lg rounded-lg border animate-fade-in">
        {children}
      </div>
    </div>
  )
}

const DialogTrigger = ({ children, onClick }) => {
  return React.cloneElement(children, {
    onClick: onClick,
  })
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
    <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props}>
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
    <p className={`text-sm text-muted-foreground ${className}`} {...props}>
      {children}
    </p>
  )
}

const DialogFooter = ({ children, className = "", ...props }) => {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`} {...props}>
      {children}
    </div>
  )
}

const DialogClose = ({ className = "", onClick, ...props }) => {
  return (
    <button
      className={`absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none ${className}`}
      onClick={onClick}
      {...props}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </button>
  )
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose }

