/**
 * Generates a personalized greeting based on the time of day
 * 
 * @param {string} firstName - The user's first name
 * @returns {string} A personalized greeting message
 */
export function getGreeting(firstName) {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    const morningGreetings = [
      `Good morning, ${firstName}`,
      `Rise and shine, ${firstName}`,
      `Top of the morning, ${firstName}`,
      `Good day, ${firstName}`
    ];
    return morningGreetings[Math.floor(Math.random() * morningGreetings.length)];
  } else if (hour >= 12 && hour < 17) {
    const afternoonGreetings = [
      `Good afternoon, ${firstName}`,
      `Slow day, huh, ${firstName}`,
      `How's your day going, ${firstName}?`
    ];
    return afternoonGreetings[Math.floor(Math.random() * afternoonGreetings.length)];
  } else if (hour >= 17 && hour < 22) {
    const eveningGreetings = [
      `Good evening, ${firstName}`,
      `Winding down, ${firstName}?`,
      `How was your day, ${firstName}?`
    ];
    return eveningGreetings[Math.floor(Math.random() * eveningGreetings.length)];
  } else {
    const nightGreetings = [
      `Good night, ${firstName}`,
      `Putting in the midnight grind huh, ${firstName}`,
      `Still working, ${firstName}?`
    ];
    return nightGreetings[Math.floor(Math.random() * nightGreetings.length)];
  }
} 