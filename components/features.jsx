import * as React from "react"
import { cn } from "@/lib/utils"
import { QrCode, FileText, Bell, BarChart3 } from "lucide-react"

const Feature = ({ icon, title, description, delay }) => {
  return (
    <div className={`flex flex-col items-center text-center p-6 animate-appear opacity-0 ${delay}`}>
      <div className="h-16 w-16 rounded-full bg-[#A91827]/10 flex items-center justify-center mb-6">{icon}</div>
      <h3 className="text-2xl font-medium mb-3">{title}</h3>
      <p className="text-[#000000]/70 text-lg">{description}</p>
    </div>
  )
}

const Features = React.forwardRef(({ className, title, subtitle, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("flex flex-col items-center py-32 bg-white", className)} {...props}>
      <div className="container px-4 max-w-7xl">
        <h2 className="text-[40px] md:text-[52px] text-center font-medium mb-6 animate-appear opacity-0">{title}</h2>

        {subtitle && (
          <p className="text-xl md:text-2xl text-center text-[#000000]/70 max-w-3xl mx-auto mb-20 animate-appear opacity-0 delay-100">
            {subtitle}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mt-16">
          <Feature
            icon={<QrCode className="h-8 w-8 text-[#A91827]" />}
            title="QR Attendance"
            description="Easily track attendance at career events with quick QR code scanning"
            delay="delay-200"
          />

          <Feature
            icon={<FileText className="h-8 w-8 text-[#A91827]" />}
            title="Internship Letters"
            description="Request and receive internship introduction letters with just a few clicks"
            delay="delay-300"
          />

          <Feature
            icon={<Bell className="h-8 w-8 text-[#A91827]" />}
            title="Instant Notifications"
            description="Stay updated with real-time notifications about events and request statuses"
            delay="delay-400"
          />

          <Feature
            icon={<BarChart3 className="h-8 w-8 text-[#A91827]" />}
            title="Analytics Dashboard"
            description="Track your career development progress with detailed analytics"
            delay="delay-500"
          />
        </div>
      </div>
    </div>
  )
})
Features.displayName = "Features"

export { Features }