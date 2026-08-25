#!/usr/bin/env node
/*
 * build.js — bundles the split source into one self-contained file.
 *
 * The repo is organised for humans: separate CSS, separate data,
 * one file per view. The Artifact host wants a single file with no
 * external references, so this script inlines everything.
 *
 *   node build.js          ->  dist/index.html   (standalone page)
 *   node build.js --artifact  ->  dist/artifact.html
 *
 * The --artifact variant additionally strips <!doctype>, <html>,
 * <head> and <body>, because the Artifact host supplies its own
 * page skeleton and would otherwise nest one document inside another.
 */

const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT_DIR = path.join(ROOT, "dist");
const artifactMode = process.argv.includes("--artifact");

const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");

/* Order matters: data defines AP.*, state depends on nothing,
   views depend on data + state, app.js depends on views. */
const SCRIPTS = [
  "js/data/courses.js",
  "js/data/questions.js",
  "js/data/cards.js",
  "js/data/frq.js",
  "js/data/videos.js",
  "js/state.js",
  "js/views/today.js",
  "js/views/practice.js",
  "js/views/cards.js",
  "js/views/write.js",
  "js/views/tracker.js",
  "js/views/watch.js",
  "js/app.js"
];

let html = read("index.html");

/* 1. inline the stylesheet */
html = html.replace(
  '<link rel="stylesheet" href="css/styles.css">',
  "<style>\n" + read("css/styles.css") + "\n</style>"
);

/* 2. replace the script tags with one concatenated block */
const bundle = SCRIPTS
  .map((f) => "/* ===== " + f + " ===== */\n" + read(f))
  .join("\n\n");

const firstTag = '<script src="' + SCRIPTS[0] + '"></script>';
const lastTag = '<script src="' + SCRIPTS[SCRIPTS.length - 1] + '"></script>';
const start = html.indexOf(firstTag);
const end = html.indexOf(lastTag) + lastTag.length;

if (start === -1 || end < start) {
  console.error("Could not find the script block in index.html — did the filenames change?");
  process.exit(1);
}

html = html.slice(0, start) + "<script>\n" + bundle + "\n</script>" + html.slice(end);

/* pwa.js and the manifest only make sense on a real deployment with a
   service worker alongside. The bundled single file has neither, so
   strip those references rather than shipping broken links. */
html = html
  .replace(/\s*<script src="js\/pwa\.js"><\/script>/, "")
  .replace(/\s*<link rel="manifest"[^>]*>/, "")
  .replace(/\s*<link rel="icon"[^>]*>/, "")
  .replace(/\s*<link rel="apple-touch-icon"[^>]*>/, "")
  .replace(/\s*<!-- PWA -->/, "")
  .replace(/\s*<button class="btn ghost sm" id="install"[^>]*>[^<]*<\/button>/, "");

/* 3. for the artifact build, drop the document skeleton */
let outName = "index.html";
if (artifactMode) {
  outName = "artifact.html";
  html = html
    .replace(/<!doctype html>\s*/i, "")
    .replace(/<html[^>]*>\s*/i, "")
    .replace(/<\/html>\s*$/i, "")
    .replace(/<head>\s*/i, "")
    .replace(/<\/head>\s*/i, "")
    .replace(/<body>\s*/i, "")
    .replace(/<\/body>\s*/i, "")
    .replace(/<meta[^>]*>\s*/gi, "")
    .trim();
}

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.writeFileSync(path.join(OUT_DIR, outName), html);

const kb = (Buffer.byteLength(html, "utf8") / 1024).toFixed(1);
console.log("built dist/" + outName + "  (" + kb + " KB, " + SCRIPTS.length + " scripts inlined)");
