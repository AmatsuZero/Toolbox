/*参考：
    https://www.cnblogs.com/cheflone/p/17157938.html
    https://github.com/civitai/civitai/wiki/How-to-use-models
*/

import path from "path";
import fs from "fs";
import {shellCmd, walk, __dirname, stableFusionDir} from "./utils.mjs";

// 检查是否已经克隆项目
if (!fs.existsSync(stableFusionDir)) {
    console.info("Start to pull sub modules");
    const info = await shellCmd("git submodule update --init");
    console.info("clone submodule completed", info);
}

const ignoreFiles = new Set([".md", ".gitattributes", ".git"]);

// 软链 sd-vae-ft-mse-original 到 models/Vae 目录下
let target = path.join(stableFusionDir, "models", "Vae");
const vaeSrc = path.join(__dirname, "..", "trainingModels", "sd-vae-ft-mse-original");
if (fs.existsSync(target)) {
    for await (const p of walk(vaeSrc)) {
        const name = path.basename(p)
        const ext = path.extname(name);
        if (ignoreFiles.has(ext) || ignoreFiles.has(name)) {
            continue;
        }
        const link = path.join(target, name);
        if (fs.existsSync(link)) {
            console.info(`Soft link has been created: ${p}`);
            continue;
        }
        fs.symlinkSync(p, link);
    }
}