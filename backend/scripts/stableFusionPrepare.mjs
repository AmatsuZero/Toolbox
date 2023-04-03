//  参考：https://www.cnblogs.com/cheflone/p/17157938.html

import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const shellCmd = (cmd) => {
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

// 检查是否已经克隆项目
const stableFusionDir = path.join(__dirname, "..", "stableDifusionWebUI");
if (!fs.existsSync(stableFusionDir)) {
    await shellCmd("git submodule update --init");
}

// 建立 sd-vae-ft-mse-original 软连接
