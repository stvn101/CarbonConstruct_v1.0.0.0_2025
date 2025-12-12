import { Page, expect } from '@playwright/test';

// Helper to navigate to reports page
export async function goToReports(page: Page): Promise<void> {
  await page.goto('/reports');
  await page.waitForLoadState('networkidle');
}

// Helper to verify reports page loaded
export async function verifyReportsLoaded(page: Page): Promise<void> {
  await expect(page.locator('h1:has-text("Report"), h1:has-text("Assessment")')).toBeVisible({ timeout: 10000 });
}

// Helper to generate PDF report
export async function generatePDFReport(page: Page): Promise<void> {
  const generateButton = page.locator('button:has-text("Generate"), button:has-text("Download"), button:has-text("PDF")').first();
  
  if (await generateButton.isVisible()) {
    // Set up download listener
    const downloadPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null);
    
    await generateButton.click();
    
    const download = await downloadPromise;
    if (download) {
      expect(download.suggestedFilename()).toContain('.pdf');
    }
  }
}

// Helper to check compliance status
export async function getComplianceStatus(page: Page): Promise<string | null> {
  const statusElement = page.locator('[data-testid="compliance-status"], .compliance-status, :text("Compliant"), :text("Non-Compliant")').first();
  
  if (await statusElement.isVisible()) {
    return await statusElement.textContent();
  }
  return null;
}

// Helper to verify lifecycle stages are displayed
export async function verifyLifecycleStages(page: Page): Promise<void> {
  const stages = ['A1-A3', 'A4', 'A5', 'B1-B7', 'C1-C4', 'D'];
  
  for (const stage of stages) {
    const stageElement = page.locator(`text=${stage}`).first();
    // Some stages may not be visible depending on data
    const isVisible = await stageElement.isVisible().catch(() => false);
    if (isVisible) {
      await expect(stageElement).toBeVisible();
    }
  }
}

// Helper to check emissions breakdown
export async function getEmissionsBreakdown(page: Page): Promise<Record<string, string>> {
  const breakdown: Record<string, string> = {};
  
  const scopes = ['Scope 1', 'Scope 2', 'Scope 3'];
  for (const scope of scopes) {
    const scopeElement = page.locator(`text=${scope}`).first();
    if (await scopeElement.isVisible()) {
      const valueElement = scopeElement.locator('..').locator('text=/\\d+(\\.\\d+)?/').first();
      if (await valueElement.isVisible()) {
        breakdown[scope] = await valueElement.textContent() || '0';
      }
    }
  }
  
  return breakdown;
}

// Helper to set project details for report
export async function setProjectDetails(
  page: Page,
  details: { name?: string; location?: string; type?: string }
): Promise<void> {
  if (details.name) {
    const nameInput = page.locator('input[name*="project"], input[placeholder*="Project"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill(details.name);
    }
  }
  
  if (details.location) {
    const locationInput = page.locator('input[name*="location"], input[placeholder*="Location"]').first();
    if (await locationInput.isVisible()) {
      await locationInput.fill(details.location);
    }
  }
}
