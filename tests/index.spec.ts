import { test, expect, selectors, Page, Browser } from "@playwright/test";
import * as fs from "fs";
import path from "path";
import { navigateToMainPage } from "./navigateToMainPage";
import { recreateDirectory } from "./recreateDirectory";
import { getTempDirectory } from "./getTempDirectory";

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

function setTestId() {
    selectors.setTestIdAttribute("id");
}

async function testDownloadButton(browser: Browser, downloadDirectory: string, id: string) {
    const page = await navigateToMainPage(browser);
    setTestId();
    return await downloadButtonClick(page, id, downloadDirectory);
}

test.describe("download buttons", () => {
    const tempDirectory = getTempDirectory();
    const downloadDirectory = path.join(tempDirectory, "download buttons");
    test.beforeAll(async () => {
        // recreate temp directory
        recreateDirectory(downloadDirectory);
    });

    test.beforeEach(async () => {
        selectors.setTestIdAttribute("id");
    });

    test("md", async ({ browser }) => {
        await testDownloadButton(browser, downloadDirectory, idButtonSaveFileMd);
    });

    test("json", async ({ browser }) => {
        await testDownloadButton(browser, downloadDirectory, idButtonSaveFileJson);
    });

    test("txt", async ({ browser }) => {
        await testDownloadButton(browser, downloadDirectory, idButtonSaveFileTxt);
    });

    test("png", async ({ browser }) => {
        await testDownloadButton(browser, downloadDirectory, idButtonSaveFilePng);
    });

    test("svg", async ({ browser }) => {
        await testDownloadButton(browser, downloadDirectory, idButtonSaveFileSvg);
    });
});

test.describe("load", () => {
    const tempDirectory = getTempDirectory();
    const downloadDirectory = path.join(tempDirectory, "load");
    test.beforeAll(async () => {
        // recreate temp directory
        recreateDirectory(downloadDirectory);
    });

    test("md", async ({ browser }) => {
        const inputFileId = "input_load_file";
        setTestId();
        const page = await navigateToMainPage(browser);
        const button = page.getByTestId(inputFileId);

        // really want to test simple modification to the file

        const fileChooserPromise = page.waitForEvent("filechooser");

        await button.click();

        const fileChooser = await fileChooserPromise;

        // download file
        const filePath = await downloadButtonClick(page, idButtonSaveFileSvg, downloadDirectory);

        // uokia
        await fileChooser.setFiles(filePath);

        // How to check that the file was uploaded successfully?
        // What should happen?
    });
});

/**
 * Tests the download file button
 * clicks button and checks that the suggested file name actually downloads.
 *
 * @param page
 * @param id
 * @param tempDirectory
 * @returns
 */
async function downloadButtonClick(page: Page, id: string, tempDirectory: string) {
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
