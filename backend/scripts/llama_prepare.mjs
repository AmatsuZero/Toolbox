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
    const pyVer = `python${parts[0]}.${parts[1]}`;
    if (process.platform === 'win32')
        return 'Lib';
    else
        return path.join('lib', `python${parts[0]}.${parts[1]}`);
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

    let prePath = '';
    if (process.platform === 'win32') {
        prePath = await shellCmd("echo %PATH%");
        prePath = prePath.trimEnd()
    } else {
        prePath = await shellCmd("echo $PATH");
    }

    if (process.env["VIRTUAL_ENV"] === undefined) { // 模拟 source path/to/activate
        process.env["VIRTUAL_ENV"] = venvPath;
        if (process.platform === 'win32')
            process.env["PATH"] = `${prePath};${path.join(venvPath, "Scripts")}`
        else
            process.env["PATH"] = `${venvPath}/bin:${prePath}`
    }

    console.info('开始安装依赖库...');
    if (process.platform === "win32") {
        await shell(path.join(__dirname, "prepare_llama.bat"), [
            path.join(venvPath, "Scripts", "activate.bat"),
            path.join(installDir, "..", "requirements.txt")
        ]);
    } else {
        await shell("sh", [
            path.join(__dirname, "prepare_llama.sh"),
            path.join(installDir, "..", "requirements.txt")
        ]);
    }

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

    let pythonProgram = '';
    if (process.platform === 'win32')
        pythonProgram = path.join(venvPath, "Scripts", "python.exe");
    else
        pythonProgram = path.join(venvPath, "bin", "python");

    const libPath = await getPythonDir(pythonProgram);
    console.info('LLaMA 模型下载完成，准备将原版 LLaMA 模型转换为 HF 格式...');

    const hfOutput = path.join(installDir, "LLaMa_Output", "hf");
    await shell(pythonProgram, [
        path.join(venvPath, libPath, "site-packages", "transformers",
        "models", "llama", "convert_llama_weights_to_hf.py"),
        "--input_dir", downloadDst,
        "--model_size", "7B",
        "--output_dir", hfOutput,
    ]);

    console.info("LLaMA 模型转换为 HF 格式完毕, 合并LoRA权重，开始生成全量模型权重");
    console.info("开始生成 alpaca-lora-7b 全量模型");
    const modelsDir = path.join(installDir, "chineseModels");
    const mergeScriptPath = path.join(installDir, "Chinese-LLaMA-Alpaca", "scripts", "merge_llama_with_chinese_lora.py");
    await shell(pythonProgram, [
        mergeScriptPath,
        "--base_model", hfOutput,
        "--lora_model", path.join(modelsDir, "chinese-alpaca-lora-7b"),
        "--output_dir", path.join(installDir, "LLaMa_Output", "full", "alpaca-lora-7b")
    ]);

    console.info("生成 alpaca-lora-7b 全量模型完毕，开始生成  alpaca-lora-13b 模型");
    await shell(pythonProgram, [
        mergeScriptPath,
        "--base_model", hfOutput,
        "--lora_model", path.join(modelsDir, "chinese-alpaca-lora-13b"),
        "--output_dir", path.join(installDir, "LLaMa_Output", "full", "alpaca-lora-13b")
    ]);

    console.info("生成 alpaca-lora-13b 全量模型完毕，开始生成  llama-lora-7b 模型");
    await shell(pythonProgram, [
        mergeScriptPath,
        "--base_model", hfOutput,
        "--lora_model", path.join(modelsDir, "chinese-llama-lora-7b"),
        "--output_dir", path.join(installDir, "LLaMa_Output", "full", "llama-lora-7b")
    ]);

    console.info("生成 llama-lora-7b 全量模型完毕，开始生成  llama-lora-13b 模型");
    await shell(pythonProgram, [
        mergeScriptPath,
        "--base_model", hfOutput,
        "--lora_model", path.join(modelsDir, "chinese-llama-lora-13b"),
        "--output_dir", path.join(installDir, "LLaMa_Output", "full", "llama-lora-13b")
    ]);
    console.info("生成 llama-lora-13b 全量模型完毕");
} catch (e) {
    console.error(e);
}