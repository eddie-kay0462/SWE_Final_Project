import React from "react"
import { cn } from "@/lib/utils"
import { cva } from "class-variance-authority"

const mockupVariants = cva("flex relative z-10 overflow-hidden shadow-2xl border border-border/5 border-t-border/15", {
  variants: {
    variant: {
      browser: "",
      phone: "rounded-[2.5rem] aspect-[9/19.5]",
      "phone-dark": "rounded-[2.5rem] aspect-[9/19.5] bg-black",
    },
  },
  defaultVariants: {
    variant: "browser",
  },
})

export function Mockup({ variant, className, children, ...props }) {
  return (
    <div className={cn(mockupVariants({ variant }), className)} {...props}>
      {variant === "browser" && (
        <div className="absolute inset-x-0 top-0 h-14 border-b border-border/5 bg-gradient-to-b from-background/10 to-transparent backdrop-blur-sm">
          <div className="flex h-full items-center gap-2 px-4">
            <div className="flex gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <div className="ml-4 flex-1">
              <div className="h-8 w-full rounded-lg bg-gradient-to-r from-border/10 to-border/5" />
            </div>
          </div>
        </div>
      )}
      {variant?.includes("phone") && (
        <div className="absolute inset-x-0 top-0 z-50 h-6 w-full">
          <div className="absolute left-1/2 top-1/2 h-4 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full bg-border/5" />
        </div>
      )}
      {children}
    </div>
  )
}

const frameVariants = cva("bg-accent/5 flex relative z-10 overflow-hidden rounded-2xl", {
  variants: {
    size: {
      sm: "p-2",
      md: "p-4",
      lg: "p-8",
    },
  },
  defaultVariants: {
    size: "md",
  },
})

export function MockupFrame({ size, className, children, ...props }) {
  return (
    <div className={cn(frameVariants({ size }), className)} {...props}>
      {children}
    </div>
  )
}