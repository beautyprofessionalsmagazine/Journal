// Lets `node --test` run the TypeScript sources directly: maps the "@/" path
// alias to the project root and resolves extensionless imports to .ts files.
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import ts from "typescript";
import { register } from "node:module";
import { fileURLToPath, pathToFileURL } from "node:url";

if (!process.env.__JOURNAL_TEST_HOOKS) {
  process.env.__JOURNAL_TEST_HOOKS = "1";
  register(import.meta.url);
}

const root = new URL("../", import.meta.url);

// Exercise actual React components without adding a separate test toolchain.
export async function load(url, context, nextLoad) {
  if (url.endsWith(".tsx")) {
    const source = await readFile(new URL(url), "utf8");
    return {
      format: "module",
      shortCircuit: true,
      source: ts.transpileModule(source, {
        compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext },
      }).outputText,
    };
  }
  return nextLoad(url, context);
}

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
