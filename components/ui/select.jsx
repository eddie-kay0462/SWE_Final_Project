"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

const SelectContext = React.createContext({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
})

export function Select({ children, value, onValueChange, ...props }) {
  const [open, setOpen] = useState(false)
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative" {...props}>
        {children}
      </div>
    </SelectContext.Provider>
  )
}

export function SelectTrigger({ children, className, ...props }) {
  const { open, setOpen, value } = React.useContext(SelectContext)
  const triggerRef = useRef(null)
  
  return (
    <button
      ref={triggerRef}
      type="button"
      role="combobox"
      aria-expanded={open}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setOpen(!open)}
      {...props}
    >
      {children}
    </button>
  )
}

export function SelectValue({ placeholder, ...props }) {
  const { value } = React.useContext(SelectContext)
  
  return (
    <span className="text-sm" {...props}>
      {value || placeholder}
    </span>
  )
}

export function SelectContent({ children, className, ...props }) {
  const { open, setOpen } = React.useContext(SelectContext)
  const contentRef = useRef(null)
  
  // Close select when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        open &&
        contentRef.current &&
        !contentRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [open, setOpen])
  
  if (!open) return null
  
  return (
    <div
      ref={contentRef}
      className={cn(
        "absolute z-50 min-w-[8rem] w-full overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 mt-1",
        className
      )}
      {...props}
    >
      <div className="p-1">{children}</div>
    </div>
  )
}

export function SelectItem({ children, value, className, ...props }) {
  const { onValueChange, setOpen } = React.useContext(SelectContext)
  
  const handleClick = () => {
    onValueChange(value)
    setOpen(false)
  }
  
  return (
    <div
      role="option"
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </div>
  )
}
