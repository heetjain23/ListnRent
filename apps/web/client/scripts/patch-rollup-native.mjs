import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const lightningPackageJson = require.resolve("lightningcss/package.json");
const lightningDir = path.dirname(lightningPackageJson);
const lightningLoaderPath = path.join(lightningDir, "node", "index.js");
const rollupPackageJson = require.resolve("rollup/package.json");
const rollupDir = path.dirname(rollupPackageJson);
const nativeLoaderPath = path.join(rollupDir, "dist", "native.js");

const lightningSource = await readFile(lightningLoaderPath, "utf8");
const patchedLightningSource = lightningSource.replace(
  /let native;\s*try \{\s*native = require\(`lightningcss-\$\{parts\.join\('-'\)\}`\);\s*\} catch \(err\) \{\s*native = require\(`\.\.\/lightningcss\.\$\{parts\.join\('-'\)\}\.node`\);\s*\}/,
  'let native;\ntry {\n  native = require(`lightningcss-${parts.join("-")}`);\n} catch (err) {\n  try {\n    native = require(`../lightningcss.${parts.join("-")}.node`);\n  } catch (nativeError) {\n    native = require("lightningcss-wasm");\n  }\n}'
);

if (patchedLightningSource !== lightningSource) {
  await writeFile(lightningLoaderPath, patchedLightningSource);
  console.log("[postinstall] Patched Lightning CSS to use lightningcss-wasm fallback.");
} else {
  console.log("[postinstall] Lightning CSS loader already patched or pattern not found.");
}

const originalSource = await readFile(nativeLoaderPath, "utf8");
const patchedSource = originalSource.replace(
  /const \{ parse, parseAsync, xxhashBase64Url, xxhashBase36, xxhashBase16 \} = [\s\S]*?;/,
  'const { parse, parseAsync, xxhashBase64Url, xxhashBase36, xxhashBase16 } = require("@rollup/wasm-node/dist/native.js");'
);

if (patchedSource === originalSource) {
  console.log("[postinstall] Rollup native loader already patched or pattern not found.");
} else {
  await writeFile(nativeLoaderPath, patchedSource);
  console.log("[postinstall] Patched Rollup to use @rollup/wasm-node.");
}