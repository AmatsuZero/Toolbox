import path from "path";
import fs from "fs";
import {__dirname} from "../global";
import {spawn} from "child_process";
import * as process from "process";

// venv 路径
let _venvPath = path.join(__dirname, "..");

if (!fs.existsSync(_venvPath)) {
    _venvPath = path.join(_venvPath, "..");
}

if (process.env["BACKEND_ENV"] === "llama") {
    _venvPath = path.join(_venvPath, "venv_llama");
} else {
    _venvPath = path.join(_venvPath, "venv");
}

export const shell = (cmd: string, ...args: any[]) => {
    return new Promise<Buffer>((resolve,reject) => {
        const prog = spawn(cmd, args, {
            cwd: path.join(_venvPath, "..")
        });
        prog.stderr.pipe(process.stdout);
        prog.on('error', (err) => {
            reject(err);
        });

        const chunks = new Array<Buffer>();
        prog.stdout.on('data', (chunk: Buffer) => {
            chunks.push(Buffer.from(chunk));
        });

        prog.on('close', (code, signal) => {
            resolve(Buffer.concat(chunks));
        });
    });
}

export const createProgram = (...args: any[]) => {
    if (process.env["VIRTUAL_ENV"] === undefined) {
        process.env["VIRTUAL_ENV"] = _venvPath;
        process.env["PATH"] = `${_venvPath}/bin:$PATH`
    }
    return shell("python", ...args);
}

export const cli = async (command: string, ...args: any[]) => {
    return createProgram("-m", "aliyunpan", command, ...args);
}
