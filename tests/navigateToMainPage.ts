import { test, expect, selectors, Page, Browser } from "@playwright/test";
import * as fs from "fs";
import path from "path";
import { getRootDirectory } from "./getRootDirectory";

/**
 * true - uses local dist for testing
 * false - point to production url
 */
const useLocalDist = true;

const mainPageUrl = "https://openchecklist.github.io/";

export async function navigateToMainPage(browser: Browser): Promise<Page> {
    // Create a separate browser context for each test
    const context = await browser.newContext();
    const page = await context.newPage();

    // redirect to local data
    if (useLocalDist) {
        // interceptor to replace content of the page
        page.route(mainPageUrl, (route, request) => {
            route.fulfill({
                body: getLocalDistIndexData(),
            });
        });
    }

    await page.goto(mainPageUrl);

    // Check that the page is the right one
    await expect(page).toHaveTitle("Checklist");

    return page;
}

/**
 * Local generated page from build
 */
const mainPageLocalDistDataPath = path.resolve(getRootDirectory(), "dist", "index.html");

function getLocalDistIndexData() {
    if (!fs.existsSync(mainPageLocalDistDataPath)) {
        throw new Error(`cannot find mainPageLocalDistDataPath`);
    }

    const mainPageLocalDistData = fs.readFileSync(mainPageLocalDistDataPath);
    return mainPageLocalDistData;
}
