import axios from 'axios';
import QRCode from 'qrcode';
import { NextFunction, Request, Response } from 'express';
import {BaseResponse, SaveCookie} from './base';

let pollTimer: NodeJS.Timer | null = null;
let pollInfo: PollStatusResponse | null = null;

interface GenerateQRcodeResponse extends BaseResponse {
    data: {
        url: string;
        qrcode_key: string;
    }
}

interface PollStatusResponse extends BaseResponse {
    data: {
        url: string;
        refresh_token: string;
        timestamp: string;
        code: number;
        message: string;
    }
}

const loginClient = axios.create({
    baseURL: 'https://passport.bilibili.com',
});

const stopPoll = () => {
    if (pollTimer !== null) {
        clearInterval(pollTimer);
        pollTimer = null;
    }
}

const getQRCode = () => loginClient
.get<GenerateQRcodeResponse>('/x/passport-login/web/qrcode/generate');

const getStatus = async (qrcode_key: string) => {
    const url = '/x/passport-login/web/qrcode/poll';
    const response = await loginClient.get<PollStatusResponse>(url, {
        params: { qrcode_key }
    });

    const code = response.data.data.code;
    pollInfo = response.data;
    switch (code) {
    case 86101:
    case 86090:
        break;
    case 0: {
        const cookies = response.headers["set-cookie"];
        if (cookies !== undefined) {
            await SaveCookie(cookies);
        }
        stopPoll();
        break;
    }
    default:
        stopPoll();
        break;
    }
}

const page = (img: string, cb: string) => `
<!DOCTYPE html>
<html lang="ch">
    <head>
        <meta charset="UTF-8">
        <title>扫码登陆</title>
        <style>
            .box {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                height: 100vh;
            }
        </style>
        <script>
            let nIntervalId;
            
            async function successHandler() {
                const dst = '${cb}';
                if (dst.length > 0) {
                    window.location = dst;   
                }
                await fetch('b/checkStatus?done=1');
                clearInterval(nIntervalId);
                document.getElementById("title").textContent = "登陆成功，即将关闭";
            }
            
            async function check() {// 检查是否可以关闭登陆页面
                const response = await fetch('/b/checkStatus');
                const data = await response.json();
                console.log(data);
                
                const code = data['code'];
                if (code === 0) {
                    await successHandler();
                } else if (code === 86038) {
                    document.getElementById("title").textContent = "已超时，请刷新";
                    clearInterval(nIntervalId);
                } 
            }
            
            window.onload = () => {
                nIntervalId = setInterval(check, 500);
            }
        </script>
    </head>
    <body>
        <div class="box">
            <h1 id="title">使用哔哩哔哩手机客户端扫码登陆</h1>
            <img src=${img} alt="qrcode">
        </div>
    </body>
</html>
`

export const Login = async (req: Request, res: Response, next: NextFunction) => {
    pollInfo = null;
    try {
        const response = await getQRCode(); // 获取二维码和 token
        if (response.status !== 200) {
            res.status(response.status).send(response.data);
            return
        }

        const { url, qrcode_key } = response.data.data;
        const cb = req.query["callback"] as string || "";

        const img = await QRCode.toDataURL(url);
        res.type('text/html');
        res.send(page(img, cb));

        // 检查登陆状态
        if (pollTimer !== null) {
            stopPoll();
        }
        pollTimer = setInterval(getStatus, 500, qrcode_key);
    } catch (e) {
        next(e);
    }
}

export const CheckShouldJump = async (req: Request, res: Response, next: NextFunction) => {
    const isDone = req.params['done'];
    if (isDone) {
        pollInfo = null;
        res.sendStatus(200);
        stopPoll();
        return;
    }

    if (pollInfo === null) {
        res.send({code: 86101, message: "未扫码"});
        return;
    }
    res.send(pollInfo.data);
}