import puppeteer, {Browser, Page} from "puppeteer";
import * as cheerio from 'cheerio';

const launchOptions = (proxyServer: string | null) => {
    const args = [
        '--blink-settings=imagesEnabled=false',
        '--no-sandbox',
        '--disable-setuid-sandbox'
    ];

    if (proxyServer !== null && proxyServer.length > 0) {
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
    proxyServer: string | null;

    constructor(proxyServer: string | null = null) {
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
        const fullUrl = `https://www.91porn.com/view_video.php?viewkey=${this.viewKey}`;

        try {
            const page = await this.createPage();
            await page.goto(fullUrl, {waitUntil: 'domcontentloaded'});
            let node = await page.$("#player_one_html5_api > source");
            if (node === null) {
                await page.click('body > table > tbody > tr > td > a');
                await page.goto(fullUrl, {waitUntil: 'domcontentloaded'});
                node = await page.$("#player_one_html5_api > source");
            }
            if (node === null) {
                console.log("DlAddr: ", fullUrl);
                return;
            }
            const html = node.toString();
            const arr = html.match(/<source [^>]*src=['"]([^'"]+)[^>]* type=>/gi);
            if (arr !== null && arr[0].length > 0) {
                this.dlAddr = arr[0];
            }
        } catch (e) {
            console.error("DlAddr: ", fullUrl, e);
        }
    }
}

const extractContent = async (page: Page, selectors: string[], regs: RegExp[]) => {
    const htmls = new Array<string>();
    for (const sel of selectors) {
        const node = await page.$(sel);
        if (node === null) {
            throw new Error(`can not find the sel: ${sel}`);
        }
        htmls.push(node.toString());
    }

    return htmls.map((h, i) => h.match(regs[i]));
}

const createVideoInfo = async (dstUrl: string, proxyServer: string) => {
    const vi = new VideoInfo(proxyServer);
    await vi.init();
    const page = await vi.createPage(25);
    const response = await page.goto(dstUrl, {waitUntil: 'domcontentloaded'});
    if (response == null || !response.ok) {
        throw new Error(`visit ${dstUrl} failed!`);
    }
    return {vi, page};
}

export const PageCrawlOne = async (dstUrl: string, proxyServer: string) => {
    try {
        const {vi, page} = await createVideoInfo(dstUrl, proxyServer);

        const sels = ["#player_one_html5_api > source",
            "#videodetails > h4",
            "#videodetails-content > div:nth-child(3) > span.title-yakov > a:nth-child(1) > span"];
        const regs = [
            /<source [^>]*src=['"]([^'"]+)[^>]* type=>/gi,
            /<h4 class="login_register_header" align="left">['"]([^'"]+)[^>]*/gi,
            /<span class="title">['"]([^'"]+)[^>]*<\/span>/gi
        ];

        const rets = await extractContent(page, sels, regs)
        rets.forEach((ret, i) => {
            if (ret !== null && ret[0].length > 0) {
                switch (i) {
                    case 0: vi.dlAddr = ret[0];
                    case 1: vi.title = ret[0].trim();
                    case 2: vi.owner = ret[0];
                }
            }
        });

        return vi;
    } catch (e) {
        console.log(dstUrl, e);
        return null;
    }
}

export const PageCrawlChromeDp = async (dstUrl: string, proxyServer: string) => {
    try {
        const {page} = await createVideoInfo(dstUrl, proxyServer);
        let node = await page.$("#wrapper");
        if (node === null) {
            await page.click('body > table > tbody > tr > td > a');
            await page.goto(dstUrl, {waitUntil: 'domcontentloaded'});
            node = await page.$("#wrapper");
        }
        if (node === null) {
            console.error("Crawl done: ", dstUrl);
            return [];
        }

        const html = node.toString();
        const $ = cheerio.load(html);
        const d = $("#wrapper > div.container.container-minheight > div.row > div > div > div > div");
        d.each(() => {
            // const textStr = $(this).text();
            // const title = $(this).find("a").find("span.video-title").text();
            // const videoUrl = $(this).find("a").attr("href") || '';
            //
            // const viewKey = videoUrl.match(/viewkey=['"]([^'"]+)[^>]*&page/gi);
            // const addTime = textStr.match(/添加时间:['"]([^'"]+)[^>]*\n/gi);
            // const watch = textStr.match(/热度:['"]([^'"]+)[^>]*\n/gi);
            // const collect = textStr.match(/收藏:(?s:(.*?))\n/gi);
        });
        const all = new Array<VideoInfo>();

        return all;
    } catch (e) {
        console.error("Crawl done", dstUrl, e);
        return [];
    }
}

export const PageCrawl = () => {

}