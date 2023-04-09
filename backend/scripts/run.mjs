import path from "path";
import {installDir, shellCmd, stableFusionDir, venvPath, __dirname} from "./utils.mjs";
import {spawn} from "child_process";

process.env["install_dir"] = installDir;
process.env["clone_dir"] = "stableDiffusionWebUI";
process.env["venv_dir"] = venvPath;
process.env["LAUNCH_SCRIPT"] = path.join(stableFusionDir, "launch.py");
// 检测 cuda 是否可用
const rawInfo = await shellCmd(`source ${path.join(venvPath, "bin", "activate")} && python3 ${path.join(__dirname, "detect_GPU.py")}`);
const gpuInfo = JSON.parse(rawInfo);
const args = ["--no-half-vae", "--xformers", "--precision full", "--no-half"];

if (!gpuInfo["isCUDAAvailable"]) {
    args.push("--skip-torch-cuda-test");
}

if (gpuInfo["isMPSAvailable"]) { // MPS: Metal Performance Shaders
    process.env["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"; // 添加 fallback
    process.env["PYTORCH_MPS_HIGH_WATERMARK_RATIO"] = "0.0"; // MPS 内存分配取消限制
}

process.env["COMMANDLINE_ARGS"] = args.join(" ");

if (process.platform === "win32") {
    const bat = spawn("cmd.exe", [path.join(stableFusionDir, "webui.bat")]);

    bat.stdout.on('data', (data) => {
        console.log(data.toString());
    });

    bat.stderr.on('data', (data) => {
        console.error(data.toString());
    });

    bat.on('exit', (code) => {
        console.log(`Child exited with code ${code}`);
    });
} else {
    spawn("sh", [path.join(stableFusionDir, "webui.sh")], {
        shell: true,
        stdio: "inherit"
    });
}



