import path from "path";
import {installDir, stableFusionDir, venvPath } from "./utils.mjs";
import {spawn} from "child_process";

process.env["install_dir"] = installDir;
process.env["clone_dir"] = "stableDiffusionWebUI";
process.env["venv_dir"] = venvPath;
process.env["LAUNCH_SCRIPT"] = path.join(stableFusionDir, "launch.py");
process.env["COMMANDLINE_ARGS"] = "--skip-torch-cuda-test --precision full --no-half"; // 跳过 cuda

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
    spawn("sh", [
        path.join(stableFusionDir, "webui.sh"),
        "--no-half-vae",
        "--xformers"
    ], {
        shell: true,
        stdio: "inherit"
    });
}



