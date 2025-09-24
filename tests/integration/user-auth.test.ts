import { test, expect } from '@playwright/test';

test.describe('User Registration & Authentication', () => {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test('should complete user registration flow', async ({ page }) => {
    // Navigate to registration
    await page.goto('/');
    await page.click('[data-testid="sign-up-link"]');

    // Verify on registration page
    await expect(page).toHaveURL(/\/register|\/auth\/register/);
    await expect(page.locator('h1, h2')).toContainText(/sign up|register/i);

    // Fill registration form
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', testPassword);
    await page.fill('[data-testid="confirm-password-input"]', testPassword);

    // Submit registration
    await page.click('[data-testid="register-button"]');

    // Should redirect to authenticated area or show success message
    await page.waitForTimeout(2000); // Allow for registration processing

    // Verify registration success (either redirect or success message)
    try {
      await expect(page).toHaveURL(/\/dashboard|\/|\/lists/);
    } catch {
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    }
  });

  test('should handle first login after registration', async ({ page }) => {
    // Go to login page
    await page.goto('/login');

    // Fill login form
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', testPassword);

    // Submit login
    await page.click('[data-testid="login-button"]');

    // Wait for authentication
    await page.waitForTimeout(2000);

    // Should be authenticated and redirected
    await expect(page).toHaveURL(/\/dashboard|\/|\/lists/);

    // Verify authenticated UI state
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();

    // Verify favorites list is auto-created
    await page.click('[data-testid="lists-nav"]');
    await expect(page.locator('[data-testid="favorites-list"]')).toBeVisible();
  });

  test('should maintain session across browser refresh', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', testPassword);
    await page.click('[data-testid="login-button"]');
    await page.waitForTimeout(2000);

    // Verify authenticated state
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Refresh page
    await page.reload();

    // Should still be authenticated
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="logout-button"]')).toBeVisible();

    // Should not redirect to login
    await expect(page).not.toHaveURL(/\/login/);
  });

  test('should handle logout correctly', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', testPassword);
    await page.click('[data-testid="login-button"]');
    await page.waitForTimeout(2000);

    // Verify authenticated state
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should return to public state
    await page.waitForTimeout(1000);
    await expect(page.locator('[data-testid="sign-in-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();

    // Public content should still be accessible
    await expect(page.locator('[data-testid="magic-items-grid"]')).toBeVisible();
  });

  test('should handle login with wrong credentials', async ({ page }) => {
    await page.goto('/login');

    // Try with wrong password
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/invalid|incorrect|wrong/i);

    // Should not be authenticated
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
  });

  test('should handle registration with existing email', async ({ page }) => {
    await page.goto('/register');

    // Try to register with same email
    await page.fill('[data-testid="email-input"]', testEmail);
    await page.fill('[data-testid="password-input"]', testPassword);
    await page.fill('[data-testid="confirm-password-input"]', testPassword);
    await page.click('[data-testid="register-button"]');

    // Should show error about existing account
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText(/already exists|already registered/i);
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/register');

    // Test weak password
    await page.fill('[data-testid="email-input"]', 'newuser@example.com');
    await page.fill('[data-testid="password-input"]', '123');
    await page.fill('[data-testid="confirm-password-input"]', '123');
    await page.click('[data-testid="register-button"]');

    // Should show password validation error
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/register');

    // Test mismatched passwords
    await page.fill('[data-testid="email-input"]', 'newuser2@example.com');
    await page.fill('[data-testid="password-input"]', testPassword);
    await page.fill('[data-testid="confirm-password-input"]', 'differentpassword');
    await page.click('[data-testid="register-button"]');

    // Should show password mismatch error
    await expect(page.locator('[data-testid="confirm-password-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText(/match|same/i);
  });
});