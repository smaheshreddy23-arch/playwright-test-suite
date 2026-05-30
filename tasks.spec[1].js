// @ts-check
const { test, expect } = require('@playwright/test');
const testData = require('./testData.json');

const { credentials, testCases } = testData;

/**
 * Reusable login helper — fills the login form and submits it.
 * @param {import('@playwright/test').Page} page
 */
async function login(page) {
  await page.goto('/');

  // The demo app uses simple text inputs; try label-based then fallback to placeholder/type
  const emailField =
    page.getByLabel(/username|email/i).first() ||
    page.locator('input[type="text"], input[name="username"], input[name="email"]').first();

  const passwordField =
    page.getByLabel(/password/i).first() ||
    page.locator('input[type="password"]').first();

  await page.locator('input[type="text"], input[name="username"]').first().fill(credentials.email);
  await page.locator('input[type="password"]').first().fill(credentials.password);
  await page.locator('button[type="submit"], button:has-text("Sign"), button:has-text("Log")').first().click();

  // Confirm we've moved past the login screen (URL changes or login form disappears)
  await page.waitForURL((url) => !url.href.includes('login'), { timeout: 10_000 }).catch(() => {
    // Some SPAs don't change the URL; just wait for the nav/sidebar to appear
  });
  await expect(page.locator('nav, [role="navigation"], aside').first()).toBeVisible({ timeout: 10_000 });
}

/**
 * Clicks a project link in the sidebar and waits for its board to load.
 * @param {import('@playwright/test').Page} page
 * @param {string} projectName
 */
async function navigateToProject(page, projectName) {
  await page.getByRole('link', { name: projectName, exact: true }).click();
  // Wait for a heading or the board columns to be visible
  await expect(page.getByText(projectName, { exact: true }).first()).toBeVisible({ timeout: 8_000 });
}

/**
 * Finds the kanban column whose header matches `columnName`, then asserts that:
 *   - the `taskName` card is present inside it, and
 *   - every tag in `expectedTags` is visible on (or near) that card.
 *
 * @param {import('@playwright/test').Page} page
 * @param {string} taskName
 * @param {string} columnName
 * @param {string[]} expectedTags
 */
async function verifyTaskInColumn(page, taskName, columnName, expectedTags) {
  // Strategy: find an element whose text matches the column name, then walk up
  // to its section/container, and search within it.
  const columnHeader = page.getByText(columnName, { exact: true }).first();
  await expect(columnHeader).toBeVisible({ timeout: 8_000 });

  // Get the bounding box of the header to find co-located task cards
  // Use a broad ancestor search: h2/h3 → parent section/div
  const columnSection = page.locator('div, section').filter({
    has: page.getByText(columnName, { exact: true }),
  }).first();

  // Verify task title exists inside the column section
  const taskCard = columnSection.getByText(taskName, { exact: true }).first();
  await expect(taskCard).toBeVisible({ timeout: 8_000 });

  // Verify each expected tag is visible within the column section
  for (const tag of expectedTags) {
    await expect(columnSection.getByText(tag, { exact: true }).first()).toBeVisible({ timeout: 5_000 });
  }
}

// ---------------------------------------------------------------------------
// Data-driven test suite — iterates over every scenario in testData.json
// ---------------------------------------------------------------------------
for (const tc of testCases) {
  test(
    `TC${tc.id}: [${tc.project}] "${tc.task}" → "${tc.column}" | tags: [${tc.tags.join(', ')}]`,
    async ({ page }) => {
      // 1. Authenticate
      await login(page);

      // 2. Open the target project board
      await navigateToProject(page, tc.project);

      // 3. Assert task is in the correct column with the correct tags
      await verifyTaskInColumn(page, tc.task, tc.column, tc.tags);
    }
  );
}
