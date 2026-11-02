import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const mode = process.argv[2];
if (!["dev", "start"].includes(mode)) throw new Error("Use dev ou start.");
const packageName = mode === "dev" ? "@react-router/dev" : "@react-router/serve";
const cli = resolve(dirname(require.resolve(`${packageName}/package.json`)), "bin.cjs");
const args = mode === "dev" ? ["dev", ...process.argv.slice(3)] : ["./build/server/index.js"];
const children = [];
let stopping = false;

function stop(code = 0) {
    if (stopping) return;
    stopping = true;
    process.exitCode = code;
    for (const child of children) child.kill();
}

function launch(args) {
    const child = spawn(process.execPath, args, { stdio: "inherit", windowsHide: true });
    children.push(child);
    child.once("error", (error) => { console.error(error.message); stop(1); });
    child.once("exit", (code) => stop(code ?? 0));
}

process.once("SIGINT", () => stop());
process.once("SIGTERM", () => stop());
if (process.env.HOSPITAIS_INDEX_WORKER !== "0") launch(["scripts/update-hospitais-index.js", "--watch"]);
launch([cli, ...args]);
