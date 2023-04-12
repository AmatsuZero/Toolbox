import * as path from "path";
import {homedir, tmpdir} from "os";
import * as fs from "fs";
import { promisify } from "util";
import {ifFileExists} from "../utils/utils";
import {NextFunction, Request, Response} from "express";
import {cli} from "./program";
import {QRLoginPage} from "../utils/qr";

const readFile = promisify(fs.readFile);
const usrData = path.join(homedir(), ".aligo", "aligo.json");

const readUser = async () => {
    const isExist = await ifFileExists(usrData);
    if (!isExist) {
        return null;
    }
    const rawData = await readFile(usrData);
    return JSON.parse(rawData.toString());
};

let currentUser: any;

export const checkIfNeedLogin = async (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/login'
        || req.path === 'ali/login') {
        next();
        return;
    }

    if (currentUser !== null) {
        currentUser = await readUser();
    }

    if (currentUser !== null) {
        next(currentUser);
        return;
    }

    res.redirect(`/ali/login?callback=${req.originalUrl}`);
};

const scriptFunc = (cb: string) => `
<script>

</script>
`

export const Login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const cb = req.query["callback"] as string || "";
        const tmpFile = '/Users/samzhjiang/Downloads/test.txt';
        const interval = setInterval(async () => {
            const isExist = await ifFileExists(tmpFile);
            if (!isExist) {
                return;
            }
            clearInterval(interval);
            const imgURL =  await readFile(tmpFile, 'utf8');
            const page = await QRLoginPage(imgURL, scriptFunc(cb), "使用阿里云盘手机客户端扫码登陆");
            await page(req, res, next);
        }, 500);
        const chunks = await cli("login", "-p", tmpFile);

    } catch (e) {
        next(e);
    }
}