import {NextFunction, Request, Response} from "express";
import QRCode from "qrcode";

const qrLoginHTML = (img: string, script: string, prompt: string) => `
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
        ${script}
    </head>
    <body>
        <div class="box">
            <h1 id="title">${prompt}</h1>
            <img src=${img} alt="qrcode">
        </div>
    </body>
</html>
`

export const QRLoginPage = (qrLink: string, script: string, prompt: string) => {
    return async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const img = await QRCode.toDataURL(qrLink);
            const html = qrLoginHTML(img, script, prompt);

            res.type('text/html');
            res.send(html);
        } catch (e) {
            next(e);
        }
    }
}