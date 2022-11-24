import * as fs from "fs";

/**
 * deletes directory and everything in it and then recreates it.
 * @param directoryPath
 */
export function recreateDirectory(directoryPath: string): void {
    // if it exists remove it
    if (fs.existsSync(directoryPath)) {
        fs.rmSync(directoryPath, { force: true, recursive: true });
    }

    // make sure it's removed
    if (fs.existsSync(directoryPath)) {
        throw new Error(`directory still exists ${directoryPath}`);
    }

    // remake it
    fs.mkdirSync(directoryPath, { recursive: true });

    // make sure it exists
    if (!fs.existsSync(directoryPath)) {
        throw new Error(`directory does not ${directoryPath}`);
    }
}
