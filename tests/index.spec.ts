import { test, expect } from '@playwright/test';
import { runInNewContext } from 'vm';
import * as fs from 'fs';

const mainPageUrl = "https://openchecklist.github.io/";

/**
 * Local generated page
 */
const mainPageLocalDistData = fs.readFileSync("./dist/index.html")

/**
 * true - uses local dist for testing
 * false - point to production url
 */
const useLocalDist = true;

test('homepage has title and links to intro page', async ({ page }) => {
    // redirect to local data
    if (useLocalDist)
    {
        // interceptor to replace content of the page
        page.route(mainPageUrl, (route, request) => {
            route.fulfill({
                body: mainPageLocalDistData
            });
        });
    }

  await page.goto(mainPageUrl);

  // Check that the page is the right one
  await expect(page).toHaveTitle("Checklist");
});
