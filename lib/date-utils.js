// Simple date formatting function to replace date-fns
export function format(date, formatStr) {
  if (!date) return ""

  const d = new Date(date)

  // Basic formatting options
  if (formatStr === "PPP") {
    // Example: March 31, 2025
    const options = { month: "long", day: "numeric", year: "numeric" }
    return d.toLocaleDateString("en-US", options)
  }

  if (formatStr === "MMMM d, yyyy") {
    // Example: March 31, 2025
    const options = { month: "long", day: "numeric", year: "numeric" }
    return d.toLocaleDateString("en-US", options)
  }

  // Default format
  return d.toLocaleDateString()
}