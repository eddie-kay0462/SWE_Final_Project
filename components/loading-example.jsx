"use client"

/**
 * Loading Example Component
 * 
 * Demonstrates how to use the enhanced loading components and provider
 * with Framer Motion animations and rotating messages
 */

import { useState } from "react"
import { useLoading } from "@/components/ui/loading-provider"
import { LoadingButton } from "@/components/ui/loading-button"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { motion } from "framer-motion"

export function LoadingExample() {
  const [localLoading, setLocalLoading] = useState(false)
  const { startLoading, stopLoading } = useLoading()
  
  // Simulate a local component loading state
  const handleLocalAction = async () => {
    setLocalLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setLocalLoading(false)
  }
  
  // Simulate a global loading state (full page)
  const handleGlobalAction = async () => {
    startLoading()
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000))
    stopLoading()
  }
  
  // Simulate a form submission with multiple steps
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLocalLoading(true)
      
      // Step 1: Validate form (simulate delay)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Step 2: Show global loading for submission
      startLoading()
      
      // Step 3: Process form (simulate API call)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Success!
      alert("Form submitted successfully!")
    } catch (error) {
      console.error("Error submitting form:", error)
      alert("An error occurred. Please try again.")
    } finally {
      setLocalLoading(false)
      stopLoading()
    }
  }
  
  return (
    <motion.div 
      className="space-y-6 p-6 bg-white rounded-lg shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.h2 
        className="text-xl font-medium"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Loading States Example
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          className="space-y-4 p-4 border rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-medium">Component Loading</h3>
          <p className="text-sm text-gray-600">
            Local loading state within a component. 
            Useful for actions that don't block the entire UI.
          </p>
          
          <div className="flex justify-between items-center">
            {localLoading && (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="small" showText={false} />
                <span className="text-sm">Processing...</span>
              </div>
            )}
          </div>
          
          <LoadingButton
            loading={localLoading}
            onClick={handleLocalAction}
            showLoadingText={true}
            className="w-full bg-[#A91827] text-white hover:bg-[#8a1420]"
          >
            Load Component Data
          </LoadingButton>
        </motion.div>
        
        <motion.div 
          className="space-y-4 p-4 border rounded-lg"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-medium">Global Loading</h3>
          <p className="text-sm text-gray-600">
            Full page loading state for major transitions.
            Blocks the entire UI during important operations.
          </p>
          
          <LoadingButton
            onClick={handleGlobalAction}
            showLoadingText={true}
            className="w-full bg-[#A91827] text-white hover:bg-[#8a1420]"
          >
            Show Global Loading
          </LoadingButton>
        </motion.div>
      </div>
      
      <motion.div 
        className="p-4 border rounded-lg mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="font-medium mb-4">Form Submission Example</h3>
        
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A91827] focus:border-transparent"
              placeholder="John Doe"
              disabled={localLoading}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#A91827] focus:border-transparent"
              placeholder="john@example.com"
              disabled={localLoading}
              required
            />
          </div>
          
          <LoadingButton
            type="submit"
            loading={localLoading}
            loadingText="Submitting"
            className="w-full bg-[#A91827] text-white"
          >
            Submit Form
          </LoadingButton>
        </form>
      </motion.div>
    </motion.div>
  )
} 