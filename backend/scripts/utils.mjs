import {exec} from "child_process";
import fs from "fs";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const stableFusionDir = path.join(__dirname, "..", "stableDiffusionWebUI");

export const installDir = path.join(__dirname, "..");
// venv 路径
let _venvPath = path.join(installDir, "..", "venv");
if (!fs.existsSync(_venvPath)) {
    _venvPath = path.join(installDir, "venv");
}

export const venvPath = _venvPath;

export const shellCmd = (cmd) => {
    return new Promise((resolve, reject) => {
        exec(cmd, function (error, stdout, stderr) {
            if (error !== null) {
                reject(error);
            } else if (typeof(stderr) !== "string") {
                reject(new Error(stderr));
            } else {
                resolve(stdout);
            }
        });
    });
}

export async function* walk(dir) {
    for await (const d of await fs.promises.opendir(dir)) {
        const entry = path.join(dir, d.name);
        if (d.isDirectory()) yield* walk(entry);
        else if (d.isFile()) yield entry;
    }
}