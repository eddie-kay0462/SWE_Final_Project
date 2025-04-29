"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

const PopoverContext = React.createContext({
  open: false,
  setOpen: () => {},
  triggerRef: null,
  contentRef: null,
})

export function Popover({ children, open: controlledOpen, onOpenChange, ...props }) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const triggerRef = useRef(null)
  const contentRef = useRef(null)

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = (newOpen) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen)
    }
    if (onOpenChange) {
      onOpenChange(newOpen)
    }
  }

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

  // Extract onOpenChange from props so it doesn't get passed to the div
  const divProps = { ...props }

  return (
    <PopoverContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
      <div className="relative inline-block" {...divProps}>
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
    <button ref={triggerRef} onClick={handleClick} {...props}>
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
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
