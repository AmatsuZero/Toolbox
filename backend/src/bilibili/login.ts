import axios from 'axios';
import QRCode from 'qrcode';
import { NextFunction, Request, Response } from 'express';
import { BaseResponse } from './base';

let pollTimer: NodeJS.Timer | null;

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
    switch (code) {
    case 86101:
    case 86090:
        break;
    case 0:
        console.log(`扫码成功 ${response.headers}`);
    default:
        stopPoll();
        break;
    }
}

const page = (img: string) => `
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
    </head>
    <body>
        <div class="box">
            <h1>使用哔哩哔哩手机客户端扫码登陆</h1>
            <img src=${img} alt="qrcode">
        </div>
    </body>
</html>
`

export const Login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const response = await getQRCode(); // 获取二维码和 token
        if (response.status !== 200) {
            res.status(response.status).send(response.data);
            return
        }

        const { url, qrcode_key } = response.data.data;

        const img = await QRCode.toDataURL(url);
        res.type('text/html');
        res.send(page(img));

        // 检查登陆状态
        pollTimer = setInterval(getStatus, 500, qrcode_key);

        setTimeout(() => stopPoll(), 180 * 1000);
    } catch (e) {
        next(e);
    }
}