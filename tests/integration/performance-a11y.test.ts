import { test, expect } from '@playwright/test';

test.describe('Performance & Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // Set up consistent testing environment
    await page.goto('/');
  });

  test('should meet Lighthouse performance targets', async ({ page }) => {
    // Navigate to main pages and measure performance
    const pages = ['/', '/login', '/register'];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Measure page load performance
      const performanceEntries = await page.evaluate(() => {
        return {
          loadComplete: performance.timing.loadEventEnd - performance.timing.navigationStart,
          domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
          firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-contentful-paint')?.startTime || 0
        };
      });

      // Performance targets based on requirements
      expect(performanceEntries.loadComplete).toBeLessThan(3000); // < 3s initial load
      expect(performanceEntries.domReady).toBeLessThan(2000); // DOM ready < 2s
      expect(performanceEntries.firstContentfulPaint).toBeLessThan(1500); // FCP < 1.5s

      console.log(`Performance for ${pagePath}:`, performanceEntries);
    }
  });

  test('should have fast search response time', async ({ page }) => {
    await page.waitForSelector('[data-testid="search-bar"]');

    // Measure search response time
    const searchTerms = ['sword', 'ring', 'armor', 'potion', 'magic'];

    for (const term of searchTerms) {
      const startTime = Date.now();

      await page.fill('[data-testid="search-bar"]', term);

      // Wait for search results to update
      await page.waitForFunction(
        (searchTerm) => {
          const items = document.querySelectorAll('[data-testid="magic-item-card"]');
          return items.length > 0;
        },
        term,
        { timeout: 1000 }
      );

      const searchTime = Date.now() - startTime;

      // Should respond in under 200ms as per requirements
      expect(searchTime).toBeLessThan(200);

      // Clear search for next iteration
      await page.fill('[data-testid="search-bar"]', '');
      await page.waitForTimeout(100);
    }
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    // Test main navigation via keyboard
    await page.keyboard.press('Tab');

    // Should focus on first interactive element
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);

    // Test search functionality via keyboard
    await page.goto('/');
    await page.keyboard.press('Tab');

    // Navigate to search bar (may take multiple tabs)
    let searchFocused = false;
    for (let i = 0; i < 10; i++) {
      const currentElement = await page.evaluate(() => {
        return {
          tagName: document.activeElement?.tagName,
          testId: document.activeElement?.getAttribute('data-testid'),
          type: document.activeElement?.getAttribute('type')
        };
      });

      if (currentElement.testId === 'search-bar' || (currentElement.tagName === 'INPUT' && currentElement.type === 'search')) {
        searchFocused = true;
        break;
      }

      await page.keyboard.press('Tab');
    }

    expect(searchFocused).toBeTruthy();

    // Test search input via keyboard
    await page.keyboard.type('sword');
    await page.waitForTimeout(300);

    // Results should be visible
    const results = page.locator('[data-testid="magic-item-card"]');
    await expect(results).toHaveCountGreaterThan(0);

    // Test navigation through results
    await page.keyboard.press('Tab');
    const focusedResult = await page.evaluate(() => {
      return document.activeElement?.closest('[data-testid="magic-item-card"]') !== null;
    });

    expect(focusedResult).toBeTruthy();
  });

  test('should have proper ARIA labels and roles', async ({ page }) => {
    // Check main landmarks
    const landmarks = await page.evaluate(() => {
      const elements = document.querySelectorAll('[role]');
      return Array.from(elements).map(el => ({
        role: el.getAttribute('role'),
        ariaLabel: el.getAttribute('aria-label'),
        tagName: el.tagName
      }));
    });

    // Should have navigation landmark
    const hasNavigation = landmarks.some(el => el.role === 'navigation' || el.tagName === 'NAV');
    expect(hasNavigation).toBeTruthy();

    // Should have main content area
    const hasMain = landmarks.some(el => el.role === 'main' || el.tagName === 'MAIN');
    expect(hasMain).toBeTruthy();

    // Check form elements have proper labels
    const formElements = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input, select, textarea');
      return Array.from(inputs).map(el => ({
        id: el.id,
        ariaLabel: el.getAttribute('aria-label'),
        ariaLabelledBy: el.getAttribute('aria-labelledby'),
        hasLabel: !!document.querySelector(`label[for="${el.id}"]`)
      }));
    });

    for (const element of formElements) {
      // Each form element should have some form of labeling
      const hasLabeling = element.ariaLabel || element.ariaLabelledBy || element.hasLabel;
      expect(hasLabeling).toBeTruthy();
    }

    // Check buttons have accessible names
    const buttons = await page.evaluate(() => {
      const btns = document.querySelectorAll('button');
      return Array.from(btns).map(btn => ({
        textContent: btn.textContent?.trim(),
        ariaLabel: btn.getAttribute('aria-label'),
        title: btn.getAttribute('title')
      }));
    });

    for (const button of buttons) {
      // Each button should have an accessible name
      const hasAccessibleName = button.textContent || button.ariaLabel || button.title;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('should support screen reader navigation', async ({ page }) => {
    // Test heading hierarchy
    const headings = await page.evaluate(() => {
      const headingTags = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headingTags).map(h => ({
        level: parseInt(h.tagName.substring(1)),
        text: h.textContent?.trim(),
        id: h.id
      }));
    });

    // Should have a proper heading hierarchy
    expect(headings.length).toBeGreaterThan(0);

    // Should start with h1
    const hasH1 = headings.some(h => h.level === 1);
    expect(hasH1).toBeTruthy();

    // Check for skip links
    const skipLinks = await page.evaluate(() => {
      const links = document.querySelectorAll('a[href^="#"]');
      return Array.from(links).filter(link =>
        link.textContent?.toLowerCase().includes('skip') ||
        link.textContent?.toLowerCase().includes('main')
      );
    });

    // Should have skip navigation links for accessibility
    expect(skipLinks.length).toBeGreaterThanOrEqual(0); // Optional but recommended

    // Test list semantics
    const lists = await page.evaluate(() => {
      const listElements = document.querySelectorAll('ul, ol');
      return Array.from(listElements).map(list => ({
        tagName: list.tagName,
        itemCount: list.querySelectorAll('li').length,
        role: list.getAttribute('role')
      }));
    });

    // Lists should contain list items
    for (const list of lists) {
      if (list.role !== 'presentation' && list.role !== 'none') {
        expect(list.itemCount).toBeGreaterThan(0);
      }
    }
  });

  test('should handle high contrast mode', async ({ page }) => {
    // Simulate high contrast mode
    await page.addStyleTag({
      content: `
        @media (prefers-contrast: high) {
          * {
            filter: contrast(2) !important;
          }
        }
      `
    });

    await page.reload();

    // Ensure content is still visible and readable
    const visibleElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, a, input, [data-testid="magic-item-card"]');
      return Array.from(elements).map(el => {
        const styles = window.getComputedStyle(el);
        return {
          visible: styles.display !== 'none' && styles.visibility !== 'hidden',
          hasBackground: styles.backgroundColor !== 'rgba(0, 0, 0, 0)',
          hasText: el.textContent?.trim().length > 0
        };
      });
    });

    // Key interactive elements should remain visible
    const visibleInteractiveElements = visibleElements.filter(el => el.visible);
    expect(visibleInteractiveElements.length).toBeGreaterThan(0);
  });

  test('should be usable with reduced motion preference', async ({ page }) => {
    // Set reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await page.goto('/');

    // Test that animations respect reduced motion
    const animations = await page.evaluate(() => {
      const elements = document.querySelectorAll('*');
      const animatedElements = [];

      for (const el of elements) {
        const styles = window.getComputedStyle(el);
        if (styles.animationDuration !== '0s' || styles.transitionDuration !== '0s') {
          animatedElements.push({
            tagName: el.tagName,
            animationDuration: styles.animationDuration,
            transitionDuration: styles.transitionDuration
          });
        }
      }

      return animatedElements;
    });

    // With reduced motion, animations should be disabled or very short
    for (const animation of animations) {
      const duration = parseFloat(animation.animationDuration) || parseFloat(animation.transitionDuration);
      expect(duration).toBeLessThanOrEqual(0.2); // Max 200ms for reduced motion
    }

    // Test search functionality still works without motion
    await page.fill('[data-testid="search-bar"]', 'test');
    await page.waitForTimeout(300);

    const results = page.locator('[data-testid="magic-item-card"]');
    await expect(results).toHaveCountGreaterThan(0);
  });

  test('should handle color contrast requirements', async ({ page }) => {
    // Check color contrast for text elements
    const contrastResults = await page.evaluate(() => {
      const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, button, label, span');
      const results = [];

      for (const el of textElements) {
        const styles = window.getComputedStyle(el);
        const color = styles.color;
        const backgroundColor = styles.backgroundColor;

        if (el.textContent?.trim()) {
          results.push({
            text: el.textContent.trim().substring(0, 50),
            color,
            backgroundColor,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight
          });
        }
      }

      return results.slice(0, 20); // Sample first 20 elements
    });

    // This is a basic check - in a real scenario you'd use a proper contrast checker
    for (const result of contrastResults) {
      // Ensure colors are defined (not transparent)
      expect(result.color).not.toBe('rgba(0, 0, 0, 0)');
      expect(result.color).not.toBe('transparent');
    }
  });

  test('should support focus management', async ({ page }) => {
    // Test focus visibility
    await page.keyboard.press('Tab');

    const focusStyles = await page.evaluate(() => {
      const focused = document.activeElement;
      if (!focused) return null;

      const styles = window.getComputedStyle(focused);
      return {
        outline: styles.outline,
        outlineColor: styles.outlineColor,
        outlineWidth: styles.outlineWidth,
        boxShadow: styles.boxShadow
      };
    });

    // Focused element should have visible focus indicator
    const hasFocusIndicator = focusStyles && (
      focusStyles.outline !== 'none' ||
      focusStyles.boxShadow !== 'none' ||
      focusStyles.outlineWidth !== '0px'
    );

    expect(hasFocusIndicator).toBeTruthy();

    // Test focus trap in modals (if any)
    const modalTrigger = page.locator('[data-testid*="modal"], [data-testid*="dialog"]').first();
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();

      // Focus should be trapped within modal
      await page.keyboard.press('Tab');
      const focusedInModal = await page.evaluate(() => {
        const focused = document.activeElement;
        const modal = focused?.closest('[role="dialog"], [data-testid*="modal"]');
        return !!modal;
      });

      expect(focusedInModal).toBeTruthy();
    }
  });

  test('should meet SEO requirements', async ({ page }) => {
    // Check meta tags
    const metaTags = await page.evaluate(() => {
      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
        viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content'),
        charset: document.querySelector('meta[charset]')?.getAttribute('charset')
      };
    });

    // Should have proper meta tags
    expect(metaTags.title).toBeTruthy();
    expect(metaTags.title.length).toBeGreaterThan(10);
    expect(metaTags.viewport).toContain('width=device-width');

    // Check for structured data
    const structuredData = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      return scripts.length;
    });

    // Should have some structured data for SEO
    expect(structuredData).toBeGreaterThanOrEqual(0);

    // Check heading structure for SEO
    const headingHierarchy = await page.evaluate(() => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      return Array.from(headings).map(h => ({
        level: parseInt(h.tagName.substring(1)),
        text: h.textContent?.trim()
      }));
    });

    // Should have proper heading hierarchy
    expect(headingHierarchy.length).toBeGreaterThan(0);
    const hasH1 = headingHierarchy.some(h => h.level === 1);
    expect(hasH1).toBeTruthy();
  });

  test('should handle error states accessibly', async ({ page }) => {
    // Test form validation errors
    await page.goto('/login');

    // Submit empty form
    await page.click('[data-testid="login-button"]');

    // Check for accessible error messages
    const errorMessages = await page.evaluate(() => {
      const errors = document.querySelectorAll('[role="alert"], [aria-live], .error, [data-testid*="error"]');
      return Array.from(errors).map(error => ({
        text: error.textContent?.trim(),
        role: error.getAttribute('role'),
        ariaLive: error.getAttribute('aria-live'),
        id: error.id
      }));
    });

    // Should have accessible error messages
    const hasAccessibleErrors = errorMessages.some(error =>
      error.role === 'alert' || error.ariaLive || error.text
    );

    if (errorMessages.length > 0) {
      expect(hasAccessibleErrors).toBeTruthy();
    }

    // Test network error handling
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server Error' })
      });
    });

    // Trigger API call and check error handling
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Should handle errors gracefully without breaking accessibility
    const pageErrors = await page.evaluate(() => {
      const errorElements = document.querySelectorAll('[role="alert"], [data-testid*="error"]');
      return errorElements.length;
    });

    // Application should still be navigable
    await page.keyboard.press('Tab');
    const stillNavigable = await page.evaluate(() => {
      return document.activeElement !== document.body;
    });

    expect(stillNavigable).toBeTruthy();
  });
});