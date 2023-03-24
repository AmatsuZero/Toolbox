import path from "path";
import {__dirname} from "../global";
import {spawn} from "child_process";

const pythonPath = path.join(__dirname, "..", "venv", "bin", "python3");

export const createProgram = (progPath: string, ...args: any[]) => {
    return new Promise<Buffer>((resolve,reject) => {
        const pyProg = spawn(pythonPath, [progPath, ...args]);
        pyProg.stderr.pipe(process.stdout);
        pyProg.on('error', (err) => {
           reject(err);
        });

        const chunks = new Array<Buffer>();
        pyProg.stdout.on('data', (chunk: Buffer) => {
            chunks.push(Buffer.from(chunk));
        });

        pyProg.on('close', (code, signal) => {
            resolve(Buffer.concat(chunks));
        });
    });
}