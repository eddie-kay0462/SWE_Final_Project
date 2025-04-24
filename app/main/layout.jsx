import Navbar from "@/components/navbar"
import { SpeedInsights } from "@vercel/speed-insights/next"

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <SpeedInsights />
    </>
  )
}