import path from "path";
import fs from "fs";
import {__dirname, stableFusionDir} from "./utils.mjs";
import {spawn} from "child_process";

const installDir = path.join(__dirname, "..");
process.env["install_dir"] = installDir;
process.env["clone_dir"] = "stableDiffusionWebUI";

// venv 路径
let ventPath = path.join(installDir, "..", "venv");
if (!fs.existsSync(ventPath)) {
    ventPath = path.join(installDir, "venv");
}

process.env["venv_dir"] = ventPath;
process.env["LAUNCH_SCRIPT"] = path.join(stableFusionDir, "launch.py");
process.env["python3"] = path.join(ventPath, "bin", "python3");
process.env["COMMANDLINE_ARGS"] = "--skip-torch-cuda-test --precision full --no-half"; // 跳过 cuda

spawn("sh", [path.join(stableFusionDir, "webui.sh")], {
    shell: true,
    stdio: "inherit"
});


