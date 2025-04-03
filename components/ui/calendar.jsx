"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Calendar({
  mode = "single",
  selected,
  onSelect,
  disabled,
  className,
  ...props
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState([])
  
  // Generate calendar days for the current month
  useEffect(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1)
    // Get the last day of the month
    const lastDay = new Date(year, month + 1, 0)
    
    // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay()
    
    // Calculate days from previous month to show
    const daysFromPrevMonth = firstDayOfWeek
    
    // Calculate total days to show (previous month + current month + next month)
    const totalDays = daysFromPrevMonth + lastDay.getDate()
    // Round up to nearest multiple of 7 to complete the last week
    const totalCalendarDays = Math.ceil(totalDays / 7) * 7
    
    const days = []
    
    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i)
      days.push({ date, isCurrentMonth: false })
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Next month days
    const remainingDays = totalCalendarDays - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({ date, isCurrentMonth: false })
    }
    
    setCalendarDays(days)
  }, [currentMonth])
  
  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }
  
  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }
  
  // Check if a date is selected
  const isSelected = (date) => {
    if (!selected) return false
    
    if (Array.isArray(selected)) {
      return selected.some(selectedDate => 
        selectedDate.getDate() === date.getDate() &&
        selectedDate.getMonth() === date.getMonth() &&
        selectedDate.getFullYear() === date.getFullYear()
      )
    }
    
    return (
      selected.getDate() === date.getDate() &&
      selected.getMonth() === date.getMonth() &&
      selected.getFullYear() === date.getFullYear()
    )
  }
  
  // Check if a date is disabled
  const isDateDisabled = (date) => {
    if (!disabled) return false
    return disabled(date)
  }
  
  // Handle date selection
  const handleSelect = (date) => {
    if (isDateDisabled(date)) return
    onSelect(date)
  }
  
  // Format month and year for display
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }
  
  // Days of the week
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
  
  return (
    <div className={cn("p-3", className)} {...props}>
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={prevMonth}
          className="h-7 w-7"
        >
          &lt;
        </Button>
        <div className="font-medium">
          {formatMonthYear(currentMonth)}
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          onClick={nextMonth}
          className="h-7 w-7"
        >
          &gt;
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map(({ date, isCurrentMonth }, index) => (
          <Button
            key={index}
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 p-0 font-normal",
              !isCurrentMonth && "text-muted-foreground opacity-50",
              isSelected(date) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              isDateDisabled(date) && "opacity-50 cursor-not-allowed"
            )}
            disabled={isDateDisabled(date)}
            onClick={() => handleSelect(date)}
          >
            {date.getDate()}
          </Button>
        ))}
      </div>
    </div>
  )
}
