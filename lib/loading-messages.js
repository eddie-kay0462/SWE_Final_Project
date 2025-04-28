/**
 * Loading Messages Configuration
 * 
 * Collection of fun, engaging loading messages for the CSOFT application
 * These messages rotate during loading states to keep users entertained
 */

export const loadingMessages = [
  "Dusting off your resume... ✨",
  "Connecting you to your dream job... 🌟",
  "Sharpening pencils for interviews... ✏️",
  "Firing up the coffee machine... ☕",
  "Downloading success package... 📦",
  "Consulting the career crystal ball... 🔮",
  "Summoning opportunities from the cloud... ☁️",
  "Polishing up your LinkedIn shine... ✨",
  "Double-checking your future... 🔎",
  "Launching the hustle rocket... 🚀",
  "Steaming some new internships... 🍲",
  "Opening the gates to greatness... 🏰",
  "Baking a fresh batch of career wins... 🥐",
  "Turning dreams into deadlines... ⏳",
  "Patching up missing skills... 🩹",
  "Matching you with magic mentors... 🧙‍♂️",
  "Planting seeds for your future... 🌱",
  "Charging ambition batteries... 🔋",
  "Organizing the world's best 'you' file... 📁",
  "Sorting job offers alphabetically... 🅰️"
]

export const getRandomMessage = () => {
  return loadingMessages[Math.floor(Math.random() * loadingMessages.length)]
}

export const getProgressMessage = (progress) => {
  if (progress < 30) return "Warming up the engines... 🚀"
  if (progress < 60) return "Almost halfway there! 🌟"
  if (progress < 90) return "Final touches... ✨"
  return "Ready for takeoff! 🎉"
} 