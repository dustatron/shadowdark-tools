import { test, expect } from '@playwright/test';

test.describe('Roll Table Generation', () => {
  const testEmail = `rolltest${Date.now()}@example.com`;
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

    // Create a list with items for table generation
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="create-list-button"]');
    await page.fill('[data-testid="list-name-input"]', 'Combat Magic Items');
    await page.fill('[data-testid="list-description-input"]', 'Items for combat encounters');
    await page.click('[data-testid="save-list-button"]');
    await page.waitForTimeout(1000);

    // Add some items to the list
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');
    await page.selectOption('[data-testid="type-filter"]', 'weapon');
    await page.waitForTimeout(500);

    const weaponCards = page.locator('[data-testid="magic-item-card"]');
    const weapons = await weaponCards.all();

    for (let i = 0; i < Math.min(8, weapons.length); i++) {
      await weapons[i].locator('[data-testid="add-to-list"]').click();
      await page.selectOption('[data-testid="list-selector"]', 'Combat Magic Items');
      await page.click('[data-testid="confirm-add-to-list"]');
      await page.waitForTimeout(300);
    }
  });

  test('should create a basic d20 roll table from a list', async ({ page }) => {
    // Navigate to the list
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="list-card"]:has-text("Combat Magic Items")');

    // Create roll table
    await page.click('[data-testid="create-roll-table"]');

    // Configure table settings
    await page.fill('[data-testid="table-name-input"]', 'Combat Items d20');
    await page.selectOption('[data-testid="die-size-select"]', '20');

    // Generate the table
    await page.click('[data-testid="generate-table-button"]');

    // Verify table structure
    await expect(page.locator('[data-testid="roll-table-container"]')).toBeVisible();
    await expect(page.locator('h1, h2')).toContainText('Combat Items d20');

    // Should have 20 rows (1-20)
    const tableRows = page.locator('[data-testid="table-row"]');
    await expect(tableRows).toHaveCount(20);

    // First rows should be populated with list items
    const firstRow = tableRows.first();
    await expect(firstRow.locator('[data-testid="roll-number"]')).toContainText('1');
    await expect(firstRow.locator('[data-testid="item-name"]')).not.toBeEmpty();

    // Later rows might be blank if list has fewer than 20 items
    const lastRow = tableRows.last();
    await expect(lastRow.locator('[data-testid="roll-number"]')).toContainText('20');
  });

  test('should handle different die sizes correctly', async ({ page }) => {
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="list-card"]:has-text("Combat Magic Items")');

    // Test d6 table
    await page.click('[data-testid="create-roll-table"]');
    await page.fill('[data-testid="table-name-input"]', 'Combat Items d6');
    await page.selectOption('[data-testid="die-size-select"]', '6');
    await page.click('[data-testid="generate-table-button"]');

    // Should have 6 rows
    await expect(page.locator('[data-testid="table-row"]')).toHaveCount(6);

    // Test d100 table
    await page.click('[data-testid="create-new-table"]');
    await page.fill('[data-testid="table-name-input"]', 'Combat Items d100');
    await page.selectOption('[data-testid="die-size-select"]', '100');
    await page.click('[data-testid="generate-table-button"]');

    // Should have 100 rows
    await expect(page.locator('[data-testid="table-row"]')).toHaveCount(100);

    // Test custom die size
    await page.click('[data-testid="create-new-table"]');
    await page.fill('[data-testid="table-name-input"]', 'Combat Items d37');
    await page.selectOption('[data-testid="die-size-select"]', 'custom');
    await page.fill('[data-testid="custom-die-size-input"]', '37');
    await page.click('[data-testid="generate-table-button"]');

    // Should have 37 rows
    await expect(page.locator('[data-testid="table-row"]')).toHaveCount(37);
  });

  test('should auto-fill blank rows with random items', async ({ page }) => {
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="list-card"]:has-text("Combat Magic Items")');

    // Create a d20 table (will have blank rows since list has < 20 items)
    await page.click('[data-testid="create-roll-table"]');
    await page.fill('[data-testid="table-name-input"]', 'Auto-filled d20');
    await page.selectOption('[data-testid="die-size-select"]', '20');
    await page.click('[data-testid="generate-table-button"]');

    // Find blank rows
    const blankRows = page.locator('[data-testid="table-row"]:has([data-testid="blank-row"])');
    const blankCount = await blankRows.count();

    if (blankCount > 0) {
      // Use auto-fill feature
      await page.click('[data-testid="auto-fill-blanks"]');

      // Choose auto-fill strategy
      await page.selectOption('[data-testid="fill-strategy"]', 'random');
      await page.click('[data-testid="confirm-auto-fill"]');

      // Verify blank rows are now filled
      await page.waitForTimeout(1000);
      const remainingBlanks = page.locator('[data-testid="table-row"]:has([data-testid="blank-row"])');
      await expect(remainingBlanks).toHaveCount(0);

      // Verify all rows now have items
      const allRows = page.locator('[data-testid="table-row"]');
      for (let i = 0; i < await allRows.count(); i++) {
        const row = allRows.nth(i);
        await expect(row.locator('[data-testid="item-name"]')).not.toBeEmpty();
      }
    }
  });

  test('should allow manual editing of table rows', async ({ page }) => {
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="list-card"]:has-text("Combat Magic Items")');

    // Create table
    await page.click('[data-testid="create-roll-table"]');
    await page.fill('[data-testid="table-name-input"]', 'Manually Edited Table');
    await page.selectOption('[data-testid="die-size-select"]', '10');
    await page.click('[data-testid="generate-table-button"]');

    // Edit a table row
    const thirdRow = page.locator('[data-testid="table-row"]').nth(2);
    await thirdRow.locator('[data-testid="edit-row-button"]').click();

    // Should show item selection modal
    await expect(page.locator('[data-testid="item-selection-modal"]')).toBeVisible();

    // Search for and select a specific item
    await page.fill('[data-testid="item-search"]', 'sword');
    await page.waitForTimeout(500);

    const searchResults = page.locator('[data-testid="selectable-item"]');
    await expect(searchResults).toHaveCountGreaterThan(0);

    // Select first sword result
    await searchResults.first().click();
    await page.click('[data-testid="confirm-selection"]');

    // Verify row was updated
    await expect(thirdRow.locator('[data-testid="item-name"]')).toContainText(/sword/i);

    // Test making a row blank
    await thirdRow.locator('[data-testid="edit-row-button"]').click();
    await page.click('[data-testid="make-blank"]');

    // Row should now be blank
    await expect(thirdRow.locator('[data-testid="blank-row"]')).toBeVisible();
  });

  test('should handle edge cases for die sizes vs available items', async ({ page }) => {
    // Create a small list with only 2 items
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="create-list-button"]');
    await page.fill('[data-testid="list-name-input"]', 'Small List');
    await page.click('[data-testid="save-list-button"]');
    await page.waitForTimeout(1000);

    // Add only 2 items
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    const items = page.locator('[data-testid="magic-item-card"]');
    for (let i = 0; i < 2; i++) {
      await items.nth(i).locator('[data-testid="add-to-list"]').click();
      await page.selectOption('[data-testid="list-selector"]', 'Small List');
      await page.click('[data-testid="confirm-add-to-list"]');
      await page.waitForTimeout(300);
    }

    // Try to create a d20 table from this small list
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="list-card"]:has-text("Small List")');
    await page.click('[data-testid="create-roll-table"]');
    await page.fill('[data-testid="table-name-input"]', 'Large Die Small List');
    await page.selectOption('[data-testid="die-size-select"]', '20');
    await page.click('[data-testid="generate-table-button"]');

    // Should handle gracefully - show warning or auto-fill options
    await expect(page.locator('[data-testid="edge-case-warning"]')).toBeVisible();

    // Table should still be created with appropriate handling
    await expect(page.locator('[data-testid="table-row"]')).toHaveCount(20);

    // First 2 rows should have the list items
    const firstRow = page.locator('[data-testid="table-row"]').first();
    const secondRow = page.locator('[data-testid="table-row"]').nth(1);

    await expect(firstRow.locator('[data-testid="item-name"]')).not.toBeEmpty();
    await expect(secondRow.locator('[data-testid="item-name"]')).not.toBeEmpty();

    // Remaining rows should be blank or auto-filled based on settings
    const thirdRow = page.locator('[data-testid="table-row"]').nth(2);
    // Could be blank or auto-filled depending on implementation
  });

  test('should save and persist roll tables', async ({ page }) => {
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="list-card"]:has-text("Combat Magic Items")');

    // Create and save table
    await page.click('[data-testid="create-roll-table"]');
    await page.fill('[data-testid="table-name-input"]', 'Persistent Table');
    await page.selectOption('[data-testid="die-size-select"]', '12');
    await page.click('[data-testid="generate-table-button"]');

    // Save the table
    await page.click('[data-testid="save-table-button"]');

    // Verify save success
    await expect(page.locator('[data-testid="toast-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="toast-notification"]')).toContainText(/saved|success/i);

    // Navigate away
    await page.goto('/');

    // Go to roll tables section
    await page.click('[data-testid="tables-nav"]');

    // Verify table appears in saved tables
    await expect(page.locator('[data-testid="table-card"]:has-text("Persistent Table")')).toBeVisible();

    // Open the saved table
    await page.click('[data-testid="table-card"]:has-text("Persistent Table")');

    // Verify all data persisted
    await expect(page.locator('h1, h2')).toContainText('Persistent Table');
    await expect(page.locator('[data-testid="table-row"]')).toHaveCount(12);

    // Verify table structure is intact
    const firstRow = page.locator('[data-testid="table-row"]').first();
    await expect(firstRow.locator('[data-testid="roll-number"]')).toContainText('1');
  });

  test('should handle unique items option', async ({ page }) => {
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="list-card"]:has-text("Combat Magic Items")');

    // Create table with unique items enabled
    await page.click('[data-testid="create-roll-table"]');
    await page.fill('[data-testid="table-name-input"]', 'Unique Items Table');
    await page.selectOption('[data-testid="die-size-select"]', '20');
    await page.check('[data-testid="unique-items-checkbox"]');
    await page.click('[data-testid="generate-table-button"]');

    // Auto-fill to test uniqueness
    if (await page.locator('[data-testid="auto-fill-blanks"]').isVisible()) {
      await page.click('[data-testid="auto-fill-blanks"]');
      await page.selectOption('[data-testid="fill-strategy"]', 'random');
      await page.click('[data-testid="confirm-auto-fill"]');
      await page.waitForTimeout(1000);
    }

    // Verify no duplicate items in the table
    const allRows = page.locator('[data-testid="table-row"]');
    const itemNames = [];

    for (let i = 0; i < await allRows.count(); i++) {
      const row = allRows.nth(i);
      const itemName = await row.locator('[data-testid="item-name"]').textContent();

      if (itemName && itemName.trim()) {
        expect(itemNames).not.toContain(itemName);
        itemNames.push(itemName);
      }
    }
  });
});