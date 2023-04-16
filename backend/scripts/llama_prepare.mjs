import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import {__dirname, installDir, shellCmd, venvPath} from "./utils.mjs";

dotenv.config({ // 加载配置
    path: path.join(installDir, ".env.backend")
});

const getPythonDir = async (program) => {
    const ver = await shellCmd(`${program} --version`);
    const parts = ver.split(" ")[1].split(".");
    return `python${parts[0]}.${parts[1]}`;
}

const shell = (cmd, args) => new Promise((resolve, reject) => {
    const ch = spawn(cmd, args, {
        shell: true,
        stdio: "inherit",
        cwd: path.join(venvPath, ".."),
        checkCWD: true
    });

    ch.on('error', (err) => {
        reject(err);
    });

    ch.on('close', (code) => {
        resolve(code);
    });
});

try {
    // 检查环境是否已经创建
    if (!fs.existsSync(path.join(venvPath))) {
        const dir = path.basename(venvPath);
        await shellCmd(`cd .. && python3 -m venv ${dir}`);
    }
    const prePath = await shellCmd("echo $PATH");

    if (process.env["VIRTUAL_ENV"] === undefined) { // 模拟 source path/to/activate
        process.env["VIRTUAL_ENV"] = venvPath;
        process.env["PATH"] = `${venvPath}/bin:${prePath}`
    }

    console.info('开始安装依赖库...');
    await shell("sh", [
        path.join(__dirname, "prepare_llama.sh"),
        path.join(installDir, "..", "requirements.txt")
    ]);

    console.info("依赖安装完成，下载 LLaMA 模型...");

    const downloadDst = path.join(installDir, "LLaMa_Input", "LLaMa");
    if (fs.existsSync(downloadDst)) {
        console.info("LLaMa 模型已经下载完毕");
    } else {
        const folderId = process.env["LLAMA_FOLDER_ID"];
        if (folderId === undefined || folderId === 'to replace') {
            throw new Error("未能找到文件夹 id");
        }
        await shell("python", [
            "-m", "aliyunpan", "retrieve-dir",
            "--id", folderId,
            "--dst", downloadDst
        ]);
    }

    const pythonProgram = path.join(venvPath, "bin", "python");
    const pythonVersion = await getPythonDir(pythonProgram);
    console.info('LLaMA 模型下载完成，准备将原版 LLaMA 模型转换为 HF 格式...');

    await shell(pythonProgram, [
        path.join(venvPath, "lib", pythonVersion, "site-packages", "transformers",
        "models", "llama", "convert_llama_weights_to_hf.py"),
        "--input_dir", downloadDst,
        "--model_size", "7B",
        "--output_dir", path.join(__dirname, "LLaMa_Output"),
    ]);
} catch (e) {
    console.error(e);
}