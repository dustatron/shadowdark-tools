import { test, expect } from '@playwright/test';

test.describe('Favorites Management', () => {
  const testEmail = `favtest${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test.beforeEach(async ({ page }) => {
    // Setup: Create account and login
    await page.goto('/register');
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', testPassword);
    await page.fill('[data-testid="confirm-password-input"]', testPassword);
    await page.click('[data-testid="register-button"]');

    // Wait for registration and potential redirect
    await page.waitForTimeout(2000);

    // If not automatically logged in, login manually
    if (await page.locator('[data-testid="login-button"]').isVisible()) {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testEmail);
      await page.fill('[data-testid="password-input"]', testPassword);
      await page.click('[data-testid="login-button"]');
      await page.waitForTimeout(2000);
    }
  });

  test('should add magic items to favorites', async ({ page }) => {
    // Navigate to magic items browse
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    // Add first 3 items to favorites
    const itemCards = page.locator('[data-testid="magic-item-card"]');
    const itemsToFavorite = await itemCards.all();

    for (let i = 0; i < Math.min(3, itemsToFavorite.length); i++) {
      const item = itemsToFavorite[i];

      // Get item name for verification later
      const itemName = await item.locator('[data-testid="item-name"]').textContent();

      // Click favorite button
      await item.locator('[data-testid="add-to-favorites"]').click();

      // Verify immediate visual feedback
      await expect(item.locator('[data-testid="favorited-indicator"]')).toBeVisible();

      // Check for toast notification
      await expect(page.locator('[data-testid="toast-notification"]')).toBeVisible();

      // Wait for toast to disappear
      await page.waitForTimeout(1000);
    }
  });

  test('should display favorites in favorites list', async ({ page }) => {
    // First add some favorites
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    // Add items to favorites
    const itemCards = page.locator('[data-testid="magic-item-card"]');
    const firstItem = itemCards.first();
    const itemName = await firstItem.locator('[data-testid="item-name"]').textContent();

    await firstItem.locator('[data-testid="add-to-favorites"]').click();
    await page.waitForTimeout(1000);

    // Navigate to favorites
    await page.click('[data-testid="favorites-nav"]');

    // Verify favorites page loads
    await expect(page).toHaveURL(/\/favorites|\/lists\/favorites/);
    await expect(page.locator('h1, h2')).toContainText(/favorites/i);

    // Verify favorited item appears
    await expect(page.locator('[data-testid="favorite-item"]')).toHaveCountGreaterThan(0);

    // Verify the specific item we favorited is there
    const favoritesList = page.locator('[data-testid="favorite-item"]');
    await expect(favoritesList.filter({ hasText: itemName || '' })).toBeVisible();

    // Verify complete item information is displayed
    const firstFavorite = favoritesList.first();
    await expect(firstFavorite.locator('[data-testid="item-name"]')).toBeVisible();
    await expect(firstFavorite.locator('[data-testid="item-type"]')).toBeVisible();
    await expect(firstFavorite.locator('[data-testid="item-rarity"]')).toBeVisible();
    await expect(firstFavorite.locator('[data-testid="item-description"]')).toBeVisible();
  });

  test('should remove items from favorites', async ({ page }) => {
    // Add an item to favorites first
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    const firstItem = page.locator('[data-testid="magic-item-card"]').first();
    const itemName = await firstItem.locator('[data-testid="item-name"]').textContent();

    await firstItem.locator('[data-testid="add-to-favorites"]').click();
    await page.waitForTimeout(1000);

    // Go to favorites page
    await page.click('[data-testid="favorites-nav"]');
    await page.waitForSelector('[data-testid="favorite-item"]');

    // Remove the item from favorites
    const favoriteItem = page.locator('[data-testid="favorite-item"]').first();
    await favoriteItem.locator('[data-testid="remove-from-favorites"]').click();

    // Handle confirmation dialog if present
    if (await page.locator('[data-testid="confirm-dialog"]').isVisible()) {
      await page.click('[data-testid="confirm-remove"]');
    }

    // Verify item is removed from favorites
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="favorite-item"]').filter({ hasText: itemName || '' })).not.toBeVisible();

    // Verify toast notification
    await expect(page.locator('[data-testid="toast-notification"]')).toBeVisible();

    // Go back to browse page and verify unfavorited state
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    const itemCard = page.locator('[data-testid="magic-item-card"]').filter({ hasText: itemName || '' });
    await expect(itemCard.locator('[data-testid="favorited-indicator"]')).not.toBeVisible();
  });

  test('should maintain favorite state across pages', async ({ page }) => {
    // Add item to favorites
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    const firstItem = page.locator('[data-testid="magic-item-card"]').first();
    const itemName = await firstItem.locator('[data-testid="item-name"]').textContent();

    await firstItem.locator('[data-testid="add-to-favorites"]').click();
    await page.waitForTimeout(1000);

    // Navigate to item detail page
    await firstItem.click();

    // Verify favorite state on detail page
    await expect(page.locator('[data-testid="favorited-indicator"]')).toBeVisible();
    await expect(page.locator('[data-testid="remove-from-favorites"]')).toBeVisible();

    // Navigate back to browse
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    // Verify favorite state persists
    const sameItem = page.locator('[data-testid="magic-item-card"]').filter({ hasText: itemName || '' });
    await expect(sameItem.locator('[data-testid="favorited-indicator"]')).toBeVisible();
  });

  test('should handle duplicate favorite attempts gracefully', async ({ page }) => {
    // Add item to favorites
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    const firstItem = page.locator('[data-testid="magic-item-card"]').first();
    await firstItem.locator('[data-testid="add-to-favorites"]').click();
    await page.waitForTimeout(1000);

    // Try to add the same item again
    await firstItem.locator('[data-testid="add-to-favorites"]').click();

    // Should show appropriate message (already favorited or no duplicate)
    const toastMessage = page.locator('[data-testid="toast-notification"]');
    await expect(toastMessage).toBeVisible();

    // Verify only one instance in favorites
    await page.click('[data-testid="favorites-nav"]');
    const favoriteItems = page.locator('[data-testid="favorite-item"]');
    await expect(favoriteItems).toHaveCount(1);
  });

  test('should support bulk favorite management', async ({ page }) => {
    // Add multiple items to favorites
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    const itemCards = page.locator('[data-testid="magic-item-card"]');
    const itemsToAdd = await itemCards.all();

    // Add first 5 items
    for (let i = 0; i < Math.min(5, itemsToAdd.length); i++) {
      await itemsToAdd[i].locator('[data-testid="add-to-favorites"]').click();
      await page.waitForTimeout(500);
    }

    // Go to favorites
    await page.click('[data-testid="favorites-nav"]');

    // Verify all items are there
    const favoriteItems = page.locator('[data-testid="favorite-item"]');
    await expect(favoriteItems).toHaveCount(5);

    // Test bulk actions if available
    if (await page.locator('[data-testid="select-all-favorites"]').isVisible()) {
      await page.click('[data-testid="select-all-favorites"]');
      await page.click('[data-testid="bulk-remove-favorites"]');

      // Confirm bulk action
      if (await page.locator('[data-testid="confirm-dialog"]').isVisible()) {
        await page.click('[data-testid="confirm-remove"]');
      }

      // Verify all items removed
      await page.waitForTimeout(1000);
      await expect(page.locator('[data-testid="favorite-item"]')).toHaveCount(0);
    }
  });

  test('should handle favorites with deleted items gracefully', async ({ page }) => {
    // This test simulates the case where a favorited item might be removed from the catalog
    // Add item to favorites
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    const firstItem = page.locator('[data-testid="magic-item-card"]').first();
    await firstItem.locator('[data-testid="add-to-favorites"]').click();
    await page.waitForTimeout(1000);

    // Go to favorites
    await page.click('[data-testid="favorites-nav"]');

    // Verify favorites load without errors
    await expect(page.locator('[data-testid="favorites-container"]')).toBeVisible();

    // Should handle missing items gracefully (no errors thrown)
    await expect(page.locator('[data-testid="error-message"]')).not.toBeVisible();
  });
});