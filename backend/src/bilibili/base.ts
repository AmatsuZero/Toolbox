import axios from 'axios';
import {NextFunction, Request, Response} from "express";
import {Cookie, CookieJar } from 'tough-cookie';
import { wrapper } from 'axios-cookiejar-support';
import { FileCookieStore } from 'tough-cookie-file-store';
import { join } from 'path';
import { __dirname } from '../global';

const cookiePath = join(__dirname, "cookie.json");
const BASE_URL = "https://api.bilibili.com";
export const cookieJar = new CookieJar(new FileCookieStore(cookiePath));

export const bilibili = wrapper(axios.create({
    baseURL: 'https://api.bilibili.com/x',
    timeout: 1000,
    method: 'get',
    withCredentials: true,
    jar: cookieJar
}));

export interface BilibiliResponse<T> {
    code: number;
    message: string;
    ttl: number | null;
    data: T
}

export const SaveCookie = async (cookies: string[]) => {
    const arr = cookies.map(c => Cookie.parse(c))
        .filter(c => c !== undefined)
        .map(c => c as Cookie);

    for (const cookie of arr) {
        try {
            await cookieJar.setCookie(cookie, BASE_URL);
        } catch (e) {
            console.error(e);
        }
    }
}

export const checkCookies = async (req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/login'
        || req.path === 'b/login'
        || req.path === '/checkStatus'
        || req.path === 'b/checkStatus') {
        next();
        return;
    }

    const cookies = await cookieJar.getCookies(BASE_URL);
    if (cookies.length > 0) {
        next();
        return;
    }
    res.redirect(`/b/login?callback=${req.originalUrl}`);
};