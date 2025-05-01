const { test, expect } = require('@playwright/test')

test.describe('QR Code Functionality', () => {
  test('should generate QR code for event', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Test Event')
    await page.click('text=Generate QR Code')
    
    // Should show QR code
    await expect(page.getByTestId('qr-code')).toBeVisible()
    // Should show download button
    await expect(page.getByText('Download QR Code')).toBeVisible()
  })

  test('should download QR code', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Test Event')
    await page.click('text=Generate QR Code')
    
    // Start waiting for download before clicking
    const downloadPromise = page.waitForEvent('download')
    await page.click('text=Download QR Code')
    const download = await downloadPromise
    
    // Verify downloaded file
    expect(download.suggestedFilename()).toMatch(/.*\.png$/)
  })

  test('should scan QR code for attendance', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Test Event')
    await page.click('text=Mark Attendance')
    
    // Should show camera permission request
    await expect(page.getByText('Camera access required')).toBeVisible()
    
    // Mock camera access
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('cameraAccessGranted'))
    })
    
    // Should show QR code scanner
    await expect(page.getByTestId('qr-scanner')).toBeVisible()
    
    // Mock successful QR code scan
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('qrCodeScanned', {
        detail: { data: 'valid-event-qr-code' }
      }))
    })
    
    // Should show success message
    await expect(page.getByText('Attendance marked successfully')).toBeVisible()
  })

  test('should handle invalid QR code', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Test Event')
    await page.click('text=Mark Attendance')
    
    // Mock camera access
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('cameraAccessGranted'))
    })
    
    // Mock invalid QR code scan
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('qrCodeScanned', {
        detail: { data: 'invalid-qr-code' }
      }))
    })
    
    // Should show error message
    await expect(page.getByText('Invalid QR code')).toBeVisible()
  })

  test('should handle camera access denial', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Test Event')
    await page.click('text=Mark Attendance')
    
    // Mock camera access denial
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('cameraAccessDenied'))
    })
    
    // Should show error message
    await expect(page.getByText('Camera access denied')).toBeVisible()
    // Should show manual entry option
    await expect(page.getByText('Enter Code Manually')).toBeVisible()
  })

  test('should allow manual code entry', async ({ page }) => {
    await page.goto('/main/events')
    await page.click('text=Test Event')
    await page.click('text=Mark Attendance')
    
    // Click manual entry
    await page.click('text=Enter Code Manually')
    
    // Enter code
    await page.fill('input[name="manualCode"]', 'valid-event-code')
    await page.click('button[type="submit"]')
    
    // Should show success message
    await expect(page.getByText('Attendance marked successfully')).toBeVisible()
  })
}) 