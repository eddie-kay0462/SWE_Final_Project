const { test, expect } = require('@playwright/test')

test.describe('Form Interactions and Validation', () => {
  test('should validate event creation form', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Create Event')
    
    // Try to submit empty form
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.getByText('Title is required')).toBeVisible()
    await expect(page.getByText('Description is required')).toBeVisible()
    await expect(page.getByText('Date is required')).toBeVisible()
    await expect(page.getByText('Time is required')).toBeVisible()
  })

  test('should validate date format', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Create Event')
    
    // Fill form with invalid date
    await page.fill('input[name="title"]', 'Test Event')
    await page.fill('textarea[name="description"]', 'Test Description')
    await page.fill('input[name="date"]', 'invalid-date')
    await page.fill('input[name="time"]', '14:00')
    await page.click('button[type="submit"]')
    
    // Should show date format error
    await expect(page.getByText('Please enter a valid date')).toBeVisible()
  })

  test('should validate time format', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Create Event')
    
    // Fill form with invalid time
    await page.fill('input[name="title"]', 'Test Event')
    await page.fill('textarea[name="description"]', 'Test Description')
    await page.fill('input[name="date"]', '2024-05-01')
    await page.fill('input[name="time"]', '25:00')
    await page.click('button[type="submit"]')
    
    // Should show time format error
    await expect(page.getByText('Please enter a valid time')).toBeVisible()
  })

  test('should validate past dates', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Create Event')
    
    // Fill form with past date
    await page.fill('input[name="title"]', 'Test Event')
    await page.fill('textarea[name="description"]', 'Test Description')
    await page.fill('input[name="date"]', '2020-01-01')
    await page.fill('input[name="time"]', '14:00')
    await page.click('button[type="submit"]')
    
    // Should show past date error
    await expect(page.getByText('Event date cannot be in the past')).toBeVisible()
  })

  test('should handle form submission success', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Create Event')
    
    // Fill form with valid data
    await page.fill('input[name="title"]', 'Test Event')
    await page.fill('textarea[name="description"]', 'Test Description')
    await page.fill('input[name="date"]', '2024-05-01')
    await page.fill('input[name="time"]', '14:00')
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.getByText('Event created successfully')).toBeVisible()
    // Should redirect to events list
    await expect(page).toHaveURL(/.*\/main\/events/)
  })

  test('should handle form submission error', async ({ page }) => {
    // Mock API error
    await page.route('**/api/events', async (route) => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      })
    })

    await page.goto('/main/events')
    await page.click('text=Create Event')
    
    // Fill form with valid data
    await page.fill('input[name="title"]', 'Test Event')
    await page.fill('textarea[name="description"]', 'Test Description')
    await page.fill('input[name="date"]', '2024-05-01')
    await page.fill('input[name="time"]', '14:00')
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.getByText('Failed to create event')).toBeVisible()
  })

  test('should preserve form data on validation error', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Create Event')
    
    // Fill form with some valid data
    await page.fill('input[name="title"]', 'Test Event')
    await page.fill('textarea[name="description"]', 'Test Description')
    await page.click('button[type="submit"]')
    
    // Should show validation errors
    await expect(page.getByText('Date is required')).toBeVisible()
    
    // Form data should be preserved
    await expect(page.locator('input[name="title"]')).toHaveValue('Test Event')
    await expect(page.locator('textarea[name="description"]')).toHaveValue('Test Description')
  })
}) 