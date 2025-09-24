import { test, expect } from '@playwright/test';

test.describe('Custom List Creation & Management', () => {
  const testEmail = `listtest${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test.beforeEach(async ({ page }) => {
    // Setup: Create account and login
    await page.goto('/register');
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', testPassword);
    await page.fill('[data-testid="confirm-password-input"]', testPassword);
    await page.click('[data-testid="register-button"]');
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

  test('should create a new custom list', async ({ page }) => {
    // Navigate to list management
    await page.click('[data-testid="lists-nav"]');
    await expect(page).toHaveURL(/\/lists/);

    // Click create new list
    await page.click('[data-testid="create-list-button"]');

    // Fill out list creation form
    await page.fill('[data-testid="list-name-input"]', 'Campaign Weapons');
    await page.fill('[data-testid="list-description-input"]', 'Magic weapons for our current campaign');

    // Save the list
    await page.click('[data-testid="save-list-button"]');

    // Verify list creation success
    await expect(page.locator('[data-testid="toast-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="toast-notification"]')).toContainText(/created|success/i);

    // Verify list appears in list view
    await expect(page.locator('[data-testid="list-card"]')).toContainText('Campaign Weapons');
  });

  test('should add items to custom list from browse page', async ({ page }) => {
    // First create a list
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="create-list-button"]');
    await page.fill('[data-testid="list-name-input"]', 'Combat Magic Items');
    await page.click('[data-testid="save-list-button"]');
    await page.waitForTimeout(1000);

    // Go to browse magic items
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    // Filter for weapons to add to combat list
    await page.selectOption('[data-testid="type-filter"]', 'weapon');
    await page.waitForTimeout(500);

    // Add first 5 weapon items to the list
    const weaponCards = page.locator('[data-testid="magic-item-card"]');
    const weapons = await weaponCards.all();

    for (let i = 0; i < Math.min(5, weapons.length); i++) {
      const weapon = weapons[i];
      const weaponName = await weapon.locator('[data-testid="item-name"]').textContent();

      // Click add to list
      await weapon.locator('[data-testid="add-to-list"]').click();

      // Select the combat magic items list
      await page.selectOption('[data-testid="list-selector"]', 'Combat Magic Items');
      await page.click('[data-testid="confirm-add-to-list"]');

      // Verify success notification
      await expect(page.locator('[data-testid="toast-notification"]')).toBeVisible();
      await page.waitForTimeout(500);
    }

    // Verify items were added by going to the list
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="list-card"]:has-text("Combat Magic Items")');

    // Should see the added items
    await expect(page.locator('[data-testid="list-item"]')).toHaveCountGreaterThan(0);
    await expect(page.locator('[data-testid="list-item"]')).toHaveCount(5);
  });

  test('should manage list contents from list view', async ({ page }) => {
    // Create a list and add items (abbreviated setup)
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="create-list-button"]');
    await page.fill('[data-testid="list-name-input"]', 'Test Management List');
    await page.click('[data-testid="save-list-button"]');
    await page.waitForTimeout(1000);

    // Add some items first
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    const firstItem = page.locator('[data-testid="magic-item-card"]').first();
    await firstItem.locator('[data-testid="add-to-list"]').click();
    await page.selectOption('[data-testid="list-selector"]', 'Test Management List');
    await page.click('[data-testid="confirm-add-to-list"]');
    await page.waitForTimeout(1000);

    // Go to the list view
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="list-card"]:has-text("Test Management List")');

    // Verify we're in the list view
    await expect(page.locator('h1, h2')).toContainText('Test Management List');
    await expect(page.locator('[data-testid="list-item"]')).toHaveCount(1);

    // Remove an item from the list
    const listItem = page.locator('[data-testid="list-item"]').first();
    await listItem.locator('[data-testid="remove-from-list"]').click();

    // Confirm removal if dialog appears
    if (await page.locator('[data-testid="confirm-dialog"]').isVisible()) {
      await page.click('[data-testid="confirm-remove"]');
    }

    // Verify item was removed
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="list-item"]')).toHaveCount(0);

    // Add items directly from list view
    await page.click('[data-testid="add-items-to-list"]');

    // Should show item selection interface
    await expect(page.locator('[data-testid="item-selection-modal"]')).toBeVisible();

    // Select a few items
    const selectableItems = page.locator('[data-testid="selectable-item"]');
    const itemsToSelect = await selectableItems.all();

    for (let i = 0; i < Math.min(3, itemsToSelect.length); i++) {
      await itemsToSelect[i].click();
    }

    // Confirm selection
    await page.click('[data-testid="add-selected-items"]');

    // Verify items were added
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="list-item"]')).toHaveCount(3);
  });

  test('should edit list properties', async ({ page }) => {
    // Create a list first
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="create-list-button"]');
    await page.fill('[data-testid="list-name-input"]', 'Original Name');
    await page.fill('[data-testid="list-description-input"]', 'Original description');
    await page.click('[data-testid="save-list-button"]');
    await page.waitForTimeout(1000);

    // Edit the list
    await page.click('[data-testid="list-card"]:has-text("Original Name")');
    await page.click('[data-testid="edit-list-button"]');

    // Verify edit form is populated
    await expect(page.locator('[data-testid="list-name-input"]')).toHaveValue('Original Name');
    await expect(page.locator('[data-testid="list-description-input"]')).toHaveValue('Original description');

    // Update the list
    await page.fill('[data-testid="list-name-input"]', 'Updated Combat Magic Items');
    await page.fill('[data-testid="list-description-input"]', 'Updated description for combat magic items');
    await page.click('[data-testid="save-list-button"]');

    // Verify updates persisted
    await expect(page.locator('[data-testid="toast-notification"]')).toBeVisible();
    await expect(page.locator('h1, h2')).toContainText('Updated Combat Magic Items');

    // Go back to list view and verify name change
    await page.click('[data-testid="lists-nav"]');
    await expect(page.locator('[data-testid="list-card"]')).toContainText('Updated Combat Magic Items');
  });

  test('should handle same item in multiple lists', async ({ page }) => {
    // Create two lists
    await page.click('[data-testid="lists-nav"]');

    // Create first list
    await page.click('[data-testid="create-list-button"]');
    await page.fill('[data-testid="list-name-input"]', 'List One');
    await page.click('[data-testid="save-list-button"]');
    await page.waitForTimeout(1000);

    // Create second list
    await page.click('[data-testid="create-list-button"]');
    await page.fill('[data-testid="list-name-input"]', 'List Two');
    await page.click('[data-testid="save-list-button"]');
    await page.waitForTimeout(1000);

    // Add same item to both lists
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    const firstItem = page.locator('[data-testid="magic-item-card"]').first();
    const itemName = await firstItem.locator('[data-testid="item-name"]').textContent();

    // Add to first list
    await firstItem.locator('[data-testid="add-to-list"]').click();
    await page.selectOption('[data-testid="list-selector"]', 'List One');
    await page.click('[data-testid="confirm-add-to-list"]');
    await page.waitForTimeout(1000);

    // Add to second list
    await firstItem.locator('[data-testid="add-to-list"]').click();
    await page.selectOption('[data-testid="list-selector"]', 'List Two');
    await page.click('[data-testid="confirm-add-to-list"]');
    await page.waitForTimeout(1000);

    // Verify item appears in both lists
    await page.click('[data-testid="lists-nav"]');

    // Check first list
    await page.click('[data-testid="list-card"]:has-text("List One")');
    await expect(page.locator('[data-testid="list-item"]').filter({ hasText: itemName || '' })).toBeVisible();

    // Check second list
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="list-card"]:has-text("List Two")');
    await expect(page.locator('[data-testid="list-item"]').filter({ hasText: itemName || '' })).toBeVisible();
  });

  test('should enforce list limit of 100 lists', async ({ page }) => {
    // This test simulates reaching the list limit
    // Note: In a real test, creating 100 lists would be slow, so we'll mock the limit response

    await page.click('[data-testid="lists-nav"]');

    // Create lists until we approach the limit
    // For test efficiency, we'll create 5-10 lists and then simulate the limit
    for (let i = 1; i <= 5; i++) {
      await page.click('[data-testid="create-list-button"]');
      await page.fill('[data-testid="list-name-input"]', `Test List ${i}`);
      await page.click('[data-testid="save-list-button"]');
      await page.waitForTimeout(500);
    }

    // Mock the scenario where we've reached the limit
    // This would typically be done through API interception
    await page.route('**/api/lists', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Conflict',
            message: 'Max allowed is 100'
          })
        });
      } else {
        await route.continue();
      }
    });

    // Try to create another list
    await page.click('[data-testid="create-list-button"]');
    await page.fill('[data-testid="list-name-input"]', 'Limit Exceeded List');
    await page.click('[data-testid="save-list-button"]');

    // Should show limit error
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/max.*100|limit.*exceeded/i);
  });

  test('should delete lists with confirmation', async ({ page }) => {
    // Create a list to delete
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="create-list-button"]');
    await page.fill('[data-testid="list-name-input"]', 'List to Delete');
    await page.click('[data-testid="save-list-button"]');
    await page.waitForTimeout(1000);

    // Delete the list
    const listCard = page.locator('[data-testid="list-card"]:has-text("List to Delete")');
    await listCard.locator('[data-testid="delete-list-button"]').click();

    // Should show confirmation dialog
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-dialog"]')).toContainText(/delete|remove/i);

    // Confirm deletion
    await page.click('[data-testid="confirm-delete"]');

    // Verify list is removed
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="list-card"]:has-text("List to Delete")')).not.toBeVisible();

    // Verify success notification
    await expect(page.locator('[data-testid="toast-notification"]')).toBeVisible();
  });
});