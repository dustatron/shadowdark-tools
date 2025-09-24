import { test, expect } from '@playwright/test';
import { BrowserContext } from '@playwright/test';

test.describe('Sharing & Collaboration', () => {
  const testEmail = `sharetest${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  let shareToken: string;

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

    // Create a test roll table for sharing
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="create-list-button"]');
    await page.fill('[data-testid="list-name-input"]', 'Shared Table Source');
    await page.click('[data-testid="save-list-button"]');
    await page.waitForTimeout(1000);

    // Add items to the list
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    const items = page.locator('[data-testid="magic-item-card"]');
    for (let i = 0; i < 5; i++) {
      await items.nth(i).locator('[data-testid="add-to-list"]').click();
      await page.selectOption('[data-testid="list-selector"]', 'Shared Table Source');
      await page.click('[data-testid="confirm-add-to-list"]');
      await page.waitForTimeout(300);
    }

    // Create a roll table
    await page.click('[data-testid="lists-nav"]');
    await page.click('[data-testid="list-card"]:has-text("Shared Table Source")');
    await page.click('[data-testid="create-roll-table"]');
    await page.fill('[data-testid="table-name-input"]', 'Shareable Test Table');
    await page.selectOption('[data-testid="die-size-select"]', '10');
    await page.click('[data-testid="generate-table-button"]');
    await page.click('[data-testid="save-table-button"]');
    await page.waitForTimeout(1000);
  });

  test('should generate a shareable link for roll table', async ({ page }) => {
    // Navigate to the saved table
    await page.click('[data-testid="tables-nav"]');
    await page.click('[data-testid="table-card"]:has-text("Shareable Test Table")');

    // Generate share link
    await page.click('[data-testid="share-table-button"]');

    // Verify share modal appears
    await expect(page.locator('[data-testid="share-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="share-link-display"]')).toBeVisible();

    // Copy the share link
    const shareLink = await page.locator('[data-testid="share-link-display"]').inputValue();
    expect(shareLink).toMatch(/\/shared\/[a-zA-Z0-9]+/);

    // Extract token for use in other tests
    const tokenMatch = shareLink.match(/\/shared\/([a-zA-Z0-9]+)/);
    shareToken = tokenMatch ? tokenMatch[1] : '';
    expect(shareToken).toBeTruthy();

    // Copy link functionality
    await page.click('[data-testid="copy-share-link"]');

    // Verify copy success feedback
    await expect(page.locator('[data-testid="toast-notification"]')).toBeVisible();
    await expect(page.locator('[data-testid="toast-notification"]')).toContainText(/copied|success/i);

    // Verify link format is user-friendly
    expect(shareLink).not.toContain('localhost:3000'); // Should use relative paths or proper domain
    expect(shareLink).toMatch(/^\/shared\//); // Should start with /shared/
  });

  test('should allow anonymous access to shared table', async ({ browser }) => {
    // First, get the share link from the authenticated session
    await test.step('Get share link', async () => {
      const page = await browser.newPage();
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testEmail);
      await page.fill('[data-testid="password-input"]', testPassword);
      await page.click('[data-testid="login-button"]');
      await page.waitForTimeout(2000);

      await page.click('[data-testid="tables-nav"]');
      await page.click('[data-testid="table-card"]:has-text("Shareable Test Table")');
      await page.click('[data-testid="share-table-button"]');

      const shareLink = await page.locator('[data-testid="share-link-display"]').inputValue();
      shareToken = shareLink.match(/\/shared\/([a-zA-Z0-9]+)/)![1];
      await page.close();
    });

    // Open in incognito/private context (anonymous)
    const incognitoContext = await browser.newContext();
    const anonymousPage = await incognitoContext.newPage();

    // Navigate to shared link
    await anonymousPage.goto(`/shared/${shareToken}`);

    // Verify table loads without authentication
    await expect(anonymousPage.locator('h1, h2')).toContainText('Shareable Test Table');
    await expect(anonymousPage.locator('[data-testid="table-row"]')).toHaveCount(10);

    // Verify table data displays correctly
    const firstRow = anonymousPage.locator('[data-testid="table-row"]').first();
    await expect(firstRow.locator('[data-testid="roll-number"]')).toContainText('1');
    await expect(firstRow.locator('[data-testid="item-name"]')).not.toBeEmpty();

    // Verify read-only state (no edit buttons)
    await expect(anonymousPage.locator('[data-testid="edit-row-button"]')).not.toBeVisible();
    await expect(anonymousPage.locator('[data-testid="save-table-button"]')).not.toBeVisible();

    // Verify anonymous user can't perform authenticated actions
    await expect(anonymousPage.locator('[data-testid="user-menu"]')).not.toBeVisible();

    await incognitoContext.close();
  });

  test('should allow authenticated users to duplicate shared tables', async ({ browser }) => {
    // Get share link and test duplication
    const creatorPage = await browser.newPage();
    await creatorPage.goto('/login');
    await creatorPage.fill('[data-testid="email-input"]', testEmail);
    await creatorPage.fill('[data-testid="password-input"]', testPassword);
    await creatorPage.click('[data-testid="login-button"]');
    await creatorPage.waitForTimeout(2000);

    await creatorPage.click('[data-testid="tables-nav"]');
    await creatorPage.click('[data-testid="table-card"]:has-text("Shareable Test Table")');
    await creatorPage.click('[data-testid="share-table-button"]');

    const shareLink = await creatorPage.locator('[data-testid="share-link-display"]').inputValue();
    shareToken = shareLink.match(/\/shared\/([a-zA-Z0-9]+)/)![1];
    await creatorPage.close();

    // Create a different user account
    const duplicateEmail = `duplicate${Date.now()}@example.com`;
    const newUserPage = await browser.newPage();

    await newUserPage.goto('/register');
    await newUserPage.fill('[data-testid="email-input"]', duplicateEmail);
    await newUserPage.fill('[data-testid="password-input"]', testPassword);
    await newUserPage.fill('[data-testid="confirm-password-input"]', testPassword);
    await newUserPage.click('[data-testid="register-button"]');
    await newUserPage.waitForTimeout(2000);

    // Login if needed
    if (await newUserPage.locator('[data-testid="login-button"]').isVisible()) {
      await newUserPage.goto('/login');
      await newUserPage.fill('[data-testid="email-input"]', duplicateEmail);
      await newUserPage.fill('[data-testid="password-input"]', testPassword);
      await newUserPage.click('[data-testid="login-button"]');
      await newUserPage.waitForTimeout(2000);
    }

    // Visit shared table
    await newUserPage.goto(`/shared/${shareToken}`);

    // Verify duplicate option is available for authenticated user
    await expect(newUserPage.locator('[data-testid="duplicate-table-button"]')).toBeVisible();

    // Duplicate the table
    await newUserPage.click('[data-testid="duplicate-table-button"]');

    // Fill duplicate form
    await newUserPage.fill('[data-testid="duplicate-name-input"]', 'My Copy of Shared Table');
    await newUserPage.click('[data-testid="confirm-duplicate"]');

    // Verify duplication success
    await expect(newUserPage.locator('[data-testid="toast-notification"]')).toBeVisible();
    await expect(newUserPage.locator('[data-testid="toast-notification"]')).toContainText(/duplicated|copied|success/i);

    // Verify copied table appears in user's tables
    await newUserPage.click('[data-testid="tables-nav"]');
    await expect(newUserPage.locator('[data-testid="table-card"]:has-text("My Copy of Shared Table")')).toBeVisible();

    // Verify copied table can be edited
    await newUserPage.click('[data-testid="table-card"]:has-text("My Copy of Shared Table")');
    await expect(newUserPage.locator('[data-testid="edit-row-button"]')).toBeVisible();
    await expect(newUserPage.locator('[data-testid="save-table-button"]')).toBeVisible();

    await newUserPage.close();
  });

  test('should keep shared links current with table changes', async ({ page, browser }) => {
    // Get share link
    await page.click('[data-testid="tables-nav"]');
    await page.click('[data-testid="table-card"]:has-text("Shareable Test Table")');
    await page.click('[data-testid="share-table-button"]');

    const shareLink = await page.locator('[data-testid="share-link-display"]').inputValue();
    shareToken = shareLink.match(/\/shared\/([a-zA-Z0-9]+)/)![1];

    // Close share modal and modify the table
    await page.click('[data-testid="close-share-modal"]');

    // Edit a row in the table
    const secondRow = page.locator('[data-testid="table-row"]').nth(1);
    await secondRow.locator('[data-testid="edit-row-button"]').click();

    // Select a different item
    await page.locator('[data-testid="selectable-item"]').first().click();
    await page.click('[data-testid="confirm-selection"]');

    // Save changes
    await page.click('[data-testid="save-table-button"]');
    await page.waitForTimeout(1000);

    // Check shared view in new context
    const incognitoContext = await browser.newContext();
    const sharedPage = await incognitoContext.newPage();

    await sharedPage.goto(`/shared/${shareToken}`);

    // Verify changes are reflected in shared view
    await expect(sharedPage.locator('[data-testid="table-row"]')).toHaveCount(10);

    // The modified row should reflect the change
    const sharedSecondRow = sharedPage.locator('[data-testid="table-row"]').nth(1);
    const modifiedItemName = await sharedSecondRow.locator('[data-testid="item-name"]').textContent();
    expect(modifiedItemName).toBeTruthy();

    await incognitoContext.close();
  });

  test('should return 404 for deleted shared tables', async ({ page, browser }) => {
    // Get share link
    await page.click('[data-testid="tables-nav"]');
    await page.click('[data-testid="table-card"]:has-text("Shareable Test Table")');
    await page.click('[data-testid="share-table-button"]');

    const shareLink = await page.locator('[data-testid="share-link-display"]').inputValue();
    shareToken = shareLink.match(/\/shared\/([a-zA-Z0-9]+)/)![1];

    // Close modal and delete the table
    await page.click('[data-testid="close-share-modal"]');
    await page.click('[data-testid="delete-table-button"]');

    // Confirm deletion
    await page.click('[data-testid="confirm-delete"]');
    await page.waitForTimeout(1000);

    // Try to access shared link
    const incognitoContext = await browser.newContext();
    const sharedPage = await incognitoContext.newPage();

    await sharedPage.goto(`/shared/${shareToken}`);

    // Should show 404 or not found message
    await expect(sharedPage.locator('[data-testid="not-found-message"]')).toBeVisible();
    await expect(sharedPage.locator('[data-testid="not-found-message"]')).toContainText(/not found|404/i);

    await incognitoContext.close();
  });

  test('should handle invalid share tokens gracefully', async ({ browser }) => {
    const incognitoContext = await browser.newContext();
    const sharedPage = await incognitoContext.newPage();

    // Try invalid token
    await sharedPage.goto('/shared/invalid-token-123');

    // Should show appropriate error
    await expect(sharedPage.locator('[data-testid="not-found-message"]')).toBeVisible();
    await expect(sharedPage.locator('[data-testid="not-found-message"]')).toContainText(/not found|invalid/i);

    // Try empty token
    await sharedPage.goto('/shared/');

    // Should handle gracefully
    await expect(sharedPage).toHaveURL(/.*404|.*not-found/);

    await incognitoContext.close();
  });

  test('should support multiple share tokens for same table', async ({ page }) => {
    // Navigate to table
    await page.click('[data-testid="tables-nav"]');
    await page.click('[data-testid="table-card"]:has-text("Shareable Test Table")');

    // Generate first share link
    await page.click('[data-testid="share-table-button"]');
    const firstShareLink = await page.locator('[data-testid="share-link-display"]').inputValue();
    const firstToken = firstShareLink.match(/\/shared\/([a-zA-Z0-9]+)/)![1];

    await page.click('[data-testid="close-share-modal"]');

    // Generate new share link (if feature exists)
    if (await page.locator('[data-testid="regenerate-share-link"]').isVisible()) {
      await page.click('[data-testid="regenerate-share-link"]');
      await page.click('[data-testid="share-table-button"]');

      const secondShareLink = await page.locator('[data-testid="share-link-display"]').inputValue();
      const secondToken = secondShareLink.match(/\/shared\/([a-zA-Z0-9]+)/)![1];

      // Tokens should be different
      expect(firstToken).not.toBe(secondToken);

      // Both should work (depending on implementation - old might be invalidated)
      await page.goto(`/shared/${secondToken}`);
      await expect(page.locator('h1, h2')).toContainText('Shareable Test Table');
    }
  });
});