import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

/**
 * Mobile-specific tests for phishing detection flow
 * Tests touch targets, form usability, and responsive layout
 */
test.describe('Mobile Phishing Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('form elements meet 44px touch target requirement', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    // Check submit button height
    const submitButton = page.locator('button:has-text("Check for Phishing")');
    const buttonBox = await submitButton.boundingBox();
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);

    // Check textarea is accessible
    const textarea = page.locator('textarea#email-text');
    await expect(textarea).toBeVisible();
    const textareaBox = await textarea.boundingBox();
    expect(textareaBox?.height).toBeGreaterThanOrEqual(120);
  });

  test('example buttons are accessible on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    // Check example buttons are visible and tappable
    const phishingButton = page.locator('button:has-text("Try Phishing Example")');
    const safeButton = page.locator('button:has-text("Try Safe Example")');

    await expect(phishingButton).toBeVisible();
    await expect(safeButton).toBeVisible();

    // Buttons should stack or be full-width on mobile
    const phishingBox = await phishingButton.boundingBox();
    const safeBox = await safeButton.boundingBox();

    // Both should meet minimum touch target
    expect(phishingBox?.height).toBeGreaterThanOrEqual(44);
    expect(safeBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('complete phishing detection flow on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    // Tap "Try Phishing Example" button
    await page.click('button:has-text("Try Phishing Example")');

    // Verify textarea is populated
    const textarea = page.locator('textarea#email-text');
    await expect(textarea).toHaveValue(/URGENT/);

    // Tap submit button
    await page.click('button:has-text("Check for Phishing")');

    // Wait for result
    await page.waitForSelector('text=Phishing Detected', { timeout: 15000 });

    // Verify result is visible
    await expect(page.locator('text=Phishing Detected')).toBeVisible();
    await expect(page.locator('text=confidence')).toBeVisible();

    // Take screenshot of mobile result
    await page.screenshot({
      path: 'tests/screenshots/mobile-phishing-result.png',
      fullPage: true
    });
  });

  test('complete safe email flow on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    // Tap "Try Safe Example" button
    await page.click('button:has-text("Try Safe Example")');

    // Verify textarea is populated
    const textarea = page.locator('textarea#email-text');
    await expect(textarea).toHaveValue(/shipped/);

    // Tap submit button
    await page.click('button:has-text("Check for Phishing")');

    // Wait for result
    await page.waitForSelector('text=Appears Safe', { timeout: 15000 });

    // Verify result is visible
    await expect(page.locator('text=Appears Safe')).toBeVisible();

    // Take screenshot
    await page.screenshot({
      path: 'tests/screenshots/mobile-safe-result.png',
      fullPage: true
    });
  });

  test('real-time threat indicator works on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    const textarea = page.locator('textarea#email-text');

    // Type suspicious content
    await textarea.fill('URGENT: Click here immediately to verify your account');

    // Wait for threat indicator
    await page.waitForSelector('text=High risk', { timeout: 5000 });
    await expect(page.locator('text=High risk')).toBeVisible();
  });

  test('no horizontal scroll on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    // Get body scroll width
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const clientWidth = await page.evaluate(() => document.body.clientWidth);

    // Scroll width should not exceed client width significantly
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
  });

  test('contact form is usable on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    // Scroll to contact form
    await page.locator('#contact').scrollIntoViewIfNeeded();

    // Check form inputs are visible and meet touch targets
    const nameInput = page.locator('input#name');
    const emailInput = page.locator('input#email');
    const companyInput = page.locator('input#company');
    const submitBtn = page.locator('button:has-text("Request Demo")');

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(companyInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Check input heights
    const nameBox = await nameInput.boundingBox();
    expect(nameBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('footer links are tappable on mobile', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');

    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();

    // Check email link
    const emailLink = page.locator('a[href^="mailto:"]');
    await expect(emailLink).toBeVisible();
    const emailBox = await emailLink.boundingBox();
    expect(emailBox?.height).toBeGreaterThanOrEqual(44);

    // Check privacy link
    const privacyLink = page.locator('a[href="/privacy"]');
    await expect(privacyLink).toBeVisible();
    const privacyBox = await privacyLink.boundingBox();
    expect(privacyBox?.height).toBeGreaterThanOrEqual(44);
  });
});

test.describe('Desktop Phishing Flow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
  });

  test('example buttons are side by side on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop-only test');

    const phishingButton = page.locator('button:has-text("Try Phishing Example")');
    const safeButton = page.locator('button:has-text("Try Safe Example")');

    const phishingBox = await phishingButton.boundingBox();
    const safeBox = await safeButton.boundingBox();

    // On desktop, buttons should be on the same row (same Y position)
    if (phishingBox && safeBox) {
      // Allow 5px tolerance for alignment
      expect(Math.abs(phishingBox.y - safeBox.y)).toBeLessThan(5);
    }
  });

  test('trust banner displays in row on desktop', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop-only test');

    // All 4 trust items should be visible
    await expect(page.locator('text=Local-First')).toBeVisible();
    await expect(page.locator('text=<15ms')).toBeVisible();
    await expect(page.locator('text=2,039')).toBeVisible();
    await expect(page.locator('text=87%')).toBeVisible();
  });
});

test.describe('SEO and Meta Tags', () => {

  test('has correct meta tags', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check viewport
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewport).toContain('width=device-width');

    // Check title
    const title = await page.title();
    expect(title).toContain('PhishGuard');

    // Check description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('ML phishing detector');

    // Check robots
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toContain('index');

    // Check OG image
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    expect(ogImage).toContain('og-image.png');
  });

  test('has structured data', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for JSON-LD script
    const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLd).toBeTruthy();

    const data = JSON.parse(jsonLd!);
    expect(data['@type']).toBe('SoftwareApplication');
    expect(data.name).toBe('PhishGuard');
  });

  test('has theme color meta', async ({ page }) => {
    await page.goto(BASE_URL);

    const themeColor = await page.locator('meta[name="theme-color"]').getAttribute('content');
    expect(themeColor).toBe('#0f172a');
  });
});
