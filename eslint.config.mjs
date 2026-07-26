import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Claude Code harness hooks. These are CommonJS scripts executed directly by
    // `node` (the hook runner requires it), not application code, so the Next.js
    // + TypeScript rules here do not apply to them — `require()` is correct in a
    // hook and forbidden by @typescript-eslint/no-require-imports. Excluded rather
    // than rewritten as ESM: the scope guard is an attack-tested governance
    // control, and a lint rule that does not govern it is not a reason to touch it.
    // Added 26 July 2026 after this file broke the recorded one-error lint baseline.
    ".claude/hooks/**",
  ]),
]);

export default eslintConfig;
