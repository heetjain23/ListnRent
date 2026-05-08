import { readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

try {
  const require = createRequire(import.meta.url);
  const rollupPackageJson = require.resolve("rollup/package.json");
  const rollupDir = path.dirname(rollupPackageJson);
  const nativeLoaderPath = path.join(rollupDir, "dist", "native.js");

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
} catch (error) {
  console.log("[postinstall] Rollup not found or patch failed - will try on next install:", error.message);
}
