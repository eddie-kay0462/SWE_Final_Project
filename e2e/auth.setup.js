const { test } = require('@playwright/test')

test('authenticate', async ({ page }) => {
  // Perform authentication steps
  await page.goto('/')
  await page.click('text=Sign in')
  await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL)
  await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD)
  await page.click('button[type="submit"]')
  
  // Wait for successful login
  await page.waitForURL(/.*\/dashboard/)
  
  // Save signed-in state to 'storageState.json'
  await page.context().storageState({ path: 'playwright/.auth/user.json' })
}) 