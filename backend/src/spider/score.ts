import * as jieba from "nodejieba";
import { createReadStream } from "fs";
import { createInterface } from 'readline';
import { VideoInfo } from "./catch";

const keyDict = new Map<string, number>();
const ownDict = new Map<string, number>();

const processLineByLine = async (file: string, handler: (key: string, value: number) => void) => {
    const input = createReadStream(file);
    const rl = createInterface({
        input,
        crlfDelay: Infinity
    });

    for await (const line of rl) {
        const strs = line.split(" ").filter(str => str.length > 0);
        if (strs.length !== 2) {
            console.error("wrong format!", strs);
            continue;
        }

        const score = parseInt(strs[1], 10);
        if (isNaN(score) || score > 100) {
            console.error("wrong format!", strs);
            continue;
        }

        const key = strs[0];
        handler(key, score);
    }
}

export default class Score {
    keyValue: Map<string, number>;
    ownValue: Map<string, number>;

    constructor() {
        this.keyValue = new Map<string, number>();
        this.ownValue = new Map<string, number>();
    }

    static async load(keyFile: string, ownFile: string) {
        await processLineByLine(keyFile, (k, v) => {
            keyDict.set(k, v);
            jieba.insertWord(k);
        });

        await processLineByLine(ownFile, (k, v) => {
            ownDict.set(k, v);
        });
    }

    grade(info: VideoInfo) {
        const words = jieba.cut(info.title, true);
        let titleScore = 0;
        words.forEach(w => this.keyValue.set(w, titleScore));
        let duraScore = 10.8 * info.vDurat;
        duraScore = duraScore > 100 ? 100 : duraScore;
        let ownScore = this.ownValue[info.owner];
        return 0.4 * titleScore + 0.4 * duraScore + 0.2 * ownScore;
    }

    gradeSort(vis: VideoInfo[]) {
        return vis.sort((lhs,rhs) => {
            if (lhs.score === -1) {
                lhs.score = this.grade(lhs);
            }
            if (rhs.score === -1) {
                rhs.score = this.grade(rhs);
            }
            return lhs.score - rhs.score;
        })
    }
}