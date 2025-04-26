/**
 * Loading Button Component
 * 
 * A button with loading state that shows a spinner when loading is true
 * Extends the base Button component with loading functionality
 */

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export function LoadingButton({
  children,
  loading = false,
  disabled,
  className,
  ...props
}) {
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
      {loading && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {children}
    </Button>
  )
} 