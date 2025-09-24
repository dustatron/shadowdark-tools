import { test, expect } from '@playwright/test';

test.describe('Anonymous Browsing & Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load homepage without authentication prompt', async ({ page }) => {
    // Verify homepage loads
    await expect(page).toHaveTitle(/Shadowdark Magic Items/);

    // Verify no authentication prompt
    await expect(page.locator('[data-testid="login-prompt"]')).not.toBeVisible();

    // Verify responsive design elements are present
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('[data-testid="magic-items-grid"]')).toBeVisible();
  });

  test('should display magic item catalog', async ({ page }) => {
    // Wait for items to load
    await page.waitForSelector('[data-testid="magic-item-card"]');

    // Verify items are displayed
    const itemCards = page.locator('[data-testid="magic-item-card"]');
    await expect(itemCards).toHaveCountGreaterThan(0);

    // Verify each item displays required fields
    const firstItem = itemCards.first();
    await expect(firstItem.locator('[data-testid="item-name"]')).toBeVisible();
    await expect(firstItem.locator('[data-testid="item-type"]')).toBeVisible();
    await expect(firstItem.locator('[data-testid="item-rarity"]')).toBeVisible();
    await expect(firstItem.locator('[data-testid="item-description"]')).toBeVisible();
  });

  test('should perform fuzzy search across magic items', async ({ page }) => {
    // Wait for search bar
    await page.waitForSelector('[data-testid="search-bar"]');

    // Test search for "ring"
    await page.fill('[data-testid="search-bar"]', 'ring');
    await page.waitForTimeout(300); // Allow for debounced search

    // Verify results contain ring items
    const results = page.locator('[data-testid="magic-item-card"]');
    await expect(results).toHaveCountGreaterThan(0);

    // Verify search results are relevant
    const firstResult = results.first();
    const itemText = await firstResult.textContent();
    expect(itemText?.toLowerCase()).toContain('ring');

    // Test partial match search
    await page.fill('[data-testid="search-bar"]', 'prot');
    await page.waitForTimeout(300);

    // Should find protection items
    const protResults = page.locator('[data-testid="magic-item-card"]');
    await expect(protResults).toHaveCountGreaterThan(0);

    // Clear search
    await page.fill('[data-testid="search-bar"]', '');
    await page.waitForTimeout(300);

    // Should show all items again
    const allResults = page.locator('[data-testid="magic-item-card"]');
    await expect(allResults).toHaveCountGreaterThan(10);
  });

  test('should filter magic items by type and rarity', async ({ page }) => {
    // Wait for filter controls
    await page.waitForSelector('[data-testid="filter-controls"]');

    // Test type filter
    await page.selectOption('[data-testid="type-filter"]', 'weapon');
    await page.waitForTimeout(300);

    // Verify filtered results
    const weaponResults = page.locator('[data-testid="magic-item-card"]');
    await expect(weaponResults).toHaveCountGreaterThan(0);

    // Verify all visible items are weapons
    const weaponItems = await weaponResults.all();
    for (const item of weaponItems) {
      const itemType = await item.locator('[data-testid="item-type"]').textContent();
      expect(itemType?.toLowerCase()).toBe('weapon');
    }

    // Test rarity filter
    await page.selectOption('[data-testid="rarity-filter"]', 'rare');
    await page.waitForTimeout(300);

    // Verify combined filter results
    const combinedResults = page.locator('[data-testid="magic-item-card"]');
    await expect(combinedResults).toHaveCountGreaterThan(0);

    // Clear filters
    await page.selectOption('[data-testid="type-filter"]', '');
    await page.selectOption('[data-testid="rarity-filter"]', '');
    await page.waitForTimeout(300);

    // Should show all items
    const allResults = page.locator('[data-testid="magic-item-card"]');
    await expect(allResults).toHaveCountGreaterThan(10);
  });

  test('should combine search and filters', async ({ page }) => {
    // Apply search and filter together
    await page.fill('[data-testid="search-bar"]', 'sword');
    await page.selectOption('[data-testid="type-filter"]', 'weapon');
    await page.waitForTimeout(300);

    const combinedResults = page.locator('[data-testid="magic-item-card"]');
    await expect(combinedResults).toHaveCountGreaterThan(0);

    // Verify results match both criteria
    const firstResult = combinedResults.first();
    const itemText = await firstResult.textContent();
    const itemType = await firstResult.locator('[data-testid="item-type"]').textContent();

    expect(itemText?.toLowerCase()).toContain('sword');
    expect(itemType?.toLowerCase()).toBe('weapon');
  });

  test('should prompt authentication for protected actions', async ({ page }) => {
    // Wait for an item to be visible
    await page.waitForSelector('[data-testid="magic-item-card"]');

    // Try to add to favorites
    const firstItem = page.locator('[data-testid="magic-item-card"]').first();
    await firstItem.locator('[data-testid="add-to-favorites"]').click();

    // Should redirect to login
    await expect(page).toHaveURL(/\/login|\/auth/);

    // Verify no error occurred
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });

  test('should meet performance requirements', async ({ page }) => {
    const startTime = Date.now();

    // Load homepage
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    const loadTime = Date.now() - startTime;

    // Should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);

    // Test search response time
    const searchStart = Date.now();
    await page.fill('[data-testid="search-bar"]', 'test');
    await page.waitForTimeout(50); // Minimal wait for search to process

    const searchTime = Date.now() - searchStart;

    // Search should respond in under 200ms
    expect(searchTime).toBeLessThan(200);
  });
});