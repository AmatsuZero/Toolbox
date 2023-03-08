import express, { NextFunction, Request, Response } from 'express';
import axios from "axios";
import { join } from "path";
import type { HotList, Question } from "./types";
import { createArchive, createReadme, mergeQuestions } from "./utils";

const Zhihu = express.Router();

Zhihu.use('/trending',  async (req: Request, res: Response, next: NextFunction)  => {
    try {
        const response = await axios.get<HotList>("https://www.zhihu.com/api/v3/feed/topstory/hot-lists/total?limit=100");
        const result = response.data;
        const questions: Question[] = result.data.map((x) => ({
            title: x.target.title,
            url: `https://www.zhihu.com/question/${x.target.id}`,
        }));

        const yyyyMMdd = format(new Date(), "yyyy-MM-dd");
        const fullPath = join("raw", `${yyyyMMdd}.json`);

        let questionsAlreadyDownload: Question[] = [];
        if (await exists(fullPath)) {
            const content = await Deno.readTextFile(fullPath);
            questionsAlreadyDownload = JSON.parse(content);
        }

        // 保存原始数据
        const questionsAll = mergeQuestions(questions, questionsAlreadyDownload);
        await Deno.writeTextFile(fullPath, JSON.stringify(questionsAll));

        // 更新 README.md
        const readme = await createReadme(questionsAll);
        await Deno.writeTextFile("./README.md", readme);

        // 更新 archives
        const archiveText = createArchive(questionsAll, yyyyMMdd);
        const archivePath = join("archives", `${yyyyMMdd}.md`);
        await Deno.writeTextFile(archivePath, archiveText);
    } catch (e) {
        next(e);
    }
});


