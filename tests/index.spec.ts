import { test, expect, selectors, Page, Browser } from "@playwright/test";
import * as fs from "fs";
import path from "path";

const mainPageUrl = "https://openchecklist.github.io/";

/**
 * Local generated page from build
 */
const mainPageLocalDistDataPath = path.resolve("./../dist/index.html");
const mainPageLocalDistData = fs.readFileSync(mainPageLocalDistDataPath);

/**
 * Temp directory for downloads
 */
const downloadDirectory = path.resolve(path.join("..", "temp"));

/**
 * true - uses local dist for testing
 * false - point to production url
 */
const useLocalDist = true;

test("navigates to correct page title", async ({ browser }) => {
    const page = await navigateToMainPage(browser);
    await expect(page).toHaveTitle("Checklist");
});

// Button Ids
const idButtonSaveFileMd = "button_save_file_markdown";
const idButtonSaveFileJson = "button_save_file_json";
const idButtonSaveFileTxt = "button_save_file_text";
const idButtonSaveFilePng = "button_save_file_png";
const idButtonSaveFileSvg = "button_save_file_svg";

async function testDownloadButton(browser: Browser, id: string) {
    const page = await navigateToMainPage(browser);
    selectors.setTestIdAttribute("id");
    await testDownloadButtonClick(page, id, downloadDirectory);
}

test.describe("download buttons", () => {
    test.beforeAll(async () => {
        // recreate temp directory
        recreateDirectory(downloadDirectory);
    });

    test.beforeEach(async ({}) => {
        selectors.setTestIdAttribute("id");
    });

    test("md", async ({ browser }) => {
        testDownloadButton(browser, idButtonSaveFileMd);
    });

    test("json", async ({ browser }) => {
        testDownloadButton(browser, idButtonSaveFileJson);
    });

    test("txt", async ({ browser }) => {
        testDownloadButton(browser, idButtonSaveFileTxt);
    });

    test("png", async ({ browser }) => {
        testDownloadButton(browser, idButtonSaveFilePng);
    });

    test("svg", async ({ browser }) => {
        testDownloadButton(browser, idButtonSaveFileSvg);
    });
});

/**
 * deletes directory and everything in it and then recreates it.
 * @param directoryPath
 */
function recreateDirectory(directoryPath: string): void {
    fs.rmSync(directoryPath, { force: true, recursive: true });
    if (fs.existsSync(directoryPath)) {
        throw new Error(`directory still exists ${directoryPath}`);
    }
    fs.mkdirSync(directoryPath);
    if (!fs.existsSync(directoryPath)) {
        throw new Error(`directory does not ${directoryPath}`);
    }
}

async function navigateToMainPage(browser: Browser): Promise<Page> {
    // Create a separate browser context for each test
    const context = await browser.newContext();
    const page = await context.newPage();

    // redirect to local data
    if (useLocalDist) {
        // interceptor to replace content of the page
        page.route(mainPageUrl, (route, request) => {
            route.fulfill({
                body: mainPageLocalDistData,
            });
        });
    }

    await page.goto(mainPageUrl);

    // Check that the page is the right one
    await expect(page).toHaveTitle("Checklist");

    return page;
}

/**
 * Tests the download file button
 * clicks button and checks that the suggested file name actually downloads.
 *
 * @param page
 * @param id
 * @param tempDirectory
 * @returns
 */
async function testDownloadButtonClick(page: Page, id: string, tempDirectory: string) {
    const button = page.getByTestId(id); // .locator(`id='${id}'`);

    // Start waiting for the download
    const downloadPromise = page.waitForEvent("download", { timeout: 5000 });

    // Perform the action that initiates download
    await button.click();

    const download = await downloadPromise;

    const filename = download.suggestedFilename();

    // save to temp directory
    const savePath = path.join(tempDirectory, filename);

    // Wait for the download process to complete
    await download.saveAs(savePath);

    // Make sure file actually downloaded
    if (!fs.existsSync(savePath)) {
        throw new Error(`file not downloaded ${savePath}`);
    }

    return savePath;
}
