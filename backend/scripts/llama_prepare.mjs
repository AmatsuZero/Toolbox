import { spawn } from "child_process";
import path from "path";
import { __dirname, shellCmd, venvPath } from "./utils.mjs";

const getPythonDir = async (program) => {
    const ver = await shellCmd(`${program} --version`);
    const parts = ver.split(" ")[1].split(".");
    return `python${parts[0]}.${parts[1]}`;
}

const shell = (cmd, args) => new Promise((resolve, reject) => {
    const ch = spawn(cmd, args, {
        shell: true,
        stdio: "inherit",
    });

    ch.on('error', (err) => {
        reject(err);
    });

    ch.on('close', (code) => {
        resolve(code);
    });
});

try {
    const activatePath = path.join(venvPath, "bin", "activate");
    console.info('开始安装依赖库...');
    await shell("sh", [
        path.join(__dirname, "prepare_llama.sh"),
        activatePath
    ]);

    console.info("依赖安装完成，下载 LLaMA 模型...");

    const pythonProgram = path.join(venvPath, "bin", "python");
    const pythonVersion = await getPythonDir(pythonProgram);
    console.info('下载完成，准备将原版 LLaMA 模型转换为 HF 格式...');

    await shell(pythonProgram, [
        path.join(venvPath, "lib", pythonVersion, "site-packages", "transformers", 
        "models", "llama", "convert_llama_weights_to_hf.py"), 
        "--input_dir", path.join(__dirname, "path_to_original_llama_root_dir"),
        "--model_size", "7B",
        "--output_dir", path.join(__dirname, "path_to_original_llama_hf_dir"),
    ]);
} catch (e) {
    console.error(e);
}