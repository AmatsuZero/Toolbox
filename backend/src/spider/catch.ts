import puppeteer from "puppeteer";
import {NextFunction, Request, Response} from "express";

export class VideoInfo {
    title = '';
    viewKey = '';
    owner = '';
    upTime = 0;
    dlAddr = '';
    vDurat = 0;
    watch = 0;
    collect = 0;
    score = -1;

    toString() {
        return `Video Info: (${this.score} ${this.vDurat})${this.title} ${this.viewKey} ${this.watch} ${this.collect} ${this.upTime} ${this.dlAddr}`;
    }

    async updateDlAddr(proxyServer: string) {
        this.dlAddr = "";
        const browser = await puppeteer.launch({
            headless: true,
            ignoreDefaultArgs: [
                "--hide-scrollbars",
                "--mute-audio",
            ],
            args: [
                '--blink-settings=imagesEnabled=false',
                `--proxy-server=${proxyServer}`,
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ],
        });

        const page = await browser.newPage();
        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            "Accept-Language": "zh-CN,zh;q=0.9"
        });
        page.setDefaultTimeout(10 * 1000);

        const fullUrl = `https://www.91porn.com/view_video.php?viewkey=${this.viewKey}`;
        const response = await page.goto(fullUrl, {waitUntil: 'domcontentloaded'});
        if (response == null || !response.ok()) {
            return;
        }
        try {
            await page.click('body > table > tbody > tr > td > a');
            const node = await page.$("#player_one_html5_api > source");
            if (node === null) {
                console.log("can not find the source: ", fullUrl);
                return;
            }
            console.log(fullUrl, "DlAddr done!");

            const html = node.toString();
            html.match(/<source src="[?s:(.*?)]" type="/);
        } catch (e) {
            console.error("DlAddr: ", fullUrl, e);
        }
    }
}

export const GetWeekly = async (req: Request, res: Response, next: NextFunction) => {

}