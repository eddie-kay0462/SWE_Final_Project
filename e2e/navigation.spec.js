const { test, expect } = require('@playwright/test')

test.describe('Navigation and Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should navigate to Events page', async ({ page }) => {
    await page.click('text=Events')
    await expect(page).toHaveURL(/.*\/main\/events/)
  })

  test('should navigate to Resources page', async ({ page }) => {
    await page.click('text=Resources')
    await expect(page).toHaveURL(/.*\/main\/resources/)
  })

  test('should toggle theme', async ({ page }) => {
    const themeButton = page.getByRole('button', { name: /switch to (dark|light) mode/i })
    await themeButton.click()
    
    // Check if theme class is updated
    const html = page.locator('html')
    await expect(html).toHaveClass(/dark/)
  })

  test('should show mobile menu on small screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Click menu button
    await page.click('button[aria-label="Menu"]')
    
    // Check if mobile menu items are visible
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Sign out')).toBeVisible()
  })

  test('should show user menu on hover', async ({ page }) => {
    // Hover over user menu
    await page.hover('text=John Doe')
    
    // Check if dropdown menu items are visible
    await expect(page.getByText('Dashboard')).toBeVisible()
    await expect(page.getByText('Sign out')).toBeVisible()
  })
}) 