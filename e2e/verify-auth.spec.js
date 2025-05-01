const { test, expect } = require('@playwright/test')

test.describe('Authentication Verification', () => {
  test('should be logged in after setup', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard')
    
    // Should be on dashboard page
    await expect(page).toHaveURL(/.*\/dashboard/)
    
    // Should show user name
    await expect(page.getByText(process.env.TEST_USER_NAME)).toBeVisible()
  })
}) 