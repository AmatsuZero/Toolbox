import { spawn } from "child_process";
import * as stream from 'stream';
import { promisify } from 'util';
import { createWriteStream } from 'fs';
import { join } from "path";
import { tmpdir } from "os";
import Axios from "axios";
import akaneko from "akaneko";

const finished = promisify(stream.finished);

const getDisguisePicture = async (output: string) => {
    const url = await akaneko.wallpapers();
    await downloadFile(url, output);
}

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const generateID = (length: number) => {
    let result = '';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

const downloadFile = async (fileUrl: string, outputLocationPath: string) => {
    const writer = createWriteStream(outputLocationPath);
    return Axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream',
    }).then(response => {
        response.data.pipe(writer);
        return finished(writer); //this is a Promise
    });
}

export const Disguise = async (src: string, picture: string | null = null, output: string = "output.png") => {
    // 临时文件路径
    let pic = picture || "";
    if (pic.length === 0) {
        pic = join(tmpdir(), generateID(5));
        await getDisguisePicture(pic);
    }

    const concat = spawn("cat", [src, pic, ">", output]); // 合并文件到伪装文件

    concat.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
    });

    concat.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
    });

    concat.on('error', (error) => {
        console.log(`error: ${error.message}`);
    });

    concat.on("close", code => {
        console.log(`child process exited with code ${code}`);
    });
}