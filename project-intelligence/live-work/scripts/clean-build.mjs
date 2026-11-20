// THE CLEAN-CHECKOUT BUILD, REUSABLE (20 November 2026; Carl: "yes" to keeping one clean folder). Why a clean build at all:
// a local build cannot see that an import points at an UNTRACKED file (Vercel failed 3–8 October on a gitignored PNG; the
// memory `reference_clean_checkout_build`). This builds the STAGED tree only — `git add` first — in a folder OUTSIDE the
// repo whose packages are installed ONCE (`npm ci`, again only when package-lock.json changes). Each run: everything in the
// folder except `node_modules` and `.next/cache` is removed, the staged tree is written in (`git archive` of `git
// write-tree`), then `next build`. ⚠ 20 November: copying node_modules with Git Bash's `cp` took >10 min; `npm ci` ~2 min.
// Usage (repo root): node project-intelligence/live-work/scripts/clean-build.mjs   → exit 0 = the staged tree builds.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { homedir, tmpdir } from "node:os";

const CLEAN = join(homedir(), ".c2b-clean-build");
// the guard: this script only ever deletes inside a folder of exactly this name
if (!CLEAN.endsWith(".c2b-clean-build")) throw new Error(`refusing: ${CLEAN}`);
const t0 = Date.now();
const run = (cmd, args, cwd) => execFileSync(cmd, args, { cwd, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
// npm run through node itself (no shell): its CLI sits beside node
const npmCli = join(dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js");
mkdirSync(CLEAN, { recursive: true });

// 1. clear the folder, keeping the installed packages and the build cache
for (const e of readdirSync(CLEAN)) {
  if (e === "node_modules" || e === ".lock-hash") continue;
  if (e === ".next") {
    for (const n of readdirSync(join(CLEAN, ".next"))) if (n !== "cache") rmSync(join(CLEAN, ".next", n), { recursive: true, force: true });
    continue;
  }
  rmSync(join(CLEAN, e), { recursive: true, force: true });
}

// 2. the STAGED tree, written in
const tree = run("git", ["write-tree"]).trim();
const tar = join(tmpdir(), `c2b-clean-${tree.slice(0, 8)}.tar`);
run("git", ["archive", "--format=tar", "-o", tar, tree]);
// Windows' own tar (Git Bash's GNU tar reads "C:" as a remote host)
run(process.platform === "win32" ? join(process.env.SystemRoot ?? "C:\\Windows", "System32", "tar.exe") : "tar", ["-xf", tar, "-C", CLEAN]);
rmSync(tar, { force: true });
console.log(`staged tree ${tree.slice(0, 8)} written (${((Date.now() - t0) / 1000).toFixed(1)} s)`);

// 3. packages: installed once, again only when the lock file changes
const lockHash = createHash("sha256").update(readFileSync(join(CLEAN, "package-lock.json"))).digest("hex");
const hashFile = join(CLEAN, ".lock-hash");
const had = existsSync(hashFile) ? readFileSync(hashFile, "utf8") : "";
if (!existsSync(join(CLEAN, "node_modules")) || had !== lockHash) {
  const ti = Date.now();
  console.log("installing packages (npm ci) ...");
  run(process.execPath, [npmCli, "ci", "--no-audit", "--no-fund"], CLEAN);
  writeFileSync(hashFile, lockHash);
  console.log(`installed (${((Date.now() - ti) / 1000).toFixed(0)} s)`);
} else console.log("packages unchanged: reused");

// 4. the build
const tb = Date.now();
try {
  const out = run(process.execPath, [join(CLEAN, "node_modules", "next", "dist", "bin", "next"), "build"], CLEAN);
  console.log(out.split("\n").filter((l) => /Compiled|Route|error|Error|warn/i.test(l)).slice(0, 8).join("\n"));
  console.log(`✅ CLEAN BUILD PASSED — staged tree ${tree.slice(0, 8)} (build ${((Date.now() - tb) / 1000).toFixed(0)} s, total ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
} catch (e) {
  console.log(String(e.stdout ?? "").slice(-3000), String(e.stderr ?? "").slice(-3000));
  console.log(`⛔ CLEAN BUILD FAILED — staged tree ${tree.slice(0, 8)}`);
  process.exit(1);
}
