import puppeteer, {Browser} from "puppeteer";
import {NextFunction, Request, Response} from "express";

const launchOptions = (proxyServer: string) => {
    const args = [
        '--blink-settings=imagesEnabled=false',
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ];

    if (proxyServer.length > 0) {
        args.push( `--proxy-server=${proxyServer}`);
    }

    return {
        headless: true,
        ignoreDefaultArgs: [
            "--hide-scrollbars",
            "--mute-audio",
        ],
        args,
    }
}

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
    browser: Browser | null | undefined;
    proxyServer: string;

    constructor(proxyServer: string) {
        this.proxyServer = proxyServer;
    }

    async init() {
        this.browser = await puppeteer.launch(
            launchOptions(this.proxyServer)
        );
    }

    toString() {
        return `Video Info:
         score: ${this.score} 
         duration: ${this.vDurat}
         title: ${this.title} 
         view key: ${this.viewKey} 
         watch: ${this.watch} 
         collection: ${this.collect} 
         update time: ${this.upTime} 
         addr: ${this.dlAddr}`;
    }

    async createPage(timeout: number = 10) {
        if (!this.browser) {
            throw new Error("should call init first!");
        }

        const page = await this.browser.newPage();
        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            "Accept-Language": "zh-CN,zh;q=0.9"
        });
        page.setDefaultTimeout(timeout * 1000);

        return page;
    }

    async updateDlAddr() {
        if (!this.browser) {
            throw new Error("should call init first!");
        }

        const page = await this.createPage();

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
            const exp = /<source [^>]*src=['"]([^'"]+)[^>]* type=>/gi;
            const array = html.match(exp);
            if (array !== null && array.length > 0) {
                this.dlAddr = array[0] || '';
            }
        } catch (e) {
            console.error("DlAddr: ", fullUrl, e);
        }
    }
}

export const PageCrawlOne = async (req: Request, res: Response, next: NextFunction) => {
    const proxyServer = req.query['proxyServer'] as string|| '';
    const vi = new VideoInfo(proxyServer);
    const dstUrl = req.query['dstUrl'] as string || '';
    try {
        await vi.init();
        const page = await vi.createPage(25);
    } catch (e) {
        console.log(req.originalUrl, e);
    }
}

export const PageCrawl = () => {

}