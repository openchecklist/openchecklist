const fs = require("fs");
const path = require("path");

const [script, ...parameters] = process.argv.slice(1);

if (parameters.length !== 0) {
    console.log("No parameters");
    process.exit(1);
}

// scripts directory
const scripts = path.dirname(script);

/**
 * root directory of repository
 */
const root = path.join(scripts, "..");

const dist = path.join(root, "dist");
const src = path.join(root, "src");

// ensure dist
if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist);
}

// build checklist

// copy over checklist.
const name = "index.html";

const from = path.normalize(path.join(src, name));
const to = path.normalize(path.join(dist, name));

console.log(from);
console.log(to);

fs.copyFileSync(from, to);
