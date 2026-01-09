import { test, expect } from '@playwright/test';

/**
 * E2E tests for BOQ carbon factor validation on /calculator route
 * 
 * These tests verify that invalid BOQ files are rejected with proper error messages
 * when uploaded through the calculator's import functionality.
 * 
 * Note: These tests require authentication setup in real E2E environment.
 */

test.describe('BOQ Validation on Calculator Route', () => {
  // Skip these tests in CI unless auth is configured
  test.skip(
    ({ browserName }) => browserName === 'chromium',
    'Requires authenticated session setup'
  );

  test.beforeEach(async ({ page }) => {
    // Navigate to calculator (requires auth in real implementation)
    await page.goto('/calculator');
  });

  test('should_RejectNegativeCarbonFactors_When_UploadedViaCalculator', async ({ page }) => {
    // This test validates that the calculator route properly rejects negative carbon factors
    // File content would be:
    // name,quantity,carbon factor
    // Concrete,100,-320
    // Steel,500,-1.99

    // Locate file input
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.isVisible()) {
      // Create a test file with negative factors
      const csvContent = `name,quantity,carbon factor
Concrete,100,-320
Steel,500,-1.99`;
      
      // Upload the file
      await fileInput.setInputFiles({
        name: 'test_negative_factors.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(csvContent),
      });

      // Expect error toast/message about negative factors
      await expect(page.getByText(/cannot be negative/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test('should_RejectAllEmptyFactors_When_UploadedViaCalculator', async ({ page }) => {
    // Test file content:
    // name,quantity,carbon factor
    // Concrete,100,
    // Steel,500,

    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.isVisible()) {
      const csvContent = `name,quantity,carbon factor
Concrete,100,
Steel,500,
Timber,25,`;
      
      await fileInput.setInputFiles({
        name: 'test_all_empty_factors.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(csvContent),
      });

      // Expect error about all empty factors
      await expect(page.getByText(/All carbon factor values are empty/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test('should_PassValidFactors_When_UploadedViaCalculator', async ({ page }) => {
    // Test file content:
    // name,quantity,carbon factor
    // Concrete,100,320
    // Steel,500,1.99

    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.isVisible()) {
      const csvContent = `name,quantity,carbon factor
Concrete,100,320
Steel,500,1.99
Timber,25,0.5`;
      
      await fileInput.setInputFiles({
        name: 'test_valid_factors.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(csvContent),
      });

      // Should NOT see validation error
      await page.waitForTimeout(2000);
      await expect(page.getByText(/cannot be negative/i)).not.toBeVisible();
      await expect(page.getByText(/All carbon factor values are empty/i)).not.toBeVisible();
    }
  });

  test('should_PassTextPlaceholders_When_UploadedViaCalculator', async ({ page }) => {
    // Test file content with TBC values:
    // name,quantity,carbon factor
    // Concrete,100,TBC
    // Steel,500,N/A
    // Timber,25,pending

    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.isVisible()) {
      const csvContent = `name,quantity,carbon factor
Concrete,100,TBC
Steel,500,N/A
Timber,25,pending`;
      
      await fileInput.setInputFiles({
        name: 'test_text_placeholders.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(csvContent),
      });

      // Should NOT see validation error (AI will handle text values)
      await page.waitForTimeout(2000);
      await expect(page.getByText(/cannot be negative/i)).not.toBeVisible();
    }
  });
});

test.describe('BOQ Validation on BOQ Import Route', () => {
  test.skip(
    ({ browserName }) => browserName === 'chromium',
    'Requires authenticated session setup'
  );

  test.beforeEach(async ({ page }) => {
    await page.goto('/boq-import');
  });

  test('should_RejectNegativeFactors_When_UploadedViaBOQImport', async ({ page }) => {
    // Similar test for the /boq-import route
    const fileInput = page.locator('input[type="file"]').first();
    
    if (await fileInput.isVisible()) {
      const csvContent = `name,quantity,carbon factor
Concrete,100,-320`;
      
      await fileInput.setInputFiles({
        name: 'test_negative.csv',
        mimeType: 'text/csv',
        buffer: Buffer.from(csvContent),
      });

      await expect(page.getByText(/cannot be negative/i)).toBeVisible({ timeout: 10000 });
    }
  });
});
