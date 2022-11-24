import { getRootDirectory } from "./getRootDirectory";
import path from "path";

export function getTempDirectory() {
    /**
     * Temp directory for downloads
     */
    const tempDirectory = path.resolve(getRootDirectory(), "temp");

    return tempDirectory;
}
