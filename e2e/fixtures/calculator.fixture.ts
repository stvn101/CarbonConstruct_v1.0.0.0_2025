import { Page, expect } from '@playwright/test';

// Test material data
export const TEST_MATERIALS = {
  concrete: {
    name: 'Concrete',
    searchTerm: 'concrete',
    quantity: 100,
    unit: 'm³',
  },
  steel: {
    name: 'Steel',
    searchTerm: 'steel',
    quantity: 50,
    unit: 'kg',
  },
  timber: {
    name: 'Timber',
    searchTerm: 'timber',
    quantity: 200,
    unit: 'm³',
  },
};

// Helper to add a material to the calculator
export async function addMaterial(
  page: Page,
  searchTerm: string,
  quantity: number
): Promise<void> {
  // Search for material
  const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="material"]').first();
  await searchInput.fill(searchTerm);
  
  // Wait for search results
  await page.waitForTimeout(500);
  
  // Click first result
  const addButton = page.locator('button:has-text("Add")').first();
  if (await addButton.isVisible()) {
    await addButton.click();
  }
  
  // Set quantity if input is available
  const quantityInput = page.locator('input[type="number"]').last();
  if (await quantityInput.isVisible()) {
    await quantityInput.fill(quantity.toString());
  }
}

// Helper to get current emissions total
export async function getEmissionsTotal(page: Page): Promise<string | null> {
  const totalElement = page.locator('[data-testid="total-emissions"], .total-emissions, h2:has-text("tCO₂e")').first();
  if (await totalElement.isVisible()) {
    return await totalElement.textContent();
  }
  return null;
}

// Helper to clear all materials
export async function clearAllMaterials(page: Page): Promise<void> {
  const removeButtons = page.locator('button:has-text("Remove"), button[aria-label*="remove"]');
  const count = await removeButtons.count();
  
  for (let i = count - 1; i >= 0; i--) {
    await removeButtons.nth(i).click();
    await page.waitForTimeout(200);
  }
}

// Helper to navigate to calculator
export async function goToCalculator(page: Page): Promise<void> {
  await page.goto('/calculator');
  await page.waitForLoadState('networkidle');
}

// Helper to verify calculator loaded
export async function verifyCalculatorLoaded(page: Page): Promise<void> {
  await expect(page.locator('h1:has-text("Calculator"), h1:has-text("Carbon")')).toBeVisible({ timeout: 10000 });
}

// Helper to set transport data
export async function setTransportData(
  page: Page,
  distance: number,
  weight: number
): Promise<void> {
  const distanceInput = page.locator('input[placeholder*="distance"], input[name*="distance"]').first();
  const weightInput = page.locator('input[placeholder*="weight"], input[name*="weight"]').first();
  
  if (await distanceInput.isVisible()) {
    await distanceInput.fill(distance.toString());
  }
  if (await weightInput.isVisible()) {
    await weightInput.fill(weight.toString());
  }
}

// Helper to check if calculation is persisted
export async function verifyCalculationPersisted(page: Page): Promise<boolean> {
  const storage = await page.evaluate(() => {
    return localStorage.getItem('calculator-materials') || 
           localStorage.getItem('unified-calculation');
  });
  return storage !== null;
}
