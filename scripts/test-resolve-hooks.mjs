// Lets `node --test` run the TypeScript sources directly: maps the "@/" path
// alias to the project root and resolves extensionless imports to .ts files.
import { existsSync } from "node:fs";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

if (!process.env.__JOURNAL_TEST_HOOKS) {
  process.env.__JOURNAL_TEST_HOOKS = "1";
  register(import.meta.url);
}

const root = new URL("../", import.meta.url);

export async function resolve(specifier, context, nextResolve) {
  const aliased = specifier.startsWith("@/")
    ? new URL(specifier.slice(2), root).href
    : specifier;

  if (aliased.startsWith("file:") || aliased.startsWith(".")) {
    const url = new URL(aliased, context.parentURL);
    for (const candidate of [url, new URL(`${url.href}.ts`), new URL(`${url.href}.tsx`)]) {
      const path = fileURLToPath(candidate);
      if (existsSync(path) && !path.endsWith("/")) {
        return nextResolve(pathToFileURL(path).href, context);
      }
    }
  }

  return nextResolve(aliased, context);
}
