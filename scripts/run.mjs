#!/usr/bin/env node
// npm entry point: find Python 3.12+ and hand over to scripts/run.py, which does the real work.
import { spawn, spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const runner = join(dirname(fileURLToPath(import.meta.url)), "run.py");
const candidates = process.platform === "win32" ? [["py", "-3"], ["python"], ["python3"]] : [["python3"], ["python"]];

const python = candidates.find(([cmd, ...pre]) => {
  const r = spawnSync(cmd, [...pre, "-c", "import sys; sys.exit(sys.version_info < (3, 12))"], { stdio: "ignore" });
  return r.status === 0;
});

if (!python) {
  console.error("FileSaviour needs Python 3.12+ on your PATH (3.13 recommended). Get it from https://python.org");
  process.exit(1);
}

const [cmd, ...pre] = python;
const child = spawn(cmd, [...pre, runner, ...process.argv.slice(2)], { stdio: "inherit" });
// Ctrl+C reaches the Python process directly (same console); just mirror its exit.
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => {});
child.on("exit", (code, signal) => process.exit(signal ? 1 : (code ?? 0)));
