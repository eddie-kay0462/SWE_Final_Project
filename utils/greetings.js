const getTimeBasedGreeting = (name) => {
  const hour = new Date().getHours();
  
  // Morning: 5 AM - 11:59 AM
  if (hour >= 5 && hour < 12) {
    return {
      greeting: `Good Morning, ${name}!`,
      wellWish: `Wishing you a fantastic day, ${name}!`
    };
  }
  
  // Afternoon: 12 PM - 4:59 PM
  if (hour >= 12 && hour < 17) {
    return {
      greeting: `Good Afternoon, ${name}!`,
      wellWish: `Hope you're having a great day!`
    };
  }
  
  // Evening: 5 PM - 8:59 PM
  if (hour >= 17 && hour < 21) {
    return {
      greeting: `Good Evening, ${name}!`,
      wellWish: `How's your evening shaping up?`
    };
  }
  
  // Night: 9 PM - 4:59 AM
  return {
    greeting: `Hey, ${name}! Glad to see you!`,
    wellWish: `Wishing you a relaxing evening and a restful night ahead!`
  };
};

export default getTimeBasedGreeting; 