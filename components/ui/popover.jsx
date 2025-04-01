"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

const PopoverContext = React.createContext({
  open: false,
  setOpen: () => {},
  triggerRef: null,
  contentRef: null,
})

export function Popover({ children, ...props }) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef(null)
  const contentRef = useRef(null)
  
  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        open &&
        contentRef.current &&
        !contentRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open])
  
  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      <div className="relative inline-block" {...props}>
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

export function PopoverTrigger({ children, asChild, ...props }) {
  const { open, setOpen, triggerRef } = React.useContext(PopoverContext)
  
  const handleClick = (e) => {
    e.preventDefault()
    setOpen(!open)
  }
  
  if (asChild) {
    return React.cloneElement(React.Children.only(children), {
      ref: triggerRef,
      onClick: handleClick,
      ...props,
    })
  }
  
  return (
    <button
      ref={triggerRef}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

export function PopoverContent({ children, className, ...props }) {
  const { open, contentRef } = React.useContext(PopoverContext)
  
  if (!open) return null
  
  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
