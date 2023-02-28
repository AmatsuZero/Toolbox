import { NextFunction, Request, Response } from 'express';
import {bilibili, BilibiliResponse} from './base';
import { VideoInfoData } from './video';

export interface PopularData {
    list: VideoInfoData;
    no_more: boolean;
}

export const GetPopularData = async (req: Request, res: Response, next: NextFunction) => {
    const params = req.query;
    const pn = params.pn || '1';
    const ps = params.ps || '20';

    try {
        const response = await bilibili.get<BilibiliResponse<PopularData>>('/web-interface/popular', {
            params: { pn, ps }
        });

        res.status(response.status)
            .header(response.headers)
            .send(response.data);
    } catch (e) {
        next(e);
    }
}