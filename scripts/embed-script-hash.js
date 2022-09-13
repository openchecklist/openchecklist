// WSL Test command
// node ./embed-script-hash.js && cat ./checklist.js | openssl sha256 -binary | openssl base64

/**
 * Get content from string that is between two delimiters. First match of delimiter start.
 * @param {string} s - string to search in
 * @param {string} delimiterStart
 * @param {string} delimiterEnd
 * @returns {string|undefined}
 */
function contentBetweenDelimiters(s, delimiterStart, delimiterEnd) {
    const delimiterIndexStart = s.indexOf(delimiterStart);

    if (delimiterIndexStart === -1) {
        return undefined;
    }

    const delimiterIndexEnd = s.indexOf(delimiterEnd, delimiterIndexStart + delimiterStart.length);

    if (delimiterIndexEnd === -1) {
        return undefined;
    }

    const indexStart = delimiterIndexStart + delimiterStart.length;
    const indexEnd = delimiterIndexEnd;

    const data = s.substring(indexStart, indexEnd);

    return data;
}

/**
 * Get content from string from start of first delimiter to end of end delimiter.
 * @param {string} s - string to search in
 * @param {string} delimiterStart
 * @param {string} delimiterEnd
 * @returns {string|undefined}
 */
function contentWithDelimiters(s, delimiterStart, delimiterEnd) {
    const delimiterIndexStart = s.indexOf(delimiterStart);

    if (delimiterIndexStart === -1) {
        return undefined;
    }

    const delimiterIndexEnd = s.indexOf(delimiterEnd, delimiterIndexStart + delimiterStart.length);

    if (delimiterIndexEnd === -1) {
        return undefined;
    }

    const indexStart = delimiterIndexStart;
    const indexEnd = delimiterIndexEnd + delimiterEnd.length;

    const data = s.substring(indexStart, indexEnd);

    return data;
}

/**
 * standardize newlines to proper unix line endings
 * @param {string} s - string to standardize
 * @return {string}
 */
function standardizeNewlines(s) {
    return s.replace(/\r/gm, "");
}

/**
 * Get the data between the first complete <script> </script> tags.
 * @param {string} data
 * @returns {string | undefined}
 */
function getScriptData(data) {
    // read script node from html
    // only handles first script tag, does not handle script tags in strings.

    // Node does not have a built in XML parsing library.
    const delimiterScriptOpen = "<script>";
    const delimiterScriptClose = "</script>";

    const scriptData = contentBetweenDelimiters(data, delimiterScriptOpen, delimiterScriptClose);

    if (scriptData === undefined) {
        return undefined;
    }

    // browser swaps \cr\lf to lf for hash calculation
    const s = standardizeNewlines(scriptData);
    return s;
}

/**
 * SHA 256 hash of data
 * @param {string} data
 * @returns {string} hash of the data
 */
function getHash(data) {
    const { createHash } = require("crypto");

    const hash = createHash("sha256");

    hash.update(data);

    const digest = hash.digest("base64");

    return `sha256-${digest}`;
}

/**
 * @param {string} data
 * @returns {string}
 */
function getMetaContentSecurityPolicyTag(data) {
    const delimiterCspStart = `<meta
            http-equiv="Content-Security-Policy"
            content=`;
    const delimiterCspEnd = `>`;
    const csp = contentWithDelimiters(data, delimiterCspStart, delimiterCspEnd);
    return csp;
}

/**
 *
 * @param {string} data
 * @returns {string}
 */
function visible(data) {
    return `----\n${data.replace(/ /g, ".")}\n----`;
}

/**
 *
 * @param {string} data
 * @param {string} cspHashPlaceholder
 * (string) => void
 * @returns
 */
function updateHash(data, cspHashPlaceholder, {log}) {
    const scriptData = getScriptData(data);

    if (scriptData === undefined) {
        throw new Error("Could not retrieve script data.");
    }

    // test file contents for openssl calculation
    //const filePathJsOut = "checklist.js";
    //fs.writeFileSync(filePathJsOut,scriptData);

    // text
    // first 80
    //console.log(visible(scriptData.substring(0,80)));
    //last 80
    //console.log(visible(scriptData.substring(scriptData.length -80)));

    // needs to be lf not cr/lf

    let scriptHash = getHash(scriptData);

    log(`Calculated Hash:
${scriptHash}
`);

    // embed hash in the document (don't actually modify the original document that's dangerous!) Instead create a new document with the hash embedded

    const csp = getMetaContentSecurityPolicyTag(data);
    if (csp === undefined) {
        throw new Error("ERROR: can not find meta content security policy tag");
    }

    // retrieve placeholder

    let placeholder;

    if (cspHashPlaceholder === undefined) {
        const delimiterBefore = "script-src '";
        const delimiterAfter = "'";
        placeholder = contentBetweenDelimiters(csp, delimiterBefore, delimiterAfter);
        if (placeholder === undefined || placeholder.length < 0) {
            throw new Error(`unable to automatically discover placeholder`);
        }
        placeholder = `${delimiterBefore}${placeholder}${delimiterAfter}`;
        scriptHash = `${delimiterBefore}${scriptHash}${delimiterAfter}`;
    } else {
        const cspHashPlaceholderPresent = csp.includes(cspHashPlaceholder);
        if (!cspHashPlaceholderPresent) {
            throw new Error(`no instance of csp placeholder [${cspHashPlaceholder}] for csp [${csp}]`);
        }
        placeholder = cspHashPlaceholder;
    }

    if (!csp.includes(placeholder)) {
        throw new Error("Placeholder not present in csp");
    }

    const cspUpdated = csp.replaceAll(placeholder, scriptHash);

    log(`Content Security Policy Meta Tag

original:
${csp}

updated:
${cspUpdated}
`);

    const dataUpdated = data.replace(csp, cspUpdated);

    return dataUpdated;
}

/**
 * @param {string[]} args
 * @returns {number} errorlevel
 */
function main(args) {
    // hash a specific file
    // really want a config file that is passed in with the hashed to replace.
    if (args.length === 1) {
        const fs = require("fs");
        const data = fs.readFileSync(args[0], { encoding: "utf-8" });
        const hash = getHash(data);
        console.log(`Calculated Hash:
    ${hash}
    `);
        return 1;
    }

    if (![2, 3, 4].includes(args.length)) {
        console.log(args);
        console.log("usage: [--quiet] [file in] [file out] [(optional)csp placeholder]");
        return 1;
    }

    let quiet = args[0] === "--quiet";
    if (quiet) {
        args = args.slice(1);
    }

    const log = (message) => {
        if (quiet) {
            return;
        }
        console.log(message);
    };

    const [filePathIn, filePathOut, cspHashPlaceholder] = args;
    log(`
in: ${filePathIn}
out: ${filePathOut}
place: ${cspHashPlaceholder}
`);

    // read file data
    const fs = require("fs");
    const data = fs.readFileSync(filePathIn, { encoding: "utf-8" });

    const dataUpdated = updateHash(data, cspHashPlaceholder, {log});
    //console.log(dataUpdated);

    fs.writeFileSync(filePathOut, dataUpdated, { encoding: "utf-8" });
    log(`wrote update to:
${filePathOut}`);

    return 0;
}

const process = require("process");
const args = process.argv.slice(2);
process.exit(main(args));
