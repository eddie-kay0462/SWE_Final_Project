/**
 * Password strength indicator component
 * Shows visual feedback on password strength and requirements
 */

import { getPasswordStrength, getPasswordStrengthText } from '@/utils/validation';

export function PasswordStrength({ password }) {
  const strength = getPasswordStrength(password);
  const strengthText = getPasswordStrengthText(strength);

  // Requirements check
  const hasLength = password.length >= 8;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    <div className="mt-2 space-y-2">
      {/* Strength bar */}
      <div className="flex gap-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i < strength
                ? strength === 4
                  ? 'bg-green-500'
                  : strength === 3
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Strength text */}
      <p className={`text-xs ${
        strength === 4 ? 'text-green-600' :
        strength === 3 ? 'text-yellow-600' :
        strength > 0 ? 'text-red-600' : 'text-gray-500'
      }`}>
        {password ? strengthText : 'Password strength'}
      </p>

      {/* Requirements list */}
      <div className="space-y-1 text-xs text-gray-500">
        <p className={hasLength ? 'text-green-600' : ''}>
          ✓ At least 8 characters
        </p>
        <p className={hasLower ? 'text-green-600' : ''}>
          ✓ One lowercase letter
        </p>
        <p className={hasUpper ? 'text-green-600' : ''}>
          ✓ One uppercase letter
        </p>
        <p className={hasNumber ? 'text-green-600' : ''}>
          ✓ One number
        </p>
        <p className={hasSpecial ? 'text-green-600' : ''}>
          ✓ One special character
        </p>
      </div>
    </div>
  );
} 