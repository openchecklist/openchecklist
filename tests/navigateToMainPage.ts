import { test, expect, selectors, Page, Browser } from "@playwright/test";
import * as fs from "fs";
import path from "path";
import { getRootDirectory } from "./getRootDirectory";

/**
 * true - uses local dist for testing
 * false - point to production url
 */
const useLocalDist = true;

const mainPageRootUrl = "https://openchecklist.github.io/";

export async function navigateToMainPage(browser: Browser): Promise<Page> {
    // Create a separate browser context for each test
    const context = await browser.newContext();
    const page = await context.newPage();

    // redirect to local data
    if (useLocalDist) {
        // interceptor to replace content of the page with local dist data
        page.route(`${mainPageRootUrl}**/*`, (route, request) => {
            const url = request.url();
            let relativePath = url.substring(mainPageRootUrl.length);
            if (relativePath.length === 0) {
                relativePath = "index.html";
            }

            route.fulfill({
                body: getLocalDistItemData(relativePath),
            });
        });
    }

    await page.goto(mainPageRootUrl);

    // Check that the page is the right one
    await expect(page).toHaveTitle("Checklist");

    return page;
}

/**
 * Local generated dist folder from build
 */
const localDistPath = path.resolve(getRootDirectory(), "dist");

/**
 * Get and item from the dist folder
 * @param itemPathRelative relative path to the item in the local dist folder
 * @returns
 */
function getLocalDistItemData(itemPathRelative: string) {
    const itemPath = path.join(localDistPath, itemPathRelative);
    if (!fs.existsSync(itemPath)) {
        throw new Error(`cannot find ${itemPathRelative}`);
    }

    const itemData = fs.readFileSync(itemPath);
    return itemData;
}
