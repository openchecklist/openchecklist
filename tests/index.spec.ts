import { test, expect, selectors, Page } from "@playwright/test";
import { runInNewContext } from "vm";
import * as fs from "fs";
import path from "path";

const mainPageUrl = "https://openchecklist.github.io/";

/**
 * Local generated page
 */
const mainPageLocalDistData = fs.readFileSync("./dist/index.html");

/**
 * true - uses local dist for testing
 * false - point to production url
 */
const useLocalDist = true;

test("homepage has title and links to intro page", async ({ page }) => {
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

    // Test ALL download buttons

    const idButtonSaveFileMarkdown = "button_save_file_markdown";
    const idButtonSaveFileJson = "button_save_file_json";

    const buttonIds = [
        idButtonSaveFileMarkdown,
        idButtonSaveFileJson,
        "button_save_file_text",
        "button_save_file_png",
        "button_save_file_svg",
    ];

    selectors.setTestIdAttribute("id");

    const tempDirectory = path.join(".", "temp");

    // recreate temp directory
    fs.rmSync(tempDirectory, { force: true, recursive: true });
    if (fs.existsSync(tempDirectory)) {
        throw new Error(`temp directory still exists ${tempDirectory}`);
    }
    fs.mkdirSync(tempDirectory);
    if (!fs.existsSync(tempDirectory)) {
        throw new Error(`temp directory does not ${tempDirectory}`);
    }

    for (const id of buttonIds) {
        await testDownloadButton(page, id, tempDirectory);
    }
});

async function testDownloadButton(page: Page, id: string, tempDirectory: string) {
    const button = page.getByTestId(id); // .locator(`id='${id}'`);

    // Start waiting for the download
    const downloadPromise = page.waitForEvent("download", { timeout: 2000 });

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
