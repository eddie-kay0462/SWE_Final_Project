/**
 * Validates password strength and requirements
 * 
 * @param {string} password - The password to validate
 * @returns {string} Error message if invalid, empty string if valid
 */
export const validatePassword = (password) => {
  if (!password) {
    return 'Password is required';
  }

  if (password.length < 8) {
    return 'Password must be at least 8 characters long';
  }

  // Check for lowercase letters
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }

  // Check for uppercase letters
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }

  // Check for numbers
  if (!/\d/.test(password)) {
    return 'Password must contain at least one number';
  }

  // Check for special characters
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character';
  }

  return '';
};

/**
 * Calculates password strength score
 * 
 * @param {string} password - The password to check
 * @returns {number} Score from 0-4 (0 = very weak, 4 = very strong)
 */
export const getPasswordStrength = (password) => {
  let score = 0;

  if (!password) return score;

  // Award points for length
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Award point for complexity
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

  return Math.min(score, 4);
};

/**
 * Gets text description of password strength
 * 
 * @param {number} strength - Password strength score (0-4)
 * @returns {string} Description of password strength
 */
export const getPasswordStrengthText = (strength) => {
  switch (strength) {
    case 0:
      return 'Very Weak';
    case 1:
      return 'Weak';
    case 2:
      return 'Fair';
    case 3:
      return 'Good';
    case 4:
      return 'Strong';
    default:
      return '';
  }
}; 