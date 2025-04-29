const { test, expect } = require('@playwright/test')

test.describe('API and Data Management', () => {
  test('should create a new event', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Create Event')
    
    // Fill event form
    await page.fill('input[name="title"]', 'Test Event')
    await page.fill('textarea[name="description"]', 'Test Description')
    await page.fill('input[name="date"]', '2024-05-01')
    await page.fill('input[name="time"]', '14:00')
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.getByText('Event created successfully')).toBeVisible()
    // Should show new event in list
    await expect(page.getByText('Test Event')).toBeVisible()
  })

  test('should mark attendance for an event', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Test Event')
    await page.click('text=Mark Attendance')
    
    // Should show QR code scanner
    await expect(page.getByText('Scan QR Code')).toBeVisible()
    
    // Mock QR code scan (you'll need to implement this based on your QR scanning implementation)
    // This is a placeholder - adjust based on your actual QR scanning implementation
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('qrCodeScanned', {
        detail: { data: 'test-qr-code-data' }
      }))
    })
    
    // Should show success message
    await expect(page.getByText('Attendance marked successfully')).toBeVisible()
  })

  test('should view event details', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Test Event')
    
    // Should show event details
    await expect(page.getByText('Test Description')).toBeVisible()
    await expect(page.getByText('2024-05-01')).toBeVisible()
    await expect(page.getByText('14:00')).toBeVisible()
  })

  test('should update event details', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Test Event')
    await page.click('text=Edit')
    
    // Update event details
    await page.fill('input[name="title"]', 'Updated Test Event')
    await page.fill('textarea[name="description"]', 'Updated Description')
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.getByText('Event updated successfully')).toBeVisible()
    // Should show updated details
    await expect(page.getByText('Updated Test Event')).toBeVisible()
    await expect(page.getByText('Updated Description')).toBeVisible()
  })

  test('should delete an event', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Updated Test Event')
    await page.click('text=Delete')
    
    // Confirm deletion
    await page.click('text=Confirm')
    
    // Should show success message
    await expect(page.getByText('Event deleted successfully')).toBeVisible()
    // Event should be removed from list
    await expect(page.getByText('Updated Test Event')).not.toBeVisible()
  })

  test('should view attendance records', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Test Event')
    await page.click('text=View Attendance')
    
    // Should show attendance list
    await expect(page.getByText('Attendance Records')).toBeVisible()
    // Should show test user in attendance list
    await expect(page.getByText(process.env.TEST_USER_NAME)).toBeVisible()
  })
}) 