const { test, expect } = require('@playwright/test')

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should show login form', async ({ page }) => {
    await page.click('text=Sign in')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
  })

  test('should show validation errors for empty form submission', async ({ page }) => {
    await page.click('text=Sign in')
    await page.click('button[type="submit"]')
    
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=Sign in')
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    await expect(page.getByText('Invalid email or password')).toBeVisible()
  })

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.click('text=Sign in')
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL)
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD)
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*\/dashboard/)
    // Should show user menu
    await expect(page.getByText(process.env.TEST_USER_NAME)).toBeVisible()
  })

  test('should maintain session after page refresh', async ({ page }) => {
    // First login
    await page.click('text=Sign in')
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL)
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD)
    await page.click('button[type="submit"]')
    
    // Refresh page
    await page.reload()
    
    // Should still be logged in
    await expect(page.getByText(process.env.TEST_USER_NAME)).toBeVisible()
  })

  test('should successfully logout', async ({ page }) => {
    // First login
    await page.click('text=Sign in')
    await page.fill('input[name="email"]', process.env.TEST_USER_EMAIL)
    await page.fill('input[name="password"]', process.env.TEST_USER_PASSWORD)
    await page.click('button[type="submit"]')
    
    // Click user menu and logout
    await page.hover('text=' + process.env.TEST_USER_NAME)
    await page.click('text=Sign out')
    
    // Should be logged out
    await expect(page.getByText('Sign in')).toBeVisible()
    await expect(page).toHaveURL('/')
  })
}) 