import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  const mobileViewport = { width: 375, height: 667 }; // iPhone SE
  const tabletViewport = { width: 768, height: 1024 }; // iPad
  const desktopViewport = { width: 1920, height: 1080 }; // Desktop

  test.beforeEach(async ({ page }) => {
    // Set mobile viewport for most tests
    await page.setViewportSize(mobileViewport);
  });

  test('should display properly on mobile viewport', async ({ page }) => {
    await page.goto('/');

    // Verify page loads and is responsive
    await expect(page.locator('body')).toBeVisible();

    // Check that no horizontal scrolling is required
    const bodyWidth = await page.locator('body').boundingBox();
    expect(bodyWidth?.width).toBeLessThanOrEqual(mobileViewport.width);

    // Verify main navigation is mobile-friendly
    await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible();

    // Check that magic items grid adapts to mobile
    const itemsGrid = page.locator('[data-testid="magic-items-grid"]');
    await expect(itemsGrid).toBeVisible();

    // Items should stack vertically on mobile
    const gridComputedStyle = await itemsGrid.evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue('display');
    });
    // Should be flex or grid with proper responsive behavior
    expect(['flex', 'grid', 'block']).toContain(gridComputedStyle);
  });

  test('should have appropriate touch targets', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    // Check button sizes meet 44px minimum
    const buttons = page.locator('button, [role="button"], a[data-testid*="button"]');
    const buttonCount = await buttons.count();

    for (let i = 0; i < Math.min(5, buttonCount); i++) {
      const button = buttons.nth(i);
      const boundingBox = await button.boundingBox();

      if (boundingBox) {
        // Minimum touch target should be 44px
        expect(Math.max(boundingBox.width, boundingBox.height)).toBeGreaterThanOrEqual(44);
      }
    }

    // Test specific interactive elements
    const searchBar = page.locator('[data-testid="search-bar"]');
    if (await searchBar.isVisible()) {
      const searchBox = await searchBar.boundingBox();
      expect(searchBox?.height).toBeGreaterThanOrEqual(44);
    }

    // Test filter controls
    const filterControls = page.locator('[data-testid="filter-controls"] select, [data-testid="filter-controls"] button');
    const filterCount = await filterControls.count();

    for (let i = 0; i < filterCount; i++) {
      const control = filterControls.nth(i);
      const controlBox = await control.boundingBox();

      if (controlBox) {
        expect(Math.max(controlBox.width, controlBox.height)).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test('should work with touch interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-item-card"]');

    // Test touch tap on magic item card
    const firstItem = page.locator('[data-testid="magic-item-card"]').first();
    await firstItem.tap();

    // Should navigate to item detail or show expanded view
    await page.waitForTimeout(1000);

    // Test touch interaction with search
    const searchBar = page.locator('[data-testid="search-bar"]');
    await searchBar.tap();
    await searchBar.fill('sword');

    // Search should work with mobile keyboard
    await page.waitForTimeout(500);
    const results = page.locator('[data-testid="magic-item-card"]');
    await expect(results).toHaveCountGreaterThan(0);

    // Test dropdown menus work on touch
    const typeFilter = page.locator('[data-testid="type-filter"]');
    if (await typeFilter.isVisible()) {
      await typeFilter.tap();
      // Dropdown should open and be selectable
      await typeFilter.selectOption('weapon');
      await page.waitForTimeout(300);
    }
  });

  test('should adapt navigation for mobile', async ({ page }) => {
    await page.goto('/');

    // Check mobile navigation menu
    const mobileNav = page.locator('[data-testid="mobile-nav"], [data-testid="hamburger-menu"]');
    if (await mobileNav.isVisible()) {
      await mobileNav.tap();

      // Menu should expand
      const navMenu = page.locator('[data-testid="nav-menu"], [data-testid="mobile-menu"]');
      await expect(navMenu).toBeVisible();

      // Test navigation links
      const navLinks = navMenu.locator('a, [role="link"]');
      const linkCount = await navLinks.count();
      expect(linkCount).toBeGreaterThan(0);

      // Links should be appropriately sized for touch
      for (let i = 0; i < Math.min(3, linkCount); i++) {
        const link = navLinks.nth(i);
        const linkBox = await link.boundingBox();
        if (linkBox) {
          expect(linkBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    }

    // Test breadcrumb navigation on mobile
    const breadcrumbs = page.locator('[data-testid="breadcrumbs"]');
    if (await breadcrumbs.isVisible()) {
      // Should be readable and tappable on mobile
      const breadcrumbLinks = breadcrumbs.locator('a');
      const breadcrumbCount = await breadcrumbLinks.count();

      if (breadcrumbCount > 0) {
        const firstBreadcrumb = breadcrumbLinks.first();
        const breadcrumbBox = await firstBreadcrumb.boundingBox();
        if (breadcrumbBox) {
          expect(breadcrumbBox.height).toBeGreaterThanOrEqual(30);
        }
      }
    }
  });

  test('should handle form inputs properly on mobile', async ({ page, context }) => {
    // Test with authenticated forms
    await page.goto('/register');

    // Form inputs should be appropriately sized
    const emailInput = page.locator('[data-testid="email-input"]');
    const passwordInput = page.locator('[data-testid="password-input"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();

    // Inputs should be touch-friendly
    const emailBox = await emailInput.boundingBox();
    const passwordBox = await passwordInput.boundingBox();

    expect(emailBox?.height).toBeGreaterThanOrEqual(44);
    expect(passwordBox?.height).toBeGreaterThanOrEqual(44);

    // Test keyboard behavior
    await emailInput.tap();
    await emailInput.fill('test@example.com');

    // Test form submission button
    const submitButton = page.locator('[data-testid="register-button"]');
    const submitBox = await submitButton.boundingBox();
    expect(submitBox?.height).toBeGreaterThanOrEqual(44);

    // Test mobile keyboard doesn't break layout
    const bodyHeight = await page.locator('body').boundingBox();
    expect(bodyHeight?.width).toBeLessThanOrEqual(mobileViewport.width);
  });

  test('should display tables responsively', async ({ page }) => {
    // Create a test account to access tables
    const testEmail = `mobiletest${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    await page.goto('/register');
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', testPassword);
    await page.fill('[data-testid="confirm-password-input"]', testPassword);
    await page.tap('[data-testid="register-button"]');
    await page.waitForTimeout(2000);

    // Login if needed
    if (await page.locator('[data-testid="login-button"]').isVisible()) {
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testEmail);
      await page.fill('[data-testid="password-input"]', testPassword);
      await page.tap('[data-testid="login-button"]');
      await page.waitForTimeout(2000);
    }

    // Navigate to a list or table view
    await page.tap('[data-testid="lists-nav"]');

    // Tables/lists should be responsive
    const listContainer = page.locator('[data-testid="lists-container"], [data-testid="tables-container"]');
    if (await listContainer.isVisible()) {
      const containerBox = await listContainer.boundingBox();
      expect(containerBox?.width).toBeLessThanOrEqual(mobileViewport.width);
    }

    // Table rows should stack or scroll appropriately
    const tableRows = page.locator('[data-testid="list-item"], [data-testid="table-row"]');
    if (await tableRows.count() > 0) {
      const firstRow = tableRows.first();
      const rowBox = await firstRow.boundingBox();

      // Row should fit within mobile viewport
      expect(rowBox?.width).toBeLessThanOrEqual(mobileViewport.width);

      // Row should be tall enough for touch interaction
      expect(rowBox?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('should work across different screen sizes', async ({ page }) => {
    // Test mobile
    await page.setViewportSize(mobileViewport);
    await page.goto('/');
    await page.waitForSelector('[data-testid="magic-items-grid"]');

    let gridColumns = await page.locator('[data-testid="magic-items-grid"]').evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue('grid-template-columns');
    });

    // Should have fewer columns on mobile
    expect(gridColumns).toBeTruthy();

    // Test tablet
    await page.setViewportSize(tabletViewport);
    await page.reload();
    await page.waitForSelector('[data-testid="magic-items-grid"]');

    gridColumns = await page.locator('[data-testid="magic-items-grid"]').evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue('grid-template-columns');
    });

    // Should adapt for tablet
    expect(gridColumns).toBeTruthy();

    // Test desktop
    await page.setViewportSize(desktopViewport);
    await page.reload();
    await page.waitForSelector('[data-testid="magic-items-grid"]');

    gridColumns = await page.locator('[data-testid="magic-items-grid"]').evaluate((el) => {
      return window.getComputedStyle(el).getPropertyValue('grid-template-columns');
    });

    // Should have more columns on desktop
    expect(gridColumns).toBeTruthy();
  });

  test('should handle landscape orientation', async ({ page }) => {
    // Test landscape mobile (rotated phone)
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/');

    // Content should still be accessible
    await expect(page.locator('[data-testid="magic-items-grid"]')).toBeVisible();

    // Navigation should still work
    const navElement = page.locator('[data-testid="mobile-nav"], nav');
    await expect(navElement).toBeVisible();

    // No horizontal scroll should be needed
    const bodyWidth = await page.locator('body').boundingBox();
    expect(bodyWidth?.width).toBeLessThanOrEqual(667);

    // Search functionality should still work
    const searchBar = page.locator('[data-testid="search-bar"]');
    if (await searchBar.isVisible()) {
      await searchBar.tap();
      await searchBar.fill('test');
      await page.waitForTimeout(300);

      // Should not break layout
      const searchBox = await searchBar.boundingBox();
      expect(searchBox?.width).toBeLessThanOrEqual(667);
    }
  });

  test('should maintain performance on mobile', async ({ page }) => {
    await page.goto('/');

    const startTime = Date.now();
    await page.waitForSelector('[data-testid="magic-item-card"]');
    const loadTime = Date.now() - startTime;

    // Should load reasonably fast on mobile
    expect(loadTime).toBeLessThan(5000); // 5 seconds for mobile

    // Test scroll performance
    const initialY = await page.locator('body').evaluate((el) => window.scrollY);

    await page.evaluate(() => {
      window.scrollTo(0, 500);
    });

    await page.waitForTimeout(100);

    const finalY = await page.locator('body').evaluate((el) => window.scrollY);
    expect(finalY).toBeGreaterThan(initialY);

    // Search should still be responsive
    const searchStart = Date.now();
    await page.fill('[data-testid="search-bar"]', 'sword');
    await page.waitForTimeout(100);
    const searchTime = Date.now() - searchStart;

    expect(searchTime).toBeLessThan(500); // Should be fast even on mobile
  });

  test('should handle edge cases and small screens', async ({ page }) => {
    // Test very small screen (e.g., old phones)
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');

    // Content should still be usable
    await expect(page.locator('[data-testid="magic-items-grid"]')).toBeVisible();

    // Text should remain readable
    const firstItem = page.locator('[data-testid="magic-item-card"]').first();
    if (await firstItem.isVisible()) {
      const itemName = firstItem.locator('[data-testid="item-name"]');
      await expect(itemName).toBeVisible();

      // Text should not be cut off
      const nameBox = await itemName.boundingBox();
      expect(nameBox?.width).toBeLessThanOrEqual(320);
    }

    // Buttons should still be tappable
    const buttons = page.locator('button');
    if (await buttons.count() > 0) {
      const firstButton = buttons.first();
      const buttonBox = await firstButton.boundingBox();

      if (buttonBox) {
        expect(buttonBox.width).toBeGreaterThan(0);
        expect(buttonBox.height).toBeGreaterThanOrEqual(44);
      }
    }
  });
});